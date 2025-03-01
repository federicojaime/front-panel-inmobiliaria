// src/pages/OwnerFormPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ownerService } from '../services/api';
import { toast } from 'react-hot-toast';
import {
    UserGroupIcon,
    ArrowLeftIcon,
    ExclamationCircleIcon
} from '@heroicons/react/24/outline';

const DOCUMENT_TYPES = [
    { id: "dni", name: "DNI" },
    { id: "cuil", name: "CUIL" },
    { id: "cuit", name: "CUIT" },
];

export function OwnerFormPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [owner, setOwner] = useState({
        name: '',
        document_type: 'dni',
        document_number: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        province: '',
        is_company: false
    });

    useEffect(() => {
        if (id) {
            loadOwner();
        }
    }, [id]);

    const loadOwner = async () => {
        try {
            setIsLoading(true);
            const response = await ownerService.getById(id);
            if (response.ok) {
                setOwner(response.data);
            } else {
                setError(response.msg || 'Error al cargar el propietario');
                toast.error(response.msg || 'Error al cargar el propietario');
            }
        } catch (err) {
            console.error('Error al cargar propietario:', err);
            setError('Error al cargar el propietario');
            toast.error('Error al cargar el propietario');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        // Validación básica
        if (!owner.name.trim()) {
            setError('El nombre es requerido');
            setIsLoading(false);
            return;
        }

        if (!owner.document_number.trim()) {
            setError('El número de documento es requerido');
            setIsLoading(false);
            return;
        }

        try {
            let response;
            if (id) {
                response = await ownerService.update(id, owner);
            } else {
                response = await ownerService.create(owner);
            }

            if (response.ok) {
                toast.success(id ? 'Propietario actualizado exitosamente' : 'Propietario creado exitosamente');
                navigate('/owners');
            } else {
                setError(response.msg || 'Error al guardar el propietario');
                toast.error(response.msg || 'Error al guardar el propietario');
            }
        } catch (err) {
            console.error('Error al guardar propietario:', err);
            setError('Error al guardar el propietario');
            toast.error('Error al guardar el propietario');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setOwner(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    if (isLoading && id) {
        return (
            <div className="flex items-center justify-center min-h-screen -mt-16">
                <div className="flex flex-col items-center gap-4">
                    <UserGroupIcon className="w-12 h-12 text-karttem-gold animate-bounce" />
                    <p className="text-gray-600">Cargando propietario...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="border-b border-gray-200 pb-5">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            {id ? 'Editar Propietario' : 'Nuevo Propietario'}
                        </h1>
                        <p className="mt-2 text-sm text-gray-600">
                            {id ? 'Modifica los datos del propietario' : 'Ingresa los datos del nuevo propietario'}
                        </p>
                    </div>
                    <Link
                        to="/owners"
                        className="inline-flex items-center gap-x-2 rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-200 transition-colors duration-200"
                    >
                        <ArrowLeftIcon className="h-5 w-5" />
                        Volver
                    </Link>
                </div>
            </div>

            {/* Form Container */}
            <div className="bg-white rounded-xl shadow-sm">
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Nombre completo
                            </label>
                            <input
                                type="text"
                                name="name"
                                id="name"
                                required
                                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-karttem-gold focus:ring-karttem-gold sm:text-sm"
                                value={owner.name}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                ¿Es una empresa?
                            </label>
                            <div className="mt-1 flex items-center">
                                <input
                                    type="checkbox"
                                    name="is_company"
                                    id="is_company"
                                    className="h-4 w-4 rounded border-gray-300 text-karttem-gold focus:ring-karttem-gold"
                                    checked={owner.is_company}
                                    onChange={handleChange}
                                />
                                <label htmlFor="is_company" className="ml-2 block text-sm text-gray-900">
                                    Sí, es una empresa
                                </label>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="document_type" className="block text-sm font-medium text-gray-700">
                                Tipo de Documento
                            </label>
                            <select
                                name="document_type"
                                id="document_type"
                                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-karttem-gold focus:ring-karttem-gold sm:text-sm"
                                value={owner.document_type}
                                onChange={handleChange}
                            >
                                {DOCUMENT_TYPES.map((type) => (
                                    <option key={type.id} value={type.id}>
                                        {type.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="document_number" className="block text-sm font-medium text-gray-700">
                                Número de Documento
                            </label>
                            <input
                                type="text"
                                name="document_number"
                                id="document_number"
                                required
                                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-karttem-gold focus:ring-karttem-gold sm:text-sm"
                                value={owner.document_number}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-karttem-gold focus:ring-karttem-gold sm:text-sm"
                                value={owner.email}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                Teléfono
                            </label>
                            <input
                                type="text"
                                name="phone"
                                id="phone"
                                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-karttem-gold focus:ring-karttem-gold sm:text-sm"
                                value={owner.phone}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                                Dirección
                            </label>
                            <input
                                type="text"
                                name="address"
                                id="address"
                                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-karttem-gold focus:ring-karttem-gold sm:text-sm"
                                value={owner.address}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                                Ciudad
                            </label>
                            <input
                                type="text"
                                name="city"
                                id="city"
                                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-karttem-gold focus:ring-karttem-gold sm:text-sm"
                                value={owner.city}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label htmlFor="province" className="block text-sm font-medium text-gray-700">
                                Provincia
                            </label>
                            <input
                                type="text"
                                name="province"
                                id="province"
                                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-karttem-gold focus:ring-karttem-gold sm:text-sm"
                                value={owner.province}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="rounded-lg bg-red-50 p-4">
                            <div className="flex">
                                <ExclamationCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800">
                                        Error al {id ? 'actualizar' : 'crear'} el propietario
                                    </h3>
                                    <div className="mt-2 text-sm text-red-700">
                                        <p>{error}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-3">
                        <Link
                            to="/owners"
                            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-karttem-gold"
                        >
                            Cancelar
                        </Link>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-black bg-karttem-gold hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-karttem-gold disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Guardando...
                                </>
                            ) : (
                                'Guardar'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}