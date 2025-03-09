// src/components/LocationPicker.jsx
import { useState, useEffect, useRef } from 'react';

export function LocationPicker({ latitude, longitude, onChange }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const [searchAddress, setSearchAddress] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState(null);
  const [currentAddress, setCurrentAddress] = useState('');
  const [mapType, setMapType] = useState('standard'); // 'standard' o 'satellite'
  
  useEffect(() => {
    // Carga dinámica de Leaflet desde CDN
    const loadLeaflet = async () => {
      // Si ya existe Leaflet en la ventana o ya tenemos la instancia de mapa, no hacemos nada
      if (window.L && mapInstanceRef.current) return;

      // Cargar CSS de Leaflet
      const linkElement = document.createElement('link');
      linkElement.rel = 'stylesheet';
      linkElement.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(linkElement);
      
      // Crear script para cargar Leaflet
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.async = true;
      
      // Esperar a que el script se cargue
      await new Promise((resolve) => {
        script.onload = resolve;
        document.body.appendChild(script);
      });
      
      initializeMap();
    };

    const initializeMap = () => {
      if (!window.L || !mapRef.current) return;
      
      // Inicializar el mapa si no existe
      if (!mapInstanceRef.current) {
        // Coordenadas por defecto para centrar el mapa (Argentina)
        const defaultLat = parseFloat(latitude) || -34.6118;
        const defaultLng = parseFloat(longitude) || -58.4173;
        
        mapInstanceRef.current = window.L.map(mapRef.current).setView([defaultLat, defaultLng], 13);
        
        // Crear las capas (layers) para ambos tipos de mapas
        const standardLayer = window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        });
        
        const satelliteLayer = window.L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        });
        
        // Añadir la capa por defecto según el estado inicial
        if (mapType === 'satellite') {
          satelliteLayer.addTo(mapInstanceRef.current);
        } else {
          standardLayer.addTo(mapInstanceRef.current);
        }
        
        // Guardar referencia a las capas
        mapInstanceRef.current.standardLayer = standardLayer;
        mapInstanceRef.current.satelliteLayer = satelliteLayer;
        
        // Añadir marcador si hay coordenadas
        if (latitude && longitude) {
          markerRef.current = window.L.marker([latitude, longitude], {
            draggable: true
          }).addTo(mapInstanceRef.current);
          
          // Al arrastrar el marcador, actualizar las coordenadas sin cambiar el zoom
          markerRef.current.on('dragend', async (e) => {
            const marker = e.target;
            const position = marker.getLatLng();
            const lat = position.lat.toFixed(6);
            const lng = position.lng.toFixed(6);
            
            // Actualizar la dirección al mover el marcador
            await updateAddressFromCoordinates(lat, lng);
            
            onChange(lat, lng);
          });

          // Obtener la dirección inicial si hay coordenadas
          updateAddressFromCoordinates(latitude, longitude);
        }
        
        // Al hacer clic en el mapa, añadir o mover el marcador
        mapInstanceRef.current.on('click', async (e) => {
          const { lat, lng } = e.latlng;
          const latFixed = lat.toFixed(6);
          const lngFixed = lng.toFixed(6);
          
          if (markerRef.current) {
            markerRef.current.setLatLng([lat, lng]);
          } else {
            markerRef.current = window.L.marker([lat, lng], {
              draggable: true
            }).addTo(mapInstanceRef.current);
            
            markerRef.current.on('dragend', async (e) => {
              const marker = e.target;
              const position = marker.getLatLng();
              const newLat = position.lat.toFixed(6);
              const newLng = position.lng.toFixed(6);
              
              // Actualizar la dirección al mover el marcador
              await updateAddressFromCoordinates(newLat, newLng);
              
              onChange(newLat, newLng);
            });
          }
          
          // Actualizar la dirección al hacer clic en el mapa
          await updateAddressFromCoordinates(latFixed, lngFixed);
          
          onChange(latFixed, lngFixed);
        });
      } else {
        // Cambiar entre capas si ya existe el mapa
        if (mapType === 'satellite') {
          mapInstanceRef.current.removeLayer(mapInstanceRef.current.standardLayer);
          mapInstanceRef.current.satelliteLayer.addTo(mapInstanceRef.current);
        } else {
          mapInstanceRef.current.removeLayer(mapInstanceRef.current.satelliteLayer);
          mapInstanceRef.current.standardLayer.addTo(mapInstanceRef.current);
        }
      }
      
      // Actualizar la posición del marcador si cambian las coordenadas
      // pero mantener el nivel de zoom actual
      if (markerRef.current && latitude && longitude) {
        const currentZoom = mapInstanceRef.current.getZoom();
        markerRef.current.setLatLng([latitude, longitude]);
        
        // Centrar el mapa en la nueva posición manteniendo el zoom actual
        mapInstanceRef.current.setView([latitude, longitude], currentZoom);
        
        // Actualizar la dirección cuando se establecen nuevas coordenadas
        updateAddressFromCoordinates(latitude, longitude);
      }
    };

    loadLeaflet();

    // Limpieza
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, [latitude, longitude, onChange, mapType]);

  // Función para obtener la dirección a partir de coordenadas
  const updateAddressFromCoordinates = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=es`
      );
      
      if (!response.ok) {
        throw new Error('Error al obtener la dirección');
      }
      
      const data = await response.json();
      if (data && data.display_name) {
        setCurrentAddress(data.display_name);
      } else {
        setCurrentAddress('Dirección no encontrada');
      }
    } catch (err) {
      console.error('Error al obtener la dirección:', err);
      setCurrentAddress('Error al obtener la dirección');
    }
  };

  // Modificar esta función para evitar el refresh de la página
  const searchLocation = async (e) => {
    e.preventDefault(); // Prevenir el comportamiento por defecto del formulario
    
    if (!searchAddress.trim()) return;
    
    setIsSearching(true);
    setError(null);
    setSearchResults([]);
    
    try {
      // Utilizar Nominatim API para geocodificación
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchAddress)}&limit=5&accept-language=es&countrycodes=ar`
      );
      
      if (!response.ok) {
        throw new Error('Error en la búsqueda de dirección');
      }
      
      const data = await response.json();
      
      if (data.length === 0) {
        setError('No se encontraron resultados para esta dirección');
      } else {
        setSearchResults(data);
      }
    } catch (err) {
      console.error('Error al buscar dirección:', err);
      setError('Error al buscar la dirección. Inténtalo de nuevo.');
    } finally {
      setIsSearching(false);
    }
  };

  const selectLocation = (result) => {
    if (!mapInstanceRef.current) return;
    
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    
    // Obtener el zoom actual
    const currentZoom = mapInstanceRef.current.getZoom();
    
    // Actualizar el marcador
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      markerRef.current = window.L.marker([lat, lng], {
        draggable: true
      }).addTo(mapInstanceRef.current);
      
      markerRef.current.on('dragend', async (e) => {
        const marker = e.target;
        const position = marker.getLatLng();
        const newLat = position.lat.toFixed(6);
        const newLng = position.lng.toFixed(6);
        
        // Actualizar la dirección
        await updateAddressFromCoordinates(newLat, newLng);
        
        onChange(newLat, newLng);
      });
    }
    
    // Centrar el mapa manteniendo el zoom actual (o usar zoom 16 si es una búsqueda)
    mapInstanceRef.current.setView([lat, lng], 16);
    
    // Actualizar las coordenadas
    onChange(lat.toFixed(6), lng.toFixed(6));
    
    // Actualizar la dirección actual
    setCurrentAddress(result.display_name);
    
    // Limpiar resultados
    setSearchResults([]);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        {/* Cambiado para evitar el refresco */}
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Buscar dirección (ej. Av. Corrientes 1234, Buenos Aires)"
            className="flex-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            value={searchAddress}
            onChange={(e) => setSearchAddress(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                searchLocation(e);
              }
            }}
          />
          <button
            type="button" // Cambiado de submit a button
            onClick={searchLocation}
            disabled={isSearching || !searchAddress.trim()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isSearching ? 'Buscando...' : 'Buscar'}
          </button>
        </div>

        {error && (
          <p className="text-sm text-red-600">
            {error}
          </p>
        )}

        {searchResults.length > 0 && (
          <div className="mt-2 bg-white rounded-md shadow-lg max-h-60 overflow-y-auto">
            <ul className="divide-y divide-gray-200">
              {searchResults.map((result, index) => (
                <li 
                  key={index}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors"
                  onClick={() => selectLocation(result)}
                >
                  <div className="text-sm">{result.display_name}</div>
                  <div className="text-xs text-gray-500">
                    Tipo: {result.type}, {result.lat.substring(0, 8)}, {result.lon.substring(0, 8)}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Mostrar la dirección actual */}
        {currentAddress && (
          <div className="mt-2 p-2 bg-gray-50 rounded-md border border-gray-200">
            <p className="text-sm font-medium">Dirección actual:</p>
            <p className="text-sm text-gray-700">{currentAddress}</p>
          </div>
        )}
      </div>

      <div className="flex flex-col">
        {/* Botón de cambio de vista */}
        <div className="mb-2 flex justify-end">
          <button
            type="button"
            onClick={() => setMapType(prev => prev === 'standard' ? 'satellite' : 'standard')}
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md bg-white border border-gray-300 shadow-sm hover:bg-gray-50 transition-colors"
          >
            {mapType === 'standard' ? 'Cambiar a vista satelital' : 'Cambiar a vista estándar'}
          </button>
        </div>
        
        {/* Contenedor del mapa */}
        <div 
          ref={mapRef} 
          style={{ width: '100%', height: '400px', borderRadius: '0.5rem' }} 
          className="border border-gray-300"
        />
      </div>
      <p className="text-xs text-gray-500">
        Busca una dirección, haz clic en el mapa para seleccionar la ubicación o arrastra el marcador para ajustarla.
      </p>
    </div>
  );
}