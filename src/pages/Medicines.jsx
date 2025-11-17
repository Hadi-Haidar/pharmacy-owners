import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { medicineService } from '../services/medicineService';
import { Package, Plus, Search, Filter, CheckSquare, Square, CheckCircle2 } from 'lucide-react';

const Medicines = () => {
  const { owner, pharmacy } = useAuth();
  const [medicines, setMedicines] = useState([]);
  const [pharmacyInventory, setPharmacyInventory] = useState([]);
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'in-pharmacy', 'not-in-pharmacy'
  const [error, setError] = useState(null);
  const [selectedMedicineIds, setSelectedMedicineIds] = useState([]);
  const [addingMedicines, setAddingMedicines] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [expandedDescriptions, setExpandedDescriptions] = useState(new Set()); // Track expanded descriptions
  const [isMobile, setIsMobile] = useState(false); // Track if user is on mobile

  useEffect(() => {
    // Only fetch if pharmacy and owner are available
    if (pharmacy && owner) {
      fetchData();
    } else if (pharmacy === null && owner === null) {
      // If both are null, they might still be loading
      setLoading(true);
    } else {
      // One is missing
      setError('Pharmacy or owner information is missing. Please log out and log in again.');
      setLoading(false);
    }
  }, [pharmacy, owner]);

  useEffect(() => {
    filterMedicines();
  }, [medicines, pharmacyInventory, searchQuery, filterStatus]);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // 768px is typically the breakpoint for mobile/tablet
    };
    
    // Check on mount
    checkMobile();
    
    // Check on resize
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching data...');
      console.log('Pharmacy:', pharmacy);
      console.log('Owner:', owner);
      
      // First, check if pharmacy is available
      if (!pharmacy) {
        setError('Pharmacy information not available. Please log out and log in again.');
        setLoading(false);
        return;
      }
      
      // Fetch all medicines and pharmacy inventory in parallel
      console.log('Fetching medicines from:', `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/pharmacy-owner/medicines/all`);
      
      const [allMedicines, inventory] = await Promise.all([
        medicineService.getAllAvailableMedicines(),
        medicineService.getPharmacyMedicines(pharmacy.id, owner.id).catch(err => {
          console.warn('Failed to fetch pharmacy inventory:', err);
          return []; // Return empty array if inventory fetch fails
        })
      ]);
      
      console.log('Medicines fetched:', allMedicines);
      console.log('Inventory fetched:', inventory);
      
      setMedicines(allMedicines || []);
      setPharmacyInventory(inventory || []);
    } catch (err) {
      console.error('Error in fetchData:', err);
      const errorMessage = err.message || 'Failed to load medicines. Please check if the backend server is running.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const isInPharmacy = (medicineId) => {
    return pharmacyInventory.some(item => item.medicine?.id === medicineId);
  };

  const filterMedicines = () => {
    let filtered = [...medicines];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(medicine =>
        medicine.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        medicine.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (filterStatus === 'in-pharmacy') {
      filtered = filtered.filter(medicine => isInPharmacy(medicine.id));
    } else if (filterStatus === 'not-in-pharmacy') {
      filtered = filtered.filter(medicine => !isInPharmacy(medicine.id));
    }

    // Sort: Not Added medicines first, then Added medicines
    filtered.sort((a, b) => {
      const aInPharmacy = isInPharmacy(a.id);
      const bInPharmacy = isInPharmacy(b.id);
      
      // If one is in pharmacy and the other is not, put the one NOT in pharmacy first
      if (aInPharmacy && !bInPharmacy) return 1;  // b comes first
      if (!aInPharmacy && bInPharmacy) return -1; // a comes first
      
      // If both are in the same category, maintain original order
      return 0;
    });

    setFilteredMedicines(filtered);
  };

  const handleSelectAll = () => {
    const selectableMedicines = filteredMedicines.filter(
      m => !isInPharmacy(m.id) && m.status === 'available'
    );
    
    if (selectedMedicineIds.length === selectableMedicines.length) {
      setSelectedMedicineIds([]);
    } else {
      const selectableIds = selectableMedicines.map(medicine => medicine.id);
      setSelectedMedicineIds(selectableIds);
    }
  };

  const handleSelectMedicine = (medicineId, medicineStatus) => {
    // Don't allow selecting unavailable medicines
    if (medicineStatus !== 'available') return;
    
    if (selectedMedicineIds.includes(medicineId)) {
      setSelectedMedicineIds(selectedMedicineIds.filter(id => id !== medicineId));
    } else {
      setSelectedMedicineIds([...selectedMedicineIds, medicineId]);
    }
  };

  const handleAddSelected = async () => {
    if (selectedMedicineIds.length === 0 || !pharmacy) return;

    try {
      setAddingMedicines(true);
      setError(null);

      // Add all selected medicines
      await Promise.all(
        selectedMedicineIds.map(medicineId =>
          medicineService.addMedicineToPharmacy(pharmacy.id, owner.id, {
            medicineId,
            status: 'available',
          })
        )
      );

      setSuccessMessage(`${selectedMedicineIds.length} medicine(s) added successfully!`);
      setSelectedMedicineIds([]);
      
      // Refresh inventory
      const inventory = await medicineService.getPharmacyMedicines(pharmacy.id, owner.id);
      setPharmacyInventory(inventory);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to add medicines. Some may already be in your inventory.');
      console.error(err);
    } finally {
      setAddingMedicines(false);
    }
  };

  const selectableCount = filteredMedicines.filter(m => !isInPharmacy(m.id) && m.status === 'available').length;
  const allSelected = selectableCount > 0 && selectedMedicineIds.length === selectableCount;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            All Medicines Catalog
          </h1>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 text-green-800 px-5 py-4 rounded-xl flex items-center gap-3 animate-slideIn">
          <CheckCircle2 className="w-6 h-6 text-green-600" />
          <span className="font-semibold">{successMessage}</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-2 border-red-300 text-red-700 px-5 py-4 rounded-xl">
          {error}
        </div>
      )}

      {/* Filters and Actions */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-5">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Search Bar */}
          <div className="relative flex-1 w-full lg:max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by medicine name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                filterStatus === 'all'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Medicines
            </button>
            <button
              onClick={() => setFilterStatus('in-pharmacy')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                filterStatus === 'in-pharmacy'
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              In My Pharmacy
            </button>
            <button
              onClick={() => setFilterStatus('not-in-pharmacy')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                filterStatus === 'not-in-pharmacy'
                  ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Not Added Yet
            </button>
          </div>
        </div>

        {/* Action Bar */}
        {selectedMedicineIds.length > 0 && (
          <div className="mt-4 pt-4 border-t-2 border-gray-200 flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-700">
              {selectedMedicineIds.length} medicine(s) selected
            </p>
            <button
              onClick={handleAddSelected}
              disabled={addingMedicines}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-2.5 rounded-lg font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
            >
              {addingMedicines ? (
                <>
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Add Selected to Pharmacy
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Medicines Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin h-14 w-14 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-gray-600 mt-4 font-medium">Loading medicines...</p>
          </div>
        ) : filteredMedicines.length === 0 ? (
          <div className="text-center py-16 text-gray-600">
            <Package className="w-20 h-20 mx-auto mb-4 text-gray-400" />
            <p className="text-xl font-semibold">
              {searchQuery || filterStatus !== 'all' ? 'No medicines match your filters' : 'No medicines available'}
            </p>
            <p className="text-sm mt-2">
              {searchQuery || filterStatus !== 'all' ? 'Try adjusting your search or filters' : 'Admin hasn\'t added any medicines yet'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={handleSelectAll}
                      className="flex items-center gap-2 group"
                      disabled={selectableCount === 0}
                    >
                      {allSelected ? (
                        <CheckSquare className="w-5 h-5 text-blue-600 group-hover:text-blue-700 transition" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition" />
                      )}
                      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Select All
                      </span>
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Medicine Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Admin Status
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                    In My Pharmacy
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredMedicines.map((medicine) => {
                  const inPharmacy = isInPharmacy(medicine.id);
                  const isSelected = selectedMedicineIds.includes(medicine.id);

                  return (
                    <tr
                      key={medicine.id}
                      className={`transition-colors ${
                        isSelected ? 'bg-blue-50' : ''
                      } ${inPharmacy ? 'opacity-60' : medicine.status !== 'available' ? 'opacity-50 bg-gray-50' : 'hover:bg-blue-50/50'}`}
                    >
                      <td className="px-6 py-4">
                        {!inPharmacy ? (
                          medicine.status === 'available' ? (
                            <button
                              onClick={() => handleSelectMedicine(medicine.id, medicine.status)}
                              className="p-1 hover:bg-blue-100 rounded transition"
                            >
                              {isSelected ? (
                                <CheckSquare className="w-6 h-6 text-blue-600" />
                              ) : (
                                <Square className="w-6 h-6 text-gray-400" />
                              )}
                            </button>
                          ) : (
                            <div className="w-6 h-6 flex items-center justify-center cursor-not-allowed" title="Medicine is unavailable">
                              <Square className="w-6 h-6 text-gray-300 opacity-50" />
                            </div>
                          )
                        ) : (
                          <div className="w-6 h-6 flex items-center justify-center" title="Already in your pharmacy">
                            <CheckCircle2 className="w-6 h-6 text-green-500" />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {/* Medicine Image */}
                          {medicine.frontImageUrl && (
                            <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-200">
                              <img
                                src={medicine.frontImageUrl}
                                alt={medicine.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <span className="font-bold text-gray-900">{medicine.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-md">
                        {(() => {
                          const description = medicine.description || 'No description';
                          if (!description || description === 'No description') {
                            return <p>{description}</p>;
                          }
                          
                          // Split description into words
                          const trimmedDesc = description.trim();
                          const words = trimmedDesc.split(/\s+/).filter(word => word.trim().length > 0);
                          const wordCount = words.length;
                          
                          // Use 5 words for mobile, 20 words for desktop
                          const wordLimit = isMobile ? 5 : 20;
                          const isLongDescription = wordCount > wordLimit;
                          const isExpanded = expandedDescriptions.has(medicine.id);

                          if (isExpanded) {
                            // Show full description when expanded
                            return (
                              <>
                                <p>{description}</p>
                                {isLongDescription && (
                                  <button
                                    onClick={() => {
                                      const newExpanded = new Set(expandedDescriptions);
                                      newExpanded.delete(medicine.id);
                                      setExpandedDescriptions(newExpanded);
                                    }}
                                    className="text-blue-600 hover:text-blue-700 font-medium mt-1"
                                  >
                                    see less
                                  </button>
                                )}
                              </>
                            );
                          } else {
                            // Show only first N words when collapsed (5 for mobile, 20 for desktop)
                            const truncatedText = isLongDescription 
                              ? words.slice(0, wordLimit).join(' ') + '...'
                              : description;
                            
                            return (
                              <>
                                <p>{truncatedText}</p>
                                {isLongDescription && (
                                  <button
                                    onClick={() => {
                                      const newExpanded = new Set(expandedDescriptions);
                                      newExpanded.add(medicine.id);
                                      setExpandedDescriptions(newExpanded);
                                    }}
                                    className="text-blue-600 hover:text-blue-700 font-medium mt-1"
                                  >
                                    see more...
                                  </button>
                                )}
                              </>
                            );
                          }
                        })()}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                            medicine.status === 'available'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              medicine.status === 'available' ? 'bg-green-500' : 'bg-red-500'
                            }`}
                          ></span>
                          {medicine.status === 'available' ? 'Available' : 'Unavailable'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {inPharmacy ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-300">
                            <CheckCircle2 className="w-4 h-4" />
                            Added
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-gray-100 text-gray-600">
                            Not Added
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stats Footer */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200 p-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{medicines.length}</p>
            <p className="text-sm text-gray-600 font-medium">Total Medicines</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{pharmacyInventory.length}</p>
            <p className="text-sm text-gray-600 font-medium">In My Pharmacy</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">
              {medicines.length - pharmacyInventory.length}
            </p>
            <p className="text-sm text-gray-600 font-medium">Available to Add</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Medicines;
