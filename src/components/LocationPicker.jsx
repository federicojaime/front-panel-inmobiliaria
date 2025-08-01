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
  const [mapType, setMapType] = useState('standard');
  const [mapInitialized, setMapInitialized] = useState(false); // NUEVO: bandera para saber si ya se inicializó
  
  // NUEVO: Solo inicializar el mapa UNA VEZ
  useEffect(() => {
    if (mapInitialized) return; // Si ya está inicializado, no hacer nada
    
    const loadLeaflet = async () => {
      if (window.L) {
        initializeMap();
        return;
      }

      // Cargar CSS de Leaflet
      const linkElement = document.createElement('link');
      linkElement.rel = 'stylesheet';
      linkElement.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(linkElement);
      
      // Crear script para cargar Leaflet
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.async = true;
      
      await new Promise((resolve) => {
        script.onload = resolve;
        document.body.appendChild(script);
      });
      
      initializeMap();
    };

    const initializeMap = () => {
      if (!window.L || !mapRef.current || mapInstanceRef.current) return;
      
      // Coordenadas de San Luis, Argentina
      const defaultLat = parseFloat(latitude) || -33.2950;
      const defaultLng = parseFloat(longitude) || -66.3356;
      
      mapInstanceRef.current = window.L.map(mapRef.current).setView([defaultLat, defaultLng], 13);
      
      // Crear las capas
      const standardLayer = window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      });
      
      const satelliteLayer = window.L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
      });
      
      if (mapType === 'satellite') {
        satelliteLayer.addTo(mapInstanceRef.current);
      } else {
        standardLayer.addTo(mapInstanceRef.current);
      }
      
      mapInstanceRef.current.standardLayer = standardLayer;
      mapInstanceRef.current.satelliteLayer = satelliteLayer;
      
      // Añadir marcador inicial si hay coordenadas
      if (latitude && longitude) {
        markerRef.current = window.L.marker([latitude, longitude], {
          draggable: true
        }).addTo(mapInstanceRef.current);
        
        markerRef.current.on('dragend', async (e) => {
          const marker = e.target;
          const position = marker.getLatLng();
          const lat = position.lat.toFixed(6);
          const lng = position.lng.toFixed(6);
          
          await updateAddressFromCoordinates(lat, lng);
          onChange(lat, lng);
        });

        updateAddressFromCoordinates(latitude, longitude);
      }
      
      // Al hacer clic en el mapa
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
            
            await updateAddressFromCoordinates(newLat, newLng);
            onChange(newLat, newLng);
          });
        }
        
        await updateAddressFromCoordinates(latFixed, lngFixed);
        onChange(latFixed, lngFixed);
      });

      setMapInitialized(true); // MARCAR COMO INICIALIZADO
    };

    loadLeaflet();

    // Limpieza al desmontar el componente
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
        setMapInitialized(false);
      }
    };
  }, []); // SIN DEPENDENCIAS - solo se ejecuta UNA VEZ

  // NUEVO: Efecto separado SOLO para actualizar el marcador cuando cambian las coordenadas desde fuera
  useEffect(() => {
    if (!mapInstanceRef.current || !latitude || !longitude) return;

    // Solo actualizar el marcador si las coordenadas vienen desde fuera (ej: escribir manualmente)
    if (markerRef.current) {
      markerRef.current.setLatLng([latitude, longitude]);
    } else {
      markerRef.current = window.L.marker([latitude, longitude], {
        draggable: true
      }).addTo(mapInstanceRef.current);
      
      markerRef.current.on('dragend', async (e) => {
        const marker = e.target;
        const position = marker.getLatLng();
        const newLat = position.lat.toFixed(6);
        const newLng = position.lng.toFixed(6);
        
        await updateAddressFromCoordinates(newLat, newLng);
        onChange(newLat, newLng);
      });
    }

    updateAddressFromCoordinates(latitude, longitude);
  }, [latitude, longitude]); // Solo cuando cambian las coordenadas

  // NUEVO: Efecto separado para cambiar tipo de mapa
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    
    if (mapType === 'satellite') {
      mapInstanceRef.current.removeLayer(mapInstanceRef.current.standardLayer);
      mapInstanceRef.current.satelliteLayer.addTo(mapInstanceRef.current);
    } else {
      mapInstanceRef.current.removeLayer(mapInstanceRef.current.satelliteLayer);
      mapInstanceRef.current.standardLayer.addTo(mapInstanceRef.current);
    }
  }, [mapType]);

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

  const searchLocation = async (e) => {
    e.preventDefault();
    
    if (!searchAddress.trim()) return;
    
    setIsSearching(true);
    setError(null);
    setSearchResults([]);
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchAddress)}&limit=5&accept-language=es&countrycodes=ar&bounded=1&viewbox=-67.5,-32.5,-65.0,-34.5`
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
    
    // SOLO mover el mapa a la nueva ubicación, NO re-centrarlo automáticamente
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
        
        await updateAddressFromCoordinates(newLat, newLng);
        onChange(newLat, newLng);
      });
    }
    
    // Solo centrar el mapa si es necesario (ej: está muy lejos)
    mapInstanceRef.current.setView([lat, lng], 16);
    
    onChange(lat.toFixed(6), lng.toFixed(6));
    setCurrentAddress(result.display_name);
    setSearchResults([]);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Buscar dirección en San Luis (ej. Av. Illia 355, San Luis)"
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
            type="button"
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

        {currentAddress && (
          <div className="mt-2 p-2 bg-gray-50 rounded-md border border-gray-200">
            <p className="text-sm font-medium">Dirección actual:</p>
            <p className="text-sm text-gray-700">{currentAddress}</p>
          </div>
        )}
      </div>

      <div className="flex flex-col">
        <div className="mb-2 flex justify-end">
          <button
            type="button"
            onClick={() => setMapType(prev => prev === 'standard' ? 'satellite' : 'standard')}
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md bg-white border border-gray-300 shadow-sm hover:bg-gray-50 transition-colors"
          >
            {mapType === 'standard' ? 'Cambiar a vista satelital' : 'Cambiar a vista estándar'}
          </button>
        </div>
        
        <div 
          ref={mapRef} 
          style={{ width: '100%', height: '400px', borderRadius: '0.5rem' }} 
          className="border border-gray-300"
        />
      </div>
      <p className="text-xs text-gray-500">
        Busca una dirección en San Luis, haz clic en el mapa para seleccionar la ubicación o arrastra el marcador para ajustarla.
      </p>
    </div>
  );
}