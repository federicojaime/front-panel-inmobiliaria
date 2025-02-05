// src/pages/UserFormPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { userService } from '../services/api';
import { 
  UserIcon,
  ArrowLeftIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

export function UserFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState({
    email: '',
    firstname: '',
    lastname: '',
    password: '',
  });

  useEffect(() => {
    if (id) {
      loadUser();
    }
  }, [id]);

  const loadUser = async () => {
    try {
      setIsLoading(true);
      const response = await userService.getById(id);
      if (response.ok) {
        // Excluimos la contraseña de los datos cargados
        const { password, ...userData } = response.data;
        setUser({ ...userData, password: '' });
      } else {
        setError(response.msg || 'Error al cargar el usuario');
      }
    } catch (err) {
      console.error('Error al cargar usuario:', err);
      setError('Error al cargar el usuario');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      let response;
      if (id) {
        // Si no se proporciona una nueva contraseña, la excluimos de la actualización
        const updateData = user.password 
          ? user 
          : { email: user.email, firstname: user.firstname, lastname: user.lastname };
        response = await userService.update(id, updateData);
      } else {
        response = await userService.create(user);
      }

      if (response.ok) {
        navigate('/users');
      } else {
        setError(response.msg || 'Error al guardar el usuario');
      }
    } catch (err) {
      console.error('Error al guardar usuario:', err);
      setError('Error al guardar el usuario');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (isLoading && id) {
    return (
      <div className="flex items-center justify-center min-h-screen -mt-16">
        <div className="flex flex-col items-center gap-4">
          <UserIcon className="w-12 h-12 text-karttem-gold animate-bounce" />
          <p className="text-gray-600">Cargando usuario...</p>
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
              {id ? 'Editar Usuario' : 'Nuevo Usuario'}
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              {id ? 'Modifica los datos del usuario' : 'Ingresa los datos del nuevo usuario'}
            </p>
          </div>
          <Link
            to="/users"
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
              <label htmlFor="firstname" className="block text-sm font-medium text-gray-700">
                Nombre
              </label>
              <input
                type="text"
                name="firstname"
                id="firstname"
                required
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-karttem-gold focus:ring-karttem-gold sm:text-sm"
                value={user.firstname}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="lastname" className="block text-sm font-medium text-gray-700">
                Apellido
              </label>
              <input
                type="text"
                name="lastname"
                id="lastname"
                required
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-karttem-gold focus:ring-karttem-gold sm:text-sm"
                value={user.lastname}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              required
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-karttem-gold focus:ring-karttem-gold sm:text-sm"
              value={user.email}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              {id ? 'Nueva Contraseña (dejar en blanco para mantener la actual)' : 'Contraseña'}
            </label>
            <input
              type="password"
              name="password"
              id="password"
              required={!id}
              minLength={3}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-karttem-gold focus:ring-karttem-gold sm:text-sm"
              value={user.password}
              onChange={handleChange}
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-4">
              <div className="flex">
                <ExclamationCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Error al {id ? 'actualizar' : 'crear'} el usuario
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
              to="/users"
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