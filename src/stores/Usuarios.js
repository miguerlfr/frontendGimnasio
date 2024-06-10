import { defineStore } from "pinia";
import axios from "axios";
import { Notify } from "quasar";
import { ref } from "vue";

const url = "https://backendgimnasio-ip8j.onrender.com"

export const useStoreUsuarios = defineStore("Usuario", () => {
    let token = ref("")
    let user = ref("")

    const getUsuarios = async () => {
        try {
            const r = await axios.get(`${url}/api/usuarios`, {
                headers: {
                    token: token.value
                }
            });
			return r;
		} catch (error) {
			console.log(error);
			return error;
		}
	};

    const getUsuariosActivos = async () => {
        try {
            const r = await axios.get(`${url}/api/usuarios/activos`, {
                headers: {
                    token: token.value
                }
            });
            return r;
        } catch (error) {
            console.log(error);
            return error;
        }
    };

    const getUsuariosInactivos = async () => {
        try {
            const r = await axios.get(`${url}/api/usuarios/inactivos`, {
                headers: {
                    token: token.value
                }
            });
            return r;
        } catch (error) {
            console.log(error);
            return error;
        }
    };

    const getUsuariosID = async (id) => {
        try {
            const r = await axios.get(`${url}/api/usuarios/${id}`, {
                headers: {
                    token: token.value
                }
            });
			return r;
		} catch (error) {
			console.log(error);
			return error;
		}
	};

    const login = async (email, password) => {
        try {
            const r = await axios.post(`${url}/api/usuarios/login`, {email, password});
            token.value = r.data.token
            user.value = r.data.usuario
            console.log(token.value);
            Notify.create({
                type: "positive",
                message: "Registro exitoso",
            });
			return r;
		} catch (error) {
			console.log(error.response.data.msg);
            console.log("Email:", email);
            console.log("Contraseña:", password);
            Notify.create({
                type: "negative",
                message: error.response.data.msg,
            });
			return error;
		}
	};

    const postUsuarios = async (datos) => {
        try {
            const r = await axios.post(`${url}/api/usuarios`, datos, {
                headers: {
                    token: token.value
                }
            });
            Notify.create({
                type: "positive",
                message: "Registro exitoso",
            });
            return r;
        } catch (error) {
            console.log("Error en postPagos:", error);
            Notify.create({
                type: "negative",
                message: error.response.data.msg,
            });
            return error;
        }
    };

    const putUsuarios = async (id, datos) => {
        try {
            const r = await axios.put(`${url}/api/usuarios/${id}`, datos, {
                headers: {
                    token: token.value
                }
            });
            Notify.create({
                type: "positive",
                message: "Registro exitoso",
            });
            console.log(r);
            return r;
        } catch (error) {
            console.log("Error en putUsuarios:", error.response.data);
            Notify.create({
                type: "negative",
                message: error.response.data.msg,
            });
            return error;
        }
    };

    const putUsuariosActivar = async (id) => {
        try {
            const r = await axios.put(`${url}/api/usuarios/activar/${id}`, null, {
                headers: {
                    token: token.value
                }
            });
            Notify.create({
                type: "positive",
                message: "Cambio de estado exitoso",
            });
            return r;
        } catch (error) {
            console.log(error);
            return error;
        }
    };

    const putUsuariosInactivar = async (id) => {
        try {
            const r = await axios.put(`${url}/api/usuarios/inactivar/${id}`, null, {
                headers: {
                    token: token.value
                }
            });
            Notify.create({
                type: "positive",
                message: "Cambio de estado exitoso",
            });
            return r;
        } catch (error) {
            console.log(error);
            return error;
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
        user
    };
},
{
    persist: true,
}
);