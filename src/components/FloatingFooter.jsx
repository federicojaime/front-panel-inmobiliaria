// src/components/FloatingFooter.jsx
import React from 'react';

// Importa tu logo (asegúrate de añadir el archivo en la carpeta assets)
import codeoLogo from '../assets/codeo-logo.png';

const FloatingFooter = () => {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center bg-white rounded-full shadow-lg py-2 px-3 border border-gray-200">
      <span className="text-xs text-gray-600 mr-2">Desarrollado por</span>
      <a 
        href="https://www.instagram.com/codeo.ar" 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex items-center hover:opacity-80 transition-opacity"
      >
        <img 
          src={codeoLogo} 
          alt="Codeo.ar" 
          className="h-5 w-auto"
        />
      </a>
    </div>
  );
};

export default FloatingFooter;