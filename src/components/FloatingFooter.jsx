// src/components/FloatingFooter.jsx
import React, { useState, useEffect, useRef } from 'react';

// Importa tu logo (asegúrate de añadir el archivo en la carpeta assets)
import codeoLogo from '../assets/codeo-logo.png';

const FloatingFooter = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [text, setText] = useState("Desarrollado por");
  const fullText = "Desarrollado por Codeo.Ar";
  const defaultText = "Desarrollado por";
  const typingTimerRef = useRef(null);
  
  useEffect(() => {
    if (isHovered) {
      let currentIndex = defaultText.length;
      setText(defaultText);
      
      // Limpia cualquier timer previo
      if (typingTimerRef.current) {
        clearInterval(typingTimerRef.current);
      }
      
      // Configura el efecto de escritura
      typingTimerRef.current = setInterval(() => {
        if (currentIndex <= fullText.length) {
          setText(fullText.substring(0, currentIndex));
          currentIndex++;
        } else {
          clearInterval(typingTimerRef.current);
        }
      }, 100); // Velocidad de escritura: 100ms por caracter
    } else {
      // Cuando sale el mouse, borra letra por letra
      if (typingTimerRef.current) {
        clearInterval(typingTimerRef.current);
      }
      
      let currentText = text;
      let currentIndex = currentText.length;
      
      typingTimerRef.current = setInterval(() => {
        if (currentIndex > defaultText.length) {
          currentIndex--;
          setText(fullText.substring(0, currentIndex));
        } else {
          clearInterval(typingTimerRef.current);
          setText(defaultText);
        }
      }, 80); // Velocidad de borrado: un poco más rápido que la escritura
    }
    
    // Limpieza al desmontar
    return () => {
      if (typingTimerRef.current) {
        clearInterval(typingTimerRef.current);
      }
    };
  }, [isHovered]);
  
  return (
    <div 
      className="fixed bottom-4 right-4 z-50 flex items-center bg-white rounded-full shadow-lg py-2 px-4 border border-gray-200 transition-all duration-300 hover:shadow-xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span className="text-xs whitespace-nowrap overflow-hidden">
        {text}
        <span className={isHovered && text !== fullText ? "inline-block ml-1 animate-pulse" : "hidden"}>|</span>
      </span>
      <a 
        href="https://www.instagram.com/codeo.ar" 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex items-center ml-2 transition-all duration-300"
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