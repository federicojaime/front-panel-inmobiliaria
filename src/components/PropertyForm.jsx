// src/components/PropertyForm.jsx
import { useState, useEffect, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { useDropzone } from "react-dropzone";
import imageCompression from "browser-image-compression";
import { toast } from "react-hot-toast";
import { OwnerSection } from "./OwnerSection";
import { LocationPicker } from "./LocationPicker";

// Lista de tipos permitidos por la BD
const PROPERTY_TYPES = [
  { id: "casa", name: "Casa" },
  { id: "departamento", name: "Departamento" },
  { id: "terreno", name: "Terreno" },
  { id: "local_comercial", name: "Local Comercial" },
  { id: "oficina", name: "Oficina" },
  { id: "galpon", name: "Galpón" },
  { id: "campo", name: "Campo" },
  { id: "cochera", name: "Cochera" },
];

// Lista de provincias
const PROVINCES = [
  { id: "san_luis", name: "San Luis" },
  { id: "cordoba", name: "Córdoba" },
  { id: "buenos_aires", name: "Buenos Aires" },
  { id: "catamarca", name: "Catamarca" },
  { id: "chaco", name: "Chaco" },
  { id: "chubut", name: "Chubut" },
  { id: "corrientes", name: "Corrientes" },
  { id: "entre_rios", name: "Entre Ríos" },
  { id: "formosa", name: "Formosa" },
  { id: "jujuy", name: "Jujuy" },
  { id: "la_pampa", name: "La Pampa" },
  { id: "la_rioja", name: "La Rioja" },
  { id: "mendoza", name: "Mendoza" },
  { id: "misiones", name: "Misiones" },
  { id: "neuquen", name: "Neuquén" },
  { id: "rio_negro", name: "Río Negro" },
  { id: "salta", name: "Salta" },
  { id: "santa_cruz", name: "Santa Cruz" },
  { id: "santa_fe", name: "Santa Fe" },
  { id: "santiago_del_estero", name: "Santiago del Estero" },
  { id: "tierra_del_fuego", name: "Tierra del Fuego" },
  { id: "tucuman", name: "Tucumán" },
];

// Lista de estados
const PROPERTY_STATUS = [
  { id: "sale", name: "En Venta" },
  { id: "rent", name: "En Alquiler" },
  { id: "rented", name: "Alquilado" },
  { id: "sold", name: "Vendido" },
  { id: "reserved", name: "Reservado" },
];

export function PropertyForm({
  onSubmit,
  initialData = {},
  isSubmitting = false,
}) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: initialData?.title || "",
      owner_id: initialData?.owner_id || "",
      description: initialData?.description || "",
      type: initialData?.type || "casa",
      status: initialData?.status || "sale",
      price_ars: initialData?.price_ars || "",
      price_usd: initialData?.price_usd || "",
      covered_area: initialData?.covered_area || "",
      total_area: initialData?.total_area || "",
      bedrooms: initialData?.bedrooms || "",
      bathrooms: initialData?.bathrooms || "",
      garage: initialData?.garage || false,
      has_electricity: initialData?.has_electricity || false,
      has_natural_gas: initialData?.has_natural_gas || false,
      has_sewage: initialData?.has_sewage || false,
      has_paved_street: initialData?.has_paved_street || false,
      address: initialData?.address || "",
      city: initialData?.city || "",
      province: initialData?.province || "",
      featured: initialData?.featured || false,
      latitude: initialData?.latitude || "",
      longitude: initialData?.longitude || "",
      amenities: initialData?.amenities || {
        has_pool: false,
        has_heating: false,
        has_ac: false,
        has_garden: false,
        has_laundry: false,
        has_parking: false,
        has_central_heating: false,
        has_lawn: false,
        has_fireplace: false,
        has_central_ac: false,
        has_high_ceiling: false,
      },
    },
    mode: "onBlur",
  });

  const [uploadedImages, setUploadedImages] = useState(
    initialData?.images || []
  );
  const [selectedOwner, setSelectedOwner] = useState(
    initialData?.owner || null
  );
  const [showOwnerSearch, setShowOwnerSearch] = useState(false);

  // Utilizamos un ref para comparar el contenido de initialData
  const prevInitialDataRef = useRef();

  useEffect(() => {
    const initialDataString = JSON.stringify(initialData);
    if (prevInitialDataRef.current !== initialDataString) {
      reset({
        title: initialData?.title || "",
        owner_id: initialData?.owner_id || "",
        description: initialData?.description || "",
        type: initialData?.type || "casa",
        status: initialData?.status || "sale",
        price_ars: initialData?.price_ars || "",
        price_usd: initialData?.price_usd || "",
        covered_area: initialData?.covered_area || "",
        total_area: initialData?.total_area || "",
        bedrooms: initialData?.bedrooms || "",
        bathrooms: initialData?.bathrooms || "",
        garage: initialData?.garage || false,
        has_electricity: initialData?.has_electricity || false,
        has_natural_gas: initialData?.has_natural_gas || false,
        has_sewage: initialData?.has_sewage || false,
        has_paved_street: initialData?.has_paved_street || false,
        address: initialData?.address || "",
        city: initialData?.city || "",
        province: initialData?.province || "",
        featured: initialData?.featured || false,
        latitude: initialData?.latitude || "",
        longitude: initialData?.longitude || "",
        amenities: initialData?.amenities || {
          has_pool: false,
          has_heating: false,
          has_ac: false,
          has_garden: false,
          has_laundry: false,
          has_parking: false,
          has_central_heating: false,
          has_lawn: false,
          has_fireplace: false,
          has_central_ac: false,
          has_high_ceiling: false,
        },
      });
      setUploadedImages(initialData?.images || []);
      setSelectedOwner(initialData?.owner || null);
      prevInitialDataRef.current = initialDataString;
    }
  }, [initialData, reset]);

  // Función para comprimir imágenes
  const compressImage = async (file) => {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };
    try {
      const compressedFile = await imageCompression(file, options);
      return compressedFile;
    } catch (error) {
      console.error("Error al comprimir la imagen:", error);
      return file;
    }
  };

  // Función de drop para cargar nuevas imágenes
  const onDrop = useCallback(async (acceptedFiles) => {
    try {
      const newImages = await Promise.all(
        acceptedFiles.map(async (file) => {
          const compressedFile = await compressImage(file);
          return {
            file: compressedFile,
            preview: URL.createObjectURL(compressedFile),
            is_main: false,
          };
        })
      );

      setUploadedImages((prev) => [...prev, ...newImages]);
      toast.success(`${newImages.length} imagen(es) cargada(s) correctamente`);
    } catch (error) {
      console.error("Error al procesar imágenes:", error);
      toast.error("Error al procesar las imágenes");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png"],
    },
  });

  // Función para eliminar una imagen del estado
  const removeImage = (index) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
    toast.success("Imagen eliminada");
  };

  // Función para marcar una imagen como principal
  const toggleMainImage = (index) => {
    setUploadedImages((prev) =>
      prev.map((img, i) => ({
        ...img,
        is_main: i === index,
      }))
    );
    toast.success("Imagen principal actualizada");
  };

  // Al enviar el formulario se crea un FormData con todos los campos e imágenes
  const onSubmitForm = (data) => {
    if (!selectedOwner) {
      toast.error("Debe seleccionar un propietario");
      return;
    }

    // SOLUCIÓN CLAVE: Considerar todas las posibles ubicaciones del ID
    const ownerId = selectedOwner.id || selectedOwner._id || selectedOwner.newId;

    if (!ownerId) {
      console.error("El propietario seleccionado no tiene ningún tipo de ID:", selectedOwner);
      toast.error("Error: El propietario no tiene un ID válido. Por favor, seleccione otro propietario.");
      return;
    }

    console.log("Enviando formulario con propietario:", selectedOwner);
    console.log("ID del propietario a enviar:", ownerId);

    // Crear formData
    const formData = new FormData();

    // Añadir coordenadas SI existen
    if (data.latitude) formData.append("latitude", data.latitude);
    if (data.longitude) formData.append("longitude", data.longitude);

    // Convertir ID a string y agregarlo al formulario
    const ownerIdString = String(ownerId);
    formData.append("owner_id", ownerIdString);

    // Como plan de respaldo, también enviamos los datos completos del propietario
    formData.append("owner_data", JSON.stringify(selectedOwner));
    formData.append("title", data.title.trim());
    formData.append("description", data.description.trim());
    formData.append("type", data.type.toLowerCase());
    formData.append("status", data.status);
    formData.append("covered_area", Number(data.covered_area) || 0);
    formData.append("total_area", Number(data.total_area) || 0);
    formData.append("province", data.province);

    if (data.price_ars) formData.append("price_ars", Number(data.price_ars));
    if (data.price_usd) formData.append("price_usd", Number(data.price_usd));
    if (data.bedrooms) formData.append("bedrooms", Number(data.bedrooms));
    if (data.bathrooms) formData.append("bathrooms", Number(data.bathrooms));
    if (data.address?.trim()) formData.append("address", data.address.trim());
    if (data.city?.trim()) formData.append("city", data.city.trim());

    formData.append("garage", data.garage === true ? 1 : 0);
    formData.append("has_electricity", data.has_electricity === true ? 1 : 0);
    formData.append("has_natural_gas", data.has_natural_gas === true ? 1 : 0);
    formData.append("has_sewage", data.has_sewage === true ? 1 : 0);
    formData.append("has_paved_street", data.has_paved_street === true ? 1 : 0);
    formData.append("featured", data.featured ? 1 : 0);
    formData.append("amenities", JSON.stringify(data.amenities));

    const user = JSON.parse(localStorage.getItem("inmobiliaria_user"));
    if (user && user.id) {
      formData.append("user_id", user.id);
    }

    // Si no hay imágenes, agregar un campo para indicar que se enviaron 0 imágenes
    if (uploadedImages.length === 0) {
      formData.append("no_images", "1");
    }

    // Procesar las imágenes
    let hasMainImage = false;
    uploadedImages.forEach((img, index) => {
      if (img.is_main) hasMainImage = true;

      if (img.url) {
        formData.append("existing_images[]", img.url);
        formData.append("existing_images_main[]", img.is_main ? "1" : "0");
      } else if (img.file) {
        formData.append("images[]", img.file);
        formData.append("images_main[]", img.is_main ? "1" : "0");
      }
    });

    // Si no hay imagen principal marcada, establecer la primera como principal
    if (uploadedImages.length > 0 && !hasMainImage) {
      if (uploadedImages[0].url) {
        // Reemplazar el valor del primer existing_images_main[]
        const entries = Array.from(formData.entries());
        const mainImageIndex = entries.findIndex(([key]) => key === "existing_images_main[]");
        if (mainImageIndex !== -1) {
          formData.set("existing_images_main[]", "1");
        }
      } else if (uploadedImages[0].file) {
        // Reemplazar el valor del primer images_main[]
        const entries = Array.from(formData.entries());
        const mainImageIndex = entries.findIndex(([key]) => key === "images_main[]");
        if (mainImageIndex !== -1) {
          formData.set("images_main[]", "1");
        }
      }

      // Actualizar el estado local para reflejar el cambio
      setUploadedImages(prev =>
        prev.map((img, i) => i === 0 ? { ...img, is_main: true } : img)
      );
    }

    onSubmit(formData);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmitForm)}
      className="space-y-8 divide-y divide-gray-200"
    >
      <div className="space-y-8 divide-y divide-gray-200">
        {/* Sección de información básica */}
        <div className="pt-4">
          <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Información de la Propiedad
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Complete la información básica de la propiedad.
            </p>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            {/* Título */}
            <div className="sm:col-span-6 md:col-span-4">
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700"
              >
                Título
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  {...register("title", {
                    required: "El título es requerido",
                    minLength: {
                      value: 3,
                      message: "El título debe tener al menos 3 caracteres",
                    },
                  })}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.title.message}
                  </p>
                )}
              </div>
            </div>

            {/* Descripción */}
            <div className="sm:col-span-6">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Descripción
              </label>
              <div className="mt-1">
                <textarea
                  {...register("description", {
                    required: "La descripción es requerida",
                    minLength: {
                      value: 10,
                      message:
                        "La descripción debe tener al menos 10 caracteres",
                    },
                  })}
                  rows={3}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.description.message}
                  </p>
                )}
              </div>
            </div>

            {/* Tipo y Estado */}
            <div className="sm:col-span-3">
              <label
                htmlFor="type"
                className="block text-sm font-medium text-gray-700"
              >
                Tipo de Propiedad
              </label>
              <div className="mt-1">
                <select
                  {...register("type", {
                    required: "El tipo de propiedad es requerido",
                  })}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                >
                  {PROPERTY_TYPES.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
                {errors.type && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.type.message}
                  </p>
                )}
              </div>
            </div>

            <div className="sm:col-span-3">
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-700"
              >
                Estado
              </label>
              <div className="mt-1">
                <select
                  {...register("status", {
                    required: "El estado es requerido",
                  })}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                >
                  {PROPERTY_STATUS.map((status) => (
                    <option key={status.id} value={status.id}>
                      {status.name}
                    </option>
                  ))}
                </select>
                {errors.status && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.status.message}
                  </p>
                )}
              </div>
            </div>

            {/* Precios */}
            <div className="sm:col-span-3">
              <label
                htmlFor="price_ars"
                className="block text-sm font-medium text-gray-700"
              >
                Precio en ARS
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  {...register("price_ars", {
                    setValueAs: (v) => (v === "" ? null : parseFloat(v)),
                  })}
                  className="block w-full pl-7 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label
                htmlFor="price_usd"
                className="block text-sm font-medium text-gray-700"
              >
                Precio en USD
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  {...register("price_usd", {
                    setValueAs: (v) => (v === "" ? null : parseFloat(v)),
                  })}
                  className="block w-full pl-7 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Superficies */}
            <div className="sm:col-span-3">
              <label
                htmlFor="covered_area"
                className="block text-sm font-medium text-gray-700"
              >
                Superficie Cubierta (m²)
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  step="0.01"
                  {...register("covered_area", {
                    required: "La superficie cubierta es requerida",
                    min: {
                      value: 1,
                      message: "La superficie cubierta debe ser mayor a 0",
                    },
                  })}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
                {errors.covered_area && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.covered_area.message}
                  </p>
                )}
              </div>
            </div>

            <div className="sm:col-span-3">
              <label
                htmlFor="total_area"
                className="block text-sm font-medium text-gray-700"
              >
                Superficie del Terreno (m²)
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  step="0.01"
                  {...register("total_area", {
                    required: "La superficie del terreno es requerida",
                    min: {
                      value: 1,
                      message:
                        "La superficie del terreno debe ser mayor a 0",
                    },
                  })}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
                {errors.total_area && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.total_area.message}
                  </p>
                )}
              </div>
            </div>

            {/* Servicios */}
            <div className="sm:col-span-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Servicios Disponibles
              </label>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    {...register("has_electricity")}
                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Luz</span>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    {...register("has_natural_gas")}
                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Gas Natural
                  </span>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    {...register("has_sewage")}
                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Cloacas</span>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    {...register("has_paved_street")}
                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Calle Asfaltada
                  </span>
                </div>
              </div>
            </div>

            {/* Características adicionales */}
            <div className="sm:col-span-2">
              <label
                htmlFor="bedrooms"
                className="block text-sm font-medium text-gray-700"
              >
                Habitaciones
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  min="0"
                  {...register("bedrooms")}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="bathrooms"
                className="block text-sm font-medium text-gray-700"
              >
                Baños
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  {...register("bathrooms")}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="garage"
                className="block text-sm font-medium text-gray-700"
              >
                Cochera
              </label>
              <div className="mt-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    {...register("garage")}
                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Tiene cochera</span>
                </div>
              </div>
            </div>

            {/* Dirección */}
            <div className="sm:col-span-6">
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700"
              >
                Dirección
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  {...register("address")}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label
                htmlFor="city"
                className="block text-sm font-medium text-gray-700"
              >
                Ciudad
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  {...register("city")}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label
                htmlFor="province"
                className="block text-sm font-medium text-gray-700"
              >
                Provincia
              </label>
              <div className="mt-1">
                <select
                  {...register("province", {
                    required: "La provincia es requerida",
                  })}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                >
                  <option value="">Seleccione una provincia</option>
                  {PROVINCES.map((prov) => (
                    <option key={prov.id} value={prov.id}>
                      {prov.name}
                    </option>
                  ))}
                </select>
                {errors.province && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.province.message}
                  </p>
                )}
              </div>
            </div>

            {/* Destacado */}
            <div className="sm:col-span-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  {...register("featured")}
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">Marcar como propiedad destacada</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sección de geoposición */}
        <div className="pt-8">
          <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Ubicación en el mapa
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Ingresa las coordenadas de la propiedad o utiliza el mapa para seleccionarlas.
            </p>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label
                htmlFor="latitude"
                className="block text-sm font-medium text-gray-700"
              >
                Latitud
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  {...register("latitude")}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  placeholder="Ej: -34.6118"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label
                htmlFor="longitude"
                className="block text-sm font-medium text-gray-700"
              >
                Longitud
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  {...register("longitude")}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  placeholder="Ej: -58.4173"
                />
              </div>
            </div>

            <div className="sm:col-span-6">
              <LocationPicker
                latitude={watch('latitude')}
                longitude={watch('longitude')}
                onChange={(lat, lng) => {
                  setValue('latitude', lat);
                  setValue('longitude', lng);
                }}
              />

            </div>
          </div>
        </div>

        {/* Sección de propietario */}
        <div className="pt-8 pb-6">
          <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Información del Propietario
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Seleccione o registre el propietario de la propiedad.
            </p>
          </div>
          <div className="mt-6">
            <OwnerSection
              initialOwner={selectedOwner}
              onOwnerChange={(owner) => {
                console.log("Propietario seleccionado en PropertyForm:", owner);
                if (owner) {
                  // SOLUCIÓN CLAVE: Considerar todas las posibles ubicaciones del ID
                  const ownerId = owner.id || owner._id || owner.newId;

                  // Verificar que el ID sea un valor válido (no undefined, null o '')
                  if (ownerId !== undefined && ownerId !== null && ownerId !== '') {
                    // Crear una copia normalizada del propietario con un id consistente
                    const normalizedOwner = {
                      ...owner,
                      id: ownerId  // Asegurar que tenga un campo id
                    };

                    setSelectedOwner(normalizedOwner);
                    setValue("owner_id", ownerId.toString()); // Convertir a string por si acaso
                    console.log("ID del propietario asignado:", ownerId);
                  } else {
                    console.error("El propietario no tiene ID válido:", owner);
                    toast.error("Error: El propietario seleccionado no tiene ID válido");
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Sección de imágenes */}
        <div className="pt-8">
          <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Imágenes
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Agrega imágenes de la propiedad. La primera imagen marcada como principal será la miniatura.
            </p>
          </div>

          <div className="mt-4">
            <div
              {...getRootProps()}
              className={`flex justify-center px-6 pt-5 pb-6 border-2 ${isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 border-dashed'
                } rounded-md cursor-pointer hover:border-gray-400 transition-colors`}
            >
              <div className="space-y-1 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex text-sm text-gray-600 justify-center">
                  <input {...getInputProps()} />
                  <p className="pl-1">
                    {isDragActive
                      ? "Suelta las imágenes aquí"
                      : "Arrastra imágenes o haz clic para seleccionar"}
                  </p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG hasta 10MB</p>
              </div>
            </div>
          </div>

          {uploadedImages.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Imágenes cargadas ({uploadedImages.length})
              </h4>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {uploadedImages.map((image, index) => (
                  <div key={index} className="relative group rounded-lg overflow-hidden shadow-sm border border-gray-200">
                    <div className="aspect-w-1 aspect-h-1 w-full">
                      <img
                        src={
                          image.preview ||
                          (image.url.startsWith('http')
                            ? image.url
                            : import.meta.env.VITE_API_URL + "/" + image.url)
                        }
                        alt={`Vista previa ${index + 1}`}
                        className="h-36 w-full object-cover"
                      />
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="p-1 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleMainImage(index)}
                        className={`self-start px-2 py-1 text-xs rounded-md ${image.is_main
                          ? "bg-green-500 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          } transition-colors`}
                      >
                        {image.is_main ? "Principal ✓" : "Hacer principal"}
                      </button>
                    </div>
                    {image.is_main && (
                      <div className="absolute top-0 left-0 bg-green-500 text-white px-2 py-1 text-xs">
                        Principal
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sección de amenidades */}
        <div className="pt-8">
          <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Amenidades
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Seleccione las características adicionales de la propiedad.
            </p>
          </div>
          <div className="mt-6">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3 md:grid-cols-4">
              {[
                { id: "has_pool", label: "Piscina" },
                { id: "has_heating", label: "Calefacción" },
                { id: "has_ac", label: "Aire Acondicionado" },
                { id: "has_garden", label: "Jardín" },
                { id: "has_laundry", label: "Lavandería" },
                { id: "has_parking", label: "Estacionamiento" },
                { id: "has_central_heating", label: "Calefacción Central" },
                { id: "has_lawn", label: "Césped" },
                { id: "has_fireplace", label: "Chimenea" },
                { id: "has_central_ac", label: "Refrigeración Central" },
                { id: "has_high_ceiling", label: "Techo Alto" },
              ].map((amenity) => (
                <div key={amenity.id} className="flex items-center">
                  <input
                    type="checkbox"
                    {...register(`amenities.${amenity.id}`)}
                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {amenity.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Botón de envío */}
      <div className="pt-5">
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 rounded-lg bg-green-600 text-white font-medium shadow hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Guardando...
              </span>
            ) : "Guardar Propiedad"}
          </button>
        </div>
      </div>
    </form>
  );
}