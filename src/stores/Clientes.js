import { defineStore } from "pinia";
import axios from "axios";
import { useStoreUsuarios } from "../stores/Usuarios.js";
import { ref } from "vue"
import { notifyErrorRequest } from "../routes/routes.js";
import { notifySuccessRequest } from "../routes/routes.js";

const url = "https://backendgimnasio-ip8j.onrender.com" 
// const url = "http://localhost:4505"

export const useStoreClientes = defineStore("Cliente", () => {
    const useUsuario = useStoreUsuarios();
    let loading=ref(false)

    const getClientes = async () => {
        try {
            loading.value=true
            const r = await axios.get(`${url}/api/clientes`, {
                headers: {
                    token: useUsuario.token
                }
            });
            notifySuccessRequest("Clientes listados exitosamente");
            return r;
        } catch (error) {
            loading.value=true
            console.error("Error al listar clientes:", error);
            return error;
        } finally{
            loading.value=false
        }
    };

    const getClientesActivos = async () => {
        try {
            loading.value=true
            const r = await axios.get(`${url}/api/clientes/activos`, {
                headers: {
                    token: useUsuario.token
                }
            });
            notifySuccessRequest("Clientes activos listados exitosamente");
            return r;
        } catch (error) {
            loading.value=true
            console.log("Error al listar clientes activos:", error);
            return error
        } finally{
            loading.value=false
        }
    };

    const getClientesInactivos = async () => {
        try {
            loading.value=true
            const r = await axios.get(`${url}/api/clientes/inactivos`, {
                headers: {
                    token: useUsuario.token
                }
            });
            notifySuccessRequest("Clientes inactivos listados exitosamente");
            return r;
        } catch (error) {
            loading.value=true
            console.log("Error al listar clientes inactivos:", error);
            return error
        } finally{
            loading.value=false
        }
    };

    const getClientesID = async (id) => {
        try {
            loading.value=true
            const r = await axios.get(`${url}/api/clientes/${id}`, {
                headers: {
                    token: useUsuario.token
                }
            });
            notifySuccessRequest("Clientes por su ID listados exitosamente");
            return r;
        } catch (error) {
            loading.value=true
            console.log("Error al listar el cliente por su ID:", error.response.data);
            return error
        } finally{
            loading.value=false
        }
    };

    const getClientesSeguimientoID = async (id) => {
        try {
            loading.value=true
            const r = await axios.get(`${url}/api/clientes/seguimiento/${id}`, {
                headers: {
                    token: useUsuario.token
                }
            });
            notifySuccessRequest("Clientes listados exitosamente");
            return r;
        } catch (error) {
            loading.value=true
            console.log("Error al listar el cliente por el ID de se seguimiento:", error.response.data);
            return error
        } finally{
            loading.value=false
        }
    };

    const getClientesPlan = async (plan) => {
        try {
            loading.value=true
            const r = await axios.get(`${url}/api/clientes/plan/${plan}`, {
                headers: {
                    token: useUsuario.token
                }
            });
            notifySuccessRequest("Clientes listados exitosamente");
            return r;
        } catch (error) {
            loading.value=true
            console.log("Error al listar los clientes por su plan:", error.response.data);
            return error
        } finally{
            loading.value=false
        }
    };

    const getClientesCumpleaños = async (fecha) => {
        try {
            loading.value=true
            const r = await axios.get(`${url}/api/clientes/cumpleanos/${fecha}`, {
                headers: {
                    token: useUsuario.token
                }
            });
            notifySuccessRequest("Clientes listados exitosamente");
            return r;
        } catch (error) {
            loading.value=true
            console.log("Error al listar los clientes por su fecha de cumpleaños:", error.response.data);
            return error
        } finally{
            loading.value=false
        }
    };

    const getClientesIngresaron = async (fecha) => {
        try {
            loading.value=true
            const r = await axios.get(`${url}/api/clientes/ingresaron/${fecha}`, {
                headers: {
                    token: useUsuario.token
                }
            });
            notifySuccessRequest("Clientes listados exitosamente");
            return r;
        } catch (error) {
            loading.value=true
            console.log("Error al listar los clientes por su fecha de ingreso:", error.response.data);
            return error
        } finally{
            loading.value=false
        }
    };

    const postClientes = async (datos) => {
        try {
            loading.value=true
            const r = await axios.post(`${url}/api/clientes`, datos, {
                headers: {
                    'Content-Type': 'application/json', // Asegúrate de configurar el encabezado Content-Type correctamente
                    'Authorization': `Bearer ${useUsuario.token}` // Si estás usando tokens JWT para autenticación
                }
            });
            return r.data; // Devuelve solo los datos de la respuesta, no toda la respuesta de Axios
        } catch (error) {
            loading.value=true
            console.error("Error al agregar el cliente:", error.response.data);
            throw error; // Lanza el error para que pueda ser manejado en el contexto donde se llama a esta función
        } finally{
            loading.value=false
        }
    }


    const putClientes = async (id, datos) => {
        try {
            loading.value=true
            const r = await axios.put(`${url}/api/clientes/${id}`, datos, {
                headers: {
                    token: useUsuario.token
                }
            });
            return r
        } catch (error) {
            loading.value=true
            console.log("Error al modificar el cliente:", error.response.data);
            return error
        } finally{
            loading.value=false
        }
    }

    const putClientesActivar = async (id) => {
        try {
            loading.value=true
            const r = await axios.put(`${url}/api/clientes/activar/${id}`, {
                headers: {
                    token: useUsuario.token
                }
            });
            notifySuccessRequest("Clientes listados exitosamente");
            return r;
        } catch (error) {
            loading.value=true
            console.log("Error al activar el cliente:", error.response.data);
            return error
        } finally{
            loading.value=false
        }
    };

    const putClientesInactivar = async (id) => {
        try {
            loading.value=true
            const r = await axios.put(`${url}/api/clientes/inactivar/${id}`, {
                headers: {
                    token: useUsuario.token
                }
            });
            notifySuccessRequest("Clientes listados exitosamente");
            return r;
        } catch (error) {
            loading.value=true
            console.log("Error al inactivar el cliente:", error.response.data);
            return error
        } finally{
            loading.value=false
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
        putClientesInactivar,
        loading
    };
},
    {
        persist: true,
    }
);
