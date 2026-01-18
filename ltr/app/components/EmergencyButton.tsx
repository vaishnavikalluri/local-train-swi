'use client';

import { useState, useRef, useEffect } from 'react';

const STATIONS = [
  'Hyderabad Junction',
  'Secunderabad',
  'Kacheguda',
  'Begumpet',
  'Mumbai Central',
  'Dadar',
  'Bandra',
  'Andheri',
  'Borivali',
  'Churchgate',
  'Marine Lines',
  'Thane',
  'Kalyan',
  'Dombivli',
  'Kurla',
  'Goregaon',
  'Virar',
  'Chittoor',
  'Tirupati',
].sort();

const PLATFORMS = Array.from({ length: 12 }, (_, i) => (i + 1).toString());

const COACHES = [
  'S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9', 'S10', 'S11', 'S12',
  'General', 'Ladies', 'First Class', 'AC Chair Car', 'Sleeper',
];

interface EmergencyButtonProps {
  variant?: 'fixed' | 'inline';
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
  icon: string;
  focusColor: string;
  required?: boolean;
}

function CustomSelect({ value, onChange, options, placeholder, icon, focusColor, required }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('bottom');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      
      // If not enough space below (less than 200px) and more space above, open upward
      if (spaceBelow < 200 && spaceAbove > spaceBelow) {
        setDropdownPosition('top');
      } else {
        setDropdownPosition('bottom');
      }
    }
  }, [isOpen]);

  return (
    <div className="relative group" ref={dropdownRef}>
      <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none z-10">
        <i className={`${icon} text-gray-500 text-lg ${isOpen ? focusColor : ''} transition-colors`}></i>
      </div>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full pl-10 sm:pl-12 pr-10 py-3 text-sm sm:text-base bg-slate-900/70 backdrop-blur-sm border ${
          isOpen ? `${focusColor.replace('text-', 'border-')} ring-2 ${focusColor.replace('text-', 'ring-')}/30` : 'border-slate-700/50'
        } rounded-lg focus:outline-none transition-all text-left ${
          value ? 'text-white' : 'text-gray-500'
        }`}
      >
        {value || placeholder}
      </button>
      <div className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center pointer-events-none">
        <i className={`bi bi-chevron-down text-gray-400 text-sm transition-transform ${isOpen ? 'rotate-180' : ''}`}></i>
      </div>
      
      {isOpen && (
        <div className={`fixed lg:absolute z-[200] w-full lg:w-auto ${
          dropdownPosition === 'top' ? 'bottom-full mb-1' : 'mt-1'
        } bg-slate-800/98 backdrop-blur-xl border border-slate-700/70 rounded-lg shadow-2xl max-h-60 overflow-y-auto`}
          style={
            window.innerWidth < 1024 && dropdownRef.current
              ? {
                  left: `${dropdownRef.current.getBoundingClientRect().left}px`,
                  width: `${dropdownRef.current.getBoundingClientRect().width}px`,
                  top: dropdownPosition === 'bottom' 
                    ? `${dropdownRef.current.getBoundingClientRect().bottom + 4}px`
                    : 'auto',
                  bottom: dropdownPosition === 'top'
                    ? `${window.innerHeight - dropdownRef.current.getBoundingClientRect().top + 4}px`
                    : 'auto'
                }
              : {}
          }
        >
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-left text-sm sm:text-base transition-colors ${
                value === option
                  ? `bg-blue-600/30 text-white font-semibold`
                  : 'text-gray-300 hover:bg-slate-700/50 hover:text-white'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function EmergencyButton({ variant = 'fixed' }: EmergencyButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState({
    boardingStationName: '',
    platformNumber: '',
    trainNumber: '',
    trainName: '',
    coach: '',
    seatNumber: '',
    destinationStationName: '',
  });

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setSubmitSuccess(false);
    setError('');
    setCurrentStep(1);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({
      boardingStationName: '',
      platformNumber: '',
      trainNumber: '',
      trainName: '',
      coach: '',
      seatNumber: '',
      destinationStationName: '',
    });
    setError('');
    setSubmitSuccess(false);
    setCurrentStep(1);
  };

  const handleNext = () => {
    setError('');
    
    // Validate current step
    if (currentStep === 1) {
      if (!formData.boardingStationName || !formData.platformNumber) {
        setError('Please fill all fields in this step');
        return;
      }
    } else if (currentStep === 2) {
      if (!formData.trainNumber || !formData.trainName) {
        setError('Please fill all fields in this step');
        return;
      }
    } else if (currentStep === 3) {
      if (!formData.coach || !formData.seatNumber) {
        setError('Please fill all fields in this step');
        return;
      }
    }
    
    setCurrentStep(currentStep + 1);
  };

  const handlePrevious = () => {
    setError('');
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentStep < 4) {
      handleNext();
      return;
    }
    
    if (!formData.destinationStationName) {
      setError('Please fill all fields');
      return;
    }
    
    setError('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit emergency alert');
      }

      setSubmitSuccess(true);
      localStorage.setItem('emergencySubmitted', 'true');
      setTimeout(() => {
        handleCloseModal();
      }, 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit emergency alert');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Emergency Button */}
      <button
        onClick={handleOpenModal}
        className={
          variant === 'fixed'
            ? "fixed bottom-6 right-6 z-50 bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-xl shadow-2xl shadow-red-600/50 flex items-center gap-2 transition-all duration-300 hover:scale-105 pulse-animation"
            : "bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 px-4 rounded-lg shadow-lg flex items-center gap-2 transition-all duration-200 whitespace-nowrap hover:scale-105"
        }
        aria-label="Emergency Assistance"
      >
        <i className={`bi bi-exclamation-octagon-fill ${variant === 'fixed' ? 'text-2xl' : 'text-xl'}`}></i>
        <span className={variant === 'fixed' ? "text-sm sm:text-base font-bold" : "text-sm font-semibold"}>EMERGENCY</span>
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          {/* Backdrop with blur effect */}
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity"
            onClick={handleCloseModal}
            aria-hidden="true"
          ></div>
          
          {/* Modal content - Mobile optimized */}
          <div className="relative w-full h-full lg:h-auto lg:max-w-6xl lg:max-h-[90vh] lg:rounded-2xl bg-slate-900/95 backdrop-blur-xl shadow-2xl z-10 border-0 lg:border-2 border-red-500/40 shadow-red-500/20 flex flex-col overflow-hidden">
            {/* Header - Mobile only */}
            <div className="lg:hidden bg-gradient-to-r from-red-600 to-red-700 text-white px-3 py-2.5 border-b border-red-500/50 flex-shrink-0">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <i className="bi bi-exclamation-triangle-fill text-lg"></i>
                  <div>
                    <h2 className="text-sm font-bold leading-tight">Emergency Alert</h2>
                    <p className="text-[10px] text-red-100">Fill carefully</p>
                  </div>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/20 text-white transition-all flex-shrink-0"
                  aria-label="Close"
                >
                  <i className="bi bi-x-lg text-sm"></i>
                </button>
              </div>
            </div>

            {/* Step Indicator - Mobile only (compact horizontal) */}
            {!submitSuccess && (
              <div className="lg:hidden px-3 py-2 flex-shrink-0 bg-slate-800/50 border-b border-slate-700/50">
                <div className="flex items-center justify-between max-w-xs mx-auto">
                  {[1, 2, 3, 4].map((step) => (
                    <div key={step} className="flex items-center">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] transition-all ${
                        currentStep >= step
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-slate-700/50 text-gray-400'
                      }`}>
                        {currentStep > step ? <i className="bi bi-check-lg text-[10px]"></i> : step}
                      </div>
                      {step < 4 && (
                        <div className={`h-[2px] w-5 mx-0.5 rounded transition-all ${
                          currentStep > step ? 'bg-blue-600' : 'bg-slate-700/50'
                        }`}></div>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-center text-[10px] text-gray-400 mt-1">
                  {currentStep === 1 && 'Boarding Info'}
                  {currentStep === 2 && 'Train Details'}
                  {currentStep === 3 && 'Your Location'}
                  {currentStep === 4 && 'Destination'}
                </p>
              </div>
            )}

            {/* Two Column Layout */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
              {/* Left Sidebar - Desktop only */}
              <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-red-600 to-red-700 text-white p-8 flex-shrink-0 flex-col">
                {/* Close button - Desktop only */}
                <button
                  onClick={handleCloseModal}
                  className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/20 text-white transition-all hover:scale-110 z-10"
                  aria-label="Close"
                >
                  <i className="bi bi-x-lg text-xl"></i>
                </button>

                <div className="max-w-md">
                  {/* Header */}
                  <div className="mb-8">
                    <div className="flex items-center gap-3 mb-3">
                      <i className="bi bi-exclamation-triangle-fill text-5xl"></i>
                      <h2 className="text-3xl font-bold">Emergency Assistance</h2>
                    </div>
                    <p className="text-base text-red-100">
                      Fill all fields carefully. Both boarding and destination station managers will be notified immediately.
                    </p>
                  </div>

                  {/* Step Indicator - Horizontal for Desktop */}
                  {!submitSuccess && (
                    <div>
                      <h3 className="text-lg font-semibold mb-6">Progress</h3>
                      <div className="space-y-4">
                        {[
                          { num: 1, label: 'Boarding Info', icon: 'bi-geo-alt-fill' },
                          { num: 2, label: 'Train Details', icon: 'bi-train-front-fill' },
                          { num: 3, label: 'Your Location', icon: 'bi-pin-map-fill' },
                          { num: 4, label: 'Destination', icon: 'bi-flag-fill' }
                        ].map((step, index) => (
                          <div key={step.num} className="flex items-start gap-3">
                            <div className="flex flex-col items-center">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-base transition-all ${
                                currentStep >= step.num
                                  ? 'bg-white text-red-600 shadow-lg'
                                  : 'bg-red-800/50 text-red-200'
                              }`}>
                                {currentStep > step.num ? <i className="bi bi-check-lg"></i> : step.num}
                              </div>
                              {index < 3 && (
                                <div className={`w-0.5 h-8 my-1 transition-all ${
                                  currentStep > step.num ? 'bg-white' : 'bg-red-800/50'
                                }`}></div>
                              )}
                            </div>
                            <div className="flex-1 pt-2">
                              <p className={`font-semibold ${
                                currentStep >= step.num ? 'text-white' : 'text-red-200'
                              }`}>
                                {step.label}
                              </p>
                              {currentStep === step.num && (
                                <p className="text-xs text-red-100 mt-1">Current step</p>
                              )}
                            </div>
                            <i className={`${step.icon} text-xl mt-2 ${
                              currentStep >= step.num ? 'text-white' : 'text-red-300'
                            }`}></i>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Privacy Notice */}
                  {!submitSuccess && (
                    <div className="mt-8 p-4 bg-red-800/30 backdrop-blur-sm border border-red-400/30 rounded-lg">
                      <p className="font-semibold mb-2 flex items-center gap-2 text-sm">
                        <i className="bi bi-shield-lock-fill"></i>
                        Privacy Protected
                      </p>
                      <p className="text-xs text-red-100 leading-relaxed">
                        Only location details are shared with station staff to help locate the person in need.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Side - Form Section */}
              <div className="flex-1 flex flex-col overflow-hidden bg-slate-900 min-h-0">
                {/* Success Message */}
                {submitSuccess && (
                  <div className="flex-1 flex items-center justify-center p-4 lg:p-6">
                    <div className="p-4 lg:p-6 bg-green-500/20 border-2 border-green-500/50 rounded-lg lg:rounded-xl backdrop-blur-sm max-w-md">
                      <div className="flex items-start gap-3 lg:gap-4">
                        <i className="bi bi-check-circle-fill text-3xl lg:text-4xl text-green-400 flex-shrink-0"></i>
                        <div>
                          <p className="font-bold text-lg lg:text-xl text-green-300 mb-1 lg:mb-2">Alert Sent!</p>
                          <p className="text-sm lg:text-base text-green-200">
                            Station managers have been notified.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Form */}
                {!submitSuccess && (
                  <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden min-h-0">
                    <div className="flex-1 overflow-y-auto px-3 py-3 lg:px-8 lg:py-6 lg:pt-16">
                      <div className="max-w-2xl mx-auto">
                  {/* Step 1: Boarding Information */}
                  {currentStep === 1 && (
                    <div className="bg-slate-800/60 backdrop-blur-sm p-3 lg:p-5 rounded-lg border border-blue-500/30 animate-in fade-in duration-300">
                      <h3 className="font-bold text-white text-sm lg:text-xl mb-3 lg:mb-4 flex items-center gap-2">
                        <div className="w-7 h-7 lg:w-10 lg:h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                          <i className="bi bi-geo-alt-fill text-blue-400 text-base lg:text-xl"></i>
                        </div>
                        Boarding Information
                      </h3>

                      <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
                        {/* Boarding Station */}
                        <div>
                          <label className="block text-xs lg:text-base font-semibold text-gray-200 mb-1.5 lg:mb-2">
                            Boarding Station <span className="text-red-400">*</span>
                          </label>
                          <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <i className="bi bi-building-fill text-gray-500 text-sm lg:text-base group-focus-within:text-blue-400 transition-colors"></i>
                            </div>
                            <input
                              type="text"
                              value={formData.boardingStationName}
                              onChange={(e) =>
                                setFormData({ ...formData, boardingStationName: e.target.value })
                              }
                              placeholder="e.g., Hyderabad Junction"
                              className="w-full pl-9 lg:pl-12 pr-3 py-2 lg:py-3 text-sm lg:text-base bg-slate-900/70 backdrop-blur-sm border border-slate-700/50 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 text-white placeholder-gray-500 transition-all"
                              required
                              maxLength={100}
                            />
                          </div>
                        </div>

                        {/* Platform */}
                        <div>
                          <label className="block text-xs lg:text-base font-semibold text-gray-200 mb-1.5 lg:mb-2">
                            Platform Number <span className="text-red-400">*</span>
                          </label>
                          <CustomSelect
                            value={formData.platformNumber}
                            onChange={(value) => setFormData({ ...formData, platformNumber: value })}
                            options={PLATFORMS.map(p => `Platform ${p}`)}
                            placeholder="Select Platform"
                            icon="bi bi-signpost-split-fill"
                            focusColor="text-blue-400"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Train Information */}
                  {currentStep === 2 && (
                    <div className="bg-slate-800/60 backdrop-blur-sm p-3 lg:p-5 rounded-lg border border-purple-500/30 animate-in fade-in duration-300">
                      <h3 className="font-bold text-white text-sm lg:text-xl mb-3 lg:mb-4 flex items-center gap-2">
                        <div className="w-7 h-7 lg:w-10 lg:h-10 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                          <i className="bi bi-train-front-fill text-purple-400 text-base lg:text-xl"></i>
                        </div>
                        Train Information
                      </h3>

                      <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
                        {/* Train Number */}
                        <div>
                          <label className="block text-xs lg:text-base font-semibold text-gray-200 mb-1.5 lg:mb-2">
                            Train Number <span className="text-red-400">*</span>
                          </label>
                          <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <i className="bi bi-hash text-gray-500 text-sm lg:text-base group-focus-within:text-purple-400 transition-colors"></i>
                            </div>
                            <input
                              type="text"
                              value={formData.trainNumber}
                              onChange={(e) =>
                                setFormData({ ...formData, trainNumber: e.target.value })
                              }
                              placeholder="e.g., 12760"
                              className="w-full pl-9 lg:pl-12 pr-3 py-2 lg:py-3 text-sm lg:text-base bg-slate-900/70 backdrop-blur-sm border border-slate-700/50 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 text-white placeholder-gray-500 transition-all"
                              required
                              maxLength={10}
                            />
                          </div>
                        </div>

                        {/* Train Name */}
                        <div>
                          <label className="block text-xs lg:text-base font-semibold text-gray-200 mb-1.5 lg:mb-2">
                            Train Name <span className="text-red-400">*</span>
                          </label>
                          <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <i className="bi bi-card-heading text-gray-500 text-sm lg:text-base group-focus-within:text-purple-400 transition-colors"></i>
                            </div>
                            <input
                              type="text"
                              value={formData.trainName}
                              onChange={(e) =>
                                setFormData({ ...formData, trainName: e.target.value })
                              }
                              placeholder="e.g., Charminar Express"
                              className="w-full pl-9 lg:pl-12 pr-3 py-2 lg:py-3 text-sm lg:text-base bg-slate-900/70 backdrop-blur-sm border border-slate-700/50 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 text-white placeholder-gray-500 transition-all"
                              required
                              maxLength={50}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Location Information */}
                  {currentStep === 3 && (
                    <div className="bg-slate-800/60 backdrop-blur-sm p-3 lg:p-5 rounded-lg border border-yellow-500/30 animate-in fade-in duration-300">
                      <h3 className="font-bold text-white text-sm lg:text-xl mb-3 lg:mb-4 flex items-center gap-2">
                        <div className="w-7 h-7 lg:w-10 lg:h-10 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                          <i className="bi bi-pin-map-fill text-yellow-400 text-base lg:text-xl"></i>
                        </div>
                        Precise Location
                      </h3>

                      <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
                        {/* Coach */}
                        <div>
                          <label className="block text-xs lg:text-base font-semibold text-gray-200 mb-1.5 lg:mb-2">
                            Coach <span className="text-red-400">*</span>
                          </label>
                          <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <i className="bi bi-box-fill text-gray-500 text-sm lg:text-base group-focus-within:text-yellow-400 transition-colors"></i>
                            </div>
                            <input
                              type="text"
                              value={formData.coach}
                              onChange={(e) => setFormData({ ...formData, coach: e.target.value })}
                              placeholder="e.g., S4, General"
                              className="w-full pl-9 lg:pl-12 pr-3 py-2 lg:py-3 text-sm lg:text-base bg-slate-900/70 backdrop-blur-sm border border-slate-700/50 rounded-lg focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/30 text-white placeholder-gray-500 transition-all"
                              required
                              maxLength={30}
                            />
                          </div>
                        </div>

                        {/* Seat Number */}
                        <div>
                          <label className="block text-xs lg:text-base font-semibold text-gray-200 mb-1.5 lg:mb-2">
                            Seat Number <span className="text-red-400">*</span>
                          </label>
                          <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <i className="bi bi-grid-3x3-gap-fill text-gray-500 text-sm lg:text-base group-focus-within:text-yellow-400 transition-colors"></i>
                            </div>
                            <input
                              type="text"
                              value={formData.seatNumber}
                              onChange={(e) =>
                                setFormData({ ...formData, seatNumber: e.target.value })
                              }
                              placeholder="e.g., 42 or 12A"
                              className="w-full pl-9 lg:pl-12 pr-3 py-2 lg:py-3 text-sm lg:text-base bg-slate-900/70 backdrop-blur-sm border border-slate-700/50 rounded-lg focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/30 text-white placeholder-gray-500 transition-all"
                              required
                              maxLength={10}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Destination Information */}
                  {currentStep === 4 && (
                    <div className="bg-slate-800/60 backdrop-blur-sm p-3 lg:p-5 rounded-lg border border-green-500/30 animate-in fade-in duration-300">
                      <h3 className="font-bold text-white text-sm lg:text-xl mb-3 lg:mb-4 flex items-center gap-2">
                        <div className="w-7 h-7 lg:w-10 lg:h-10 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                          <i className="bi bi-flag-fill text-green-400 text-base lg:text-xl"></i>
                        </div>
                        Destination
                      </h3>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs lg:text-base font-semibold text-gray-200 mb-1.5 lg:mb-2">
                            Destination Station <span className="text-red-400">*</span>
                          </label>
                          <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <i className="bi bi-geo-alt-fill text-gray-500 text-sm lg:text-base group-focus-within:text-green-400 transition-colors"></i>
                            </div>
                            <input
                              type="text"
                              value={formData.destinationStationName}
                              onChange={(e) =>
                                setFormData({ ...formData, destinationStationName: e.target.value })
                              }
                              placeholder="e.g., Chittoor"
                              className="w-full pl-9 lg:pl-12 pr-3 py-2 lg:py-3 text-sm lg:text-base bg-slate-900/70 backdrop-blur-sm border border-slate-700/50 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/30 text-white placeholder-gray-500 transition-all"
                              required
                              maxLength={100}
                            />
                          </div>
                        </div>

                        {/* Privacy Notice */}
                        <div className="p-2.5 lg:p-4 bg-slate-900/40 backdrop-blur-sm border border-slate-600/30 rounded-lg text-xs lg:text-sm text-gray-300">
                          <p className="font-semibold mb-1 flex items-center gap-1.5 text-xs lg:text-base">
                            <i className="bi bi-shield-lock-fill text-blue-400"></i>
                            Privacy Protected
                          </p>
                          <p className="text-[11px] lg:text-xs text-gray-400 leading-relaxed">
                            Only location details are shared with station staff.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                {/* Error Message */}
                {error && (
                  <div className="mt-3 p-2.5 lg:p-3 bg-red-500/20 border border-red-500/40 text-red-300 text-xs lg:text-sm rounded-lg flex items-center gap-2 backdrop-blur-sm">
                    <i className="bi bi-exclamation-triangle-fill text-base lg:text-lg text-red-400 flex-shrink-0"></i>
                    <span>{error}</span>
                  </div>
                )}
                      </div>
                    </div>

                    {/* Navigation Buttons - Fixed at bottom */}
                    <div className="flex-shrink-0 px-3 py-2.5 lg:px-8 lg:py-4 bg-slate-800/80 border-t border-slate-700/50">
                      <div className="max-w-2xl mx-auto flex gap-2 lg:gap-3">
                        {currentStep > 1 && (
                          <button
                            type="button"
                            onClick={handlePrevious}
                            className="flex-1 bg-slate-700/80 hover:bg-slate-600 text-white font-semibold py-2.5 lg:py-3 px-4 lg:px-6 rounded-lg transition-all flex items-center justify-center gap-2 text-sm lg:text-base"
                          >
                            <i className="bi bi-arrow-left text-sm"></i>
                            <span>Previous</span>
                          </button>
                        )}
                        
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className={`${currentStep === 1 ? 'w-full' : 'flex-1'} bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold py-2.5 lg:py-3 px-4 lg:px-6 rounded-lg transition-all shadow-lg shadow-red-600/20 flex items-center justify-center gap-2 text-sm lg:text-base`}
                        >
                          {isSubmitting ? (
                            <>
                              <i className="bi bi-arrow-repeat animate-spin text-sm"></i>
                              <span>Sending...</span>
                            </>
                          ) : currentStep < 4 ? (
                            <>
                              <span>Next</span>
                              <i className="bi bi-arrow-right text-sm"></i>
                            </>
                          ) : (
                            <>
                              <i className="bi bi-send-fill text-sm"></i>
                              <span>Send Alert</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
