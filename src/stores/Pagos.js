import { defineStore } from "pinia";
import axios from "axios";
import { useStoreUsuarios } from "../stores/Usuarios.js";

export const useStorePagos = defineStore("Pago", () => {
    const useUsuario = useStoreUsuarios();

	const getPagos = async () => {
		try {
			const r = await axios.get(`http://localhost:4505/api/pagos`, {
				headers: {
					token: useUsuario.token,
				},
			});
			return r;
		} catch (error) {
			console.log(error);
			return error;
		}
	};

    const getPagosActivos = async () => {
        try {
            const r = await axios.get("http://localhost:4505/api/pagos/activos", {
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

    const getPagosInactivos = async () => {
        try {
            const r = await axios.get("http://localhost:4505/api/pagos/inactivos", {
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

    const getPagosID = async (id) => {
        try {
            const r = await axios.get(`http://localhost:4505/api/pagos/${id}`, {
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

    const getPagosFecha = async (fecha) => {
        try {
            const r = await axios.get(`http://localhost:4505/api/pagos/fecha/${fecha}`, {
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

    const getPagosPlan = async (plan) => {
        try {
            const r = await axios.get(`http://localhost:4505/api/pagos/pago/${plan}`, {
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

    const getPagosCliente = async (cliente) => {
        try {
            const r = await axios.get(`http://localhost:4505/api/pagos/pagoo/${cliente}`, {
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

    const postPagos = async (datos) => {
        try {
            const r = await axios.post(`http://localhost:4505/api/pagos`, datos, {
                headers: {
                    token: useUsuario.token
                }
            });
            return r;
        } catch (error) {
            console.log("Error en postPagos:", error.response.data);
            return error;
        }
    };

const putPagos = async (id, pagoEditado) => {
  try {
    const response = await axios.put(`http://localhost:4505/api/pagos/${id}`, pagoEditado);
    return response;
  } catch (error) {
    console.error("Error en putPagos:", error.response ? error.response.data : error.message);
    throw error;
  }
}


    const putPagosActivar = async (id) => {
        try {
            const r = await axios.put(`http://localhost:4505/api/pagos/activar/${id}`, null, {
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

    const putPagosInactivar = async (id) => {
        try {
            const r = await axios.put(`http://localhost:4505/api/pagos/inactivar/${id}`, null, {
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
        putPagosInactivar
    };
},
{
    persist: true,
});
