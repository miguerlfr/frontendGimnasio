import { defineStore } from "pinia";
import axios from "axios";
import { useStoreUsuarios } from "../stores/Usuarios.js";

export const useStoreProductos = defineStore("Producto", () => {
    const useUsuario = useStoreUsuarios();
    
    const getProductos = async () => {
        try {
            const r = await axios.get("http://localhost:4505/api/productos", {
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

    const getProductosTotal = async () => {
        try {
            const r = await axios.get("http://localhost:4505/api/productos/total", {
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

    const getProductosID = async (id) => {
        try {
            const r = await axios.get(`http://localhost:4505/api/productos/${id}`, {
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

    const postProductos = async (datos) => {
        try {
            const r = await axios.post("http://localhost:4505/api/productos", datos, {
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

    const putProductos = async (id, datos) => {
        try {
            const r = await axios.put(`http://localhost:4505/api/productos/${id}`, datos, {
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
        getProductos,
        getProductosTotal,
        getProductosID,
        postProductos,
        putProductos
    };
},
{
    persist: true,
});
