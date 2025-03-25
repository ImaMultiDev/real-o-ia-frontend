import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { apiRequestWithToken } from '../services/apiService';
import UserAuth from './UserAuth';
import logo from '../assets/ico.png';

function Navbar() {
  const { isAuthenticated } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [userInfo, setUserInfo] = useState({
    username: '',
    bestScore: 0,
    attemptsLeft: 5,
  });
  const navigate = useNavigate();
  const location = useLocation();

  const fetchUserData = useCallback(async () => {
    try {
      const response = await apiRequestWithToken('/api/scores/my-score', 'GET');
      setUserInfo(prevInfo => ({
        ...prevInfo,
        bestScore: response.data.bestScore || 0,
        attemptsLeft: response.data.attemptsLeft || 0,
      }));
    } catch (error) {
      console.error('Error al cargar los datos del usuario:', error);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      // Cargar datos iniciales del usuario
      const loadInitialData = async () => {
        try {
          const response = await apiRequestWithToken('/user/profile', 'GET');
          setUserInfo({
            username: response.data.username || response.data.email,
            bestScore: response.data.bestScore || 0,
            attemptsLeft: response.data.attemptsLeft || 0,
          });
        } catch (error) {
          console.error('Error al cargar los datos del usuario:', error);
        }
      };
      loadInitialData();
    }
  }, [isAuthenticated]);

  // Actualizar datos cuando el usuario está en la página del juego
  useEffect(() => {
    let intervalId;
    if (isAuthenticated && location.pathname === '/game') {
      // Actualizar inmediatamente
      fetchUserData();
      // Y luego cada 2 segundos mientras esté en la página del juego
      intervalId = setInterval(fetchUserData, 2000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isAuthenticated, location.pathname, fetchUserData]);

  const handleAuthNavigation = (mode) => {
    setAuthMode(mode);
    setShowAuthModal(true);
    if (location.pathname !== '/') {
      navigate('/');
    }
  };

  const showBackButton =
    location.pathname !== '/' &&
    location.pathname !== '/login' &&
    location.pathname !== '/signup';

  const handleBackButton = () => {
    navigate(-1);
  };

  const handleProfileNavigation = () => {
    if (isAuthenticated) {
      navigate('/profile');
    }
  };

  return (
    <>
      <div className="h-20 bg-blue-900 text-white px-8 flex items-center justify-between shadow-lg fixed top-0 w-full z-50">
        {showBackButton && (
          <button
            onClick={handleBackButton}
            className="flex items-center bg-gray-800 hover:bg-gray-700 text-white py-2 px-4 rounded-lg shadow-md transform transition-transform hover:scale-105"
          >
            <span className="mr-2">⬅</span>
            <span>Back</span>
          </button>
        )}

        <div className="flex-shrink-0">
          <img 
            src={logo} 
            alt="App Logo" 
            className="w-12 h-12 rounded-full cursor-pointer"
            onClick={() => navigate('/')} 
          />
        </div>

        {isAuthenticated ? (
          <div
            className="flex items-center space-x-4 bg-gray-800 p-3 rounded-lg shadow-md transform transition-transform hover:scale-105 hover:shadow-lg cursor-pointer"
            onClick={handleProfileNavigation}
            title="Go to Profile"
          >
            <div className="text-sm font-mono text-center">
              <p className="font-semibold">{userInfo.bestScore} Points</p>
              <p className="text-yellow-300">💛 {userInfo.attemptsLeft}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-4">
            <button
              onClick={() => handleAuthNavigation('login')}
              className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-full transition duration-300"
            >
              Login
            </button>
            <button
              onClick={() => handleAuthNavigation('signup')}
              className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full transition duration-300"
            >
              Sign Up
            </button>
          </div>
        )}
      </div>

      <div className="h-20"></div> {/* Espaciador para compensar el navbar fijo */}

      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md m-4">
            <UserAuth
              mode={authMode}
              onClose={() => setShowAuthModal(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;
