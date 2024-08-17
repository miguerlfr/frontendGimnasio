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
            console.error("Error al listar ingresos:", error.response.data);
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
            notifySuccessRequest("Ingreso encontrado exitosamente.")
            return r;
        } catch (error) {
            console.error("Error al buscar ingreso:", error.response.data);
            return error
        } finally {
            loading.value = false
        }
    };

    const getIngresosFechas = async (fechainicio, fechafin) => {
		try {
			loading.value = true
			const r = await axios.get(`${url}/api/ingresos/fechas/${fechainicio}/${fechafin}`, {
				headers: {
					token: useUsuario.token,
				},
			});
			notifySuccessRequest("Ingresos listadas por fechas exitosamente.");
			return r
		} catch (error) {
			console.error("Error al listar ingresos por fechas:", error);
			return error;
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
            return r;
        } catch (error) {
            notifyErrorRequest(error.response.data.errors[0].msg);
            console.error("Error al agregar ingreso:", error.response.data.errors[0].msg);
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
            notifyErrorRequest(error.response.data.errors[0].msg);
            console.error("Error al editar ingreso:", error.response.data.errors[0].msg);
            return error
        } finally {
            loading.value = false
        }
    };

    return {
        getIngresos,
        getIngresosID,
        getIngresosFechas,
        postIngresos,
        putIngresos,
        loading
    };
},
    {
        persist: true,
    }
);
