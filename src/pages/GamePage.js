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
    <div className="h-[calc(100vh-5rem)] bg-gradient-to-b from-blue-900 to-indigo-900 flex items-center justify-center">
      <div className="w-full max-w-4xl mx-auto px-4 flex items-center">
        <div className="bg-gray-800 bg-opacity-60 w-full text-white rounded-lg shadow-xl flex flex-col max-h-[calc(100vh-7rem)]">
          <div className="flex justify-between items-center px-6 py-2 border-b border-gray-700">
            <p className="text-xl text-green-500 font-bold">Puntuación actual: {score}</p>
            <p className="text-xl font-bold text-yellow-300">Mejor puntuación: {bestScore}</p>
          </div>

          <div className="flex-1 p-3 flex flex-col justify-center m-auto">
            <AnimatePresence>
              {gameOver ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-6"
                >
                  <h2 className="text-3xl font-bold mb-3">Fin del juego</h2>
                  <p className="text-xl mb-3 font-mono text-yellow-300">Tu puntuación: {score}</p>
                  <p className="text-3xl mb-4 font-bold text-red-500">
                    Vidas restantes: 0
                  </p>
                  <motion.button 
                    onClick={resetGame}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-xl bg-green-500 hover:bg-green-700 text-white font-bold py-3 px-8 transition duration-200 rounded-full"
                  >
                    Jugar de nuevo
                  </motion.button>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center justify-between h-full max-h-[calc(100vh-12rem)]">
                  {loading && (
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
                  )}
                  
                  {error && (
                    <p className="text-red-500 text-sm font-bold">{error}</p>
                  )}
                  
                  {feedback && (
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className={`px-4 py-2 rounded-md font-bold ${
                        feedback.type === 'success' 
                          ? 'text-green-500 bg-green-900 bg-opacity-30' 
                          : 'text-red-500 bg-red-900 bg-opacity-30'
                      }`}
                    >
                      {feedback.message}
                    </motion.div>
                  )}

                  {!loading && imageId && (
                    <p className="text-xs text-gray-400">Imagen ID: {imageId}</p>
                  )}

                  {image && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      key={imageId}
                      className="relative w-full max-w-xl mx-auto"
                    >
                      <div className="aspect-[4/3] max-h-[50vh] bg-gray-900 rounded-lg overflow-hidden">
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
                      </div>
                    </motion.div>
                  )}

                  <div className="flex flex-col gap-4 mt-2">
                    <div className="flex justify-center gap-6">
                      <motion.button
                        onClick={() => handleGuess(true)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={loading || isSubmitting}
                        className={`text-lg ${
                          isSubmitting ? 'bg-gray-500' : 'bg-blue-500 hover:bg-blue-700'
                        } text-white font-bold py-2 px-8 rounded-full transition-colors`}
                      >
                        Real
                      </motion.button>
                      <motion.button
                        onClick={() => handleGuess(false)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={loading || isSubmitting}
                        className={`text-lg ${
                          isSubmitting ? 'bg-gray-500' : 'bg-red-500 hover:bg-red-700'
                        } text-white font-bold py-2 px-8 rounded-full transition-colors`}
                      >
                        IA
                      </motion.button>
                    </div>

                    <div className="flex items-center justify-center">
                      <span className="text-lg font-bold mr-2">Vidas:</span>
                      {[...Array(5)].map((_, i) => (
                        <motion.div
                          key={i}
                          animate={{
                            scale: i < attemptsLeft ? 1 : 0.8,
                            opacity: i < attemptsLeft ? 1 : 0.5
                          }}
                          transition={{ type: 'spring', stiffness: 500 }}
                          className={`w-4 h-4 rounded-full mx-1 ${
                            i < attemptsLeft ? 'bg-red-500' : 'bg-gray-500'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GamePage;