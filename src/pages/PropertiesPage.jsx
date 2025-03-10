// src/pages/PropertiesPage.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { propertyService, propertyTypeService } from "../services/api";
import { toast } from "react-hot-toast";
import {
  PlusIcon,
  BuildingOfficeIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  DocumentCheckIcon,
  CheckCircleIcon,
  KeyIcon,
  ArrowPathIcon,
  FunnelIcon,
  XMarkIcon,
  ClockIcon
} from "@heroicons/react/24/outline";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import ReactDOMServer from "react-dom/server";
import PropertyPDF from "../components/PropertyPDF";

// Mapeo de estados
const statusMap = {
  sale: { name: "En Venta", color: "bg-blue-50 text-blue-700 ring-blue-600/20" },
  rent: { name: "En Alquiler", color: "bg-green-50 text-green-700 ring-green-600/20" },
  rented: { name: "Alquilado", color: "bg-purple-50 text-purple-700 ring-purple-600/20" },
  sold: { name: "Vendido", color: "bg-amber-50 text-amber-700 ring-amber-600/20" },
  reserved: { name: "Reservado", color: "bg-rose-50 text-rose-700 ring-rose-600/20" },
};

export function PropertiesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [statusFilter, setStatusFilter] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  
  // Agregar estado para los tipos de propiedades
  const [propertyTypes, setPropertyTypes] = useState({});
  const [loadingTypes, setLoadingTypes] = useState(true);

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
  }, [selectedStatus]);

  const loadProperties = async () => {
    try {
      setIsLoading(true);
      let response;
      
      if (selectedStatus === "all") {
        response = await propertyService.getAll();
      } else if (selectedStatus === "inactive") {
        response = await propertyService.getInactive();
      } else {
        response = await propertyService.getByStatus(selectedStatus);
      }
      
      if (response && response.data) {
        setProperties(response.data || []);
      } else {
        setProperties([]);
      }
    } catch (err) {
      console.error("Error al cargar propiedades:", err);
      setError("Error al cargar las propiedades");
      setProperties([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para cambiar el estado de una propiedad
  const handleStatusChange = async (propertyId, newStatus) => {
    try {
      let response;
      let successMessage = "";
      
      switch (newStatus) {
        case 'rented':
          response = await propertyService.markAsRented(propertyId);
          successMessage = "Propiedad marcada como alquilada";
          break;
        case 'sold':
          response = await propertyService.markAsSold(propertyId);
          successMessage = "Propiedad marcada como vendida";
          break;
        case 'reserved':
          response = await propertyService.markAsReserved(propertyId);
          successMessage = "Propiedad marcada como reservada";
          break;
        case 'sale':
          response = await propertyService.markAsForSale(propertyId);
          successMessage = "Propiedad marcada como disponible para venta";
          break;
        case 'rent':
          response = await propertyService.markAsForRent(propertyId);
          successMessage = "Propiedad marcada como disponible para alquiler";
          break;
        default:
          throw new Error('Estado no válido');
      }
      
      if (response.ok) {
        toast.success(successMessage);
        loadProperties(); // Recargar la lista
      } else {
        toast.error(response.msg || "Error al actualizar estado");
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

  // Filtro de búsqueda
  const filteredProperties = properties?.filter((property) => {
    // Filtrar por término de búsqueda
    const matchesSearch = searchTerm === "" || 
      property?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property?.address?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtrar por estados seleccionados
    const matchesStatus = statusFilter.length === 0 || 
      statusFilter.includes(property.status);
    
    return matchesSearch && matchesStatus;
  }) || [];

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

  // Función para renderizar la insignia de estado
  const renderStatusBadge = (status) => {
    const statusInfo = statusMap[status] || { 
      name: "Desconocido", 
      color: "bg-gray-50 text-gray-700 ring-gray-600/20" 
    };
    
    return (
      <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${statusInfo.color}`}>
        {statusInfo.name}
      </span>
    );
  };

  // Toggle para el filtro de estados
  const toggleStatusFilter = (status) => {
    setStatusFilter(prev => 
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  // Limpiar todos los filtros
  const clearFilters = () => {
    setStatusFilter([]);
    setSearchTerm("");
  };

  if (isLoading || loadingTypes) {
    return (
      <div className="flex items-center justify-center min-h-screen -mt-16">
        <div className="flex flex-col items-center gap-4">
          <BuildingOfficeIcon className="w-12 h-12 text-karttem-gold animate-bounce" />
          <p className="text-gray-600">Cargando propiedades...</p>
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
              Error al cargar las propiedades
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
          <h1 className="text-3xl font-bold text-gray-900">Propiedades</h1>
          <p className="mt-2 text-sm text-gray-700">
            Lista de todas las propiedades disponibles en el sistema
          </p>
        </div>
        <Link
          to="/properties/new"
          className="inline-flex items-center gap-x-2 rounded-xl bg-karttem-gold px-4 py-2.5 text-sm font-semibold text-black shadow-sm hover:bg-yellow-500 transition-all duration-200"
        >
          <PlusIcon className="h-5 w-5" />
          Nueva Propiedad
        </Link>
      </div>

      {/* Selector de vista y filtros */}
      <div className="flex flex-wrap gap-4 items-center">
        {/* Selector de estado para cargar las propiedades */}
        <div className="flex overflow-x-auto space-x-1 pb-1">
          <button
            onClick={() => setSelectedStatus("all")}
            className={`px-3 py-1.5 text-sm font-medium rounded-md ${
              selectedStatus === "all"
                ? "bg-karttem-gold text-black"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setSelectedStatus("sale")}
            className={`px-3 py-1.5 text-sm font-medium rounded-md ${
              selectedStatus === "sale"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            En Venta
          </button>
          <button
            onClick={() => setSelectedStatus("rent")}
            className={`px-3 py-1.5 text-sm font-medium rounded-md ${
              selectedStatus === "rent"
                ? "bg-green-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            En Alquiler
          </button>
          <button
            onClick={() => setSelectedStatus("rented")}
            className={`px-3 py-1.5 text-sm font-medium rounded-md ${
              selectedStatus === "rented"
                ? "bg-purple-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            Alquilados
          </button>
          <button
            onClick={() => setSelectedStatus("sold")}
            className={`px-3 py-1.5 text-sm font-medium rounded-md ${
              selectedStatus === "sold"
                ? "bg-amber-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            Vendidos
          </button>
          <button
            onClick={() => setSelectedStatus("reserved")}
            className={`px-3 py-1.5 text-sm font-medium rounded-md ${
              selectedStatus === "reserved"
                ? "bg-rose-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            Reservados
          </button>
        </div>

        
        <div className="flex ml-auto">
        {/* Botones para los filtros adicionales   <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-x-2 px-3 py-1.5 text-sm font-medium rounded-md bg-white border border-gray-300 hover:bg-gray-50"
          >
            <FunnelIcon className="h-4 w-4" />
            Filtros
            {statusFilter.length > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                {statusFilter.length}
              </span>
            )}
          </button>*/}
          
          {(statusFilter.length > 0 || searchTerm) && (
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
            <h3 className="text-sm font-medium text-gray-700">Filtrar por estado</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {Object.entries(statusMap).map(([key, { name, color }]) => (
                <button
                  key={key}
                  onClick={() => toggleStatusFilter(key)}
                  className={`px-3 py-1 text-xs font-medium rounded-md ${
                    statusFilter.includes(key)
                      ? "bg-gray-800 text-white"
                      : "bg-white border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {name}
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
              placeholder="Buscar propiedades..."
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
                  className="w-[120px] px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Tipo
                </th>
                <th
                  scope="col"
                  className="w-[120px] px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Estado
                </th>
                <th
                  scope="col"
                  className="w-[150px] px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Precio
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
                    <td className="w-[120px] px-3 py-4 text-sm text-gray-500 capitalize">
                      {getPropertyTypeName(property)}
                    </td>
                    <td className="w-[120px] px-3 py-4 text-sm">
                      {renderStatusBadge(property.status)}
                    </td>
                    <td className="w-[150px] px-3 py-4 text-sm text-gray-500">
                      {property.price_usd
                        ? `USD $${property.price_usd.toLocaleString()}`
                        : property.price_ars
                        ? `$${Number(property.price_ars).toLocaleString("es-AR")}`
                        : "-"}
                    </td>
                    <td className="w-[120px] px-3 py-4 text-sm text-gray-500">
                      {property.city || "-"}
                    </td>
                    <td className="w-[180px] px-3 py-4 text-right text-sm font-medium">
                      {/* Botones de acción y estado */}
                      <div className="flex flex-col space-y-2">
                        <div className="flex space-x-2 justify-end">
                          <Link
                            to={`/properties/${property.id}/edit`}
                            className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200"
                          >
                            <PencilSquareIcon className="h-4 w-4 mr-1" />
                            Editar
                          </Link>
                          <button
                            onClick={() => handleExportPDF(property)}
                            className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200"
                          >
                            <DocumentCheckIcon className="h-4 w-4 mr-1" />
                            PDF
                          </button>
                        </div>
                        
                        {/* Botones de estado - Versión simplificada y directa */}
                        <div className="flex flex-wrap justify-end gap-1 mt-1">
                          {property.status !== "sold" && (
                            <button
                              onClick={() => handleStatusChange(property.id, "sold")}
                              className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700"
                              title="Marcar como vendido"
                            >
                              <CheckCircleIcon className="h-3.5 w-3.5 mr-1" />
                              Vendido
                            </button>
                          )}
                          
                          {property.status !== "rented" && (
                            <button
                              onClick={() => handleStatusChange(property.id, "rented")}
                              className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                              title="Marcar como alquilado"
                            >
                              <KeyIcon className="h-3.5 w-3.5 mr-1" />
                              Alquilado
                            </button>
                          )}
                        </div>
                        <div className="flex flex-wrap justify-end gap-1">
                          {property.status !== "reserved" && (
                            <button
                              onClick={() => handleStatusChange(property.id, "reserved")}
                              className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md text-white bg-rose-600 hover:bg-rose-700"
                              title="Marcar como reservado"
                            >
                              <ClockIcon className="h-3.5 w-3.5 mr-1" />
                              Reservado
                            </button>
                          )}
                          
                          {property.status !== "sale" && (
                            <button
                              onClick={() => handleStatusChange(property.id, "sale")}
                              className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                              title="Marcar como en venta"
                            >
                              <ArrowPathIcon className="h-3.5 w-3.5 mr-1" />
                              En venta
                            </button>
                          )}
                          
                          {property.status !== "rent" && (
                            <button
                              onClick={() => handleStatusChange(property.id, "rent")}
                              className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                              title="Marcar como en alquiler"
                            >
                              <ArrowPathIcon className="h-3.5 w-3.5 mr-1" />
                              En alquiler
                            </button>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-12 text-center">
                    <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">
                      No hay propiedades
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {searchTerm || statusFilter.length > 0
                        ? "No se encontraron propiedades que coincidan con tu búsqueda."
                        : "Comienza agregando una nueva propiedad."}
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