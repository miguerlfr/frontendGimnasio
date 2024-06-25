import { defineStore } from "pinia";
import axios from "axios";
import { useStoreUsuarios } from "../stores/Usuarios.js";
import { ref } from "vue"
import { notifyErrorRequest } from "../routes/routes.js";
import { notifySuccessRequest } from "../routes/routes.js";

const url = "http://localhost:4505"
// "https://backendgimnasio-ip8j.onrender.com"

export const useStoreProductos = defineStore("Producto", () => {
    let loading=ref(false)
    const useUsuario = useStoreUsuarios();
    
    const getProductos = async () => {
        try {
            loading.value=true
            const r = await axios.get(`${url}/api/productos`, {
                headers: {
                    token: useUsuario.token
                }
            });
            return r;
        } catch (error) {
            loading.value=true
            console.log("Error al listar los productos:", error);
            return error
        } finally{
            loading.value=false
        }
    };

    const getProductosTotal = async () => {
        try {
            loading.value=true
            const r = await axios.get(`${url}/api/productos/total`, {
                headers: {
                    token: useUsuario.token
                }
            });
            return r;
        } catch (error) {
            loading.value=true
            console.log("Error al listar el total de los productos:", error);
            return error;
        } finally{
            loading.value=false
        }
    };

    const getProductosID = async (id) => {
        try {
            loading.value=true
            const r = await axios.get(`${url}/api/productos/${id}`, {
                headers: {
                    token: useUsuario.token
                }
            });
            return r;
        } catch (error) {
            loading.value=true
            console.log("Error al listar productos por su ID:", error);
            return error;
        } finally{
            loading.value=false
        }
    };

    const postProductos = async (datos) => {
        try {
            loading.value=true
            const r = await axios.post(`${url}/api/productos`, datos, {
                headers: {
                    token: useUsuario.token
                }
            });
            return r;
        } catch (error) {
            loading.value=true
            console.log("Error al agregar el producto:", error);
            return error;
        } finally{
            loading.value=false
        }
    };

    const putProductos = async (id, datos) => {
        try {
            loading.value=true
            const r = await axios.put(`${url}/api/productos/${id}`, datos, {
                headers: {
                    token: useUsuario.token
                }
            });
            return r;
        } catch (error) {
            loading.value=true
            console.log("Error al modificar el producto:", error);
            return error;
        } finally{
            loading.value=false
        }
    };
    

    return {
        getProductos,
        getProductosTotal,
        getProductosID,
        postProductos,
        putProductos,
        loading
    };
},
{
    persist: true,
});
