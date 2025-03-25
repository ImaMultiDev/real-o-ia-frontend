import React from 'react';
import { motion } from 'framer-motion';

function Instructions() {
  return (
    <div className="w-screen bg-gradient-to-b from-blue-900 to-indigo-900 min-h-screen flex flex-col py-16 items-center h-full">
      <motion.div
        className="bg-gray-800 text-white p-8 rounded-lg shadow-2xl max-w-3xl"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold text-center mb-6 tracking-wide">📜 Instructions</h1>
        <p className="text-lg mb-4 text-gray-300 text-center">
          Follow these instructions to excel in the game:
        </p>
        <ul className="list-disc list-inside text-gray-100 space-y-4">
          <li>Identify which image is real and which one is AI-generated.</li>
          <li>You gain points for each correct answer. Be careful, you have limited attempts!</li>
          <li>Compete with other players and try to reach the top of the leaderboard.</li>
        </ul>
      </motion.div>
    </div>
  );
}

export default Instructions;
