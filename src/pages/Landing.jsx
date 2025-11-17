import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Store, Package, BarChart3, Clock, ShieldCheck, MessageCircle, ArrowRight } from 'lucide-react';

function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToJoin = () => {
    const joinSection = document.getElementById('join-section');
    if (joinSection) {
      joinSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleJoinWhatsApp = () => {
    const phoneNumber = '96176739342'; // +961 76 739 342
    const message = encodeURIComponent(
      'Hello! I am a pharmacy owner interested in joining the Pharmacy Portal. I would like to get access to manage my pharmacy\'s medicine inventory online. Could you please help me get started?'
    );
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      {/* Navigation Bar */}
      <nav className="fixed top-0 w-full bg-white bg-opacity-95 backdrop-blur-sm shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <Store className="w-8 h-8 text-blue-600" />
              <span className="text-xl sm:text-2xl font-bold text-blue-700">Pharmacy Portal</span>
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            {/* Desktop Menu */}
            <div className="hidden md:flex gap-6 lg:gap-8 items-center">
              <a href="#features" className="text-gray-700 hover:text-blue-600 font-medium transition text-sm lg:text-base">Features</a>
              <a href="#benefits" className="text-gray-700 hover:text-blue-600 font-medium transition text-sm lg:text-base">Benefits</a>
              <a href="#how-it-works" className="text-gray-700 hover:text-blue-600 font-medium transition text-sm lg:text-base">How It Works</a>
              <button onClick={scrollToJoin} className="font-medium transition text-sm lg:text-base hover:opacity-80" style={{ color: '#0D9488' }}>Get Started</button>
              <Link to="/login">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 lg:px-6 py-2 lg:py-2.5 rounded-lg font-bold transition shadow-md hover:shadow-lg text-sm lg:text-base">
                  Owner Portal
                </button>
              </Link>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 space-y-3">
              <a href="#features" className="block text-gray-700 hover:text-blue-600 font-medium py-2">Features</a>
              <a href="#benefits" className="block text-gray-700 hover:text-blue-600 font-medium py-2">Benefits</a>
              <a href="#how-it-works" className="block text-gray-700 hover:text-blue-600 font-medium py-2">How It Works</a>
              <button onClick={scrollToJoin} className="block font-medium py-2 text-left hover:opacity-80" style={{ color: '#0D9488' }}>Get Started</button>
              <Link to="/login" className="block">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-bold transition shadow-md text-center">
                  Owner Portal
                </button>
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 sm:pt-32 pb-12 sm:pb-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left: Text Content */}
            <div className="space-y-4 sm:space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold">
                <ShieldCheck className="w-4 h-4" />
                For Pharmacy Owners
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Manage Your{' '}
                <span className="text-blue-700">Pharmacy Inventory</span>{' '}
                <span className="text-blue-700">Effortlessly</span>
              </h1>

              <p className="text-base sm:text-lg lg:text-xl text-gray-600 leading-relaxed">
                Update medicine availability in real-time, reach more customers, and grow your pharmacy business with our easy-to-use owner portal.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                <Link to="/login" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-bold text-base sm:text-lg shadow-lg transform hover:scale-105 transition">
                    Access Owner Portal
                  </button>
                </Link>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-8 text-xs sm:text-sm text-gray-600 justify-center lg:justify-start">
                <div className="flex items-center justify-center lg:justify-start gap-2">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Easy to use</span>
                </div>
                <div className="flex items-center justify-center lg:justify-start gap-2">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Real-time updates</span>
                </div>
              </div>
            </div>

            {/* Right: Illustration */}
            <div className="relative mt-8 lg:mt-0">
              <div className="bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl transform rotate-2 hover:rotate-0 transition duration-300">
                <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 space-y-3 sm:space-y-4">
                  {/* Medicine Items */}
                  <div className="space-y-2 sm:space-y-3">
                    <div className="bg-green-50 border-l-4 border-green-500 p-3 sm:p-4 rounded">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-gray-800 text-sm sm:text-base truncate">Aspirin 500mg</p>
                          <p className="text-xs sm:text-sm text-gray-600">Stock: 150 units</p>
                        </div>
                        <span className="bg-green-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap">
                          Available
                        </span>
                      </div>
                    </div>

                    <div className="bg-red-50 border-l-4 border-red-500 p-3 sm:p-4 rounded">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-gray-800 text-sm sm:text-base truncate">Paracetamol</p>
                          <p className="text-xs sm:text-sm text-gray-600">Stock: 0 units</p>
                        </div>
                        <span className="bg-red-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap">
                          Unavailable
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 sm:py-20 px-4 sm:px-6 bg-white scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
              Powerful Features for Pharmacy Owners
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600">
              Everything you need to manage your pharmacy effectively
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {[
              {
                icon: <Package className="w-8 h-8" />,
                color: 'blue',
                title: 'Inventory Management',
                description: 'Easily add or remove medicines from your pharmacy\'s inventory with just a few clicks'
              },
              {
                icon: <BarChart3 className="w-8 h-8" />,
                color: 'cyan',
                title: 'Real-Time Updates',
                description: 'Update medicine availability instantly and customers see changes immediately'
              },
              {
                icon: <Store className="w-8 h-8" />,
                color: 'blue',
                title: 'Reach More Customers',
                description: 'Connect with customers actively searching for medicines in your area'
              },
              {
                icon: <Clock className="w-8 h-8" />,
                color: 'cyan',
                title: 'Save Time',
                description: 'No more phone calls about availability - customers check online first'
              }
            ].map((feature, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition group border border-gray-100">
                <div className={`w-14 h-14 bg-${feature.color}-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition text-${feature.color}-600`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3">{feature.title}</h3>
                <p className="text-sm sm:text-base text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-12 sm:py-20 px-4 sm:px-6 bg-gradient-to-br from-blue-50 to-cyan-50 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
              Why Join Pharmacy Portal?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                num: '1',
                title: 'Increase Visibility',
                desc: 'Customers searching for medicines will find your pharmacy instantly'
              },
              {
                num: '2',
                title: 'Reduce Phone Calls',
                desc: 'Customers check availability online before visiting or calling'
              },
              {
                num: '3',
                title: 'Grow Your Business',
                desc: 'Reach new customers and increase foot traffic to your pharmacy'
              }
            ].map((benefit, index) => (
              <div key={index} className="text-center bg-white rounded-2xl p-6 sm:p-8 shadow-md hover:shadow-xl transition">
                <div className="bg-gradient-to-br from-teal-500 to-cyan-600 text-white w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold mx-auto mb-4 sm:mb-6 shadow-lg">
                  {benefit.num}
                </div>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-2 sm:mb-3">{benefit.title}</h3>
                <p className="text-sm sm:text-base text-gray-600">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-7 sm:py-12 px-4 sm:px-6 bg-white scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
              How It Works
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600">Simple steps to get started</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
            {[
              { num: '1', title: 'Get Your Login', desc: 'Admin provides you with secure login credentials for your pharmacy' },
              { num: '2', title: 'Add Your Medicines', desc: 'Select medicines from the catalog and add them to your pharmacy\'s inventory' },
              { num: '3', title: 'Update Availability', desc: 'Mark medicines as available or unavailable in real-time as stock changes' }
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="bg-gradient-to-br from-teal-500 to-cyan-600 text-white w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold mx-auto mb-4 sm:mb-6 shadow-lg">
                  {step.num}
                </div>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-2 sm:mb-3">{step.title}</h3>
                <p className="text-sm sm:text-base text-gray-600 px-4">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Join Section */}
      <section id="join-section" className="py-6 sm:py-8 px-4 sm:px-6 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border-2 border-blue-100">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                <ShieldCheck className="w-5 h-5" />
                New Pharmacy Owner?
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3">
                Join Our Platform
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
                Want to manage your pharmacy's inventory online and reach more customers? 
                Contact our admin team to get your pharmacy registered on our platform.
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-4 sm:p-6 mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Package className="w-6 h-6 text-blue-600" />
                What You'll Get:
              </h3>
              <ul className="space-y-2">
                {[
                  'Secure login credentials for your pharmacy',
                  'Easy-to-use dashboard to manage medicines',
                  'Real-time inventory updates',
                  'Reach customers actively searching for medicines',
                  'Free to use - no subscription fees'
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-gray-700 text-base sm:text-lg">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="text-center">
              <button
                onClick={handleJoinWhatsApp}
                className="inline-flex items-center gap-3 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white px-8 sm:px-12 py-3 sm:py-4 rounded-2xl font-bold text-lg sm:text-xl shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                <MessageCircle className="w-6 h-6" />
                Contact Admin to Join
                <ArrowRight className="w-5 h-5" />
              </button>
              <p className="text-sm text-gray-500 mt-3">
                Click to send us a message on WhatsApp
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

export default Landing;

