// src/services/api.js
import axios from "axios";
import { toast } from "react-hot-toast";

// Usar la URL desde el .env
const API_URL = import.meta.env.VITE_API_URL || "http://localhost/inmobiliaria-api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para añadir el token de autenticación
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("inmobiliaria_token");
    if (token) {
      // Asegurarse de que el token tiene el prefijo "Bearer "
      config.headers.Authorization = token.startsWith("Bearer ")
        ? token
        : `Bearer ${token}`;
    }
    // Si se envía FormData, eliminamos Content-Type para que axios lo genere correctamente
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log("Error response:", error.response);
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("inmobiliaria_token");
      localStorage.removeItem("inmobiliaria_user");
      window.dispatchEvent(new Event("auth-error"));
      toast.error("Su sesión ha expirado. Por favor, vuelva a iniciar sesión.");
    }
    return Promise.reject(error);
  }
);

// Servicio de autenticación
export const authService = {
  login: async (credentials) => {
    try {
      console.log("Intentando login con:", credentials);
      const response = await api.post("/user/login", credentials);
      console.log("Respuesta login:", response.data);
      if (response.data.ok) {
        // Asegurarse de que el token se guarda con el prefijo "Bearer "
        const token = response.data.data.jwt;
        localStorage.setItem(
          "inmobiliaria_token",
          token.startsWith("Bearer ") ? token : `Bearer ${token}`
        );
        localStorage.setItem(
          "inmobiliaria_user",
          JSON.stringify(response.data.data)
        );
      }
      return response.data;
    } catch (error) {
      console.error("Error en login:", error.response || error);
      return {
        ok: false,
        msg: error.response?.data?.msg || "Error al iniciar sesión",
        data: null,
      };
    }
  },
  logout: () => {
    localStorage.removeItem("inmobiliaria_token");
    localStorage.removeItem("inmobiliaria_user");
  },
};

