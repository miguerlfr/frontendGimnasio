import { defineStore } from "pinia";
import { ref } from "vue"
import { useStoreUsuarios } from "../stores/Usuarios.js";
import axios from "axios";
import { notifyErrorRequest, notifySuccessRequest } from "../routes/routes.js";

const url = "https://backendgimnasio-ip8j.onrender.com"
// const url = "http://localhost:4505"

export const useStoreMaquinas = defineStore("Maquina", () => {
    let loading=ref(false)
    const useUsuario = useStoreUsuarios();

    const getMaquinas = async () => {
        try {
            loading.value=true
            const r = await axios.get(`${url}/api/maquinas`, {
                headers: {
                    token: useUsuario.token
                }
            });
            return r;
        } catch (error) {
            loading.value=true
            console.log("Error al listar las maquinas:", error.response.data);
            return error;
        } finally{
            loading.value=false
        }
    };

    const getMaquinasActivas = async () => {
        try {
            loading.value=true
            const r = await axios.get(`${url}/api/maquinas/activos`, {
                headers: {
                    token: useUsuario.token
                }
            });
            return r;
        } catch (error) {
            loading.value=true
            console.log("Error al listar maquinas activas:", error.response.data);
            return error;
        } finally{
            loading.value=false
        }
    };

    const getMaquinasInactivas = async () => {
        try {
            loading.value=true
            const r = await axios.get(`${url}/api/maquinas/inactivos`, {
                headers: {
                    token: useUsuario.token
                }
            });
            return r;
        } catch (error) {
            loading.value=true
            console.log("Error al listar maquinas inactivas:", error.response.data);
            return error;
        } finally{
            loading.value=false
        }
    };

    const getMaquinasID = async (id) => {
        try {
            loading.value=true
            const r = await axios.get(`${url}/api/maquinas/${id}`, {
                headers: {
                    token: useUsuario.token
                }
            });
            return r;
        } catch (error) {
            loading.value=true
            console.log("Error al listar las maquinas por su ID:", error.response.data);
            return error;
        } finally{
            loading.value=false
        }
    };

    const postMaquinas = async (datos) => {
        try {
            loading.value=true
            const r = await axios.post(`${url}/api/maquinas`, datos, {
                headers: {
                    token: useUsuario.token
                }
            });
            return r;
        } catch (error) {
            loading.value=true
            console.log("Error al agregar la máquina:", error.response.data.errors);
            return error;
        } finally{
            loading.value=false
        }
    };

    const putMaquinas = async (id, datos) => {
        try {
            loading.value=true
            const r = await axios.put(`${url}/api/maquinas/${id}`, datos, {
                headers: {
                    token: useUsuario.token
                }
            });
            return r;
        } catch (error) {
            loading.value=true
            console.log("Error al modificar la máquina:", error.response.data.errors);
            return error;
        } finally{
            loading.value=false
        }
    };

    const putMaquinasActivar = async (id) => {
        try {
            loading.value=true
            const r = await axios.put(`${url}/api/maquinas/activar/${id}`, {
                headers: {
                    token: useUsuario.token
                }
            });
            return r;
        } catch (error) {
            loading.value=true
            console.log("Error al activar la máquina:", error.response.data);
            return error;
        } finally{
            loading.value=false
        }
    };

    const putMaquinasInactivar = async (id) => {
        try {
            loading.value=true
            const r = await axios.put(`${url}/api/maquinas/inactivar/${id}`, {
                headers: {
                    token: useUsuario.token
                }
            });
            return r;
        } catch (error) {
            loading.value=true
            console.log("Error al inactivar la máquina:", error.response.data);
            return error;
        } finally{
            loading.value=false
        }
    };

    return {
        getMaquinas,
        getMaquinasActivas,
        getMaquinasInactivas,
        getMaquinasID,
        postMaquinas,
        putMaquinas,
        putMaquinasActivar,
        putMaquinasInactivar,
        loading
    };
},
{
    persist: true,
});
