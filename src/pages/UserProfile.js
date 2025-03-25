import React, { useState, useEffect } from 'react';
import { apiRequestWithToken } from '../services/apiService';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

function UserProfile() {
  const { setIsAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [bestScore, setBestScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await apiRequestWithToken('/user/profile', 'GET');
        setFormData({
          username: response.data.username || '',
          email: response.data.email || '',
          phone: response.data.phone || '',
          password: '',
          confirmPassword: '',
        });
        setBestScore(response.data.bestScore || 0);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Error loading profile information');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await apiRequestWithToken('/user/profile', 'PUT', {
        email: formData.email,
        username: formData.username,
        phone: formData.phone,
        password: formData.password || undefined
      });
      
      if (response.status === 200) {
        setSuccess('Profile updated successfully');
        setFormData({
          ...formData,
          password: '',
          confirmPassword: ''
        });
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update profile';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    setIsAuthenticated(false);
    navigate('/');
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-blue-900 to-indigo-900 py-8 px-4 overflow-y-auto">
      <div className="container mx-auto max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center"
        >
          <div className="flex items-center mb-6">
            <button 
              onClick={() => navigate('/')}
              className="text-white hover:text-blue-300 mr-4"
            >
              &larr; Back to Home
            </button>
            <h2 className="text-xl bg-gray-800 py-2 px-8 text-sky-200 font-mono rounded-full shadow-lg">
              {formData.username || 'My Profile'}
            </h2>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full bg-red-500 bg-opacity-20 text-red-200 p-3 rounded-lg mb-4 text-center"
            >
              {error}
            </motion.div>
          )}
          
          {success && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full bg-green-500 bg-opacity-20 text-green-200 p-3 rounded-lg mb-4 text-center"
            >
              {success}
            </motion.div>
          )}

          <div className="flex flex-col w-full gap-6 mb-6">
            <div className="w-full p-4 bg-gray-800 bg-opacity-80 rounded-lg text-center">
              <p className="text-yellow-300 text-sm uppercase">Best Score</p>
              <p className="text-yellow-400 text-3xl font-bold">{bestScore}</p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="bg-gray-800 bg-opacity-70 shadow-lg rounded-xl p-6 text-white w-full"
            >
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1" htmlFor="username">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  id="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 text-sm rounded-lg bg-gray-700 text-white border-gray-600 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1" htmlFor="email">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 text-sm rounded-lg bg-gray-700 text-white border-gray-600 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1" htmlFor="phone">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 text-sm rounded-lg bg-gray-700 text-white border-gray-600 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1" htmlFor="password">
                  New Password (leave blank to keep current)
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full border px-3 py-2 text-sm rounded-lg bg-gray-700 text-white border-gray-600 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-1" htmlFor="confirmPassword">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full border px-3 py-2 text-sm rounded-lg bg-gray-700 text-white border-gray-600 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-between">
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? 'Updating...' : 'Update Profile'}
                </button>
                
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
                >
                  Logout
                </button>
              </div>
            </form>
          </div>
          
          <button 
            onClick={() => navigate('/reset-attempts')}
            className="mt-2 text-gray-300 hover:text-white text-sm underline"
          >
            Reset My Game Attempts
          </button>
        </motion.div>
      </div>
    </div>
  );
}

export default UserProfile;
