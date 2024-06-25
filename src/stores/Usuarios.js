import { defineStore } from "pinia";
import axios from "axios";
import { ref } from "vue";
import { notifyErrorRequest } from "../routes/routes.js";
import { notifySuccessRequest } from "../routes/routes.js";

const url = "https://backendgimnasio-ip8j.onrender.com"
// const url = "http://localhost:4505"

export const useStoreUsuarios = defineStore("Usuario", () => {
    let loading=ref(false)
    let token = ref("")
    let user = ref("")

    const getUsuarios = async () => {
        try {
            loading.value=true
            const r = await axios.get(`${url}/api/usuarios`, {
                headers: {
                    token: token.value
                }
            });
            notifySuccessRequest("Usuarios listados exitosamente");
            return r;
        } catch (error) {
            loading.value=true
            console.log("Error al listar usuarios:", error);
            return error;
        } finally{
            loading.value=false
        }
    };

    const getUsuariosActivos = async () => {
        try {
            loading.value=true
            const r = await axios.get(`${url}/api/usuarios/activos`, {
                headers: {
                    token: token.value
                }
            });
            notifySuccessRequest("Usuarios activos listados exitosamente");
            return r;
        } catch (error) {
            loading.value=true
            console.log("Error al listar usuarios activos:", error);
            return error;
        } finally{
            loading.value=false
        }
    };

    const getUsuariosInactivos = async () => {
        try {
            loading.value=true
            const r = await axios.get(`${url}/api/usuarios/inactivos`, {
                headers: {
                    token: token.value
                }
            });
            notifySuccessRequest("Usuarios inactivos listados exitosamente");
            return r;
        } catch (error) {
            loading.value=true
            console.log("Error al listar usuarios inactivos:", error);
            return error;
        } finally{
            loading.value=false
        }
    };

    const getUsuariosID = async (id) => {
        try {
            loading.value=true
            const r = await axios.get(`${url}/api/usuarios/${id}`, {
                headers: {
                    token: token.value
                }
            });
            notifySuccessRequest("Usuario buscado exitosamente");
            return r;
        } catch (error) {
            loading.value=true
            console.log("Error al listar usuarios por su ID:", error);
            return error;
        } finally{
            loading.value=false
        }
    };

    const login = async (email, password) => {
        try {
            loading.value=true
            const r = await axios.post(`${url}/api/usuarios/login`, { email, password });
            token.value = r.data.token;
            user.value = r.data.usuario;
            console.log("Token:", token.value);
            notifySuccessRequest("Registro exitoso");
            return r;
        } catch (error) {
            loading.value=true
            notifyErrorRequest(error.response.data.msg);
            console.log("Error al Logearse:", error.response.data.msg);
            console.log("Email:", email);
            console.log("Contraseña:", password);
            return error;
        } finally{
            loading.value=false
        }
    };
    
    const logout = () => {
        user.value = "";
        token.value = "";
    };
    
    const postUsuarios = async (datos) => {
        try {
            loading.value=true
            const r = await axios.post(`${url}/api/usuarios`, datos, {
                headers: {
                    token: token.value
                }
            });
            notifySuccessRequest("Usuario Agregado exitosamente");
            return r;
        } catch (error) {
            loading.value=true
            notifyErrorRequest(error.response.data.msg);
            console.log("Error al agregar el usuario:", error);
            return error;
        } finally{
            loading.value=false
        }
    };
    
    const putUsuarios = async (id, datos) => {
        try {
            loading.value=true
            const r = await axios.put(`${url}/api/usuarios/${id}`, datos, {
                headers: {
                    token: token.value
                }
            });
            notifySuccessRequest("Usuario modificado exitosamente");
            console.log(r);
            return r;
        } catch (error) {
            loading.value=true
            notifyErrorRequest(error.response.data.msg);
            console.log("Error al modificar el usuario:", error.response.data);
            return error;
        } finally{
            loading.value=false
        }
    };
    
    const putUsuariosActivar = async (id) => {
        try {
            loading.value=true
            const r = await axios.put(`${url}/api/usuarios/activar/${id}`, null, {
                headers: {
                    token: token.value
                }
            });
            notifySuccessRequest("Usuario activado exitosamente");
            return r;
        } catch (error) {
            loading.value=true
            console.log("Error al activar el usuario:", error);
            return error;
        } finally{
            loading.value=false
        }
    };
    
    const putUsuariosInactivar = async (id) => {
        try {
            loading.value=true
            const r = await axios.put(`${url}/api/usuarios/inactivar/${id}`, null, {
                headers: {
                    token: token.value
                }
            });
            notifySuccessRequest("Usuario inactivado exitosamente");
            return r;
        } catch (error) {
            loading.value=true
            notifyErrorRequest(error.response.data.msg);
            console.log("Error al desactivar el usuario:", error);
            return error;
        } finally{
            loading.value=false
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