import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { apiRequestWithToken } from '../services/apiService';
import logo from '../assets/ico.png';

function HomePage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [attemptsLeft, setAttemptsLeft] = useState(5);
  const [timeRemaining, setTimeRemaining] = useState(0);

  // Función para obtener los datos de puntuación del usuario
  const fetchScoreData = async () => {
    try {
      const response = await apiRequestWithToken('/scores/my-score', 'GET');
      setAttemptsLeft(response.data.attemptsLeft);
      setTimeRemaining(response.data.timeRemaining || 0);
    } catch (error) {
      console.error('Error al obtener los datos del usuario:', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchScoreData();
    }
  }, [isAuthenticated]);

  // Formatear el tiempo restante
  const formatTime = (milliseconds) => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-blue-900 to-indigo-900 flex flex-col items-center justify-center py-10 px-4">
      <div className="w-full max-w-md mx-auto text-center">
        {/* Botones de instrucciones y tabla de posiciones */}
        <div className="flex flex-wrap justify-center gap-4 mb-6">
          <button
            onClick={() => navigate('/instructions')}
            className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-full transition duration-300"
          >
            Instructions
          </button>
          <button
            onClick={() => navigate('/leaderboard')}
            className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full transition duration-300"
          >
            Leaderboard
          </button>
        </div>

        <div className="flex flex-col items-center space-y-6 mb-8">
          <img
            src={logo}
            alt="App Logo"
            className="w-48 sm:w-80 rounded-3xl shadow-lg"
          />
          <div className="text-center">
            <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2">Welcome</h1>
            <p className="text-gray-300 mb-8">Join the game to test your skills!</p>
            {/* Botón de juego */}
            <button
              onClick={() => navigate('/game')}
              className={`text-2xl font-bold py-4 px-8 rounded-full transition duration-300 w-full max-w-xs mb-4 ${
                isAuthenticated && attemptsLeft > 0
                  ? 'bg-green-500 hover:bg-green-700 text-white'
                  : 'bg-gray-500 text-white cursor-not-allowed'
              }`}
              disabled={!isAuthenticated || attemptsLeft <= 0}
            >
              Play Now
            </button>

            {isAuthenticated && attemptsLeft > 0 && (
              <p className="text-green-400">
                Lives remaining: <span className="font-bold text-xl">{attemptsLeft}</span>
              </p>
            )}

            
          </div>
        </div>


        {!isAuthenticated && (
          <div className="bg-red-900 bg-opacity-50 p-4 rounded-lg mt-6">
            <p className="text-red-300 text-lg font-bold">
              You must log in with an account to play
            </p>
          </div>
        )}
        
        {isAuthenticated && attemptsLeft === 0 && (
          <div className="bg-yellow-900 bg-opacity-50 p-4 rounded-lg mt-6">
            <p className="text-yellow-300 text-lg font-bold">
              No lives left. New lives in:
            </p>
            <p className="text-white text-xl font-mono">{formatTime(timeRemaining)}</p>
            <button 
              onClick={fetchScoreData}
              className="mt-4 bg-blue-700 hover:bg-blue-800 text-white py-2 px-4 rounded-lg"
            >
              Refresh
            </button>
          </div>
        )}
        
        {isAuthenticated && (
          <button
            onClick={() => navigate('/profile')}
            className="mt-4 text-white hover:text-blue-300 underline text-sm"
          >
            View Profile
          </button>
        )}
      </div>
    </div>
  );
}

export default HomePage;
