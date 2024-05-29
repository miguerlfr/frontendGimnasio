import { defineStore } from "pinia";
import axios from "axios";
import { useStoreUsuarios } from "../stores/Usuarios.js";

export const useStoreIngresos = defineStore("Ingreso", () => {
    const useUsuario = useStoreUsuarios();

    const getIngresos = async () => {
        try {
            const r = await axios.get("http://localhost:4505/api/ingresos", {
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
            const r = await axios.get(`http://localhost:4505/api/ingresos/${id}`, {
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
            const r = await axios.post(`http://localhost:4505/api/ingresos/`, datos, {
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
            const r = await axios.put(`http://localhost:4505/api/ingresos/${id}`, datos, {
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
