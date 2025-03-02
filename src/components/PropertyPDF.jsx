// src/components/PropertyPDF.jsx
import React from "react";

// Mapeo de tipos de propiedades
const propertyTypeMap = {
  casa: "Casa",
  departamento: "Departamento",
  terreno: "Terreno",
  local_comercial: "Local Comercial",
  oficina: "Oficina",
  galpon: "Galpón",
  campo: "Campo",
  cochera: "Cochera",
};

// Mapeo de estados
const statusMap = {
  sale: "En Venta",
  rent: "En Alquiler",
  rented: "Alquilado",
  sold: "Vendido",
  reserved: "Reservado",
};

// Mapeo de provincias
const provinceMap = {
  san_luis: "San Luis",
  cordoba: "Córdoba",
  buenos_aires: "Buenos Aires",
  catamarca: "Catamarca",
  chaco: "Chaco",
  chubut: "Chubut",
  corrientes: "Corrientes",
  entre_rios: "Entre Ríos",
  formosa: "Formosa",
  jujuy: "Jujuy",
  la_pampa: "La Pampa",
  la_rioja: "La Rioja",
  mendoza: "Mendoza",
  misiones: "Misiones",
  neuquen: "Neuquén",
  rio_negro: "Río Negro",
  salta: "Salta",
  santa_cruz: "Santa Cruz",
  santa_fe: "Santa Fe",
  santiago_del_estero: "Santiago del Estero",
  tierra_del_fuego: "Tierra del Fuego",
  tucuman: "Tucumán",
};

