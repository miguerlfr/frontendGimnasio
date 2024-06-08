import { defineStore } from "pinia";
import axios from "axios";
import { useStoreUsuarios } from "../stores/Usuarios.js";

const url = "https://backendgimnasio-ip8j.onrender.com"

export const useStoreMantenimientos = defineStore("Mantenimiento", () => {
    const useUsuario = useStoreUsuarios();

    const getMantenimientos = async () => {
        try {
            const r = await axios.get(`${url}/api/mantenimientos`, {
                headers: {
                    token: useUsuario.token
                }
            });
            return r;
        } catch (error) {
            console.log("Error en getMantenimientos:", error.response.data);
            return error;
        }
    };

    const getMantenimientosID = async (id) => {
        try {
            const r = await axios.get(`${url}/api/mantenimientos/${id}`, {
                headers: {
                    token: useUsuario.token
                }
            });
            return r;
        } catch (error) {
            console.log("Error en getMantenimientosID:", error.response.data);
            return error;
        }
    };

    const getMantenimientosFechas = async (fechaInicio, fechaFin) => {
        try {
            const r = await axios.get(`${url}/api/mantenimientos/fechas/${fechaInicio}/${fechaFin}`, {
                headers: {
                    token: useUsuario.token
                }
            });
            return r;
        } catch (error) {
            console.log("Error en getMantenimientosFechas:", error.response.data);
            return error;
        }
    };

    const postMantenimientos = async (datos) => {
        try {
            const r = await axios.post(`${url}/api/mantenimientos`, datos);
            return r;
        } catch (error) {
            console.error("Error en postMantenimientos:", error);
            return error;
        }
    };
    

    const putMantenimientos = async (id, datos) => {
        try {
            const r = await axios.put(`${url}/api/mantenimientos/${id}`, datos, {
                headers: {
                    token: useUsuario.token
                }
            });
            return r;
        } catch (error) {
            console.log("Error en putMantenimientos:", error.response.data);
            return error;
        }
    };

    const putMantenimientosActivar = async (id) => {
        try {
            const r = await axios.put(`${url}/api/mantenimientos/activar/${id}`, {
                headers: {
                    token: useUsuario.token
                }
            });
            return r;
        } catch (error) {
            console.log("Error en putMantenimientosActivar:", error.response.data);
            return error;
        }
    };

    const putMantenimientosInactivar = async (id) => {
        try {
            const r = await axios.put(`${url}/api/mantenimientos/inactivar/${id}`, {
                headers: {
                    token: useUsuario.token
                }
            });
            return r;
        } catch (error) {
            console.log("Error en putMantenimientosInactivar:", error.response.data);
            return error;
        }
    };

    return {
        getMantenimientos,
        getMantenimientosID,
        getMantenimientosFechas,
        postMantenimientos,
        putMantenimientos,
        putMantenimientosActivar,
        putMantenimientosInactivar
    };
},
{
    persist: true,
});
