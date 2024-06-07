import { defineStore } from "pinia";
import axios from "axios";
import { ref } from "vue";

export const useStoreUsuarios = defineStore("Usuario", () => {
    let token = ref("")
    let user = ref("")

    const getUsuarios = async () => {
        try {
            const r = await axios.get("http://localhost:4505/api/usuarios", {
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
            const r = await axios.get("http://localhost:4505/api/usuarios/activos", {
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
            const r = await axios.get("http://localhost:4505/api/usuarios/inactivos", {
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
            const r = await axios.get(`http://localhost:4505/api/usuarios/${id}`, {
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
            const r = await axios.post("http://localhost:4505/api/usuarios/login", {email, password});
            token.value = r.data.token
            user.value = r.data.usuario
            // console.log(token.value);
			return r;
		} catch (error) {
			console.log(error.response.data.msg);
            console.log(email);
			return error;
		}
	};

    const postUsuarios = async (datos) => {
        try {
            const r = await axios.post("http://localhost:4505/api/usuarios", datos, {
                headers: {
                    token: token.value
                }
            });
            return r;
        } catch (error) {
            console.log("Error en postPagos:", error);
            return error;
        }
    };

    const putUsuarios = async (id, datos) => {
        try {
            const r = await axios.put(`http://localhost:4505/api/usuarios/${id}`, datos, {
                headers: {
                    token: token.value
                }
            });
            console.log(r);
            return r;
        } catch (error) {
            console.log("Error en putUsuarios:", error.response.data);
            return error;
        }
    };

    const putUsuariosActivar = async (id) => {
        try {
            const r = await axios.put(`http://localhost:4505/api/usuarios/activar/${id}`, null, {
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

    const putUsuariosInactivar = async (id) => {
        try {
            const r = await axios.put(`http://localhost:4505/api/usuarios/inactivar/${id}`, null, {
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