// Función para formatear fecha
const formatDate = (date) => {
  return new Date().toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

export default function PropertyPDF({ property }) {
  if (!property) {
    return <div>No hay información disponible para esta propiedad</div>;
  }

  // Función para renderizar servicios
  const renderServices = () => {
    const services = [];
    
    if (property.has_electricity === 1 || property.has_electricity === true) services.push('Electricidad');
    if (property.has_natural_gas === 1 || property.has_natural_gas === true) services.push('Gas Natural');
    if (property.has_sewage === 1 || property.has_sewage === true) services.push('Cloacas');
    if (property.has_paved_street === 1 || property.has_paved_street === true) services.push('Calle Asfaltada');
    if (property.garage === 1 || property.garage === true) services.push('Cochera');
    
    return services.length > 0 ? services.join(', ') : 'No hay servicios disponibles';
  };

  // Función para renderizar amenidades - versión corregida para amenidades como propiedades directas
  const renderAmenities = () => {
    const amenitiesArray = [];
    
    // Verificación directa de cada amenidad como propiedad de property
    if (property.has_pool === 1 || property.has_pool === true) amenitiesArray.push('Piscina');
    if (property.has_heating === 1 || property.has_heating === true) amenitiesArray.push('Calefacción');
    if (property.has_ac === 1 || property.has_ac === true) amenitiesArray.push('Aire Acondicionado');
    if (property.has_garden === 1 || property.has_garden === true) amenitiesArray.push('Jardín');
    if (property.has_laundry === 1 || property.has_laundry === true) amenitiesArray.push('Lavandería');
    if (property.has_parking === 1 || property.has_parking === true) amenitiesArray.push('Estacionamiento');
    if (property.has_central_heating === 1 || property.has_central_heating === true) amenitiesArray.push('Calefacción Central');
    if (property.has_lawn === 1 || property.has_lawn === true) amenitiesArray.push('Césped');
    if (property.has_fireplace === 1 || property.has_fireplace === true) amenitiesArray.push('Chimenea');
    if (property.has_central_ac === 1 || property.has_central_ac === true) amenitiesArray.push('Refrigeración Central');
    if (property.has_high_ceiling === 1 || property.has_high_ceiling === true) amenitiesArray.push('Techo Alto');
    
    return amenitiesArray.length > 0 ? amenitiesArray.join(', ') : 'No hay amenidades disponibles';
  };

  // Función para formatear precio
  const formatPrice = () => {
    if (property.price_usd) {
      return `USD ${property.price_usd.toLocaleString('es-AR')}`;
    } else if (property.price_ars) {
      return `$ ${property.price_ars.toLocaleString('es-AR')}`;
    }
    return "Consultar";
  };

  // Obtener la provincia formateada
  const getProvince = () => {
    return property.province && provinceMap[property.province]
      ? provinceMap[property.province]
      : property.province || "No especificada";
  };

  return (
    <div style={{
      width: "100%",
      maxWidth: "800px",
      fontFamily: "Arial, Helvetica, sans-serif",
      color: "#333",
      margin: "0 auto",
      padding: "0",
      boxSizing: "border-box"
    }}>
      {/* Encabezado */}
      <div style={{
        backgroundColor: "#000",
        color: "#FFD700",
        padding: "15px",
        textAlign: "center",
        marginBottom: "20px"
      }}>
        <h1 style={{
          fontSize: "24px",
          margin: "0",
          textTransform: "uppercase",
          letterSpacing: "1px"
        }}>
          KARTTEM S.A.
        </h1>
        <p style={{
          fontSize: "16px",
          margin: "5px 0 0",
          color: "#f5f5f5"
        }}>
          INMOBILIARIA
        </p>
      </div>

      {/* Título de la propiedad */}
      <div style={{
        backgroundColor: "#f5f5f5",
        padding: "15px",
        marginBottom: "20px",
        borderLeft: "5px solid #FFD700"
      }}>
        <h2 style={{
          fontSize: "22px",
          margin: "0",
          fontWeight: "bold",
          color: "#000"
        }}>
          {property.title || "Propiedad sin título"}
        </h2>
        <p style={{
          margin: "5px 0 0",
          fontSize: "16px",
          color: "#555"
        }}>
          {propertyTypeMap[property.type] || property.type || "Tipo no especificado"} - {statusMap[property.status] || property.status || "Estado no especificado"}
        </p>
        <p style={{
          margin: "5px 0 0",
          fontSize: "14px",
          color: "#777"
        }}>
          {property.address ? `${property.address}, ` : ""}{property.city ? `${property.city}, ` : ""}{getProvince()}
        </p>
      </div>

      {/* Información principal */}
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        marginBottom: "20px",
        borderBottom: "1px solid #e0e0e0",
        paddingBottom: "20px"
      }}>
        {/* Columna izquierda */}
        <div style={{
          flex: "1",
          minWidth: "300px",
          paddingRight: "15px"
        }}>
          <div style={{
            marginBottom: "15px"
          }}>
            <h3 style={{
              fontSize: "16px",
              margin: "0 0 5px",
              fontWeight: "bold",
              textTransform: "uppercase",
              color: "#000",
              borderBottom: "2px solid #FFD700",
              paddingBottom: "5px"
            }}>
              Precio
            </h3>
            <p style={{
              fontSize: "18px",
              margin: "5px 0",
              fontWeight: "bold",
              color: "#000"
            }}>
              {formatPrice()}
            </p>
          </div>

          <div style={{
            marginBottom: "15px"
          }}>
            <h3 style={{
              fontSize: "16px",
              margin: "0 0 5px",
              fontWeight: "bold",
              textTransform: "uppercase",
              color: "#000",
              borderBottom: "2px solid #FFD700",
              paddingBottom: "5px"
            }}>
              Características
            </h3>
            <div style={{
              display: "flex",
              flexWrap: "wrap",
              margin: "10px 0"
            }}>
              <div style={{
                width: "50%",
                marginBottom: "5px"
              }}>
                <strong>Superficie cubierta:</strong> {property.covered_area ? `${property.covered_area} m²` : "No especificada"}
              </div>
              <div style={{
                width: "50%",
                marginBottom: "5px"
              }}>
                <strong>Superficie total:</strong> {property.total_area ? `${property.total_area} m²` : "No especificada"}
              </div>
              {property.bedrooms !== undefined && (
                <div style={{
                  width: "50%",
                  marginBottom: "5px"
                }}>
                  <strong>Dormitorios:</strong> {property.bedrooms}
                </div>
              )}
              {property.bathrooms !== undefined && (
                <div style={{
                  width: "50%",
                  marginBottom: "5px"
                }}>
                  <strong>Baños:</strong> {property.bathrooms}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Columna derecha */}
        <div style={{
          flex: "1",
          minWidth: "300px",
          paddingLeft: "15px",
          borderLeft: "1px solid #e0e0e0"
        }}>
          <div style={{
            marginBottom: "15px"
          }}>
            <h3 style={{
              fontSize: "16px",
              margin: "0 0 5px",
              fontWeight: "bold",
              textTransform: "uppercase",
              color: "#000",
              borderBottom: "2px solid #FFD700",
              paddingBottom: "5px"
            }}>
              Servicios
            </h3>
            <p style={{
              margin: "5px 0",
              lineHeight: "1.5",
              fontSize: "14px"
            }}>
              {renderServices()}
            </p>
          </div>

          <div style={{
            marginBottom: "15px"
          }}>
            <h3 style={{
              fontSize: "16px",
              margin: "0 0 5px",
              fontWeight: "bold",
              textTransform: "uppercase",
              color: "#000",
              borderBottom: "2px solid #FFD700",
              paddingBottom: "5px"
            }}>
              Amenidades
            </h3>
            <p style={{
              margin: "5px 0",
              lineHeight: "1.5",
              fontSize: "14px"
            }}>
              {renderAmenities()}
            </p>
          </div>
        </div>
      </div>

      {/* Descripción */}
      <div style={{
        marginBottom: "20px",
        padding: "15px",
        backgroundColor: "#f9f9f9",
        border: "1px solid #e0e0e0"
      }}>
        <h3 style={{
          fontSize: "16px",
          margin: "0 0 10px",
          fontWeight: "bold",
          textTransform: "uppercase",
          color: "#000",
          borderBottom: "2px solid #FFD700",
          paddingBottom: "5px"
        }}>
          Descripción
        </h3>
        <p style={{
          margin: "5px 0",
          lineHeight: "1.6",
          fontSize: "14px"
        }}>
          {property.description || "No hay descripción disponible para esta propiedad."}
        </p>
      </div>

      {/* Ubicación */}
      {property.latitude && property.longitude && (
        <div style={{
          marginBottom: "20px",
          padding: "15px",
          backgroundColor: "#f9f9f9",
          border: "1px solid #e0e0e0"
        }}>
          <h3 style={{
            fontSize: "16px",
            margin: "0 0 10px",
            fontWeight: "bold",
            textTransform: "uppercase",
            color: "#000",
            borderBottom: "2px solid #FFD700",
            paddingBottom: "5px"
          }}>
            Ubicación
          </h3>
          <p style={{
            margin: "5px 0",
            fontSize: "14px"
          }}>
            La propiedad se encuentra ubicada en {property.address ? `${property.address}, ` : ""}{property.city ? `${property.city}, ` : ""}{getProvince()}.
          </p>
          <p style={{
            margin: "5px 0",
            fontSize: "12px",
            color: "#777"
          }}>
            Coordenadas: {property.latitude}, {property.longitude}
          </p>
        </div>
      )}

      {/* Información de contacto */}
      <div style={{
        backgroundColor: "#333",
        color: "#fff",
        padding: "15px",
        textAlign: "center",
        marginTop: "20px"
      }}>
        <h3 style={{
          fontSize: "16px",
          margin: "0 0 10px",
          fontWeight: "bold",
          color: "#FFD700"
        }}>
          KARTTEM S.A. INMOBILIARIA
        </h3>
        <p style={{
          margin: "5px 0",
          fontSize: "14px"
        }}>
          Teléfono: +54 9 XXX XXX-XXXX | Email: info@karttemsa.com
        </p>
        <p style={{
          margin: "5px 0",
          fontSize: "12px",
          color: "#ccc"
        }}>
          San Luis, Argentina
        </p>
      </div>

      {/* Pie de página */}
      <div style={{
        marginTop: "20px",
        padding: "10px",
        borderTop: "1px solid #e0e0e0",
        textAlign: "center",
        fontSize: "12px",
        color: "#999"
      }}>
        <p style={{
          margin: "5px 0"
        }}>
          Documento generado el {formatDate()}. La información contenida puede estar sujeta a cambios.
        </p>
        <p style={{
          margin: "5px 0"
        }}>
          © {new Date().getFullYear()} Karttem S.A. - Todos los derechos reservados
        </p>
      </div>
    </div>
  );
}