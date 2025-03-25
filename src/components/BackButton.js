// real-o-ia-game/src/components/BackButton.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

function BackButton() {
  const navigate = useNavigate();

  const goBack = () => {
    navigate(-1);  // Esto retrocede a la página anterior
  };

  return (
    <button
      onClick={goBack}
      className="absolute top-2 left-4 p-2 bg-blue-500 text-white rounded-full"
    >
      &lt; Back
    </button>
  );
}

export default BackButton;
