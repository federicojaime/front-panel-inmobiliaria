// src/components/PropertyPDF.jsx

import React from "react";

// Definición completa de servicios y amenidades
const SERVICES_MAPPING = {
  has_electricity: { label: "Electricidad", icon: "⚡" },
  has_natural_gas: { label: "Gas Natural", icon: "🔥" },
  has_sewage: { label: "Cloacas", icon: "💧" },
  has_paved_street: { label: "Calle Asfaltada", icon: "🛣️" },
  garage: { label: "Cochera", icon: "🚗" }
};

const AMENITIES_MAPPING = {
  has_pool: { label: "Piscina", icon: "🏊‍♀️" },
  has_heating: { label: "Calefacción", icon: "🌡️" },
  has_ac: { label: "Aire Acondicionado", icon: "❄️" },
  has_garden: { label: "Jardín", icon: "🌳" },
  has_laundry: { label: "Lavandería", icon: "🧺" },
  has_parking: { label: "Estacionamiento", icon: "🅿️" },
  has_central_heating: { label: "Calefacción Central", icon: "🔆" },
  has_lawn: { label: "Césped", icon: "🌿" },
  has_fireplace: { label: "Chimenea", icon: "🔥" },
  has_central_ac: { label: "Refrigeración Central", icon: "❄️" },
  has_high_ceiling: { label: "Techos Altos", icon: "🏠" }
};

export default function PropertyPDF({ property }) {
  if (!property) {
    return <div>No hay propiedad para mostrar</div>;
  }

  // Función para renderizar servicios
  const renderServices = () => {
    const activeServices = Object.entries(SERVICES_MAPPING)
      .filter(([key]) => property[key])
      .map(([_, { label, icon }]) => `${icon} ${label}`);
    
    return activeServices.length > 0 
      ? activeServices.join(', ') 
      : 'No hay servicios disponibles';
  };

  // Función para renderizar amenidades
  const renderAmenities = () => {
    // Verificar si amenities existe y es un objeto
    if (!property.amenities || typeof property.amenities !== 'object') {
      return 'No hay amenidades';
    }

    const activeAmenities = Object.entries(AMENITIES_MAPPING)
      .filter(([key]) => property.amenities[key])
      .map(([_, { label, icon }]) => `${icon} ${label}`);
    
    return activeAmenities.length > 0 
      ? activeAmenities.join(', ') 
      : 'No hay amenidades';
  };

  return (
    <div 
      style={{ 
        fontFamily: 'Arial, sans-serif', 
        maxWidth: '800px', 
        margin: '0 auto', 
        padding: '40px',
        color: '#333',
        lineHeight: '1.6'
      }}
    >
      {/* Encabezado Profesional */}
      <div 
        style={{ 
          borderBottom: '2px solid #e0e0e0', 
          paddingBottom: '20px', 
          marginBottom: '30px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div>
          <h1 style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            color: '#1a1a1a', 
            marginBottom: '10px' 
          }}>
            Ficha de Propiedad
          </h1>
          <p style={{ 
            fontSize: '16px', 
            color: '#666' 
          }}>
            Información detallada y confidencial
          </p>
        </div>
        <div style={{ 
          textAlign: 'right',
          fontWeight: 'bold',
          color: '#2c3e50'
        }}>
          {new Date().toLocaleDateString('es-AR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })}
        </div>
      </div>

      {/* Sección de Descripción */}
      <div style={{ 
        backgroundColor: '#f9f9f9', 
        padding: '20px', 
        borderRadius: '8px', 
        marginBottom: '30px',
        border: '1px solid #e0e0e0'
      }}>
        <h2 style={{ 
          fontSize: '18px', 
          fontWeight: 'bold', 
          marginBottom: '15px',
          borderBottom: '1px solid #e0e0e0',
          paddingBottom: '10px'
        }}>
          Descripción
        </h2>
        <p style={{ 
          fontStyle: 'italic', 
          color: '#555' 
        }}>
          {property.description || "No se proporcionó descripción."}
        </p>
      </div>

      {/* Sección de Servicios */}
      <div style={{ 
        backgroundColor: '#e6f3ff', 
        padding: '20px', 
        borderRadius: '8px', 
        marginBottom: '30px',
        border: '1px solid #b3d9ff'
      }}>
        <h2 style={{ 
          fontSize: '18px', 
          fontWeight: 'bold', 
          marginBottom: '15px',
          borderBottom: '1px solid #b3d9ff',
          paddingBottom: '10px'
        }}>
          Servicios
        </h2>
        <p style={{ color: '#333' }}>
          {renderServices()}
        </p>
      </div>

      {/* Sección de Amenidades */}
      <div style={{ 
        backgroundColor: '#f0e6ff', 
        padding: '20px', 
        borderRadius: '8px', 
        marginBottom: '30px',
        border: '1px solid #d1b3ff'
      }}>
        <h2 style={{ 
          fontSize: '18px', 
          fontWeight: 'bold', 
          marginBottom: '15px',
          borderBottom: '1px solid #d1b3ff',
          paddingBottom: '10px'
        }}>
          Amenidades
        </h2>
        <p style={{ color: '#333' }}>
          {renderAmenities()}
        </p>
      </div>

      {/* Pie de página */}
      <div style={{ 
        textAlign: 'center', 
        borderTop: '1px solid #e0e0e0', 
        paddingTop: '20px', 
        color: '#888',
        fontSize: '12px'
      }}>
        <p>© 2025 Karttem Inmobiliaria - Información Confidencial</p>
        <p>Documento generado automáticamente</p>
      </div>
    </div>
  );
}