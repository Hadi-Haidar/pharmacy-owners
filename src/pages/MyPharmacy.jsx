import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { medicineService } from '../services/medicineService';
import { List, Search, Trash2, RefreshCw, AlertCircle, X, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

const MyPharmacy = () => {
  const { owner, pharmacy } = useAuth();
  const [pharmacyMedicines, setPharmacyMedicines] = useState([]);
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [removingMedicine, setRemovingMedicine] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [medicineToDelete, setMedicineToDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [successMessageType, setSuccessMessageType] = useState('success'); // 'success' or 'warning'
  const [showTips, setShowTips] = useState(false);
  const [expandedDescriptions, setExpandedDescriptions] = useState(new Set()); // Track expanded descriptions
  const [isMobile, setIsMobile] = useState(false); // Track if user is on mobile
  const updatingRef = useRef(new Set()); // Track medicines currently being updated
  const successTimeoutRef = useRef(null); // Track success message timeout

  useEffect(() => {
    // Only fetch if pharmacy and owner are available
    if (pharmacy && owner) {
      fetchPharmacyMedicines();
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
  }, [pharmacyMedicines, searchQuery, statusFilter]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
    };
  }, []);

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

  const fetchPharmacyMedicines = async () => {
    if (!pharmacy) return;

    try {
      setLoading(true);
      setError(null);
      const data = await medicineService.getPharmacyMedicines(pharmacy.id, owner.id);
      setPharmacyMedicines(data);
    } catch (err) {
      setError('Failed to load your inventory. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filterMedicines = () => {
    let filtered = [...pharmacyMedicines];

    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.medicine?.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }

    setFilteredMedicines(filtered);
  };

  const handleUpdateStatus = async (medicineId, currentStatus) => {
    if (!pharmacy) return;
    
    // Prevent multiple simultaneous updates for the same medicine
    if (updatingStatus === medicineId) {
      return;
    }

    const newStatus = currentStatus === 'available' ? 'unavailable' : 'available';

    try {
      // Set updating state immediately to disable button
      setUpdatingStatus(medicineId);
      updatingRef.current.add(medicineId);
      
      // Perform the API call
      await medicineService.updateMedicineStatus(
        medicineId,
        pharmacy.id,
        owner.id,
        newStatus
      );
      
      // Update local state with functional update to ensure consistency
      setPharmacyMedicines(prevMedicines =>
        prevMedicines.map(item => {
          if (item.id === medicineId) {
            return { ...item, status: newStatus };
          }
          return item;
        })
      );
      
      // Clear any existing success message timeout
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
      
      // Set success message with appropriate color immediately
      setSuccessMessage(`Medicine status updated to ${newStatus}!`);
      setSuccessMessageType(newStatus === 'unavailable' ? 'warning' : 'success');
      
      // Set timeout to clear message after consistent 3 seconds
      successTimeoutRef.current = setTimeout(() => {
        setSuccessMessage('');
        setSuccessMessageType('success');
        successTimeoutRef.current = null;
      }, 3000);
    } catch (err) {
      setError(err.message || 'Failed to update medicine status.');
      setTimeout(() => setError(null), 5000);
      console.error(err);
    } finally {
      // Always clean up
      updatingRef.current.delete(medicineId);
      setUpdatingStatus(null);
    }
  };

  const handleRemoveClick = (medicineId) => {
    setMedicineToDelete(medicineId);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!pharmacy || !medicineToDelete) return;

    try {
      setRemovingMedicine(medicineToDelete);
      await medicineService.removeMedicineFromPharmacy(
        medicineToDelete,
        pharmacy.id,
        owner.id
      );
      
      // Remove from local state
      setPharmacyMedicines(prevMedicines =>
        prevMedicines.filter(item => item.id !== medicineToDelete)
      );
      
      setShowDeleteModal(false);
      setMedicineToDelete(null);
      
      // Clear any existing success message timeout
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
      
      // Set success message immediately
      setSuccessMessage('Medicine removed from your pharmacy successfully!');
      setSuccessMessageType('success');
      
      // Set timeout to clear message after consistent 3 seconds
      successTimeoutRef.current = setTimeout(() => {
        setSuccessMessage('');
        setSuccessMessageType('success');
        successTimeoutRef.current = null;
      }, 3000);
    } catch (err) {
      setError(err.message || 'Failed to remove medicine.');
      setTimeout(() => setError(null), 5000);
      console.error(err);
    } finally {
      setRemovingMedicine(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <List className="w-8 h-8 text-blue-600" />
            My Pharmacy
          </h1>
        </div>
        
        {/* Quick Tips Toggle Button */}
        <button
          onClick={() => setShowTips(!showTips)}
          className="flex items-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 rounded-lg font-medium transition-all duration-200"
          title="Show helpful tips"
        >
          <AlertCircle className="w-5 h-5 text-blue-600" />
          <span className="hidden sm:inline">Quick Tips</span>
          {showTips ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Collapsible Quick Tips */}
      {showTips && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 animate-slideIn">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-sm text-blue-800">
              <p className="font-semibold mb-1">Quick Tips:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Mark medicines as "Unavailable" when out of stock</li>
                <li>Remove medicines that you no longer carry</li>
                <li>Customers see real-time updates when you change status</li>
              </ul>
            </div>
            <button
              onClick={() => setShowTips(false)}
              className="p-1 hover:bg-blue-100 rounded transition text-blue-600 flex-shrink-0"
              title="Close tips"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search your medicines..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="unavailable">Unavailable</option>
          </select>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className={`border-2 px-5 py-4 rounded-xl flex items-center gap-3 animate-slideIn ${
          successMessageType === 'warning'
            ? 'bg-gradient-to-r from-red-50 to-orange-50 border-red-300 text-red-800'
            : 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 text-green-800'
        }`}>
          <CheckCircle2 className={`w-6 h-6 ${
            successMessageType === 'warning' ? 'text-red-600' : 'text-green-600'
          }`} />
          <span className="font-semibold">{successMessage}</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-2 border-red-300 text-red-700 px-5 py-4 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Inventory List */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading your pharmacy...</p>
          </div>
        ) : filteredMedicines.length === 0 ? (
          <div className="text-center py-12 text-gray-600 px-4">
            <List className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-semibold">
              {searchQuery || statusFilter !== 'all'
                ? 'No medicines match your filters'
                : 'Your pharmacy is empty'}
            </p>
            <p className="text-sm mt-2">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Start by adding medicines from the "All Medicines Catalog" page'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              {/* Table Header */}
              <thead className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Medicine
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="divide-y divide-gray-200">
                {filteredMedicines.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    {/* Medicine Info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {item.medicine?.frontImageUrl && (
                          <img
                            src={item.medicine.frontImageUrl}
                            alt={item.medicine.title}
                            className="w-12 h-12 rounded-lg object-cover bg-gray-100"
                          />
                        )}
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {item.medicine?.title || 'Unknown'}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Description */}
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700">
                        {(() => {
                          const description = item.medicine?.description || 'No description';
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
                          const isExpanded = expandedDescriptions.has(item.id);

                          if (isExpanded) {
                            // Show full description when expanded
                            return (
                              <>
                                <p>{description}</p>
                                {isLongDescription && (
                                  <button
                                    onClick={() => {
                                      const newExpanded = new Set(expandedDescriptions);
                                      newExpanded.delete(item.id);
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
                                      newExpanded.add(item.id);
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
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold
                          ${item.status === 'available'
                            ? 'bg-green-50 text-green-700'
                            : 'bg-red-50 text-red-700'}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          item.status === 'available' ? 'bg-green-500' : 'bg-red-500'
                        }`}></span>
                        {item.status === 'available' ? 'Available' : 'Unavailable'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {/* Toggle Status Button */}
                        <button
                          onClick={() => handleUpdateStatus(item.id, item.status)}
                          disabled={updatingStatus === item.id}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                            item.status === 'available'
                              ? 'bg-red-50 text-red-600 hover:bg-red-100'
                              : 'bg-green-50 text-green-600 hover:bg-green-100'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {updatingStatus === item.id ? (
                            <div className="animate-spin h-3 w-3 border-2 border-current border-t-transparent rounded-full"></div>
                          ) : (
                            <RefreshCw className="w-3 h-3" />
                          )}
                          {item.status === 'available' ? 'Mark Unavailable' : 'Mark Available'}
                        </button>

                        {/* Remove Button */}
                        <button
                          onClick={() => handleRemoveClick(item.id)}
                          disabled={removingMedicine === item.id}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Remove from pharmacy"
                        >
                          {removingMedicine === item.id ? (
                            <div className="animate-spin h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full"></div>
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>


      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl transform transition-all">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-gray-900">Confirm Removal</h3>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setMedicineToDelete(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="mb-6">
              <p className="text-gray-700 text-lg">
                Are you sure you want to remove this medicine from your pharmacy?
              </p>
              <p className="text-sm text-gray-500 mt-2">
                This action cannot be undone. You can add it back later if needed.
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setMedicineToDelete(null);
                }}
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={removingMedicine !== null}
                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-4 py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {removingMedicine ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                    Removing...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-5 h-5" />
                    Remove
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPharmacy;

