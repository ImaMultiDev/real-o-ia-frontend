import React, { useState, useEffect, useCallback } from 'react';
import { apiRequestWithToken, fetchRandomImage } from '../services/apiService';
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

function GamePage() {
  const { isAuthenticated } = useAuth();
  const [image, setImage] = useState(null);
  const [imageId, setImageId] = useState(null);
  const [imageIsReal, setImageIsReal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [attemptsLeft, setAttemptsLeft] = useState(5);
  const [gameOver, setGameOver] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cargar una nueva imagen desde nuestra API
  const loadImage = useCallback(async () => {
    setLoading(true);
    setError('');
    setFeedback(null);

    try {
      console.log('Solicitando nueva imagen...');
      const imageData = await fetchRandomImage();

      if (imageData) {
        console.log('Imagen recibida:', imageData);
        setImageId(imageData.id);
        const timestamp = Date.now();
        setImage(`${imageData.url}?t=${timestamp}`);
        setImageIsReal(imageData.real);
      } else {
        setError('La API no devolvió una imagen válida');
      }
    } catch (err) {
      console.error('Error al cargar imagen:', err);
      setError('Error al cargar la imagen. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener el puntaje y las vidas del usuario
  const fetchUserScore = useCallback(async () => {
    try {
      const response = await apiRequestWithToken('/api/scores/my-score', 'GET');
      setBestScore(response.data.bestScore || 0);
      setAttemptsLeft(response.data.attemptsLeft || 5);
      if (response.data.attemptsLeft <= 0) {
        setGameOver(true);
      }
    } catch (err) {
      console.error('Error al cargar el puntaje del usuario:', err);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadImage();
      fetchUserScore();
    }
  }, [loadImage, fetchUserScore, isAuthenticated]);

  const handleGuess = async (isRealGuess) => {
    if (loading || isSubmitting) return;
    setIsSubmitting(true);

    console.log(`👀 Usuario dijo: ${isRealGuess ? 'Real' : 'IA'}, Imagen es: ${imageIsReal ? 'Real' : 'IA'}`);
    const isCorrect = (isRealGuess === imageIsReal);

    try {
      if (isCorrect) {
        const newScore = score + 10;
        setScore(newScore);
        setFeedback({ type: 'success', message: '¡Correcto! +10 puntos' });
        
        // Actualizar puntuación en el backend
        const response = await apiRequestWithToken('/api/scores/update', 'POST', {
          points: newScore,
          hasFailed: false
        });
        
        setBestScore(response.data.bestScore);
        setAttemptsLeft(response.data.attemptsLeft);
        
        // Cargar nueva imagen después de un breve delay para mostrar feedback
        setTimeout(() => {
          loadImage();
          setIsSubmitting(false);
        }, 1000);
      } else {
        setFeedback({ type: 'error', message: '¡Fallaste! -1 vida' });
        
        // Actualizar intentos en el backend
        const response = await apiRequestWithToken('/api/scores/update', 'POST', {
          points: score, // Mantenemos el mismo puntaje
          hasFailed: true
        });
        
        const newAttemptsLeft = response.data.attemptsLeft;
        setAttemptsLeft(newAttemptsLeft);
        
        if (newAttemptsLeft <= 0) {
          setGameOver(true);
          setIsSubmitting(false);
        } else {
          // Cargar nueva imagen después de un breve delay para mostrar feedback
          setTimeout(() => {
            loadImage();
            setIsSubmitting(false);
          }, 1000);
        }
      }
    } catch (err) {
      console.error('Error al actualizar el puntaje:', err);
      setError('Error al procesar tu respuesta. Intenta nuevamente.');
      setIsSubmitting(false);
    }
  };

  const resetGame = async () => {
    try {
      await apiRequestWithToken('/api/scores/reset-attempts', 'POST');
      setScore(0);
      setGameOver(false);
      setAttemptsLeft(5);
      setError('');
      loadImage();
    } catch (err) {
      console.error('Error al reiniciar el juego:', err);
      setError('Error al reiniciar el juego. Por favor, intenta nuevamente.');
    }
  };

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  return (
    <div className="w-screen h-screen bg-gradient-to-b from-blue-900 to-indigo-900 flex flex-col py-8">
      <div className="bg-gray-800 bg-opacity-60 container mx-auto p-8 text-white rounded-lg shadow-lg">
        <div className="bg-gray-800 bg-opacity-60 container mx-auto my-2 p-6 text-white rounded-lg shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <p className="text-xl text-green-500 font-bold">Puntuación actual: {score}</p>
            <p className="text-xl font-bold text-yellow-300">Mejor puntuación: {bestScore}</p>
          </div>

          <AnimatePresence>
            {gameOver ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center"
              >
                <h2 className="text-4xl font-bold mb-4">Fin del juego</h2>
                <p className="text-lg mb-4 font-mono text-yellow-300">Tu puntuación: {score}</p>
                <p className="text-4xl my-8 font-bold text-red-500">
                  Vidas restantes: 0
                </p>
                <motion.button 
                  onClick={resetGame}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-xl bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-6 transition duration-200 rounded-full my-6"
                >
                  Jugar de nuevo
                </motion.button>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center">
                {loading && <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>}
                {error && <p className="text-red-500 my-4 font-bold">{error}</p>}
                
                {feedback && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`my-2 p-2 rounded-md font-bold ${
                      feedback.type === 'success' 
                        ? 'text-green-500 bg-green-900 bg-opacity-30' 
                        : 'text-red-500 bg-red-900 bg-opacity-30'
                    }`}
                  >
                    {feedback.message}
                  </motion.div>
                )}

                {!loading && imageId && <p className="text-xs text-gray-400 mb-2">Imagen ID: {imageId}</p>}

                {image && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={imageId}
                    className="relative w-full max-w-2xl aspect-[4/3] mx-auto overflow-hidden rounded-lg mb-4 bg-gray-800"
                  >
                    <img
                      src={image}
                      alt="¿Real o IA?"
                      className="w-full h-full object-contain"
                      onError={() => {
                        console.error("Error al cargar la imagen");
                        setError("Error al cargar la imagen. Intenta nuevamente.");
                        loadImage();
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-20 pointer-events-none"></div>
                  </motion.div>
                )}

                <div className="flex justify-center space-x-4 mt-4">
                  <motion.button
                    onClick={() => handleGuess(true)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={loading || isSubmitting}
                    className={`text-xl ${
                      isSubmitting ? 'bg-gray-500' : 'bg-blue-500 hover:bg-blue-700'
                    } text-white font-bold py-2 px-6 rounded-full`}
                  >
                    Real
                  </motion.button>
                  <motion.button
                    onClick={() => handleGuess(false)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={loading || isSubmitting}
                    className={`text-xl ${
                      isSubmitting ? 'bg-gray-500' : 'bg-red-500 hover:bg-red-700'
                    } text-white font-bold py-2 px-6 rounded-full`}
                  >
                    IA
                  </motion.button>
                </div>

                <div className="flex items-center mt-4">
                  <span className="text-xl font-bold mr-2">Vidas:</span>
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{
                        scale: i < attemptsLeft ? 1 : 0.8,
                        opacity: i < attemptsLeft ? 1 : 0.5
                      }}
                      transition={{ type: 'spring', stiffness: 500 }}
                      className={`w-6 h-6 rounded-full mx-1 ${
                        i < attemptsLeft ? 'bg-red-500' : 'bg-gray-500'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default GamePage;