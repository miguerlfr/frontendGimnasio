import { defineStore } from "pinia";
import { ref } from "vue"
import { useStoreUsuarios } from "../stores/Usuarios.js";
import axios from "axios";
import { notifyErrorRequest, notifySuccessRequest } from "../routes/routes.js";

const url = "https://backendgimnasio-ip8j.onrender.com"
// const url = "http://localhost:4505"

export const useStoreProductos = defineStore("Producto", () => {
    let loading = ref(false)
    const useUsuario = useStoreUsuarios();

    const getProductos = async () => {
        try {
            loading.value = true
            const r = await axios.get(`${url}/api/productos`, {
                headers: {
                    token: useUsuario.token
                }
            });
            notifySuccessRequest("Productos listados exitosamente");
            return r;
        } catch (error) {
            console.error("Error al listar productos:", error.response.data);
            return error
        } finally {
            loading.value = false
        }
    };

    const getProductosActivos = async () => {
        try {
            loading.value = true
            const r = await axios.get(`${url}/api/productos/activos`, {
                headers: {
                    token: useUsuario.token
                }
            });
            notifySuccessRequest("Productos activos listados exitosamente");
            return r;
        } catch (error) {
            console.error("Error al listar productos activos:", error.response.data);
            return error
        } finally {
            loading.value = false
        }
    };

    const getProductosInactivos = async () => {
        try {
            loading.value = true
            const r = await axios.get(`${url}/api/productos/inactivos`, {
                headers: {
                    token: useUsuario.token
                }
            });
            notifySuccessRequest("Productos inactivos listados exitosamente");
            return r;
        } catch (error) {
            console.error("Error al listar productos inactivos:", error.response.data);
            return error
        } finally {
            loading.value = false
        }
    };

    const getProductosTotal = async () => {
        try {
            loading.value = true
            const r = await axios.get(`${url}/api/productos/total`, {
                headers: {
                    token: useUsuario.token
                }
            });
            notifySuccessRequest("Total de productos listado exitosamente");
            return r;
        } catch (error) {
            console.error("Error al listar el total de productos:", error.response.data);
            return error;
        } finally {
            loading.value = false
        }
    };

    const getProductosID = async (id) => {
        try {
            loading.value = true
            const r = await axios.get(`${url}/api/productos/${id}`, {
                headers: {
                    token: useUsuario.token
                }
            });
            notifySuccessRequest("Producto encontrado exitosamente.");
            return r;
        } catch (error) {
            console.error("Error al buscar producto:", error.response.data);
            return error;
        } finally {
            loading.value = false
        }
    };

    const postProductos = async (datos) => {
        try {
            loading.value = true
            const r = await axios.post(`${url}/api/productos`, datos, {
                headers: {
                    token: useUsuario.token
                }
            });
            notifySuccessRequest("Producto agregado exitosamente");
            return r;
        } catch (error) {
            notifyErrorRequest(error.response.data.errors[0].msg);
            console.error("Error al agregar producto:", error.response.data.errors[0].msg);
            return error;
        } finally {
            loading.value = false
        }
    };

    const putProductos = async (id, datos) => {
        try {
            loading.value = true
            const r = await axios.put(`${url}/api/productos/${id}`, datos, {
                headers: {
                    token: useUsuario.token
                }
            });
            notifySuccessRequest("Producto editado exitosamente");
            return r;
        } catch (error) {
            notifyErrorRequest(error.response.data.errors[0].msg);
            console.error("Error al editar producto:", error.response.data.errors[0].msg);
            return error;
        } finally {
            loading.value = false
        }
    };

    const putProductosActivar = async (id) => {
        try {
            loading.value = true
            const r = await axios.put(`${url}/api/productos/activar/${id}`, {
                headers: {
                    token: useUsuario.token
                }
            });
            notifySuccessRequest("Producto activado exitosamente");
            return r;
        } catch (error) {
            notifyErrorRequest(error.response.data);
            console.error("Error al activar producto:", error.response.data);
            return error
        } finally {
            loading.value = false
        }
    };

    const putProductosInactivar = async (id) => {
        try {
            loading.value = true
            const r = await axios.put(`${url}/api/productos/inactivar/${id}`, {
                headers: {
                    token: useUsuario.token
                }
            });
            notifySuccessRequest("Producto inactivado exitosamente");
            return r;
        } catch (error) {
            notifyErrorRequest(error.response.data);
            console.error("Error al inactivar producto:", error.response.data);
            return error
        } finally {
            loading.value = false
        }
    };


    return {
        getProductos,
        getProductosActivos,
        getProductosInactivos,
        getProductosTotal,
        getProductosID,
        postProductos,
        putProductos,
        putProductosActivar,
        putProductosInactivar,
        loading
    };
},
    {
        persist: true,
    });
