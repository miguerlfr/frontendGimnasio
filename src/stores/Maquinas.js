import { defineStore } from "pinia";
import axios from "axios";
import { useStoreUsuarios } from "../stores/Usuarios.js";

export const useStoreMaquinas = defineStore("Maquina", () => {
    const useUsuario = useStoreUsuarios();

    const getMaquinas = async () => {
        try {
            const r = await axios.get("http://localhost:4505/api/maquinas", {
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

    const getMaquinasActivas = async () => {
        try {
            const r = await axios.get("http://localhost:4505/api/maquinas/activos", {
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

    const getMaquinasInactivas = async () => {
        try {
            const r = await axios.get("http://localhost:4505/api/maquinas/inactivos", {
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

    const getMaquinasID = async (id) => {
        try {
            const r = await axios.get(`http://localhost:4505/api/maquinas/${id}`, {
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

    const postMaquinas = async (datos) => {
        try {
            const r = await axios.post(`http://localhost:4505/api/maquinas`, datos, {
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

    const putMaquinas = async (id, datos) => {
        try {
            const r = await axios.put(`http://localhost:4505/api/maquinas/${id}`, datos, {
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

    const putMaquinasActivar = async (id) => {
        try {
            const r = await axios.put(`http://localhost:4505/api/maquinas/activar/${id}`, {
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

    const putMaquinasInactivar = async (id) => {
        try {
            const r = await axios.put(`http://localhost:4505/api/maquinas/inactivar/${id}`, {
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
        getMaquinas,
        getMaquinasActivas,
        getMaquinasInactivas,
        getMaquinasID,
        postMaquinas,
        putMaquinas,
        putMaquinasActivar,
        putMaquinasInactivar
    };
},
{
    persist: true,
});
