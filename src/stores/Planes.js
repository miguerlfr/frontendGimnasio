import { defineStore } from "pinia";
import { ref } from "vue"
import { useStoreUsuarios } from "../stores/Usuarios.js";
import axios from "axios";
import { notifyErrorRequest, notifySuccessRequest } from "../routes/routes.js";

const url = "https://backendgimnasio-ip8j.onrender.com"
// const url = "http://localhost:4505"

export const useStorePlanes = defineStore("Plane", () => {
    let loading=ref(false)
    const useUsuario = useStoreUsuarios();

    const getPlanes = async () => {
        try {
            loading.value=true
            const r = await axios.get(`${url}/api/planes`, {
                headers: {
                    token: useUsuario.token
                }
            });
            return r;
        } catch (error) {
            loading.value=true
            console.log("Error al listar los planes:", error.response.data);
            return error
        } finally{
            loading.value=false
        }
    };

    const getPlanesActivos = async () => {
        try {
            loading.value=true
            const r = await axios.get(`${url}/api/planes/activos`, {
                headers: {
                    token: useUsuario.token
                }
            });
            return r;
        } catch (error) {
            loading.value=true
            console.log("Error al listar planes activos:", error.response.data);
            return error;
        } finally{
            loading.value=false
        }
    };

    const getPlanesInactivos = async () => {
        try {
            loading.value=true
            const r = await axios.get(`${url}/api/planes/inactivos`, {
                headers: {
                    token: useUsuario.token
                }
            });
            return r;
        } catch (error) {
            loading.value=true
            console.log("Error al listar planes inactivos:", error.response.data);
            return error;
        } finally{
            loading.value=false
        }
    };

    const getPlanesID = async (id) => {
        try {
            loading.value=true
            const r = await axios.get(`${url}/api/planes/${id}`, {
                headers: {
                    token: useUsuario.token
                }
            });
            return r;
        } catch (error) {
            loading.value=true
            console.log("Error al listar planes por su ID:", error.response.data);
            return error;
        } finally{
            loading.value=false
        }
    };

    const postPlanes = async (datos) => {
        try {
            loading.value=true
            const r = await axios.post(`${url}/api/planes`, datos, {
                headers: {
                    token: useUsuario.token
                }
            });
            return r;
        } catch (error) {
            loading.value=true
            console.log("Error al listar agregar el plan:", error.response.data);
            return error;
        } finally{
            loading.value=false
        }
    };

    const putPlanes = async (id, datos) => {
        try {
            loading.value=true
            const r = await axios.put(`${url}/api/planes/${id}`, datos, {
                    headers: {
                    token: useUsuario.token
                }
            });
            return r;
        } catch (error) {
            loading.value=true
            console.log("Error al listar modificar el plan:", error.response.data);
            return error;
        } finally{
            loading.value=false
        }
    };

    const putPlanesActivar = async (id) => {
        try {
            loading.value=true
            const r = await axios.put(`${url}/api/planes/activar/${id}`, null, {
                headers: {
                    token: useUsuario.token
                }
            });
            return r;
        } catch (error) {
            loading.value=true
            console.log("Error al activar el plan:", error.response.data);
            return error;
        } finally{
            loading.value=false
        }
    };

    const putPlanesInactivar = async (id) => {
        try {
            loading.value=true
            const r = await axios.put(`${url}/api/planes/inactivar/${id}`, null, {
                headers: {
                    token: useUsuario.token
                }
            });
            return r;
        } catch (error) {
            loading.value=true
            console.log("Error al inactivar el plan:", error.response.data);
            return error;
        } finally{
            loading.value=false
        }
    };

    return {
        getPlanes,
        getPlanesActivos,
        getPlanesInactivos,
        getPlanesID,
        postPlanes,
        putPlanes,
        putPlanesActivar,
        putPlanesInactivar,
        loading
    };
},
{
    persist: true,
});
