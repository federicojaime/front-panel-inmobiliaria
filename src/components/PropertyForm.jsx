// src/components/PropertyForm.jsx
import { useForm } from 'react-hook-form';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import imageCompression from 'browser-image-compression'; // npm install browser-image-compression

const PROPERTY_TYPES = [
    { id: 'cabana', name: 'Cabaña' },
    { id: 'campo', name: 'Campo' },
    { id: 'casa', name: 'Casa' },
    { id: 'cochera', name: 'Cochera' },
    { id: 'complejo-turistico', name: 'Complejo turístico' },
    { id: 'departamento', name: 'Departamento' },
    { id: 'departamentos-en-pozo', name: 'Departamentos en pozo' },
    { id: 'deposito', name: 'Depósito' },
    { id: 'duplex', name: 'Dúplex' },
    { id: 'galpon', name: 'Galpón' },
    { id: 'local-comercial', name: 'Local comercial' },
    { id: 'loteo', name: 'Loteo' },
    { id: 'monoambiente', name: 'Monoambiente' },
    { id: 'oficina', name: 'Oficina' },
    { id: 'planta-industrial', name: 'Planta industrial' },
    { id: 'terreno', name: 'Terreno' }
];

const PROPERTY_STATUS = [
    { id: 'sale', name: 'Venta' },
    { id: 'rent', name: 'Alquiler' },
    { id: 'temporary_rent', name: 'Alquiler Temporal' }
];

