import { defineStore } from "pinia";
import axios from "axios";
import { useStoreUsuarios } from "../stores/Usuarios.js";

export const useStoreClientes = defineStore("Cliente", () => {
    const useUsuario = useStoreUsuarios();
    const url = "https://backendgimnasio-ip8j.onrender.com"
    
    const getClientes = async () => {
        try {
            const r = await axios.get(`${url}/api/clientes`, {
                headers: {
                    token: useUsuario.token
                }
            });
            return r;
        } catch (error) {
            console.error("Error en getClientes:", error.response.data);
            return error;
        }
    };

    const getClientesActivos = async () => {
        try {
            const r = await axios.get(`${url}/api/clientes/activos`, {
                headers: {
                    token: useUsuario.token
                }
            });
            return r;
        } catch (error) {
            console.log("Error en getClientesActivos:", error.response.data);
            return error
        }
    };

    const getClientesInactivos = async () => {
        try {
            const r = await axios.get(`${url}/api/clientes/inactivos`, {
                headers: {
                    token: useUsuario.token
                }
            });
            return r;
        } catch (error) {
            console.log("Error en getClientesInactivos:", error.response.data);
            return error
        }
    };

    const getClientesID = async (id) => {
        try {
            const r = await axios.get(`${url}/api/clientes/${id}`, {
                headers: {
                    token: useUsuario.token
                }
            });
            return r;
        } catch (error) {
            console.log("Error en getClientesID:", error.response.data);
            return error
        }
    };

    const getClientesSeguimientoID = async (id) => {
        try {
            const r = await axios.get(`${url}/api/clientes/seguimiento/${id}`, {
                headers: {
                    token: useUsuario.token
                }
            });
            return r;
        } catch (error) {
            console.log("Error en getClientesSeguimientoID:", error.response.data);
            return error
        }
    };

    const getClientesPlan = async (plan) => {
        try {
            const r = await axios.get(`${url}/api/clientes/plan/${plan}`, {
                headers: {
                    token: useUsuario.token
                }
            });
            return r;
        } catch (error) {
            console.log("Error en getClientesPlan:", error.response.data);
            return error
        }
    };

    const getClientesCumpleaños = async (fecha) => {
        try {
            const r = await axios.get(`${url}/api/clientes/cumpleanos/${fecha}`, {
                headers: {
                    token: useUsuario.token
                }
            });
            return r;
        } catch (error) {
            console.log("Error en getClientesID:", error.response.data);
            return error
        }
    };

    const getClientesIngresaron = async (fecha) => {
        try {
            const r = await axios.get(`${url}/api/clientes/ingresaron/${fecha}`, {
                headers: {
                    token: useUsuario.token
                }
            });
            return r;
        } catch (error) {
            console.log(error.response.data);
            return error
        }
    };

    const postClientes = async (datos) => {
        try {
            const r = await axios.post(`${url}/api/clientes`, datos, {
                headers: {
                    'Content-Type': 'application/json', // Asegúrate de configurar el encabezado Content-Type correctamente
                    'Authorization': `Bearer ${useUsuario.token}` // Si estás usando tokens JWT para autenticación
                }
            });
            return r.data; // Devuelve solo los datos de la respuesta, no toda la respuesta de Axios
        } catch (error) {
            console.error('Error al enviar la solicitud POST:', error.response.data);
            throw error; // Lanza el error para que pueda ser manejado en el contexto donde se llama a esta función
        }
    }


    const putClientes = async (id, datos) => {
        try {
            const r = await axios.put(`${url}/api/clientes/${id}`, datos, {
                headers: {
                    token: useUsuario.token
                }
            });
            return r
        } catch (error) {
            console.log(error.response.data);
            return error
        }
    }

    const putClientesActivar = async (id) => {
        try {
            const r = await axios.put(`${url}/api/clientes/activar/${id}`, {
                headers: {
                    token: useUsuario.token
                }
            });
            return r;
        } catch (error) {
            console.log(error.response.data);
            return error
        }
    };

    const putClientesInactivar = async (id) => {
        try {
            const r = await axios.put(`${url}/api/clientes/inactivar/${id}`, {
                headers: {
                    token: useUsuario.token
                }
            });
            return r;
        } catch (error) {
            console.log(error.response.data);
            return error
        }
    };

    return {
        getClientes,
        getClientesActivos,
        getClientesInactivos,
        getClientesID,
        getClientesSeguimientoID,
        getClientesPlan,
        getClientesCumpleaños,
        getClientesIngresaron,
        postClientes,
        putClientes,
        putClientesActivar,
        putClientesInactivar
    };
},
    {
        persist: true,
    }
);
