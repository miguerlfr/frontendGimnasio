import { defineStore } from "pinia";
import axios from "axios";
import { useStoreUsuarios } from "../stores/Usuarios.js";

const url = "https://backendgimnasio-ip8j.onrender.com"

export const useStoreIngresos = defineStore("Ingreso", () => {
    const useUsuario = useStoreUsuarios();

    const getIngresos = async () => {
        try {
            const r = await axios.get(`${url}/api/ingresos`, {
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

    const getIngresosID = async (id) => {
        try {
            const r = await axios.get(`${url}/api/ingresos/${id}`, {
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

    const postIngresos = async (datos) => {
        try {
            const r = await axios.post(`${url}/api/ingresos/`, datos, {
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

    const putIngresos = async (id, datos) => {
        try {
            const r = await axios.put(`${url}/api/ingresos/${id}`, datos, {
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

    return {
        getIngresos,
        getIngresosID,
        postIngresos,
        putIngresos
    };
},
{
    persist: true,
}
);
