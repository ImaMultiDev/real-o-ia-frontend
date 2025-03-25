import React, { useState, useEffect } from 'react';
import { apiRequestWithToken } from '../services/apiService';
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';

function RealVsFakeGame() {
  const { isAuthenticated } = useAuth();
  const [realImage, setRealImage] = useState(null);
  const [aiImage, setAiImage] = useState(null);
  const [realImageId, setRealImageId] = useState(null);
  const [aiImageId, setAiImageId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const [attemptsLeft, setAttemptsLeft] = useState(5);
  const [gameOver, setGameOver] = useState(false);

  // Cargar imágenes reales y de IA
  const loadImages = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('Solicitando par de imágenes...');
      
      // Obtener imagen real (real=true)
      const realImageResponse = await apiRequestWithToken('/api/images/random?real=true', 'GET');
      // Obtener imagen de IA (real=false)
      const aiImageResponse = await apiRequestWithToken('/api/images/random?real=false', 'GET');
      
      if (realImageResponse.data && aiImageResponse.data) {
        console.log('Par de imágenes recibido:', { 
          real: realImageResponse.data, 
          ai: aiImageResponse.data 
        });
        
        // Guardar los datos de las imágenes
        setRealImageId(realImageResponse.data.id);
        setAiImageId(aiImageResponse.data.id);
        
        // Añadir timestamp para evitar problemas de caché
        const timestamp = Date.now();
        setRealImage(`${realImageResponse.data.url}?t=${timestamp}-real`);
        setAiImage(`${aiImageResponse.data.url}?t=${timestamp}-ai`);
        
        console.log(`Nuevas imágenes cargadas: Real(${realImageResponse.data.id}), AI(${realImageResponse.data.id})`);
        setFeedback('');
      } else {
        throw new Error('No se recibieron imágenes válidas');
      }
    } catch (err) {
      console.error('Error en loadImages:', err);
      setError('Error al cargar las imágenes. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Obtener el puntaje y los intentos del usuario
  const fetchUserScore = async () => {
    try {
      const response = await apiRequestWithToken('/api/scores/my-score', 'GET');
      setAttemptsLeft(response.data.attemptsLeft || 5);
      if (response.data.attemptsLeft <= 0) {
        setGameOver(true);
      }
    } catch (err) {
      console.error('Error al cargar el puntaje del usuario:', err);
    }
  };

  useEffect(() => {
    // Cargar imágenes al montar el componente
    loadImages();
    fetchUserScore();
  }, []);

  const handleGuess = async (selectedImageType, imageIndex) => {
    if (loading) return; // Evitar clicks durante la carga
    
    // Determinar si la respuesta es correcta
    const isCorrect = (selectedImageType === 'real' && imageIndex === 0) || 
                     (selectedImageType === 'ai' && imageIndex === 1);

    if (isCorrect) {
      setFeedback('¡Correcto!');
      setScore((prev) => prev + 1);
      
      // Actualizar puntuación en el servidor
      try {
        await apiRequestWithToken('/api/scores/update', 'POST', { points: score + 1 });
      } catch (err) {
        console.error('Error al actualizar puntuación:', err);
      }
    } else {
      setFeedback('¡Incorrecto!');
      setAttemptsLeft(prev => prev - 1);
      
      // Actualizar intentos restantes en el servidor
      try {
        await apiRequestWithToken('/api/scores/update', 'POST', { 
          points: score,
          decrementAttempts: true
        });
        
        if (attemptsLeft - 1 <= 0) {
          setGameOver(true);
          return;
        }
      } catch (err) {
        console.error('Error al actualizar intentos:', err);
      }
    }
    
    // Cargar nuevas imágenes después de un pequeño retraso
    setTimeout(() => {
      loadImages();
    }, 1000);
  };

  const resetGame = async () => {
    try {
      await apiRequestWithToken('/api/scores/reset-attempts', 'POST');
      setScore(0);
      setGameOver(false);
      setAttemptsLeft(5);
      loadImages();
    } catch (err) {
      console.error('Error al reiniciar el juego:', err);
      setError('Error al reiniciar el juego. Por favor, intenta nuevamente.');
    }
  };

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  return (
    <div className="w-screen bg-gray-900 min-h-screen flex flex-col items-center text-white py-8">
      <h1 className="text-3xl font-bold mb-4">Real vs IA</h1>
      
      {/* Puntuación y feedback */}
      <div className="mb-6">
        <p className="text-xl font-bold text-yellow-300">Puntuación: {score}</p>
        <p className="text-lg font-bold text-blue-300">Intentos restantes: {attemptsLeft}</p>
        {feedback && (
          <p className={`text-lg font-semibold mt-2 ${feedback === '¡Correcto!' ? 'text-green-400' : 'text-red-400'}`}>
            {feedback}
          </p>
        )}
        {error && <p className="text-red-500 font-bold mt-2">{error}</p>}
      </div>
      
      {/* Pantalla de fin de juego */}
      {gameOver ? (
        <div className="text-center">
          <h2 className="text-4xl font-bold mb-4">Fin del juego</h2>
          <p className="text-lg mb-4 font-mono text-yellow-300">Tu puntuación final: {score}</p>
          <button
            onClick={resetGame}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Jugar de nuevo
          </button>
        </div>
      ) : (
        <>
          {/* Indicador de carga */}
          {loading && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-10 flex items-center justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
            </div>
          )}
          
          <div className="flex flex-col md:flex-row space-y-8 md:space-y-0 md:space-x-8">
            {/* Primera imagen (Real) */}
            <div className="flex flex-col items-center">
              <div className="relative">
                {realImage ? (
                  <img
                    src={realImage}
                    alt="Imagen 1"
                    className="w-64 h-64 rounded-lg shadow-md object-cover"
                    onLoad={() => console.log("Imagen real cargada correctamente")}
                    onError={() => {
                      console.error("Error al cargar la imagen real");
                      setError("Error al cargar una imagen. Intenta nuevamente.");
                    }}
                  />
                ) : (
                  <div className="w-64 h-64 bg-gray-800 flex items-center justify-center rounded-lg">
                    <p className="text-gray-400">Cargando imagen...</p>
                  </div>
                )}
                <div className="absolute bottom-2 left-0 right-0 text-center">
                  <span className="bg-gray-800 bg-opacity-70 px-2 py-1 rounded text-xs">Imagen 1</span>
                </div>
              </div>
              <div className="flex space-x-2 mt-4">
                <button
                  onClick={() => handleGuess('real', 0)}
                  className={`bg-green-500 hover:bg-green-700 text-white py-2 px-6 rounded shadow-lg transition ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={loading}
                >
                  Real
                </button>
                <button
                  onClick={() => handleGuess('ai', 0)}
                  className={`bg-red-500 hover:bg-red-700 text-white py-2 px-6 rounded shadow-lg transition ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={loading}
                >
                  IA
                </button>
              </div>
            </div>
            
            {/* Segunda imagen (IA) */}
            <div className="flex flex-col items-center">
              <div className="relative">
                {aiImage ? (
                  <img
                    src={aiImage}
                    alt="Imagen 2"
                    className="w-64 h-64 rounded-lg shadow-md object-cover"
                    onLoad={() => console.log("Imagen IA cargada correctamente")}
                    onError={() => {
                      console.error("Error al cargar la imagen IA");
                      setError("Error al cargar una imagen. Intenta nuevamente.");
                    }}
                  />
                ) : (
                  <div className="w-64 h-64 bg-gray-800 flex items-center justify-center rounded-lg">
                    <p className="text-gray-400">Cargando imagen...</p>
                  </div>
                )}
                <div className="absolute bottom-2 left-0 right-0 text-center">
                  <span className="bg-gray-800 bg-opacity-70 px-2 py-1 rounded text-xs">Imagen 2</span>
                </div>
              </div>
              <div className="flex space-x-2 mt-4">
                <button
                  onClick={() => handleGuess('real', 1)}
                  className={`bg-green-500 hover:bg-green-700 text-white py-2 px-6 rounded shadow-lg transition ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={loading}
                >
                  Real
                </button>
                <button
                  onClick={() => handleGuess('ai', 1)}
                  className={`bg-red-500 hover:bg-red-700 text-white py-2 px-6 rounded shadow-lg transition ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={loading}
                >
                  IA
                </button>
              </div>
            </div>
          </div>
          
          {/* Información de diagnóstico */}
          <div className="mt-8 text-xs text-gray-500">
            <p>ID Imagen Real: {realImageId || 'Cargando...'}</p>
            <p>ID Imagen IA: {aiImageId || 'Cargando...'}</p>
          </div>
          
          {/* Botón para cargar nuevas imágenes manualmente */}
          {!loading && (
            <button
              onClick={loadImages}
              className="mt-6 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Cargar nuevas imágenes
            </button>
          )}
        </>
      )}
    </div>
  );
}

export default RealVsFakeGame;