export function PropertyForm({ onSubmit, initialData = {}, isSubmitting = false }) {
    const [uploadedImages, setUploadedImages] = useState(initialData.images || []);

    const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm({
        defaultValues: {
            title: initialData.title || '',
            description: initialData.description || '',
            type: initialData.type || 'casa',
            status: initialData.status || 'sale',
            price_ars: initialData.price_ars || '',
            price_usd: initialData.price_usd || '',
            area_size: initialData.area_size || '',
            bedrooms: initialData.bedrooms || '',
            bathrooms: initialData.bathrooms || '',
            garage: initialData.garage || false,
            address: initialData.address || '',
            city: initialData.city || '',
            province: initialData.province || '',
            featured: initialData.featured || false,
            amenities: {
                has_pool: initialData.amenities?.has_pool || false,
                has_heating: initialData.amenities?.has_heating || false,
                has_ac: initialData.amenities?.has_ac || false,
                has_garden: initialData.amenities?.has_garden || false,
                has_laundry: initialData.amenities?.has_laundry || false,
                has_parking: initialData.amenities?.has_parking || false,
                has_central_heating: initialData.amenities?.has_central_heating || false,
                has_lawn: initialData.amenities?.has_lawn || false,
                has_fireplace: initialData.amenities?.has_fireplace || false,
                has_central_ac: initialData.amenities?.has_central_ac || false,
                has_high_ceiling: initialData.amenities?.has_high_ceiling || false,
            }
        }
    });

    const compressImage = async (file) => {
        const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            useWebWorker: true
        };

        try {
            const compressedFile = await imageCompression(file, options);
            return compressedFile;
        } catch (error) {
            console.error('Error al comprimir la imagen:', error);
            return file;
        }
    };

    const onDrop = useCallback(async (acceptedFiles) => {
        const compressedImages = await Promise.all(
            acceptedFiles.map(async (file) => {
                const compressedFile = await compressImage(file);
                return {
                    file: compressedFile,
                    preview: URL.createObjectURL(compressedFile),
                    is_main: false
                };
            })
        );

        setUploadedImages(prev => [...prev, ...compressedImages]);
    }, []);

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png']
        }
    });

    const handleFormSubmit = async (data) => {
        const formData = new FormData();

        // Convertir precios a números antes de enviar
        const price_ars = data.price_ars ? parseFloat(data.price_ars) : null;
        const price_usd = data.price_usd ? parseFloat(data.price_usd) : null;

        // Debug: verificar los datos antes de enviar
        console.log('=== Form Data Content ===');

        // Agregar datos básicos
        const basicFields = {
            title: data.title,
            description: data.description,
            type: data.type,
            status: data.status,
            price_ars,
            price_usd,
            area_size: data.area_size ? parseFloat(data.area_size) : null,
            bedrooms: data.bedrooms ? parseInt(data.bedrooms) : null,
            bathrooms: data.bathrooms ? parseInt(data.bathrooms) : null,
            garage: Boolean(data.garage),
            address: data.address,
            city: data.city,
            province: data.province,
            featured: Boolean(data.featured)
        };

        // Agregar campos básicos al FormData
        Object.entries(basicFields).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                formData.append(key, value);
                console.log(`${key}: ${value}`);
            }
        });

        // Agregar amenities
        if (data.amenities) {
            formData.append('amenities', JSON.stringify(data.amenities));
            console.log('amenities:', JSON.stringify(data.amenities));
        }

        // Agregar imágenes
        if (uploadedImages?.length > 0) {
            uploadedImages.forEach(image => {
                if (image.file) {
                    formData.append('images[]', image.file);
                    formData.append('images_main[]', image.is_main ? '1' : '0');
                    console.log('images[]:', `File name: ${image.file.name}, Size: ${image.file.size} bytes`);
                    console.log('images_main[]:', `File name: ${image.file.name}, Is Main: ${image.is_main}`);
                }
            });

            // Debug: información de imágenes
            console.log('\n=== Images Summary ===');
            console.log('Total images:', uploadedImages.length);
            console.log('Images details:', uploadedImages.map(img => ({
                name: img.file?.name,
                size: img.file?.size,
                isMain: img.is_main
            })));
        }

        onSubmit(formData);
    };

    const removeImage = (index) => {
        setUploadedImages(prev => prev.filter((_, i) => i !== index));
    };

    const toggleMainImage = (index) => {
        setUploadedImages(prev =>
            prev.map((img, i) => ({
                ...img,
                is_main: i === index
            }))
        );
    };

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8 divide-y divide-gray-200">
            <div className="space-y-8 divide-y divide-gray-200">
                <div>
                    <div>
                        <h3 className="text-lg font-medium leading-6 text-gray-900">
                            Información de la Propiedad
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Complete la información básica de la propiedad.
                        </p>
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                        <div className="sm:col-span-4">
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                                Título
                            </label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    {...register('title', { required: 'Este campo es requerido' })}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                />
                                {errors.title && (
                                    <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="sm:col-span-6">
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                Descripción
                            </label>
                            <div className="mt-1">
                                <textarea
                                    {...register('description', { required: 'Este campo es requerido' })}
                                    rows={3}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                />
                                {errors.description && (
                                    <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="sm:col-span-3">
                            <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                                Tipo de Propiedad
                            </label>
                            <div className="mt-1">
                                <select
                                    {...register('type')}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                >
                                    {PROPERTY_TYPES.map((type) => (
                                        <option key={type.id} value={type.id}>
                                            {type.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="sm:col-span-3">
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                                Estado
                            </label>
                            <div className="mt-1">
                                <select
                                    {...register('status')}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                >
                                    {PROPERTY_STATUS.map((status) => (
                                        <option key={status.id} value={status.id}>
                                            {status.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="sm:col-span-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div>
                                <label htmlFor="price_ars" className="block text-sm font-medium text-gray-700">
                                    Precio en ARS
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 sm:text-sm">$</span>
                                    </div>
                                    <input
                                        type="number"
                                        step="0.01"
                                        {...register('price_ars', {
                                            setValueAs: v => v === "" ? null : parseFloat(v),
                                            validate: value => {
                                                const price_usd = watch('price_usd');
                                                return (value || price_usd) || "Debe especificar al menos un precio";
                                            }
                                        })}
                                        className="block w-full pl-7 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                        placeholder="0.00"
                                    />
                                    {errors.price_ars && (
                                        <p className="mt-1 text-sm text-red-600">{errors.price_ars.message}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="price_usd" className="block text-sm font-medium text-gray-700">
                                    Precio en USD
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 sm:text-sm">$</span>
                                    </div>
                                    <input
                                        type="number"
                                        step="0.01"
                                        {...register('price_usd', {
                                            setValueAs: v => v === "" ? null : parseFloat(v),
                                            validate: value => {
                                                const price_ars = watch('price_ars');
                                                return (value || price_ars) || "Debe especificar al menos un precio";
                                            }
                                        })}
                                        className="block w-full pl-7 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                        placeholder="0.00"
                                    />
                                    {errors.price_usd && (
                                        <p className="mt-1 text-sm text-red-600">{errors.price_usd.message}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Sección de imágenes */}
                        <div className="sm:col-span-6">
                            <label className="block text-sm font-medium text-gray-700">
                                Imágenes
                            </label>
                            <div className="mt-1">
                                <div {...getRootProps()} className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-gray-400">
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
                                        <div className="flex text-sm text-gray-600">
                                            <input {...getInputProps()} />
                                            <p className="pl-1">Arrastra imágenes o haz clic para seleccionar</p>
                                        </div>
                                        <p className="text-xs text-gray-500">PNG, JPG hasta 10MB</p>
                                    </div>
                                </div>
                            </div>

                            {/* Preview de imágenes */}
                            {uploadedImages.length > 0 && (
                                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                                    {uploadedImages.map((image, index) => (
                                        <div key={index} className="relative group">
                                            <img
                                                src={image.preview || image.url}
                                                alt={`Preview ${index + 1}`}
                                                className="h-24 w-full object-cover rounded-lg"
                                            />
                                            <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                                                <div className="absolute top-2 right-2 flex space-x-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeImage(index)}
                                                        className="p-1 bg-red-500 rounded-full text-white hover:bg-red-600"
                                                    >
                                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => toggleMainImage(index)}
                                                    className={`absolute bottom-2 left-2 px-2 py-1 text-xs rounded ${image.is_main
                                                        ? 'bg-green-500 text-white'
                                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                        }`}
                                                >
                                                    {image.is_main ? 'Principal' : 'Hacer principal'}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="sm:col-span-2">
                            <label htmlFor="area_size" className="block text-sm font-medium text-gray-700">
                                Área (m²)
                            </label>
                            <div className="mt-1">
                                <input
                                    type="number"
                                    step="0.01"
                                    {...register('area_size')}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                />
                                {errors.area_size && (
                                    <p className="mt-1 text-sm text-red-600">{errors.area_size.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="sm:col-span-2">
                            <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700">
                                Habitaciones
                            </label>
                            <div className="mt-1">
                                <input
                                    type="number"
                                    min="0"
                                    {...register('bedrooms')}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-2">
                            <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700">
                                Baños
                            </label>
                            <div className="mt-1">
                                <input
                                    type="number"
                                    min="0"
                                    {...register('bathrooms')}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-3">
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                                Dirección
                            </label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    {...register('address')}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-3">
                            <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                                Ciudad
                            </label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    {...register('city')}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-3">
                            <label htmlFor="province" className="block text-sm font-medium text-gray-700">
                                Provincia
                            </label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    {...register('province')}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-8">
                    <div>
                        <h3 className="text-lg font-medium leading-6 text-gray-900">Amenidades</h3>
                        <p className="mt-1 text-sm text-gray-500">Seleccione las características de la propiedad.</p>
                    </div>
                    <div className="mt-6">
                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { id: 'has_pool', label: 'Piscina' },
                                { id: 'has_heating', label: 'Calefacción' },
                                { id: 'has_ac', label: 'Aire Acondicionado' },
                                { id: 'has_garden', label: 'Jardín' },
                                { id: 'has_laundry', label: 'Lavandería' },
                                { id: 'has_parking', label: 'Estacionamiento' },
                                { id: 'has_central_heating', label: 'Calefacción Central' },
                                { id: 'has_lawn', label: 'Césped' },
                                { id: 'has_fireplace', label: 'Chimenea' },
                                { id: 'has_central_ac', label: 'Refrigeración Central' },
                                { id: 'has_high_ceiling', label: 'Techo Alto' },
                            ].map((amenity) => (
                                <div key={amenity.id} className="flex items-start">
                                    <div className="flex h-5 items-center">
                                        <input
                                            type="checkbox"
                                            {...register(`amenities.${amenity.id}`)}
                                            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                        />
                                    </div>
                                    <div className="ml-3 text-sm">
                                        <label htmlFor={`amenities.${amenity.id}`} className="font-medium text-gray-700">
                                            {amenity.label}
                                        </label>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-5">
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-green-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                        {isSubmitting ? 'Guardando...' : 'Guardar'}
                    </button>
                </div>
            </div>
        </form>
    );
}