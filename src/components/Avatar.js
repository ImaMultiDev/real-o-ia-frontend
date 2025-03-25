// real-o-ia-game/src/components/Avatar.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function Avatar() {
  const { user, isAuthenticated } = useAuth();  // Obtener usuario y autenticación
  const profileImage = user?.profileImage;  // Asumimos que el modelo 'user' tiene el campo 'profileImage'

  return (
    isAuthenticated && (
      <div className="absolute top-4 right-4">
        <Link to="/profile">
          <div
            className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white text-lg"
            style={{ backgroundImage: `url(${profileImage || ''})`, backgroundSize: 'cover' }}
          >
            {!profileImage && <span>U</span>}
          </div>
        </Link>
      </div>
    )
  );
}

export default Avatar;

