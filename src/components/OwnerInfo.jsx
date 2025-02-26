// src/components/OwnerInfo.jsx
import React from 'react';

export function OwnerInfo({ owner, onChangeOwner }) {
  if (!owner) return null;

  const documentTypes = {
    dni: "DNI",
    cuil: "CUIL",
    cuit: "CUIT"
  };

  const getFormattedDocument = () => {
    if (!owner.document_type || !owner.document_number) {
      return "No especificado";
    }
    return `${documentTypes[owner.document_type] || owner.document_type}: ${owner.document_number}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Información del Propietario
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Datos del propietario seleccionado
            </p>
          </div>
          <button
            onClick={onChangeOwner}
            type="button"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Cambiar propietario
          </button>
        </div>

        <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">Documento</dt>
            <dd className="mt-1 text-sm text-gray-900">{getFormattedDocument()}</dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-gray-500">Nombre</dt>
            <dd className="mt-1 text-sm text-gray-900">{owner.name || "No especificado"}</dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-gray-500">Email</dt>
            <dd className="mt-1 text-sm text-gray-900">{owner.email || "No especificado"}</dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-gray-500">Teléfono</dt>
            <dd className="mt-1 text-sm text-gray-900">{owner.phone || "No especificado"}</dd>
          </div>

          {owner.address && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Dirección</dt>
              <dd className="mt-1 text-sm text-gray-900">{owner.address}</dd>
            </div>
          )}

          {owner.city && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Ciudad</dt>
              <dd className="mt-1 text-sm text-gray-900">{owner.city}</dd>
            </div>
          )}

          {owner.province && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Provincia</dt>
              <dd className="mt-1 text-sm text-gray-900">{owner.province}</dd>
            </div>
          )}

          <div>
            <dt className="text-sm font-medium text-gray-500">Tipo</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {owner.is_company ? "Empresa" : "Persona física"}
            </dd>
          </div>
        </div>
      </div>
    </div>
  );
}