import { defineStore } from "pinia";
import axios from "axios";
import { useStoreUsuarios } from "../stores/Usuarios.js";

export const useStoreSedes = defineStore("Sede", () => {
    const useUsuario = useStoreUsuarios();
    
    const getSedes = async () => {
        try {
            const r = await axios.get("http://localhost:4505/api/sedes", {
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
            const r = await axios.get("http://localhost:4505/api/sedes/activos", {
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
            const r = await axios.get("http://localhost:4505/api/sedes/inactivos", {
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
            const r = await axios.get(`http://localhost:4505/api/sedes/${id}`, {
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
            const r = await axios.post("http://localhost:4505/api/sedes", datos, {
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
            const r = await axios.put(`http://localhost:4505/api/sedes/${id}`, datos, {
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
            const r = await axios.put(`http://localhost:4505/api/sedes/activar/${id}`, null, {
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
            const r = await axios.put(`http://localhost:4505/api/sedes/inactivar/${id}`, null, {
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
