import { defineStore } from "pinia";
import axios from "axios";
import { useStoreUsuarios } from "../stores/Usuarios.js";

const url = "https://backendgimnasio-ip8j.onrender.com"

export const useStoreMaquinas = defineStore("Maquina", () => {
    const useUsuario = useStoreUsuarios();

    const getMaquinas = async () => {
        try {
            const r = await axios.get(`${url}/api/maquinas`, {
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
            const r = await axios.get(`${url}/api/maquinas/activos`, {
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
            const r = await axios.get(`${url}/api/maquinas/inactivos`, {
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
            const r = await axios.get(`${url}/api/maquinas/${id}`, {
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
            const r = await axios.post(`${url}/api/maquinas`, datos, {
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
            const r = await axios.put(`${url}/api/maquinas/${id}`, datos, {
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
            const r = await axios.put(`${url}/api/maquinas/activar/${id}`, {
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
            const r = await axios.put(`${url}/api/maquinas/inactivar/${id}`, {
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
