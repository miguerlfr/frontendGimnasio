import { defineStore } from "pinia";
import { ref } from "vue"
import { useStoreUsuarios } from "../stores/Usuarios.js";
import axios from "axios";
import { notifyErrorRequest, notifySuccessRequest } from "../routes/routes.js";

// const url = "https://backendgimnasio-ip8j.onrender.com"
const url = "http://localhost:4505"

export const useStorePagos = defineStore("Pago", () => {
    let loading = ref(false)
    const useUsuario = useStoreUsuarios();

    const getPagos = async () => {
        try {
            loading.value = true
            const r = await axios.get(`${url}/api/pagos`, {
                headers: {
                    token: useUsuario.token,
                },
            });
            notifySuccessRequest("Pagos listados exitosamente.");
            return r;
        } catch (error) {
            console.error("Error al listar pagos:", error.response.data);
            return error;
        } finally {
            loading.value = false
        }
    };

    const getPagosActivos = async () => {
        try {
            loading.value = true
            const r = await axios.get(`${url}/api/pagos/activos`, {
                headers: {
                    token: useUsuario.token
                }
            });
            notifySuccessRequest("Pagos activos listados exitosamente.");
            return r;
        } catch (error) {
            console.error("Error al listar pagos activos:", error.response.data);
            return error;
        } finally {
            loading.value = false
        }
    };

    const getPagosInactivos = async () => {
        try {
            loading.value = true
            const r = await axios.get(`${url}/api/pagos/inactivos`, {
                headers: {
                    token: useUsuario.token
                }
            });
            notifySuccessRequest("Pagos inactivos listados exitosamente.");
            return r;
        } catch (error) {
            console.error("Error al listar pagos inactivos:", error.response.data);
            return error;
        } finally {
            loading.value = false
        }
    };

    const getPagosID = async (id) => {
        try {
            loading.value = true
            const r = await axios.get(`${url}/api/pagos/${id}`, {
                headers: {
                    token: useUsuario.token
                }
            });
            notifySuccessRequest("Pago encontrado exitosamente.");
            return r;
        } catch (error) {
            console.error("Error al buscar pago:", error.response.data);
            return error;
        } finally {
            loading.value = false
        }
    };

    const getPagosFecha = async (fecha) => {
        try {
            loading.value = true
            const r = await axios.get(`${url}/api/pagos/fecha/${fecha}`, {
                headers: {
                    token: useUsuario.token
                }
            });
            notifySuccessRequest("Pagos listados por el nombre del cliente exitosamente.");
            return r;
        } catch (error) {
            console.error("Error al listar pagos por la fecha del pago:", error.response.data);
            return error;
        } finally {
            loading.value = false
        }
    };

    const getPagosPlan = async (plan) => {
        try {
            loading.value = true
            const r = await axios.get(`${url}/api/pagos/pago/${plan}`, {
                headers: {
                    token: useUsuario.token
                }
            });
            notifySuccessRequest("Pagos listados por el plan del cliente exitosamente.");
            return r;
        } catch (error) {
            console.error("Error al listar pagos por el plan del cliente:", error.response.data);
            return error;
        } finally {
            loading.value = false
        }
    };

    const getPagosCliente = async (cliente) => {
        try {
            loading.value = true
            const r = await axios.get(`${url}/api/pagos/pagoo/${cliente}`, {
                headers: {
                    token: useUsuario.token
                }
            });
            notifySuccessRequest("Pagos listados por el nombre del cliente exitosamente.");
            return r;
        } catch (error) {
            console.error("Error al listar el pago del cliente por su nombre:", error.response.data);
            return error;
        } finally {
            loading.value = false
        }
    };

    const postPagos = async (datos) => {
        try {
            loading.value = true
            const r = await axios.post(`${url}/api/pagos`, datos, {
                headers: {
                    token: useUsuario.token
                }
            });
            notifySuccessRequest("Pago agregado exitosamente.");
            return r;
        } catch (error) {
            notifyErrorRequest(error.response.data.errors[0].msg);
            console.error("Error al agregar pago:", error.response.data.errors[0].msg);
            return error;
        } finally {
            loading.value = false
        }
    };

    const putPagos = async (id, datos) => {
        try {
            loading.value = true
            const r = await axios.put(`${url}/api/pagos/${id}`, datos, {
                headers: {
                    token: useUsuario.token
                }
            });
            notifySuccessRequest("Pago editado exitosamente.");
            return r;
        } catch (error) {
            notifyErrorRequest(error.response.data.errors[0].msg);
            console.error("Error al editar pago:", error.response.data.errors[0].msg);
            throw error;
        } finally {
            loading.value = false
        }
    }

    const putPagosActivar = async (id) => {
        try {
            loading.value = true
            const r = await axios.put(`${url}/api/pagos/activar/${id}`, {}, {
                headers: {
                    token: useUsuario.token
                }
            });
            notifySuccessRequest("Pago activado exitosamente.");
            return r;
        } catch (error) {
            notifyErrorRequest(error.response.data);
            console.error("Error al activar pago:", error.response.data);
            return error;
        } finally {
            loading.value = false
        }
    };

    const putPagosInactivar = async (id) => {
        try {
            loading.value = true
            const r = await axios.put(`${url}/api/pagos/inactivar/${id}`, {}, {
                headers: {
                    token: useUsuario.token
                }
            });
            notifySuccessRequest("Pago inactivado exitosamente.");
            return r;
        } catch (error) {
            notifyErrorRequest(error.response.data);
            console.error("Error al inactivar pago:", error.response.data);
            return error;
        } finally {
            loading.value = false
        }
    };

    return {
        getPagos,
        getPagosActivos,
        getPagosInactivos,
        getPagosID,
        getPagosFecha,
        getPagosPlan,
        getPagosCliente,
        postPagos,
        putPagos,
        putPagosActivar,
        putPagosInactivar,
        loading
    };
},
    {
        persist: true,
    });
