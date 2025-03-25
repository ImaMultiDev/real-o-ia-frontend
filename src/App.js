import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import GamePage from './pages/GamePage';
import Instructions from './pages/Instructions';
import Leaderboard from './components/Leaderboard';
import UserProfile from './pages/UserProfile';
import ResetAttempts from './pages/ResetAttempts';
import { AuthProvider } from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="h-screen w-screen overflow-hidden">
          <Navbar />
          <main className="h-[calc(100vh-5rem)] w-full">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/instructions" element={<Instructions />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route
                path="/game"
                element={
                  <ProtectedRoute>
                    <GamePage />
                  </ProtectedRoute>
                }
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <UserProfile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/reset-attempts" 
                element={
                  <ProtectedRoute>
                    <ResetAttempts />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
