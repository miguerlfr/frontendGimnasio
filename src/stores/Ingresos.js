import { defineStore } from "pinia";
import { ref } from "vue"
import { useStoreUsuarios } from "../stores/Usuarios.js";
import axios from "axios";
import { notifyErrorRequest, notifySuccessRequest } from "../routes/routes.js";

const url = "https://backendgimnasio-ip8j.onrender.com"
// const url = "http://localhost:4505"

export const useStoreIngresos = defineStore("Ingreso", () => {
    let loading = ref(false)
    const useUsuario = useStoreUsuarios();

    const getIngresos = async () => {
        try {
            loading.value = true
            const r = await axios.get(`${url}/api/ingresos`, {
                headers: {
                    token: useUsuario.token
                }
            });
            notifySuccessRequest("Ingresos listados exitosamente.");
            return r;
        } catch (error) {
            loading.value = true
            console.log("Error al listar ingresos:", error.response.data);
            return error
        } finally {
            loading.value = false
        }
    };

    const getIngresosID = async (id) => {
        try {
            loading.value = true
            const r = await axios.get(`${url}/api/ingresos/${id}`, {
                headers: {
                    token: useUsuario.token
                }
            });
            notifySuccessRequest("Ingreso encontrado.")
            return r;
        } catch (error) {
            loading.value = true
            console.log("Error al buscar el ingreso:", error.response.data);
            return error
        } finally {
            loading.value = false
        }
    };

    const postIngresos = async (datos) => {
        try {
            loading.value = true
            const r = await axios.post(`${url}/api/ingresos/`, datos, {
                headers: {
                    token: useUsuario.token
                }
            });
            notifySuccessRequest("Ingreso agregado exitosamente.");
            console.log("d", datos);
            return r;
        } catch (error) {
            loading.value = true
            notifyErrorRequest(error.response.data.errors[0].msg);
            console.log("Error al agregar el ingreso:", error.response.data.errors[0].msg);
            return error
        } finally {
            loading.value = false
        }
    };

    const putIngresos = async (id, datos) => {
        try {
            loading.value = true
            const r = await axios.put(`${url}/api/ingresos/${id}`, datos, {
                headers: {
                    token: useUsuario.token
                }
            });
            notifySuccessRequest("Ingreso editado exitosamente.");
            return r;
        } catch (error) {
            loading.value = true
            notifyErrorRequest(error.response.data.errors[0].msg);
            console.log("Error al editar el ingreso:", error.response.data.errors[0].msg);
            return error
        } finally {
            loading.value = false
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
