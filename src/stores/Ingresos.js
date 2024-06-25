import { defineStore } from "pinia";
import axios from "axios";
import { useStoreUsuarios } from "../stores/Usuarios.js";
import { ref } from "vue"
import { notifyErrorRequest } from "../routes/routes.js";
import { notifySuccessRequest } from "../routes/routes.js";

const url = "https://backendgimnasio-ip8j.onrender.com"
// const url = "http://localhost:4505"

export const useStoreIngresos = defineStore("Ingreso", () => {
    let loading=ref(false)
    const useUsuario = useStoreUsuarios();

    const getIngresos = async () => {
        try {
            loading.value=true
            const r = await axios.get(`${url}/api/ingresos`, {
                headers: {
                    token: useUsuario.token
                }
            });
            return r;
        } catch (error) {
            loading.value=true
            console.log("Error al listar ingresos:", error);
            return error
        } finally{
            loading.value=false
        }
    };

    const getIngresosID = async (id) => {
        try {
            loading.value=true
            const r = await axios.get(`${url}/api/ingresos/${id}`, {
                headers: {
                    token: useUsuario.token
                }
            });
            return r;
        } catch (error) {
            loading.value=true
            console.log("Error al listar el ingreso por su ID:", error);
            return error
        } finally{
            loading.value=false
        }
    };

    const postIngresos = async (datos) => {
        try {
            loading.value=true
            const r = await axios.post(`${url}/api/ingresos/`, datos, {
                    headers: {
                        token: useUsuario.token
                    }
                });
                return r;
            } catch (error) {
            loading.value=true
                console.log("Error al agregar el ingreso:", error);
                return error
            } finally{
                loading.value=false
            }
        };

    const putIngresos = async (id, datos) => {
        try {
            loading.value=true
            const r = await axios.put(`${url}/api/ingresos/${id}`, datos, {
                    headers: {
                        token: useUsuario.token
                    }
                });
                return r;
            } catch (error) {
            loading.value=true
                console.log("Error al modificar el ingreso:", error);
                return error
            } finally{
                loading.value=false
            }
        };

    return {
        getIngresos,
        getIngresosID,
        postIngresos,
        putIngresos,
        loading
    };
},
{
    persist: true,
}
);
