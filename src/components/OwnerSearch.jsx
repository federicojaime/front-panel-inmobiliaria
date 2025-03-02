// src/components/OwnerSearch.jsx
import { useState, useEffect } from "react";
import { ownerService } from "../services/api";
import { toast } from "react-hot-toast";
import { ExclamationCircleIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

const DOCUMENT_TYPES = [
  { id: "dni", name: "DNI" },
  { id: "cuil", name: "CUIL" },
  { id: "cuit", name: "CUIT" },
];

// Reglas de validación por tipo de documento
const DOCUMENT_RULES = {
  dni: {
    minLength: 7,
    maxLength: 8,
    pattern: /^\d+$/,
    message: "El DNI debe tener entre 7 y 8 números",
  },
  cuil: {
    minLength: 11,
    maxLength: 11,
    pattern: /^\d{2}-\d{8}-\d{1}$/,
    message: "El CUIL debe tener el formato XX-XXXXXXXX-X",
  },
  cuit: {
    minLength: 11,
    maxLength: 11,
    pattern: /^\d{2}-\d{8}-\d{1}$/,
    message: "El CUIT debe tener el formato XX-XXXXXXXX-X",
  },
};

export function OwnerSearch({ onOwnerSelect }) {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [formData, setFormData] = useState({
    documentType: "dni",
    documentNumber: "",
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    province: "",
    isCompany: false,
  });

  // Efecto para buscar propietarios al escribir
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim().length > 2) {
        quickSearch(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Función de búsqueda rápida por nombre, email o documento
  const quickSearch = async (query) => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await ownerService.search(query);
      if (response.ok) {
        setSearchResults(response.data || []);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Error en búsqueda:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Función para validar el número de documento según el tipo
  const validateDocument = (type, number) => {
    const rules = DOCUMENT_RULES[type];
    if (!rules) return true;

    const value = number.trim();
    if (!value) return "El número de documento es requerido";

    if (type === "dni") {
      if (!rules.pattern.test(value))
        return "El DNI solo debe contener números";
      if (value.length < rules.minLength || value.length > rules.maxLength) {
        return `El DNI debe tener entre ${rules.minLength} y ${rules.maxLength} números`;
      }
    } else {
      // Para CUIL/CUIT
      const formatted = formatDocument(value, type);
      if (!rules.pattern.test(formatted)) {
        return rules.message;
      }
    }
    return null;
  };

  // Función para formatear CUIL/CUIT
  const formatDocument = (value, type) => {
    if (type === "dni") return value;

    // Eliminar caracteres no numéricos
    const numbers = value.replace(/\D/g, "");
    if (numbers.length !== 11) return value;

    // Formatear como XX-XXXXXXXX-X
    return `${numbers.slice(0, 2)}-${numbers.slice(2, 10)}-${numbers.slice(10)}`;
  };

  // Función para validar email
  const validateEmail = (email) => {
    if (!email) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) ? null : "El formato del email no es válido";
  };

  // Función para validar teléfono
  const validatePhone = (phone) => {
    if (!phone) return null;
    const phoneRegex = /^[\d\s()-]+$/;
    return phoneRegex.test(phone)
      ? null
      : "El formato del teléfono no es válido";
  };

  const validateForm = () => {
    const newErrors = {};

    // Validar documento
    const documentError = validateDocument(
      formData.documentType,
      formData.documentNumber
    );
    if (documentError) newErrors.documentNumber = documentError;

    // Validar nombre
    if (!formData.name.trim()) {
      newErrors.name = "El nombre es requerido";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "El nombre debe tener al menos 3 caracteres";
    }

    // Validar email
    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;

    // Validar teléfono
    const phoneError = validatePhone(formData.phone);
    if (phoneError) newErrors.phone = phoneError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const documentError = validateDocument(
      formData.documentType,
      formData.documentNumber
    );
    if (documentError) {
      setErrors({ documentNumber: documentError });
      toast.error(documentError);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await ownerService.getByDocument(
        formData.documentType,
        formData.documentNumber.trim()
      );

      if (response.ok && response.data) {
        onOwnerSelect({
          ...response.data,
          document_type: response.data.document_type || formData.documentType,
          document_number:
            response.data.document_number || formData.documentNumber,
        });
        toast.success("Propietario encontrado");
      } else {
        toast.error(
          "Propietario no encontrado. Complete los datos para registrarlo."
        );
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al buscar propietario");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!validateForm()) {
      toast.error("Por favor, corrija los errores en el formulario");
      return;
    }

    setIsLoading(true);

    try {
      const ownerData = {
        document_type: formData.documentType,
        document_number: formatDocument(
          formData.documentNumber,
          formData.documentType
        ),
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        province: formData.province.trim(),
        is_company: formData.isCompany,
      };

      const response = await ownerService.create(ownerData);

      if (response.ok) {
        onOwnerSelect({
          ...response.data,
          ...ownerData,
        });
        toast.success("Propietario creado exitosamente");
      } else {
        toast.error(response.msg || "Error al crear propietario");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al crear propietario");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    // Limpiar error del campo cuando el usuario comienza a escribir
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const handleOwnerSelect = (owner) => {
    onOwnerSelect(owner);
    toast.success("Propietario seleccionado");
  };

  const handleDocumentTypeChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      documentType: e.target.value,
      documentNumber: "", // Limpiar el número al cambiar el tipo
    }));
    setErrors((prev) => ({
      ...prev,
      documentNumber: null,
    }));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      {/* Búsqueda rápida */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Buscar Propietario
        </h3>

        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar por nombre, email o documento..."
            className="block w-full rounded-lg border-gray-300 pl-10 focus:border-blue-500 focus:ring-blue-500 shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {isSearching ? (
          <div className="mt-2 text-center text-sm text-gray-500">
            Buscando...
          </div>
        ) : (
          searchResults.length > 0 && (
            <div className="mt-2 max-h-60 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-sm">
              <ul className="divide-y divide-gray-200">
                {searchResults.map((owner) => (
                  <li
                    key={owner.id}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleOwnerSelect(owner)}
                  >
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{owner.name}</p>
                        <p className="text-sm text-gray-500">
                          {owner.document_type && owner.document_number
                            ? `${owner.document_type.toUpperCase()}: ${
                                owner.document_number
                              }`
                            : "Sin documento"}
                        </p>
                      </div>
                      <div className="text-sm text-gray-500">
                        {owner.email || owner.phone}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )
        )}
      </div>

      {/* Separador entre búsqueda rápida y búsqueda por documento */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-sm text-gray-500">
            O buscar por documento
          </span>
        </div>
      </div>

      {/* Búsqueda por documento */}
      <div className="mb-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tipo de Documento
            </label>
            <select
              name="documentType"
              value={formData.documentType}
              onChange={handleDocumentTypeChange}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              {DOCUMENT_TYPES.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Número de Documento
            </label>
            <div className="relative mt-1">
              <input
                type="text"
                name="documentNumber"
                value={formData.documentNumber}
                onChange={handleChange}
                className={`block w-full rounded-lg shadow-sm ${
                  errors.documentNumber
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                }`}
              />
              {errors.documentNumber && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <ExclamationCircleIcon
                    className="h-5 w-5 text-red-500"
                    aria-hidden="true"
                  />
                </div>
              )}
            </div>
            {errors.documentNumber && (
              <p className="mt-1 text-sm text-red-600">
                {errors.documentNumber}
              </p>
            )}
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={handleSearch}
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Buscando...
                </span>
              ) : (
                "Buscar"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Sección de registro */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Datos del Propietario
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nombre
            </label>
            <div className="relative mt-1">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`block w-full rounded-lg shadow-sm ${
                  errors.name
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                }`}
              />
              {errors.name && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <ExclamationCircleIcon
                    className="h-5 w-5 text-red-500"
                    aria-hidden="true"
                  />
                </div>
              )}
            </div>
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <div className="relative mt-1">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`block w-full rounded-lg shadow-sm ${
                  errors.email
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                }`}
              />
              {errors.email && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <ExclamationCircleIcon
                    className="h-5 w-5 text-red-500"
                    aria-hidden="true"
                  />
                </div>
              )}
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Teléfono
            </label>
            <div className="relative mt-1">
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`block w-full rounded-lg shadow-sm ${
                  errors.phone
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                }`}
              />
              {errors.phone && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <ExclamationCircleIcon
                    className="h-5 w-5 text-red-500"
                    aria-hidden="true"
                  />
                </div>
              )}
            </div>
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Dirección
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Ciudad
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Provincia
            </label>
            <input
              type="text"
              name="province"
              value={formData.province}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="col-span-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="isCompany"
                checked={formData.isCompany}
                onChange={handleChange}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">Es una empresa</span>
            </label>
          </div>

          <div className="col-span-2">
            <button
              type="button"
              onClick={handleCreate}
              disabled={isLoading}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Guardando...
                </span>
              ) : (
                "Guardar Propietario"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}