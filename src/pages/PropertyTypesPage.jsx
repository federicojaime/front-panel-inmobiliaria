// src/pages/PropertyTypesPage.jsx
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
    PlusIcon,
    BuildingOfficeIcon,
    MagnifyingGlassIcon,
    PencilSquareIcon,
    TrashIcon,
    XMarkIcon,
    CheckIcon
} from '@heroicons/react/24/outline';
import { propertyTypeService } from '../services/api';

export function PropertyTypesPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [propertyTypes, setPropertyTypes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAdding, setIsAdding] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentPropertyType, setCurrentPropertyType] = useState({
        name: '',
        description: '',
        active: true
    });

    useEffect(() => {
        loadPropertyTypes();
    }, []);

    const loadPropertyTypes = async () => {
        try {
            setIsLoading(true);
            const response = await propertyTypeService.getAll();
            if (response.ok) {
                setPropertyTypes(response.data || []);
            } else {
                setError(response.msg || 'Error al cargar tipos de propiedades');
                toast.error(response.msg || 'Error al cargar tipos de propiedades');
            }
        } catch (err) {
            console.error('Error al cargar tipos de propiedades:', err);
            setError('Error al cargar los tipos de propiedades');
            toast.error('Error al cargar los tipos de propiedades');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!currentPropertyType.name.trim()) {
            toast.error('El nombre del tipo de propiedad es requerido');
            return;
        }

        try {
            let response;

            if (isEditing) {
                response = await propertyTypeService.update(currentPropertyType.id, currentPropertyType);
            } else {
                response = await propertyTypeService.create(currentPropertyType);
            }

            if (response.ok) {
                toast.success(isEditing
                    ? 'Tipo de propiedad actualizado correctamente'
                    : 'Tipo de propiedad creado correctamente');
                resetForm();
                loadPropertyTypes();
            } else {
                toast.error(response.msg || 'Error al guardar el tipo de propiedad');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error al guardar el tipo de propiedad');
        }
    };

    const handleEdit = (propertyType) => {
        setCurrentPropertyType(propertyType);
        setIsEditing(true);
        setIsAdding(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este tipo de propiedad?')) {
            try {
                const response = await propertyTypeService.delete(id);
                if (response.ok) {
                    toast.success('Tipo de propiedad eliminado correctamente');
                    loadPropertyTypes();
                } else {
                    toast.error(response.msg || 'Error al eliminar el tipo de propiedad');
                }
            } catch (error) {
                console.error('Error:', error);
                toast.error('Error al eliminar el tipo de propiedad');
            }
        }
    };

    const handleToggleStatus = async (id, isActive) => {
        try {
            const response = isActive
                ? await propertyTypeService.deactivate(id)
                : await propertyTypeService.activate(id);

            if (response.ok) {
                toast.success(`Tipo de propiedad ${isActive ? 'desactivado' : 'activado'} correctamente`);
                loadPropertyTypes();
            } else {
                toast.error(response.msg || `Error al ${isActive ? 'desactivar' : 'activar'} el tipo de propiedad`);
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error(`Error al ${isActive ? 'desactivar' : 'activar'} el tipo de propiedad`);
        }
    };

    const resetForm = () => {
        setCurrentPropertyType({
            name: '',
            description: '',
            active: true
        });
        setIsEditing(false);
        setIsAdding(false);
    };

    const filteredPropertyTypes = propertyTypes.filter(type =>
        type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (type.description && type.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen -mt-16">
                <div className="flex flex-col items-center gap-4">
                    <BuildingOfficeIcon className="w-12 h-12 text-karttem-gold animate-bounce" />
                    <p className="text-gray-600">Cargando tipos de propiedades...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="sm:flex sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Tipos de Propiedades</h1>
                    <p className="mt-2 text-sm text-gray-700">
                        Gestión de los tipos de propiedades disponibles en el sistema
                    </p>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="inline-flex items-center gap-x-2 rounded-xl bg-karttem-gold px-4 py-2.5 text-sm font-semibold text-black shadow-sm hover:bg-yellow-500 transition-all duration-200"
                >
                    {isAdding ? (
                        <>
                            <XMarkIcon className="h-5 w-5" />
                            Cancelar
                        </>
                    ) : (
                        <>
                            <PlusIcon className="h-5 w-5" />
                            Nuevo Tipo
                        </>
                    )}
                </button>
            </div>

            {/* Formulario */}
            {isAdding && (
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Nombre <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="name"
                                value={currentPropertyType.name}
                                onChange={(e) => setCurrentPropertyType({ ...currentPropertyType, name: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-karttem-gold focus:ring-karttem-gold sm:text-sm"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                Descripción
                            </label>
                            <textarea
                                id="description"
                                value={currentPropertyType.description || ''}
                                onChange={(e) => setCurrentPropertyType({ ...currentPropertyType, description: e.target.value })}
                                rows={3}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-karttem-gold focus:ring-karttem-gold sm:text-sm"
                            />
                        </div>
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="active"
                                checked={currentPropertyType.active}
                                onChange={(e) => setCurrentPropertyType({ ...currentPropertyType, active: e.target.checked })}
                                className="h-4 w-4 rounded border-gray-300 text-karttem-gold focus:ring-karttem-gold"
                            />
                            <label htmlFor="active" className="ml-2 block text-sm text-gray-700">
                                Activo
                            </label>
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={resetForm}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-black bg-karttem-gold hover:bg-yellow-500"
                            >
                                {isEditing ? 'Actualizar' : 'Guardar'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Search and Table Container */}
            <div className="bg-white rounded-xl shadow">
                {/* Search Bar */}
                <div className="border-b border-gray-200 px-6 py-4">
                    <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar tipos de propiedades..."
                            className="block w-full rounded-lg border-0 py-2.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-karttem-gold sm:text-sm sm:leading-6"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                    Nombre
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                    Descripción
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                    Estado
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {filteredPropertyTypes.length > 0 ? (
                                filteredPropertyTypes.map((type) => (
                                    <tr key={type.id} className="hover:bg-gray-50 transition-colors duration-200">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                            {type.name}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {type.description || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${type.active
                                                    ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20'
                                                    : 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20'
                                                }`}>
                                                {type.active ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm font-medium">
                                            <div className="flex justify-end space-x-3">
                                                <button
                                                    onClick={() => handleToggleStatus(type.id, type.active)}
                                                    className={`text-sm ${type.active
                                                            ? 'text-red-600 hover:text-red-900'
                                                            : 'text-green-600 hover:text-green-900'
                                                        }`}
                                                >
                                                    {type.active ? 'Desactivar' : 'Activar'}
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(type)}
                                                    className="text-karttem-black hover:text-yellow-800"
                                                >
                                                    <PencilSquareIcon className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(type.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    <TrashIcon className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-10 text-center text-sm text-gray-500">
                                        <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
                                        <p className="mt-2">No se encontraron tipos de propiedades</p>
                                        <p className="mt-1">
                                            {searchTerm
                                                ? "No hay resultados para tu búsqueda."
                                                : "Agrega un nuevo tipo para comenzar."}
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