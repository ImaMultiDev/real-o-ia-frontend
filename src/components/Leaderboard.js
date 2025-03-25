import React, { useState, useEffect } from 'react';
import { apiRequestWithToken } from '../services/apiService';
import { motion } from 'framer-motion';

function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiRequestWithToken('/scores/leaderboard', 'GET');
      console.log('Leaderboard data:', response.data);
      setLeaderboard(response.data);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError('Failed to load leaderboard');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  return (
    <div className="w-screen bg-gradient-to-b from-blue-900 to-indigo-900 min-h-screen p-8">
      <motion.div
        className="bg-gray-900 text-white p-6 rounded-lg shadow-2xl mx-auto max-w-4xl"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold mb-6 text-center tracking-wider">🏆 Leaderboard</h1>
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
          </div>
        ) : error ? (
          <p className="text-red-500 text-center">{error}</p>
        ) : leaderboard.length === 0 ? (
          <p className="text-center text-yellow-300">No scores available yet. Be the first to play!</p>
        ) : (
          <div className="overflow-hidden rounded-lg shadow-lg">
            <table className="table-auto w-full text-left border-collapse">
              <thead>
                <tr className="bg-purple-700 text-white">
                  <th className="py-3 px-5">Rank</th>
                  <th className="py-3 px-5">User</th>
                  <th className="py-3 px-5 text-right">Score</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry, index) => (
                  <tr
                    key={`score-${index}`}
                    className={index % 2 === 0 ? 'bg-purple-900 bg-opacity-30' : 'bg-purple-800 bg-opacity-20'}
                  >
                    <td className="py-3 px-5 text-white font-semibold">{index + 1}</td>
                    <td className="py-3 px-5 text-white">
                      {entry.User ? (entry.User.username || entry.User.email || 'Anonymous') : 'Unknown User'}
                    </td>
                    <td className="py-3 px-5 text-right text-yellow-300 font-bold">
                      {entry.bestScore}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="mt-6 text-center">
          <button 
            onClick={fetchLeaderboard} 
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Refresh Leaderboard
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default Leaderboard;
