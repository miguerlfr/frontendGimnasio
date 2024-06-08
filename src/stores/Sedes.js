import { defineStore } from "pinia";
import axios from "axios";
import { useStoreUsuarios } from "../stores/Usuarios.js";

const url = "https://backendgimnasio-ip8j.onrender.com"

export const useStoreSedes = defineStore("Sede", () => {
    const useUsuario = useStoreUsuarios();
    
    const getSedes = async () => {
        try {
            const r = await axios.get(`${url}/api/sedes`, {
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

    const getSedesActivas = async () => {
        try {
            const r = await axios.get(`${url}/api/sedes/activos`, {
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

    const getSedesInactivas = async () => {
        try {
            const r = await axios.get(`${url}/api/sedes/inactivos`, {
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

    const getSedesID = async (id) => {
        try {
            const r = await axios.get(`${url}/api/sedes/${id}`, {
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

    const postSedes = async (datos) => {
        try {
            const r = await axios.post(`${url}/api/sedes`, datos, {
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

    const putSedes = async (id, datos) => {
        try {
            const r = await axios.put(`${url}/api/sedes/${id}`, datos, {
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

    const putSedesActivar = async (id) => {
        try {
            const r = await axios.put(`${url}/api/sedes/activar/${id}`, null, {
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

    const putSedesInactivar = async (id) => {
        try {
            const r = await axios.put(`${url}/api/sedes/inactivar/${id}`, null, {
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
        getSedes,
        getSedesActivas,
        getSedesInactivas,
        getSedesID,
        postSedes,
        putSedes,
        putSedesActivar,
        putSedesInactivar
    };
},
{
    persist: true,
});
