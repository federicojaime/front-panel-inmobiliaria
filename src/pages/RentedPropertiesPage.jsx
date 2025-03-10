// src/pages/RentedPropertiesPage.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { propertyService, propertyTypeService } from "../services/api";
import { toast } from "react-hot-toast";
import {
  BuildingOfficeIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  DocumentCheckIcon,
  ArrowPathIcon,
  KeyIcon,
  FunnelIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import ReactDOMServer from "react-dom/server";
import PropertyPDF from "../components/PropertyPDF";

export function RentedPropertiesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [typeFilters, setTypeFilters] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  
  // Agregar estado para los tipos de propiedades
  const [propertyTypes, setPropertyTypes] = useState({});
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [typesForFilter, setTypesForFilter] = useState([]);

  // Cargar los tipos de propiedades
  useEffect(() => {
    const loadPropertyTypes = async () => {
      try {
        setLoadingTypes(true);
        const response = await propertyTypeService.getAll();
        if (response && response.ok) {
          // Crear un objeto mapeado donde la clave es el id y el valor es el nombre
          const typesMap = {};
          response.data.forEach(type => {
            typesMap[type.id] = type.name;
          });
          setPropertyTypes(typesMap);
          
          // Crear un array para los filtros
          setTypesForFilter(response.data.map(type => ({
            id: type.id,
            name: type.name
          })));
        }
      } catch (error) {
        console.error("Error al cargar tipos de propiedades:", error);
      } finally {
        setLoadingTypes(false);
      }
    };

    loadPropertyTypes();
  }, []);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      setIsLoading(true);
      const response = await propertyService.getByStatus("rented");
      if (response && response.data) {
        setProperties(response.data || []);
      } else {
        setProperties([]);
      }
    } catch (err) {
      console.error("Error al cargar propiedades alquiladas:", err);
      setError("Error al cargar las propiedades alquiladas");
      setProperties([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para marcar como disponible para alquiler (cambiar estado a "rent")
  const markAsForRent = async (propertyId) => {
    try {
      if (window.confirm("¿Desea marcar esta propiedad como disponible para alquiler?")) {
        const response = await propertyService.markAsForRent(propertyId);
        if (response.ok) {
          toast.success("Propiedad marcada como disponible para alquiler");
          loadProperties(); // Recargar la lista
        } else {
          toast.error(response.msg || "Error al actualizar estado");
        }
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al actualizar el estado de la propiedad");
    }
  };

  // Función para marcar como disponible para venta (cambiar estado a "sale")
  const markAsForSale = async (propertyId) => {
    try {
      if (window.confirm("¿Desea marcar esta propiedad como disponible para venta?")) {
        const response = await propertyService.markAsForSale(propertyId);
        if (response.ok) {
          toast.success("Propiedad marcada como disponible para venta");
          loadProperties(); // Recargar la lista
        } else {
          toast.error(response.msg || "Error al actualizar estado");
        }
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al actualizar el estado de la propiedad");
    }
  };

  // Función para obtener el nombre del tipo basado en type_id
  const getPropertyTypeName = (property) => {
    // Intentar obtener el nombre del tipo usando type_id
    if (property.type_id && propertyTypes[property.type_id]) {
      return propertyTypes[property.type_id];
    }
    
    // Si no está disponible type_id, intentar con type
    if (property.type) {
      // Si type es un número, buscar en el mapa
      if (!isNaN(property.type)) {
        return propertyTypes[property.type] || property.type;
      }
      return property.type;
    }
    
    return "Desconocido";
  };

  // Filtro de tipo de propiedad
  const togglePropertyType = (typeId) => {
    setTypeFilters(prev => 
      prev.includes(typeId)
        ? prev.filter(t => t !== typeId)
        : [...prev, typeId]
    );
  };

  // Filtro de búsqueda
  const filteredProperties = properties?.filter((property) => {
    const matchesSearch = searchTerm === "" || 
      property?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property?.address?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Para filtrar por tipo, ahora usamos type_id
    const matchesType = typeFilters.length === 0 || 
      (property.type_id && typeFilters.includes(property.type_id.toString())) ||
      (property.type && !property.type_id && typeFilters.includes(property.type));
    
    return matchesSearch && matchesType;
  }) || [];

  // Limpiar todos los filtros
  const clearFilters = () => {
    setTypeFilters([]);
    setSearchTerm("");
  };

  // Función para exportar PDF
  const handleExportPDF = async (property) => {
    try {
      // Renderizar el componente PropertyPDF como HTML estático
      const pdfContent = ReactDOMServer.renderToStaticMarkup(
        <PropertyPDF property={property} />
      );

      // Crear un contenedor temporal en el DOM y agregar el contenido HTML
      const container = document.createElement("div");
      container.innerHTML = pdfContent;
      container.style.width = "700px";
      container.style.padding = "20px";
      container.style.fontFamily = "Arial, sans-serif";
      document.body.appendChild(container);

      // Convertir el contenedor a canvas con html2canvas
      const canvas = await html2canvas(container, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");

      // Eliminar el contenedor temporal del DOM
      document.body.removeChild(container);

      // Crear el PDF con jsPDF
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: "a4",
      });

      // Calcular el ancho y alto de la página en pixeles
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Calcular la relación de aspecto de la imagen
      const canvasRatio = canvas.height / canvas.width;
      let printWidth = pageWidth;
      let printHeight = printWidth * canvasRatio;

      // Ajustar si excede la altura de la página
      if (printHeight > pageHeight) {
        printHeight = pageHeight;
        printWidth = printHeight / canvasRatio;
      }

      // Centrar la imagen en la página
      const marginX = (pageWidth - printWidth) / 2;
      const marginY = 10; // Pequeño margen superior

      // Agregar la imagen al PDF
      pdf.addImage(imgData, "PNG", marginX, marginY, printWidth, printHeight);

      // Guardar el PDF con el título de la propiedad
      pdf.save(`${property.title || "Propiedad"}.pdf`);
    } catch (error) {
      console.error("Error al exportar PDF:", error);
      toast.error("Ocurrió un error al exportar el PDF.");
    }
  };

  if (isLoading || loadingTypes) {
    return (
      <div className="flex items-center justify-center min-h-screen -mt-16">
        <div className="flex flex-col items-center gap-4">
          <BuildingOfficeIcon className="w-12 h-12 text-karttem-gold animate-bounce" />
          <p className="text-gray-600">Cargando propiedades alquiladas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen -mt-16 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full">
          <div className="flex items-center justify-center">
            <BuildingOfficeIcon className="h-12 w-12 text-red-500" />
          </div>
          <div className="mt-4 text-center">
            <h3 className="text-lg font-medium text-gray-900">
              Error al cargar las propiedades alquiladas
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              {error || "Intenta recargar la página."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Propiedades Alquiladas</h1>
          <p className="mt-2 text-sm text-gray-700">
            Lista de propiedades que actualmente están alquiladas
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-4 items-center">
        {/* Contadores */}
        <div className="bg-white shadow-sm rounded-md px-4 py-3 border border-gray-200">
          <div className="text-sm text-gray-500">Total propiedades alquiladas</div>
          <div className="text-2xl font-semibold">{properties.length}</div>
        </div>

        {/* Botones para los filtros adicionales */}
        <div className="flex ml-auto">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-x-2 px-3 py-1.5 text-sm font-medium rounded-md bg-white border border-gray-300 hover:bg-gray-50"
          >
            <FunnelIcon className="h-4 w-4" />
            Filtros
            {typeFilters.length > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                {typeFilters.length}
              </span>
            )}
          </button>
          
          {(typeFilters.length > 0 || searchTerm) && (
            <button
              onClick={clearFilters}
              className="ml-2 flex items-center gap-x-2 px-3 py-1.5 text-sm font-medium rounded-md bg-white border border-gray-300 hover:bg-gray-50 text-gray-700"
            >
              <XMarkIcon className="h-4 w-4" />
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Panel de filtros avanzados */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="mb-3">
            <h3 className="text-sm font-medium text-gray-700">Filtrar por tipo de propiedad</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {typesForFilter.map((type) => (
                <button
                  key={type.id}
                  onClick={() => togglePropertyType(type.id)}
                  className={`px-3 py-1 text-xs font-medium rounded-md ${
                    typeFilters.includes(type.id)
                      ? "bg-gray-800 text-white"
                      : "bg-white border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {type.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Contenedor de búsqueda y tabla */}
      <div className="bg-white rounded-xl shadow">
        {/* Barra de búsqueda */}
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar en propiedades alquiladas..."
              className="block w-full rounded-lg border-0 py-2.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-karttem-gold sm:text-sm sm:leading-6"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="min-w-full table-fixed divide-y divide-gray-200">
            <thead>
              <tr>
                <th
                  scope="col"
                  className="w-[250px] px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Título
                </th>
                <th
                  scope="col"
                  className="w-[150px] px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Tipo
                </th>
                <th
                  scope="col"
                  className="w-[150px] px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Precio de Alquiler
                </th>
                <th
                  scope="col"
                  className="w-[120px] px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Ciudad
                </th>
                <th
                  scope="col"
                  className="w-[180px] px-3 py-3.5 text-right text-sm font-medium"
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProperties.length > 0 ? (
                filteredProperties.map((property) => (
                  <tr
                    key={property.id}
                    className="hover:bg-gray-50 transition-colors duration-200"
                  >
                    <td className="w-[250px] px-3 py-4 text-sm">
                      <div className="font-medium text-gray-900 truncate max-w-[230px] overflow-hidden text-ellipsis whitespace-nowrap">
                        {property.title}
                      </div>
                      <div className="text-gray-500 text-xs truncate max-w-[230px] overflow-hidden text-ellipsis whitespace-nowrap">
                        {property.address}
                      </div>
                    </td>
                    <td className="w-[150px] px-3 py-4 text-sm text-gray-500 capitalize">
                      {getPropertyTypeName(property)}
                    </td>
                    <td className="w-[150px] px-3 py-4 text-sm text-gray-500">
                      {property.price_ars
                        ? `$${Number(property.price_ars).toLocaleString("es-AR")}`
                        : property.price_usd
                        ? `USD $${property.price_usd.toLocaleString()}`
                        : "-"}
                    </td>
                    <td className="w-[120px] px-3 py-4 text-sm text-gray-500">
                      {property.city || "-"}
                    </td>
                    <td className="w-[180px] px-3 py-4 text-right text-sm font-medium">
                      <div className="flex flex-col space-y-2">
                        <div className="flex space-x-2 justify-end">
                          <Link
                            to={`/properties/${property.id}/edit`}
                            className="inline-flex items-center gap-x-1.5 text-karttem-black hover:text-orange-900 transition-colors duration-200"
                          >
                            <PencilSquareIcon className="h-4 w-4" />
                            Editar
                          </Link>
                          <button
                            onClick={() => handleExportPDF(property)}
                            className="inline-flex items-center gap-x-1.5 text-karttem-black hover:text-orange-900 transition-colors duration-200"
                          >
                            <DocumentCheckIcon className="h-4 w-4" />
                            PDF
                          </button>
                        </div>
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => markAsForRent(property.id)}
                            className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            title="Cambiar a disponible para alquiler"
                          >
                            <ArrowPathIcon className="h-3.5 w-3.5 mr-1" />
                            Disponible
                          </button>
                          <button
                            onClick={() => markAsForSale(property.id)}
                            className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            title="Cambiar a disponible para venta"
                          >
                            <ArrowPathIcon className="h-3.5 w-3.5 mr-1" />
                            En venta
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-12 text-center">
                    <KeyIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">
                      No hay propiedades alquiladas
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {searchTerm || typeFilters.length > 0
                        ? "No se encontraron propiedades que coincidan con tu búsqueda."
                        : "No hay propiedades alquiladas actualmente."}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}