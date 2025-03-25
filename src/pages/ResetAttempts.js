import React, { useState } from 'react';
import { apiRequestWithToken } from '../services/apiService';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';

function ResetAttempts() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [attemptsLeft, setAttemptsLeft] = useState(null);

  const handleReset = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const response = await apiRequestWithToken('/scores/reset-attempts', 'POST');
      
      if (response.status === 200) {
        setSuccess('Your attempts have been reset successfully!');
        setAttemptsLeft(response.data.attemptsLeft);
      }
    } catch (error) {
      console.error('Error resetting attempts:', error);
      setError(error.response?.data?.message || 'Failed to reset attempts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-blue-900 to-indigo-900 py-8 px-4">
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gray-800 bg-opacity-80 p-6 rounded-xl shadow-lg"
        >
          <div className="flex items-center mb-6">
            <button
              onClick={() => navigate('/profile')}
              className="text-white hover:text-blue-300 mr-4"
            >
              &larr; Back to Profile
            </button>
            <h2 className="text-xl text-white font-bold">Reset Game Attempts</h2>
          </div>

          <p className="text-gray-300 mb-6">
            Use this option to reset your daily game attempts. This feature is primarily for testing purposes.
          </p>

          {error && (
            <div className="bg-red-500 bg-opacity-20 text-red-200 p-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-500 bg-opacity-20 text-green-200 p-3 rounded-lg mb-4">
              {success}
              {attemptsLeft !== null && (
                <p className="mt-2 font-bold">You now have {attemptsLeft} attempts available.</p>
              )}
            </div>
          )}

          <div className="flex justify-center mt-6">
            <button
              onClick={handleReset}
              disabled={loading}
              className={`px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Processing...' : 'Reset My Attempts'}
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-6 text-center">
            Note: In a production environment, attempts are automatically reset every 24 hours.
          </p>
        </motion.div>

        <div className="text-center mt-4">
          <button
            onClick={() => navigate('/')}
            className="text-white hover:text-blue-300 underline text-sm"
          >
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default ResetAttempts;