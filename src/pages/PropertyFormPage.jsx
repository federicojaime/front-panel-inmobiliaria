// src/pages/PropertyFormPage.jsx
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PropertyForm } from '../components/PropertyForm';
import { propertyService } from '../services/api';
import { toast } from 'react-hot-toast';
import {
  BuildingOfficeIcon,
  ArrowLeftIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

export function PropertyFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: property,
    isLoading: isLoadingProperty,
    isError: isLoadError
  } = useQuery({
    queryKey: ['property', id],
    queryFn: async () => {
      const response = await propertyService.getById(id);

      // Si solo tenemos owner_id pero no el objeto owner completo, cargar el propietario
      if (response.data && response.data.owner_id && !response.data.owner) {
        try {
          const ownerResponse = await ownerService.getById(response.data.owner_id);
          if (ownerResponse.ok && ownerResponse.data) {
            // Añadir el propietario completo a la respuesta
            response.data.owner = ownerResponse.data;
          }
        } catch (error) {
          console.error("Error al cargar datos del propietario:", error);
        }
      }

      return response.data;
    },
    enabled: !!id,
  });

  const createMutation = useMutation({
    mutationFn: propertyService.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['properties']);
      toast.success('Propiedad creada exitosamente');
      navigate('/properties');
    },
    onError: (error) => {
      toast.error(error.response?.data?.msg || 'Error al crear la propiedad');
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data) => propertyService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['properties']);
      toast.success('Propiedad actualizada exitosamente');
      navigate('/properties');
    },
    onError: (error) => {
      toast.error(error.response?.data?.msg || 'Error al actualizar la propiedad');
    }
  });

  const handleSubmit = async (formData) => {
    try {
      if (id) {
        await updateMutation.mutateAsync(formData);
      } else {
        await createMutation.mutateAsync(formData);
      }
    } catch (error) {
      toast.error('Error al procesar el formulario');
      throw error;
    }
  };

  if (id && isLoadingProperty) {
    return (
      <div className="flex items-center justify-center min-h-screen -mt-16">
        <div className="flex flex-col items-center gap-4">
          <BuildingOfficeIcon className="w-12 h-12 text-karttem-gold animate-bounce" />
          <p className="text-gray-600">Cargando propiedad...</p>
        </div>
      </div>
    );
  }

  if (isLoadError) {
    return (
      <div className="min-h-screen -mt-16 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full">
          <div className="flex items-center justify-center">
            <ExclamationCircleIcon className="h-12 w-12 text-red-500" />
          </div>
          <div className="mt-4 text-center">
            <h3 className="text-lg font-medium text-gray-900">Error al cargar la propiedad</h3>
            <p className="mt-2 text-sm text-gray-500">
              No se pudo cargar la información de la propiedad. Por favor, intente nuevamente.
            </p>
            <div className="mt-6">
              <Link
                to="/properties"
                className="inline-flex items-center gap-x-2 rounded-xl bg-karttem-gold px-4 py-2.5 text-sm font-semibold text-black hover:bg-yellow-500 transition-colors duration-200"
              >
                <ArrowLeftIcon className="h-5 w-5" />
                Volver a propiedades
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {id ? 'Editar Propiedad' : 'Nueva Propiedad'}
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              {id ? 'Modifica los datos de la propiedad' : 'Ingresa los datos de la nueva propiedad'}
            </p>
          </div>
          <Link
            to="/properties"
            className="inline-flex items-center gap-x-2 rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-200 transition-colors duration-200"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            Volver
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6">
          <PropertyForm
            onSubmit={handleSubmit}
            initialData={property}
            isSubmitting={createMutation.isLoading || updateMutation.isLoading}
          />
        </div>
      </div>
    </div>
  );
}