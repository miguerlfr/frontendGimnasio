import { defineStore } from "pinia";
import { ref } from "vue"
import { useStoreUsuarios } from "../stores/Usuarios.js";
import axios from "axios";
import { notifyErrorRequest, notifySuccessRequest } from "../routes/routes.js";

const url = "https://backendgimnasio-ip8j.onrender.com"
// const url = "http://localhost:4505"

export const useStoreMantenimientos = defineStore("Mantenimiento", () => {
    let loading = ref(false)
    const useUsuario = useStoreUsuarios();

    const getMantenimientos = async () => {
        try {
            loading.value = true
            const r = await axios.get(`${url}/api/mantenimientos`, {
                headers: {
                    token: useUsuario.token
                }
            });
            notifySuccessRequest("Mantenimientos listados exitosamente.");
            return r;
        } catch (error) {
            console.error("Error al listar mantenimientos:", error.response.data);
            return error;
        } finally {
            loading.value = false
        }
    };

    const getMantenimientosActivos = async () => {
        try {
            loading.value = true
            const r = await axios.get(`${url}/api/mantenimientos/activos`, {
                headers: {
                    token: useUsuario.token
                }
            });
            notifySuccessRequest("Mantenimientos activos listados exitosamente.");
            return r;
        } catch (error) {
            console.error("Error al listar mantenimientos activos:", error.response.data);
            return error
        } finally {
            loading.value = false
        }
    };

    const getMantenimientosInactivos = async () => {
        try {
            loading.value = true
            const r = await axios.get(`${url}/api/mantenimientos/inactivos`, {
                headers: {
                    token: useUsuario.token
                }
            });
            notifySuccessRequest("Mantenimientos inactivos listados exitosamente.");
            return r;
        } catch (error) {
            console.error("Error al listar mantenimientos inactivos:", error.response.data);
            return error
        } finally {
            loading.value = false
        }
    };

    const getMantenimientosID = async (id) => {
        try {
            loading.value = true
            const r = await axios.get(`${url}/api/mantenimientos/${id}`, {
                headers: {
                    token: useUsuario.token
                }
            });
            notifySuccessRequest("Mantenimiento encontrado exitosamente.");
            return r;
        } catch (error) {
            console.error("Error al buscar mantenimiento:", error.response.data);
            return error;
        } finally {
            loading.value = false
        }
    };

    const getMantenimientosFechas = async (fechaInicio, fechaFin) => {
        try {
            loading.value = true
            const r = await axios.get(`${url}/api/mantenimientos/fechas/${fechaInicio}/${fechaFin}`, {
                headers: {
                    token: useUsuario.token
                }
            });
            notifySuccessRequest("Mantenimientos listados por fechas exitosamente.");
            return r;
        } catch (error) {
            console.error("Error al listar mantenimientos por su fecha:", error.response.data);
            return error;
        } finally {
            loading.value = false
        }
    };

    const postMantenimientos = async (datos) => {
        try {
            loading.value = true
            const r = await axios.post(`${url}/api/mantenimientos`, datos, {
                headers: {
                    token: useUsuario.token
                }
            });
            notifySuccessRequest("Mantenimiento agregado exitosamente.");
            return r;
        } catch (error) {
            notifySuccessRequest(error.response.data.errors[0].msg);
            console.error("Error al agregar mantenimiento:", error.response.data.errors[0].msg);
            return error;
        } finally {
            loading.value = false
        }
    };


    const putMantenimientos = async (id, datos) => {
        try {
            loading.value = true
            const r = await axios.put(`${url}/api/mantenimientos/${id}`, datos, {
                headers: {
                    token: useUsuario.token
                }
            });
            notifySuccessRequest("Mantenimiento editado exitosamente.");
            return r;
        } catch (error) {
            notifyErrorRequest(error.response.data.errors[0].msg);
            console.error("Error al editar el mantenimiento:", error.response.data.errors[0].msg);
            return error;
        } finally {
            loading.value = false
        }
    };

    const putMantenimientosActivar = async (id) => {
        try {
            loading.value = true
            const r = await axios.put(`${url}/api/mantenimientos/activar/${id}`, {
                headers: {
                    token: useUsuario.token
                }
            });
            notifySuccessRequest("Mantenimiento activado exitosamente.");
            return r;
        } catch (error) {
            notifyErrorRequest(error.response.data);
            console.error("Error al activar el mantenimiento:", error.response.data);
            return error;
        } finally {
            loading.value = false
        }
    };

    const putMantenimientosInactivar = async (id) => {
        try {
            loading.value = true
            const r = await axios.put(`${url}/api/mantenimientos/inactivar/${id}`, {
                headers: {
                    token: useUsuario.token
                }
            });
            notifySuccessRequest("Mantenimiento inactivado exitosamente.");
            return r;
        } catch (error) {
            notifyErrorRequest(error.response.data);
            console.error("Error al inactivar el mantenimiento:", error.response.data);
            return error;
        } finally {
            loading.value = false
        }
    };

    return {
        getMantenimientos,
        getMantenimientosActivos,
        getMantenimientosInactivos,
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
