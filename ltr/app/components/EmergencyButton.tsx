'use client';

import { useState } from 'react';

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

export default function EmergencyButton({ variant = 'fixed' }: EmergencyButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState('');

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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    // Validate all required fields
    const requiredFields = [
      { field: 'boardingStationName', label: 'Boarding station name' },
      { field: 'platformNumber', label: 'Platform number' },
      { field: 'trainNumber', label: 'Train number' },
      { field: 'trainName', label: 'Train name' },
      { field: 'coach', label: 'Coach/compartment' },
      { field: 'seatNumber', label: 'Seat number' },
      { field: 'destinationStationName', label: 'Destination station name' },
    ];

    const missingFields = requiredFields.filter(
      ({ field }) => !formData[field as keyof typeof formData]
    );

    if (missingFields.length > 0) {
      setError(`Please fill all required fields: ${missingFields.map((f) => f.label).join(', ')}`);
      setIsSubmitting(false);
      return;
    }

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
      // Set flag for dashboard notification
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
            ? "fixed bottom-6 right-6 z-50 bg-red-600 hover:bg-red-700 text-white font-semibold py-4 px-6 rounded-lg shadow-2xl shadow-red-600/20 flex items-center gap-2 transition-all duration-200"
            : "bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 px-4 rounded-lg shadow-lg flex items-center gap-2 transition-all duration-200 whitespace-nowrap"
        }
        aria-label="Emergency Assistance"
      >
        <span className={variant === 'fixed' ? "text-2xl" : "text-xl"}>🆘</span>
        <span className={variant === 'fixed' ? "text-sm sm:text-base font-semibold" : "text-sm font-semibold"}>EMERGENCY</span>
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop with blur effect */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={handleCloseModal}
            aria-hidden="true"
          ></div>
          
          {/* Modal content */}
          <div className="relative bg-white rounded-lg shadow-2xl max-w-2xl w-full my-8 z-10">
            {/* Header */}
            <div className="bg-red-600 text-white p-4 rounded-t-lg sticky top-0 z-10">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <span className="text-2xl">🚨</span>
                  Emergency Assistance
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-white hover:text-gray-200 text-2xl font-bold"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
              <p className="text-sm mt-2 text-red-100">
                All fields are mandatory. Fill precise location details.
              </p>
            </div>

            {/* Success Message */}
            {submitSuccess && (
              <div className="p-4 bg-green-50 border-l-4 border-green-500 m-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">✅</span>
                  <div>
                    <p className="font-semibold text-green-800">Alert Sent Successfully!</p>
                    <p className="text-sm text-green-700">
                      Station staff at your boarding and destination stations have been notified.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Form */}
            {!submitSuccess && (
              <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                {/* Boarding Station Section */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    <span>🚉</span> Boarding Information
                  </h3>

                  <div className="space-y-3">
                    {/* Boarding Station */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Boarding Station Name <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.boardingStationName}
                        onChange={(e) =>
                          setFormData({ ...formData, boardingStationName: e.target.value })
                        }
                        placeholder="e.g., Hyderabad Junction"
                        className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none focus:ring-0 focus:ring-offset-0 text-base text-gray-900"
                        required
                        maxLength={100}
                      />
                    </div>

                    {/* Platform */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Platform Number <span className="text-red-600">*</span>
                      </label>
                      <select
                        value={formData.platformNumber}
                        onChange={(e) =>
                          setFormData({ ...formData, platformNumber: e.target.value })
                        }
                        className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none focus:ring-0 focus:ring-offset-0 text-base text-gray-900"
                        required
                      >
                        <option value="">Select Platform</option>
                        {PLATFORMS.map((platform) => (
                          <option key={platform} value={platform}>
                            Platform {platform}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Train Information Section */}
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h3 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                    <span>🚂</span> Train Information
                  </h3>

                  <div className="space-y-3">
                    {/* Train Number */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Train Number <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.trainNumber}
                        onChange={(e) =>
                          setFormData({ ...formData, trainNumber: e.target.value })
                        }
                        placeholder="e.g., 12760"
                        className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none focus:ring-0 focus:ring-offset-0 text-base text-gray-900"
                        required
                        maxLength={10}
                      />
                    </div>

                    {/* Train Name */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Train Name <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.trainName}
                        onChange={(e) =>
                          setFormData({ ...formData, trainName: e.target.value })
                        }
                        placeholder="e.g., Charminar Express"
                        className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none focus:ring-0 focus:ring-offset-0 text-base text-gray-900"
                        required
                        maxLength={50}
                      />
                    </div>
                  </div>
                </div>

                {/* Location Information Section */}
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h3 className="font-semibold text-yellow-900 mb-3 flex items-center gap-2">
                    <span>📍</span> Precise Location
                  </h3>

                  <div className="space-y-3">
                    {/* Coach */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Coach / Compartment <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.coach}
                        onChange={(e) => setFormData({ ...formData, coach: e.target.value })}
                        placeholder="e.g., S4, General, Ladies"
                        className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none focus:ring-0 focus:ring-offset-0 text-base text-gray-900"
                        required
                        maxLength={30}
                      />
                    </div>

                    {/* Seat Number */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Seat Number <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.seatNumber}
                        onChange={(e) =>
                          setFormData({ ...formData, seatNumber: e.target.value })
                        }
                        placeholder="e.g., 42 or 12A"
                        className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none focus:ring-0 focus:ring-offset-0 text-base text-gray-900"
                        required
                        maxLength={10}
                      />
                    </div>
                  </div>
                </div>

                {/* Destination Section */}
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                    <span>🎯</span> Destination Information
                  </h3>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Destination Station Name <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.destinationStationName}
                      onChange={(e) =>
                        setFormData({ ...formData, destinationStationName: e.target.value })
                      }
                      placeholder="e.g., Chittoor"
                      className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none focus:ring-0 focus:ring-offset-0 text-base text-gray-900"
                      required
                      maxLength={100}
                    />
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">
                    ⚠️ {error}
                  </div>
                )}

                {/* Privacy Notice */}
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-800">
                  <p className="font-semibold mb-1">🔒 Privacy Protected</p>
                  <p>
                    No personal information is collected. Only location details are used to help
                    station staff locate the person in need.
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold py-4 px-6 rounded-lg transition-colors duration-200 text-lg"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin">⏳</span>
                      Sending Alert...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <span>🚨</span>
                      Send Emergency Alert
                    </span>
                  )}
                </button>

                <p className="text-xs text-center text-gray-500">
                  Both boarding and destination station managers will be notified immediately
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
