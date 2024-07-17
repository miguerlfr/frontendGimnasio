import { defineStore } from "pinia";
import { ref } from "vue"
import { useStoreUsuarios } from "../stores/Usuarios.js";
import axios from "axios";
import { notifyErrorRequest, notifySuccessRequest } from "../routes/routes.js";

const url = "https://backendgimnasio-ip8j.onrender.com"
// const url = "http://localhost:4505"

export const useStorePagos = defineStore("Pago", () => {
    let loading=ref(false)
    const useUsuario = useStoreUsuarios();

    const getPagos = async () => {
        try {
            loading.value=true
            const r = await axios.get(`${url}/api/pagos`, {
                headers: {
                    token: useUsuario.token,
                },
            });
            return r;
        } catch (error) {
            loading.value=true
            console.log("Error al listar los pagos:", error.response.data);
            return error;
        } finally{
            loading.value=false
        }
    };

    const getPagosActivos = async () => {
        try {
            loading.value=true
            const r = await axios.get(`${url}/api/pagos/activos`, {
                headers: {
                    token: useUsuario.token
                }
            });
            return r;
        } catch (error) {
            loading.value=true
            console.log("Error al listar pagos activos:", error.response.data);
            return error;
        } finally{
            loading.value=false
        }
    };

    const getPagosInactivos = async () => {
        try {
            loading.value=true
            const r = await axios.get(`${url}/api/pagos/inactivos`, {
                headers: {
                    token: useUsuario.token
                }
            });
            return r;
        } catch (error) {
            loading.value=true
            console.log("Error al listar pagos inactivos:", error.response.data);
            return error;
        } finally{
            loading.value=false
        }
    };

    const getPagosID = async (id) => {
        try {
            loading.value=true
            const r = await axios.get(`${url}/api/pagos/${id}`, {
                headers: {
                    token: useUsuario.token
                }
            });
            return r;
        } catch (error) {
            loading.value=true
            console.log("Error al listar el pago por su ID:", error.response.data);
            return error;
        } finally{
            loading.value=false
        }
    };

    const getPagosFecha = async (fecha) => {
        try {
            loading.value=true
            const r = await axios.get(`${url}/api/pagos/fecha/${fecha}`, {
                headers: {
                    token: useUsuario.token
                }
            });
            return r;
        } catch (error) {
            loading.value=true
            console.log("Error al listar pagos por la fecha del pago:", error.response.data);
            return error;
        } finally{
            loading.value=false
        }
    };

    const getPagosPlan = async (plan) => {
        try {
            loading.value=true
            const r = await axios.get(`${url}/api/pagos/pago/${plan}`, {
                headers: {
                    token: useUsuario.token
                }
            });
            return r;
        } catch (error) {
            loading.value=true
            console.log("Error al listar los pagos por el plan del cliente:", error.response.data);
            return error;
        } finally{
            loading.value=false
        }
    };

    const getPagosCliente = async (cliente) => {
        try {
            loading.value=true
            const r = await axios.get(`${url}/api/pagos/pagoo/${cliente}`, {
                headers: {
                    token: useUsuario.token
                }
            });
            return r;
        } catch (error) {
            loading.value=true
            console.log("Error al listar el pago del cliente por su nombre:", error.response.data);
            return error;
        } finally{
            loading.value=false
        }
    };

    const postPagos = async (datos) => {
        try {
            loading.value=true
            const r = await axios.post(`${url}/api/pagos`, datos, {
                headers: {
                    token: useUsuario.token
                }
            });
            return r;
        } catch (error) {
            loading.value=true
            console.log("Error al agregar el pago:", error.response.data.errors);
            return error;
        } finally{
            loading.value=false
        }
    };

    const putPagos = async (id, pagoEditado) => {
        try {
            loading.value=true
            const response = await axios.put(`${url}/api/pagos/${id}`, pagoEditado);
            return response;
        } catch (error) {
            loading.value=true
            console.error("Error al modificar el pago:", error.response.data.errors);
            throw error;
        } finally{
            loading.value=false
        }
    }

    const putPagosActivar = async (id) => {
        try {
            loading.value=true
            const r = await axios.put(`${url}/api/pagos/activar/${id}`, null, {
                headers: {
                    token: useUsuario.token
                }
            });
            return r;
        } catch (error) {
            loading.value=true
            console.log("Error al activar el pago:", error.response.data);
            return error;
        } finally{
            loading.value=false
        }
    };

    const putPagosInactivar = async (id) => {
        try {
            loading.value=true
            const r = await axios.put(`${url}/api/pagos/inactivar/${id}`, null, {
                headers: {
                    token: useUsuario.token
                }
            });
            return r;
        } catch (error) {
            loading.value=true
            console.log("Error al inactivar el pago:", error.response.data);
            return error;
        } finally{
            loading.value=false
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
