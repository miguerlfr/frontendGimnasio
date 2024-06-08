import { defineStore } from "pinia";
import axios from "axios";
import { useStoreUsuarios } from "../stores/Usuarios.js";

const url = "https://backendgimnasio-ip8j.onrender.com"

export const useStorePlanes = defineStore("Plane", () => {
    const useUsuario = useStoreUsuarios();

    const getPlanes = async () => {
        try {
            const r = await axios.get(`${url}/api/planes`, {
                headers: {
                    token: useUsuario.token
                }
            });
            return r;
        } catch (error) {
            console.log(error);
            return error
        }
    };

    const getPlanesActivos = async () => {
        try {
            const r = await axios.get(`${url}/api/planes/activos`, {
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

    const getPlanesInactivos = async () => {
        try {
            const r = await axios.get(`${url}/api/planes/inactivos`, {
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

    const getPlanesID = async (id) => {
        try {
            const r = await axios.get(`${url}/api/planes/${id}`, {
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

    const postPlanes = async (datos) => {
        try {
            const r = await axios.post(`${url}/api/planes`, datos, {
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

    const putPlanes = async (id, datos) => {
        try {
            const r = await axios.put(`${url}/api/planes/${id}`, datos, {
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

    const putPlanesActivar = async (id) => {
        try {
            const r = await axios.put(`${url}/api/planes/activar/${id}`, null, {
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

    const putPlanesInactivar = async (id) => {
        try {
            const r = await axios.put(`${url}/api/planes/inactivar/${id}`, null, {
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
        getPlanes,
        getPlanesActivos,
        getPlanesInactivos,
        getPlanesID,
        postPlanes,
        putPlanes,
        putPlanesActivar,
        putPlanesInactivar
    };
},
{
    persist: true,
});
