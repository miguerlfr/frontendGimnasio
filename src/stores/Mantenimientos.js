import { defineStore } from "pinia";
import axios from "axios";
import { useStoreUsuarios } from "../stores/Usuarios.js";

export const useStoreMantenimientos = defineStore("Mantenimiento", () => {
    const useUsuario = useStoreUsuarios();

    const getMantenimientos = async () => {
        try {
            const r = await axios.get("http://localhost:4505/api/mantenimientos", {
                headers: {
                    token: useUsuario.token
                }
            });
            return r;
        } catch (error) {
            console.log(error);
            return error;
        }
    };

    const getMantenimientosID = async (id) => {
        try {
            const r = await axios.get(`http://localhost:4505/api/mantenimientos/${id}`, {
                headers: {
                    token: useUsuario.token
                }
            });
            return r;
        } catch (error) {
            console.log(error);
            return error;
        }
    };

    const getMantenimientosFechas = async (fechaInicio, fechaFin) => {
        try {
            const r = await axios.get(`http://localhost:4505/api/mantenimientos/fechas/${fechaInicio}/${fechaFin}`, {
                headers: {
                    token: useUsuario.token
                }
            });
            return r;
        } catch (error) {
            console.log(error);
            return error;
        }
    };

    const postMantenimientos = async (datos) => {
        try {
            const r = await axios.post('http://localhost:4505/api/mantenimientos', datos);
            return r;
        } catch (error) {
            console.error("Error en postMantenimientos:", error);
            throw error;
        }
    };
    

    const putMantenimientos = async (id, datos) => {
        try {
            const r = await axios.put(`http://localhost:4505/api/mantenimientos/${id}`, datos, {
                headers: {
                    token: useUsuario.token
                }
            });
            return r;
        } catch (error) {
            console.log(error);
            return error;
        }
    };

    const putMantenimientosActivar = async (id) => {
        try {
            const r = await axios.put(`http://localhost:4505/api/mantenimientos/activar/${id}`, {
                headers: {
                    token: useUsuario.token
                }
            });
            return r;
        } catch (error) {
            console.log(error);
            return error;
        }
    };

    const putMantenimientosInactivar = async (id) => {
        try {
            const r = await axios.put(`http://localhost:4505/api/mantenimientos/inactivar/${id}`, {
                headers: {
                    token: useUsuario.token
                }
            });
            return r;
        } catch (error) {
            console.log(error);
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
