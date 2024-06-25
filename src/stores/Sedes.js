import { defineStore } from "pinia";
import axios from "axios";
import { useStoreUsuarios } from "../stores/Usuarios.js";
import { ref } from "vue"
import { notifyErrorRequest } from "../routes/routes.js";
import { notifySuccessRequest } from "../routes/routes.js";

const url = "http://localhost:4505"
// "https://backendgimnasio-ip8j.onrender.com"

export const useStoreSedes = defineStore("Sede", () => {
    let loading=ref(false)
    const useUsuario = useStoreUsuarios();
    
    const getSedes = async () => {
        try {
            loading.value=true
            const r = await axios.get(`${url}/api/sedes`, {
                headers: {
                    token: useUsuario.token
                }
            });
            notifySuccessRequest("Ventas listadas exitosamente");
            return r;
        } catch (error) {
            loading.value=true
            console.log("Error al listar sedes:",error);
            return error
        } finally{
            loading.value=false
        }
    };

    const getSedesActivas = async () => {
        try {
            loading.value=true
            const r = await axios.get(`${url}/api/sedes/activos`, {
                headers: {
                    token: useUsuario.token
                }
            });
            notifySuccessRequest("Ventas listadas exitosamente");
            return r;
        } catch (error) {
            loading.value=true
            console.log("Error al listar sedes activas:", error);
            return error;
        } finally{
            loading.value=false
        }
    };

    const getSedesInactivas = async () => {
        try {
            loading.value=true
            const r = await axios.get(`${url}/api/sedes/inactivos`, {
                headers: {
                    token: useUsuario.token
                }
            });
            return r;
        } catch (error) {
            loading.value=true
            console.log("Error al listar sedes inactivas:", error);
            return error;
        } finally{
            loading.value=false
        }
    };

    const getSedesID = async (id) => {
        try {
            loading.value=true
            const r = await axios.get(`${url}/api/sedes/${id}`, {
                headers: {
                    token: useUsuario.token
                }
            });
            return r;
        } catch (error) {
            loading.value=true
            console.log("Error al listar sedes por su ID:", error);
            return error;
        } finally{
            loading.value=false
        }
    };

    const postSedes = async (datos) => {
        try {
            loading.value=true
            const r = await axios.post(`${url}/api/sedes`, datos, {
                headers: {
                    token: useUsuario.token
                }
            });
            return r;
        } catch (error) {
            loading.value=true
            console.log("Error al agregar la sede:",error);
            return error;
        } finally{
            loading.value=false
        }
    };

    const putSedes = async (id, datos) => {
        try {
            loading.value=true
            const r = await axios.put(`${url}/api/sedes/${id}`, datos, {
                headers: {
                    token: useUsuario.token
                }
            });
            return r;
        } catch (error) {
            loading.value=true
            console.log("Error al modificar la venta:", error);
            return error;
        } finally{
            loading.value=false
        }
    };

    const putSedesActivar = async (id) => {
        try {
            loading.value=true
            const r = await axios.put(`${url}/api/sedes/activar/${id}`, null, {
                headers: {
                    token: useUsuario.token
                }
            });
            return r;
        } catch (error) {
            loading.value=true
            console.log("Error al activar la sede:", error);
            return error;
        } finally{
            loading.value=false
        }
    };

    const putSedesInactivar = async (id) => {
        try {
            loading.value=true
            const r = await axios.put(`${url}/api/sedes/inactivar/${id}`, null, {
                headers: {
                    token: useUsuario.token
                }
            });
            return r;
        } catch (error) {
            loading.value=true
            console.log("Error al inactivar la sede:", error);
            return error;
        } finally{
            loading.value=false
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
