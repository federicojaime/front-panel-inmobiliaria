// src/pages/OwnersPage.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ownerService } from '../services/api';
import { toast } from 'react-hot-toast';
import {
    PlusIcon,
    UserGroupIcon,
    MagnifyingGlassIcon,
    PencilSquareIcon,
    TrashIcon,
    ExclamationCircleIcon
} from '@heroicons/react/24/outline';

export function OwnersPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [owners, setOwners] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadOwners();
    }, []);

    const loadOwners = async () => {
        try {
            setIsLoading(true);
            const response = await ownerService.getAll();
            if (response.ok) {
                setOwners(response.data || []);
            } else {
                setError(response.msg || 'Error al cargar propietarios');
                toast.error(response.msg || 'Error al cargar propietarios');
            }
        } catch (err) {
            console.error('Error al cargar propietarios:', err);
            setError('Error al cargar los propietarios');
            toast.error('Error al cargar los propietarios');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteOwner = async (ownerId) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este propietario?')) {
            try {
                const response = await ownerService.delete(ownerId);
                if (response.ok) {
                    loadOwners();
                    toast.success('Propietario eliminado correctamente');
                } else {
                    toast.error(response.msg || 'Error al eliminar propietario');
                }
            } catch (error) {
                console.error('Error al eliminar propietario:', error);
                toast.error('Error al eliminar el propietario');
            }
        }
    };

    const filteredOwners = owners.filter(owner =>
        owner.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        owner.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        owner.document_number?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getDocumentLabel = (type) => {
        const types = {
            dni: 'DNI',
            cuil: 'CUIL',
            cuit: 'CUIT'
        };
        return types[type] || type;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen -mt-16">
                <div className="flex flex-col items-center gap-4">
                    <UserGroupIcon className="w-12 h-12 text-karttem-gold animate-bounce" />
                    <p className="text-gray-600">Cargando propietarios...</p>
                </div>
            </div>
        );
    }

    if (error && owners.length === 0) {
        return (
            <div className="min-h-screen -mt-16 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full">
                    <div className="flex items-center justify-center">
                        <ExclamationCircleIcon className="h-12 w-12 text-red-500" />
                    </div>
                    <div className="mt-4 text-center">
                        <h3 className="text-lg font-medium text-gray-900">Error al cargar propietarios</h3>
                        <p className="mt-2 text-sm text-gray-500">{error}</p>
                        <div className="mt-6">
                            <button
                                onClick={loadOwners}
                                className="inline-flex items-center gap-x-2 rounded-xl bg-karttem-gold px-4 py-2.5 text-sm font-semibold text-black hover:bg-yellow-500 transition-colors duration-200"
                            >
                                Intentar nuevamente
                            </button>
                        </div>
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
                    <h1 className="text-3xl font-bold text-gray-900">Propietarios</h1>
                    <p className="mt-2 text-sm text-gray-700">
                        Gestión de propietarios de las propiedades
                    </p>
                </div>
                <Link
                    to="/owners/new"
                    className="inline-flex items-center gap-x-2 rounded-xl bg-karttem-gold px-4 py-2.5 text-sm font-semibold text-black shadow-sm hover:bg-yellow-500 transition-all duration-200"
                >
                    <PlusIcon className="h-5 w-5" />
                    Nuevo Propietario
                </Link>
            </div>

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
                            placeholder="Buscar propietarios..."
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
                                    Documento
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                    Email
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                    Teléfono
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                    Tipo
                                </th>
                                <th scope="col" className="relative px-6 py-3 text-right">
                                    <span className="sr-only">Acciones</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {filteredOwners.length > 0 ? (
                                filteredOwners.map((owner) => (
                                    <tr key={owner.id} className="hover:bg-gray-50 transition-colors duration-200">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {owner.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {owner.document_type && owner.document_number
                                                ? `${getDocumentLabel(owner.document_type)}: ${owner.document_number}`
                                                : "-"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {owner.email || "-"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {owner.phone || "-"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {owner.is_company ? "Empresa" : "Persona física"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2">
                                                <Link
                                                    to={`/owners/${owner.id}/edit`}
                                                    className="inline-flex items-center gap-x-1.5 text-karttem-gold hover:text-black transition-colors duration-200"
                                                >
                                                    <PencilSquareIcon className="h-4 w-4" />
                                                    Editar
                                                </Link>
                                                <button
                                                    onClick={() => handleDeleteOwner(owner.id)}
                                                    className="inline-flex items-center gap-x-1.5 text-red-600 hover:text-red-800 transition-colors duration-200"
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                    Eliminar
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="py-12 text-center">
                                        <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
                                        <h3 className="mt-2 text-sm font-medium text-gray-900">
                                            No hay propietarios
                                        </h3>
                                        <p className="mt-1 text-sm text-gray-500">
                                            {searchTerm
                                                ? "No se encontraron propietarios que coincidan con tu búsqueda."
                                                : "Comienza agregando un nuevo propietario."}
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