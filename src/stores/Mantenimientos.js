import { defineStore } from "pinia";
import axios from "axios";
import { useStoreUsuarios } from "../stores/Usuarios.js";
import { ref } from "vue"
import { notifyErrorRequest } from "../routes/routes.js";
import { notifySuccessRequest } from "../routes/routes.js";

const url = "https://backendgimnasio-ip8j.onrender.com"
// const url = "http://localhost:4505"

export const useStoreMantenimientos = defineStore("Mantenimiento", () => {
    let loading=ref(false)
    const useUsuario = useStoreUsuarios();

    const getMantenimientos = async () => {
        try {
            loading.value=true
            const r = await axios.get(`${url}/api/mantenimientos`, {
                headers: {
                    token: useUsuario.token
                }
            });
            return r;
        } catch (error) {
            loading.value=true
            console.log("Error al listar mantenimientos:", error.response.data);
            return error;
        } finally{
            loading.value=false
        }
    };

    const getMantenimientosID = async (id) => {
        try {
            loading.value=true
            const r = await axios.get(`${url}/api/mantenimientos/${id}`, {
                headers: {
                    token: useUsuario.token
                }
            });
            return r;
        } catch (error) {
            loading.value=true
            console.log("Error al listar el mantenimiento por su ID:", error.response.data);
            return error;
        } finally{
            loading.value=false
        }
    };

    const getMantenimientosFechas = async (fechaInicio, fechaFin) => {
        try {
            loading.value=true
            const r = await axios.get(`${url}/api/mantenimientos/fechas/${fechaInicio}/${fechaFin}`, {
                headers: {
                    token: useUsuario.token
                }
            });
            return r;
        } catch (error) {
            loading.value=true
            console.log("Error al listar mantenimientos por su fecha:", error.response.data);
            return error;
        } finally{
            loading.value=false
        }
    };

    const postMantenimientos = async (datos) => {
        try {
            loading.value=true
            const r = await axios.post(`${url}/api/mantenimientos`, datos);
            return r;
        } catch (error) {
            loading.value=true
            console.error("Error al agregar el mantenimiento:", error);
            return error;
        } finally{
            loading.value=false
        }
    };
    

    const putMantenimientos = async (id, datos) => {
        try {
            loading.value=true
            const r = await axios.put(`${url}/api/mantenimientos/${id}`, datos, {
                headers: {
                    token: useUsuario.token
                }
            });
            return r;
        } catch (error) {
            loading.value=true
            console.log("Error al modificar el mantenimiento:", error.response.data);
            return error;
        } finally{
            loading.value=false
        }
    };

    const putMantenimientosActivar = async (id) => {
        try {
            loading.value=true
            const r = await axios.put(`${url}/api/mantenimientos/activar/${id}`, {
                headers: {
                    token: useUsuario.token
                }
            });
            return r;
        } catch (error) {
            loading.value=true
            console.log("Error al activar el mantenimiento:", error.response.data);
            return error;
        } finally{
            loading.value=false
        }
    };

    const putMantenimientosInactivar = async (id) => {
        try {
            loading.value=true
            const r = await axios.put(`${url}/api/mantenimientos/inactivar/${id}`, {
                headers: {
                    token: useUsuario.token
                }
            });
            return r;
        } catch (error) {
            loading.value=true
            console.log("Error al inactivar el mantenimiento:", error.response.data);
            return error;
        } finally{
            loading.value=false
        }
    };

    return {
        getMantenimientos,
        getMantenimientosID,
        getMantenimientosFechas,
        postMantenimientos,
        putMantenimientos,
        putMantenimientosActivar,
        putMantenimientosInactivar,
        loading
    };
},
{
    persist: true,
});
