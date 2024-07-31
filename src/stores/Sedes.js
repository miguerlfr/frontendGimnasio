import { defineStore } from "pinia";
import { ref } from "vue"
import { useStoreUsuarios } from "../stores/Usuarios.js";
import axios from "axios";
import { notifyErrorRequest, notifySuccessRequest } from "../routes/routes.js";

const url = "https://backendgimnasio-ip8j.onrender.com"
// const url = "http://localhost:4505"

export const useStoreSedes = defineStore("Sede", () => {
    let loading = ref(false)
    const useUsuario = useStoreUsuarios();

    const getSedes = async () => {
        try {
            loading.value = true
            const r = await axios.get(`${url}/api/sedes`, {
                headers: {
                    token: useUsuario.token
                }
            });
            notifySuccessRequest("Sedes listadas exitosamente.");
            return r;
        } catch (error) {
            console.error("Error al listar sedes:", error.response.data);
            return error
        } finally {
            loading.value = false
        }
    };

    const getSedesActivas = async () => {
        try {
            loading.value = true
            const r = await axios.get(`${url}/api/sedes/activos`, {
                headers: {
                    token: useUsuario.token
                }
            });
            notifySuccessRequest("Sedes activas listadas exitosamente.");
            return r;
        } catch (error) {
            console.error("Error al listar sedes activas:", error.response.data);
            return error;
        } finally {
            loading.value = false
        }
    };

    const getSedesInactivas = async () => {
        try {
            loading.value = true
            const r = await axios.get(`${url}/api/sedes/inactivos`, {
                headers: {
                    token: useUsuario.token
                }
            });
            notifySuccessRequest("Sedes inactivas listadas exitosamente.");
            return r;
        } catch (error) {
            console.error("Error al listar sedes inactivas:", error.response.data);
            return error;
        } finally {
            loading.value = false
        }
    };

    const getSedesID = async (id) => {
        try {
            loading.value = true
            const r = await axios.get(`${url}/api/sedes/${id}`, {
                headers: {
                    token: useUsuario.token
                }
            });
            notifySuccessRequest("Sede encontrada exitosamente.");
            return r;
        } catch (error) {
            console.error("Error al buscar sede:", error.response.data);
            return error;
        } finally {
            loading.value = false
        }
    };

    const postSedes = async (datos) => {
        try {
            loading.value = true
            const r = await axios.post(`${url}/api/sedes`, datos, {
                headers: {
                    token: useUsuario.token
                }
            });
            notifySuccessRequest("Sede agregada exitosamente.");
            return r;
        } catch (error) {
            notifyErrorRequest(error.response.data.errors[0].msg);
            console.error("Error al agregar sede:", error.response.data.errors[0].msg);
            return error;
        } finally {
            loading.value = false
        }
    };

    const putSedes = async (id, datos) => {
        try {
            loading.value = true
            const r = await axios.put(`${url}/api/sedes/${id}`, datos, {
                headers: {
                    token: useUsuario.token
                }
            });
            notifySuccessRequest("Sede editada exitosamente.");
            return r;
        } catch (error) {
            notifyErrorRequest(error.response.data.errors[0].msg);
            console.error("Error al editar sede:", error.response.data.errors[0].msg);
            return error;
        } finally {
            loading.value = false
        }
    };

    const putSedesActivar = async (id) => {
        try {
            loading.value = true
            const r = await axios.put(`${url}/api/sedes/activar/${id}`, {}, {
                headers: {
                    token: useUsuario.token
                }
            });
            notifySuccessRequest("Sede activada exitosamente.");
            return r;
        } catch (error) {
            notifyErrorRequest(error.response.data);
            console.error("Error al activar sede:", error.response.data);
            return error;
        } finally {
            loading.value = false
        }
    };

    const putSedesInactivar = async (id) => {
        try {
            loading.value = true
            const r = await axios.put(`${url}/api/sedes/inactivar/${id}`, {}, {
                headers: {
                    token: useUsuario.token
                }
            });
            notifySuccessRequest("Sede inactivada exitosamente.");
            return r;
        } catch (error) {
            notifyErrorRequest(error.response.data);
            console.error("Error al inactivar sede:", error.response.data);
            return error;
        } finally {
            loading.value = false
        }
    };

    return {
        getSedes,
        getSedesActivas,
        getSedesInactivas,
        getSedesID,
        postSedes,
        putSedes,
        putSedesActivar,
        putSedesInactivar,
        loading
    };
},
    {
        persist: true,
    });
