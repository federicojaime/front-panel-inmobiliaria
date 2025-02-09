// src/pages/DashboardPage.jsx
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { propertyService } from "../services/api";
import {
  HomeIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ChevronRightIcon,
  PencilSquareIcon
} from "@heroicons/react/24/outline";
import { BuildingOfficeIcon } from "@heroicons/react/24/solid";

// Mapeo de tipos permitidos por la BD
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

const getStatusBadge = (status) => {
  const styles = {
    sale: "bg-blue-50 text-blue-700 ring-blue-600/20",
    rent: "bg-green-50 text-green-700 ring-green-600/20",
    default: "bg-gray-50 text-gray-700 ring-gray-600/20",
  };

  const labels = {
    sale: "En Venta",
    rent: "En Alquiler",
  };

  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
        styles[status] || styles.default
      }`}
    >
      {labels[status] || "Desconocido"}
    </span>
  );
};

export function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["properties"],
    queryFn: propertyService.getAll,
  });

  const properties = data?.data || [];

  const stats = [
    {
      name: "Total Propiedades",
      value: properties.length || 0,
      icon: HomeIcon,
      color: "bg-blue-500",
    },
    {
      name: "En Venta",
      value: properties.filter((p) => p.status === "sale").length || 0,
      icon: CurrencyDollarIcon,
      color: "bg-karttem-gold",
    },
    {
      name: "En Alquiler",
      value: properties.filter((p) => p.status === "rent").length || 0,
      icon: UserGroupIcon,
      color: "bg-emerald-500",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen -mt-16">
        <div className="flex flex-col items-center gap-4">
          <BuildingOfficeIcon className="w-12 h-12 text-karttem-gold animate-bounce" />
          <p className="text-gray-600">Cargando información...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-3xl font-bold leading-tight text-gray-900">
          Panel de Control
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Resumen general de las propiedades y estadísticas
        </p>
      </div>

      {/* Stats */}
      <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((item) => (
          <div
            key={item.name}
            className="relative overflow-hidden rounded-xl bg-white px-4 py-5 shadow transition-all duration-200 hover:shadow-lg sm:px-6"
          >
            <dt>
              <div className={`absolute rounded-lg ${item.color} p-3`}>
                <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 truncate text-sm font-medium text-gray-500">
                {item.name}
              </p>
            </dt>
            <dd className="ml-16 flex items-baseline">
              <p className="text-2xl font-semibold text-gray-900">
                {item.value}
              </p>
            </dd>
          </div>
        ))}
      </dl>

      {/* Recent Properties */}
      <div className="bg-white shadow rounded-xl overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-5">
          <h2 className="text-xl font-semibold text-gray-900">
            Últimas Propiedades
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Listado de las propiedades más recientes
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Título
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Precio
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Ver</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {properties.slice(0, 5).map((property) => (
                <tr
                  key={property.id}
                  className="hover:bg-gray-50 transition-colors duration-200"
                >
                  <td className="px-6 py-4 text-sm">
                    <div className="font-medium text-gray-900 truncate">
                      {property.title}
                    </div>
                    <div className="text-gray-500 text-xs truncate">
                      {property.address}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 capitalize">
                    {propertyTypeMap[property.type] || property.type}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {property.status === "sale"
                      ? "En Venta"
                      : property.status === "rent"
                      ? "En Alquiler"
                      : "Alquiler Temporal"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {property.price_usd
                      ? `USD $${property.price_usd.toLocaleString()}`
                      : "-"}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <Link
                      to={`/properties/${property.id}/edit`}
                      className="inline-flex items-center gap-x-1.5 text-karttem-black hover:text-orange-900 transition-colors duration-200"
                    >
                      <PencilSquareIcon className="h-4 w-4" />
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
