// src/services/api.js
import axios from "axios";
import { toast } from "react-hot-toast";

//const API_URL = 'https://codeo.site/api-karttem';
const API_URL = "http://localhost/inmobiliaria-api";

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
  getByStatus: (status) => api.get(`/properties/status/${status}`).then((res) => res.data),
  // Obtener propiedades inactivas (alquiladas, vendidas, reservadas)
  getInactive: () => api.get(`/properties/inactive`).then((res) => res.data),
  getById: (id) => api.get(`/property/${id}`).then((res) => res.data),
  create: async (formData) => {
    try {
      const response = await api.post("/property", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      console.error("Error en create:", error.response?.data);
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
  getAll: () =>
    api
      .get("/owners")
      .then((res) => res.data)
      .catch((err) => {
        console.error("Error getting owners:", err);
        throw err;
      }),

  getById: (id) =>
    api
      .get(`/owner/${id}`)
      .then((res) => res.data)
      .catch((err) => {
        console.error("Error getting owner:", err);
        throw err;
      }),

  getByDocument: (documentType, documentNumber) =>
    api
      .get(`/owner/document/${documentType}/${documentNumber}`)
      .then((res) => res.data)
      .catch((err) => {
        console.error("Error getting owner by document:", err);
        throw err;
      }),

  // Función de búsqueda rápida para propietarios
  search: (query) =>
    api
      .get(`/owners/search?q=${encodeURIComponent(query)}`)
      .then((res) => res.data)
      .catch((err) => {
        console.error("Error searching owners:", err);
        throw err;
      }),

  create: (data) =>
    api
      .post("/owner", data)
      .then((res) => res.data)
      .catch((err) => {
        console.error("Error creating owner:", err);
        throw err;
      }),

  update: (id, data) =>
    api
      .put(`/owner/${id}`, data)
      .then((res) => res.data)
      .catch((err) => {
        console.error("Error updating owner:", err);
        throw err;
      }),

  delete: (id) =>
    api
      .delete(`/owner/${id}`)
      .then((res) => res.data)
      .catch((err) => {
        console.error("Error deleting owner:", err);
        throw err;
      }),
};

export default api;