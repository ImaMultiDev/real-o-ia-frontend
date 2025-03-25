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
    <div className="h-[calc(100vh-5rem)] bg-gradient-to-b from-blue-900 to-indigo-900 flex items-center justify-center">
      <div className="w-full max-w-lg mx-auto px-4">
        <div className="w-full flex flex-col justify-center gap-4">
          {/* Botones de instrucciones y tabla de posiciones */}
          <div className="flex justify-center gap-6">
            <button
              onClick={() => navigate('/instructions')}
              className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-6 rounded-full transition duration-300"
            >
              Instructions
            </button>
            <button
              onClick={() => navigate('/leaderboard')}
              className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-full transition duration-300"
            >
              Leaderboard
            </button>
          </div>

          <div className="text-center">
            <img
              src={logo}
              alt="App Logo"
              className="w-72 mx-auto rounded-2xl shadow-lg mb-4"
            />
            <h1 className="text-3xl font-bold text-white mb-2">Welcome</h1>
            <p className="text-gray-300 text-lg mb-4">Join the game to test your skills!</p>
            
            <button
              onClick={() => navigate('/game')}
              className={`text-xl font-bold py-2.5 px-8 rounded-full transition duration-300 w-full max-w-sm mb-2 ${
                isAuthenticated && attemptsLeft > 0
                  ? 'bg-green-500 hover:bg-green-700 text-white transform hover:scale-105'
                  : 'bg-gray-500 text-white cursor-not-allowed'
              }`}
              disabled={!isAuthenticated || attemptsLeft <= 0}
            >
              Play Now
            </button>

            {isAuthenticated && attemptsLeft > 0 && (
              <p className="text-green-400 text-lg">
                Lives remaining: <span className="font-bold text-xl">{attemptsLeft}</span>
              </p>
            )}
          </div>

          {!isAuthenticated && (
            <div className="bg-red-900 bg-opacity-50 p-3 rounded-lg">
              <p className="text-red-300 text-base font-bold">
                You must log in with an account to play
              </p>
            </div>
          )}
          
          {isAuthenticated && attemptsLeft === 0 && (
            <div className="bg-yellow-900 bg-opacity-50 p-3 rounded-lg">
              <p className="text-yellow-300 text-base font-bold">
                No lives left. New lives in:
              </p>
              <p className="text-white text-xl font-mono my-1">{formatTime(timeRemaining)}</p>
              <button 
                onClick={fetchScoreData}
                className="mt-1 bg-blue-700 hover:bg-blue-800 text-white py-1.5 px-4 rounded-lg text-sm transform hover:scale-105 transition"
              >
                Refresh
              </button>
            </div>
          )}
          
          {isAuthenticated && (
            <button
              onClick={() => navigate('/profile')}
              className="text-white hover:text-blue-300 underline text-sm transition-colors"
            >
              View Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default HomePage;
