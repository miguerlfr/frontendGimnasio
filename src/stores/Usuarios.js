import { defineStore } from "pinia";
import { ref } from "vue";
import axios from "axios";
import { notifyErrorRequest, notifySuccessRequest } from "../routes/routes.js";

const url = "https://backendgimnasio-ip8j.onrender.com"
// const url = "http://localhost:4505"

export const useStoreUsuarios = defineStore("Usuario", () => {
    let loading = ref(false)
    let token = ref("")
    let user = ref("")

    const getUsuarios = async () => {
        try {
            loading.value = true
            const r = await axios.get(`${url}/api/usuarios`, {
                headers: {
                    token: token.value
                }
            });
            notifySuccessRequest("Usuarios listados exitosamente.");
            return r;
        } catch (error) {
            console.error("Error al listar usuarios:", error.response.data);
            return error;
        } finally {
            loading.value = false
        }
    };

    const getUsuariosActivos = async () => {
        try {
            loading.value = true
            const r = await axios.get(`${url}/api/usuarios/activos`, {
                headers: {
                    token: token.value
                }
            });
            notifySuccessRequest("Usuarios activos listados exitosamente.");
            return r;
        } catch (error) {
            console.error("Error al listar usuarios activos:", error.response.data);
            return error;
        } finally {
            loading.value = false
        }
    };

    const getUsuariosInactivos = async () => {
        try {
            loading.value = true
            const r = await axios.get(`${url}/api/usuarios/inactivos`, {
                headers: {
                    token: token.value
                }
            });
            notifySuccessRequest("Usuarios inactivos listados exitosamente.");
            return r;
        } catch (error) {
            console.error("Error al listar usuarios inactivos:", error.response.data);
            return error;
        } finally {
            loading.value = false
        }
    };

    const getUsuariosID = async (id) => {
        try {
            loading.value = true
            const r = await axios.get(`${url}/api/usuarios/${id}`, {
                headers: {
                    token: token.value
                }
            });
            notifySuccessRequest("Usuario encontrado exitosamente.");
            return r;
        } catch (error) {
            console.error("Error al buscar usuario:", error.response.data);
            return error;
        } finally {
            loading.value = false
        }
    };

    const login = async (email, password) => {
        try {
            loading.value = true
            const r = await axios.post(`${url}/api/usuarios/login`, { email, password });
            token.value = r.data.token;
            user.value = r.data.usuario;
            console.log("Token:", token.value);
            notifySuccessRequest("Registro exitoso.");
            return r;
        } catch (error) {
            notifyErrorRequest(error.response.data.msg);
            console.error("Error al Logearse:", error.response.data.msg);
            console.error("Email:", email);
            console.error("Contraseña:", password);
            return error;
        } finally {
            loading.value = false
        }
    };

    const logout = () => {
        user.value = "";
        token.value = "";
    };

    const postUsuarios = async (datos) => {
        try {
            loading.value = true
            const r = await axios.post(`${url}/api/usuarios`, datos, {
                headers: {
                    token: token.value
                }
            });
            notifySuccessRequest("Usuario agregado exitosamente.");
            return r;
        } catch (error) {
            notifyErrorRequest(error.response.data.errors[0].msg);
            console.error("Error al agregar usuario:", error.response.data.errors[0].msg);
            return error;
        } finally {
            loading.value = false
        }
    };

    const putUsuarios = async (id, datos) => {
        try {
            loading.value = true
            const r = await axios.put(`${url}/api/usuarios/${id}`, datos, {
                headers: {
                    token: token.value
                }
            });
            notifySuccessRequest("Usuario editado exitosamente.");
            return r;
        } catch (error) {
            notifyErrorRequest(error.response.data.errors[0].msg);
            console.error("Error al editar usuario:", error.response.data.errors[0].msg);
            return error;
        } finally {
            loading.value = false
        }
    };

    const putUsuariosActivar = async (id) => {
        try {
            loading.value = true
            const r = await axios.put(`${url}/api/usuarios/activar/${id}`, {
                headers: {
                    token: token.value
                }
            });
            notifySuccessRequest("Usuario activado exitosamente.");
            return r;
        } catch (error) {
            notifyErrorRequest(error.response.data);
            console.error("Error al activar usuario:", error.response.data);
            return error;
        } finally {
            loading.value = false
        }
    };

    const putUsuariosInactivar = async (id) => {
        try {
            loading.value = true
            const r = await axios.put(`${url}/api/usuarios/inactivar/${id}`, {
                headers: {
                    token: token.value
                }
            });
            notifySuccessRequest("Usuario inactivado exitosamente.");
            return r;
        } catch (error) {
            notifyErrorRequest(error.response.data);
            console.error("Error al inactivar usuario:", error.response.data);
            return error;
        } finally {
            loading.value = false
        }
    };

    const recuperarContrasena = async (email) => {
        try {
            loading.value = true;
            const r = await axios.put(`${url}/api/usuarios/restablecer/contrasena`, {email});
            console.log("Respuesta del servidor:", r.data.msg); // Añadir esta línea
            return r;
        } catch (error) {
            console.error("Error al restablecer contraseña", error);
            return error;
        } finally {
            loading.value = false;
        }
    };

    const putUsuariosPassword = async (data) => {
        try {
            loading.value = true;
            const r = await axios.put(`${url}/api/usuarios/cambiar/contrasena`, data);
            console.log("Respuesta del servidor:", r.data.msg); // Añadir esta línea
            return r;
        } catch (error) {
            console.error("Error al restablecer contraseña", error);
            return error;
        } finally {
            loading.value = false;
        }
    };

    return {
        getUsuarios,
        getUsuariosActivos,
        getUsuariosInactivos,
        getUsuariosID,
        login,
        postUsuarios,
        putUsuarios,
        putUsuariosActivar,
        putUsuariosInactivar,
        recuperarContrasena,
        putUsuariosPassword,
        token,
        user,
        logout,
        loading
    };
},
    {
        persist: true,
    }
);