// Servicio de propiedades
export const propertyService = {
  getAll: () => api.get("/properties").then((res) => res.data),

  // Filtrar por estado
  getByStatus: (status) =>
    api.get(`/properties/status/${status}`).then((res) => res.data),

  // Obtener propiedades inactivas (vendidas, alquiladas, reservadas)
  getInactive: () =>
    api.get(`/properties/inactive`).then((res) => res.data),

  getById: async (id) => {
    try {
      const response = await api.get(`/property/${id}`);

      // Si tenemos owner_id pero no owner, cargar el propietario
      if (response.data.ok && response.data.data &&
        response.data.data.owner_id && !response.data.data.owner) {
        try {
          const ownerResponse = await api.get(`/owner/${response.data.data.owner_id}`);
          if (ownerResponse.data.ok && ownerResponse.data.data) {
            response.data.data.owner = ownerResponse.data.data;
          }
        } catch (ownerError) {
          console.error("Error al cargar propietario:", ownerError);
        }
      }

      return response.data;
    } catch (error) {
      console.error("Error al cargar propiedad:", error);
      throw error;
    }
  },

  // Usamos POST para update, igual que en create
  update: async (id, formData) => {
    try {
      const response = await api.post(`/property/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      console.error("Error en update:", error.response?.data);
      throw error;
    }
  },

  // Actualizar estado de una propiedad
  updateStatus: async (id, status) => {
    try {
      const response = await api.patch(`/property/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error("Error al actualizar estado:", error.response?.data);
      throw error;
    }
  },

  // Marcar una propiedad como vendida
  markAsSold: async (id) => {
    try {
      const response = await api.patch(`/property/${id}/status`, { status: 'sold' });
      return response.data;
    } catch (error) {
      console.error("Error al marcar como vendida:", error.response?.data);
      throw error;
    }
  },

  // Marcar una propiedad como alquilada
  markAsRented: async (id) => {
    try {
      const response = await api.patch(`/property/${id}/status`, { status: 'rented' });
      return response.data;
    } catch (error) {
      console.error("Error al marcar como alquilada:", error.response?.data);
      throw error;
    }
  },

  // Marcar una propiedad como reservada
  markAsReserved: async (id) => {
    try {
      const response = await api.patch(`/property/${id}/status`, { status: 'reserved' });
      return response.data;
    } catch (error) {
      console.error("Error al marcar como reservada:", error.response?.data);
      throw error;
    }
  },

  // Marcar una propiedad como disponible para venta
  markAsForSale: async (id) => {
    try {
      const response = await api.patch(`/property/${id}/status`, { status: 'sale' });
      return response.data;
    } catch (error) {
      console.error("Error al marcar como en venta:", error.response?.data);
      throw error;
    }
  },

  // Marcar una propiedad como disponible para alquiler
  markAsForRent: async (id) => {
    try {
      const response = await api.patch(`/property/${id}/status`, { status: 'rent' });
      return response.data;
    } catch (error) {
      console.error("Error al marcar como en alquiler:", error.response?.data);
      throw error;
    }
  },

  delete: (id) => api.delete(`/property/${id}`).then((res) => res.data),
};

// Servicio de usuarios
export const userService = {
  getAll: () => api.get("/users").then((res) => res.data),
  getById: (id) => api.get(`/user/${id}`).then((res) => res.data),
  create: (data) => api.post("/user", data).then((res) => res.data),
  update: (id, data) => api.put(`/user/${id}`, data).then((res) => res.data),
  delete: (id) => api.delete(`/user/${id}`).then((res) => res.data),
};

// Servicio de propietarios
export const ownerService = {
  // Función utilitaria para normalizar IDs (para manejar tanto _id como id)
  _normalizeOwnerData: (ownerData) => {
    if (!ownerData) return ownerData;

    // Si el propietario tiene _id pero no id, copiamos _id a id
    if (ownerData._id && !ownerData.id) {
      ownerData.id = ownerData._id;
    }

    return ownerData;
  },

  // Normalizar respuesta para asegurar consistencia
  _normalizeResponse: (response) => {
    if (response && response.data) {
      if (Array.isArray(response.data)) {
        response.data = response.data.map(owner => ownerService._normalizeOwnerData(owner));
      } else {
        response.data = ownerService._normalizeOwnerData(response.data);
      }
    }
    return response;
  },

  getAll: () =>
    api
      .get("/owners")
      .then((res) => ownerService._normalizeResponse(res.data))
      .catch((err) => {
        console.error("Error getting owners:", err);
        throw err;
      }),

  getById: (id) =>
    api
      .get(`/owner/${id}`)
      .then((res) => ownerService._normalizeResponse(res.data))
      .catch((err) => {
        console.error("Error getting owner:", err);
        throw err;
      }),

  getByDocument: (documentType, documentNumber) =>
    api
      .get(`/owner/document/${documentType}/${documentNumber}`)
      .then((res) => ownerService._normalizeResponse(res.data))
      .catch((err) => {
        console.error("Error getting owner by document:", err);
        throw err;
      }),

  // Función de búsqueda rápida para propietarios
  search: (query) =>
    api
      .get(`/owners/search?q=${encodeURIComponent(query)}`)
      .then((res) => ownerService._normalizeResponse(res.data))
      .catch((err) => {
        console.error("Error searching owners:", err);
        throw err;
      }),

  create: (data) =>
    api
      .post("/owner", data)
      .then((res) => {
        console.log("Respuesta crear propietario (raw):", res.data);

        // Asegurarnos de que tenemos una respuesta válida
        if (!res.data) {
          console.error("Respuesta vacía al crear propietario");
          throw new Error("Respuesta vacía al crear propietario");
        }

        // Normalizar la respuesta para asegurar consistencia
        const normalizedResponse = ownerService._normalizeResponse(res.data);

        // Verificar si el propietario tiene un ID después de normalizar
        if (normalizedResponse.ok && normalizedResponse.data &&
          !normalizedResponse.data.id && !normalizedResponse.data._id) {
          console.error("El propietario creado no tiene ID después de normalizar:", normalizedResponse);
          // Si la API no devolvió un ID pero el resto de la respuesta parece correcta,
          // podríamos generar un ID temporal (no recomendado en producción)
          // normalizedResponse.data.id = "temp_" + Date.now();
        }

        console.log("Respuesta crear propietario (normalizada):", normalizedResponse);
        return normalizedResponse;
      })
      .catch((err) => {
        console.error("Error creating owner:", err);
        throw err;
      }),

  update: (id, data) =>
    api
      .put(`/owner/${id}`, data)
      .then((res) => ownerService._normalizeResponse(res.data))
      .catch((err) => {
        console.error("Error updating owner:", err);
        throw err;
      }),

  delete: (id) =>
    api
      .delete(`/owner/${id}`)
      .then((res) => ownerService._normalizeResponse(res.data))
      .catch((err) => {
        console.error("Error deleting owner:", err);
        throw err;
      }),
};

export default api;