// src/pages/PropertiesPage.jsx

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { propertyService } from "../services/api";
import {
  PlusIcon,
  BuildingOfficeIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  DocumentCheckIcon,
} from "@heroicons/react/24/outline";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import ReactDOMServer from "react-dom/server";
import PropertyPDF from "../components/PropertyPDF"; // IMPORTACIÓN POR DEFECTO

// Mapeo de tipos permitidos por la BD (ajusta según tus tipos)
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

export function PropertiesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      setIsLoading(true);
      const response = await propertyService.getAll();
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

  // Filtro de búsqueda
  const filteredProperties = properties?.filter((property) => {
    const lowerSearch = searchTerm.toLowerCase();
    return (
      property?.title?.toLowerCase().includes(lowerSearch) ||
      property?.address?.toLowerCase().includes(lowerSearch)
    );
  }) || [];

  // Función para exportar PDF (una sola propiedad)
  const handleExportPDF = async (property) => {
    try {
      // Renderizar el componente PropertyPDF como HTML estático
      const pdfContent = ReactDOMServer.renderToStaticMarkup(
        <PropertyPDF property={property} propertyTypeMap={propertyTypeMap} />
      );

      // Crear un contenedor temporal en el DOM y agregar el contenido HTML
      const container = document.createElement("div");
      container.innerHTML = pdfContent;
      container.style.width = "700px"; // Ancho máximo definido en PropertyPDF
      container.style.padding = "20px";
      container.style.fontFamily = "Arial, sans-serif";
      document.body.appendChild(container);

      // Convertir el contenedor a canvas con html2canvas
      const canvas = await html2canvas(container, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");

      // Eliminar el contenedor temporal del DOM
      document.body.removeChild(container);

      // Crear el PDF con jsPDF (A4 en vertical, usando px)
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
      alert("Ocurrió un error al exportar el PDF.");
    }
  };

  if (isLoading) {
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
                  className="w-[150px] px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
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
                  className="w-[120px] px-3 py-3.5 text-right text-sm font-medium"
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
                      {propertyTypeMap[property.type] || property.type}
                    </td>
                    <td className="w-[120px] px-3 py-4 text-sm">
                      {property.status === "sale"
                        ? "En Venta"
                        : property.status === "rent"
                        ? "En Alquiler"
                        : "Alquiler Temporal"}
                    </td>
                    <td className="w-[150px] px-3 py-4 text-sm text-gray-500">
                      {property.price_usd
                        ? `USD $${property.price_usd.toLocaleString()}`
                        : property.price_ars
                        ? `$${Number(property.price_ars).toLocaleString("es-AR")}`
                        : "-"}
                    </td>
                    <td className="w-[120px] px-3 py-4 text-sm text-gray-500">
                      {property.city}
                    </td>
                    <td className="w-[120px] px-3 py-4 text-right text-sm font-medium">
                      <Link
                        to={`/properties/${property.id}/edit`}
                        className="inline-flex items-center gap-x-1.5 text-karttem-black hover:text-orange-900 transition-colors duration-200"
                      >
                        <PencilSquareIcon className="h-4 w-4" />
                        Editar
                      </Link>
                      <button
                        onClick={() => handleExportPDF(property)}
                        className="ml-2 inline-flex items-center gap-x-1.5 text-karttem-black hover:text-orange-900 transition-colors duration-200"
                      >
                        <DocumentCheckIcon className="h-4 w-4" />
                        PDF
                      </button>
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
                      {searchTerm
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
