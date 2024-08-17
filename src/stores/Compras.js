import { defineStore } from "pinia";
import { ref } from "vue";
import { useStoreUsuarios } from "../stores/Usuarios.js";
import axios from "axios";
import { notifyErrorRequest, notifySuccessRequest } from "../routes/routes.js";

const url = "https://backendgimnasio-ip8j.onrender.com"
// const url = "http://localhost:4505";

export const useStoreCompras = defineStore(
	"Compra",
	() => {
		let loading = ref(false);
		const useUsuario = useStoreUsuarios();

		const getCompras = async () => {
			try {
				loading.value = true;
				const r = await axios.get(`${url}/api/compras`, {
					headers: {
						token: useUsuario.token,
					},
				});
				notifySuccessRequest("Compras listadas exitosamente.");
				return r;
			} catch (error) {
				console.error("Error al listar compras:", error.response.data);
				return error;
			} finally {
				loading.value = false;
			}
		};

		const getComprasID = async (id) => {
			try {
				loading.value = true;
				const r = await axios.get(`${url}/api/compras/${id}`, {
					headers: {
						token: useUsuario.token,
					},
				});
				notifySuccessRequest("Compras encontrada exitosamente.");
				return r;
			} catch (error) {
				console.error("Error al buscar compra:", error.response.data);
				return error;
			} finally {
				loading.value = false;
			}
		};

		const getComprasFechas = async (fechainicio, fechafin) => {
			try {
				loading.value = true;
				const r = await axios.get(`${url}/api/compras/fechas/${fechainicio}/${fechafin}`, {
					headers: {
						token: useUsuario.token,
					},
				});
				notifySuccessRequest("Compras listadas por fechas exitosamente.");
				return r;
			} catch (error) {
				console.error("Error al listar compras por fechas:", error);
				return error;
			} finally {
				loading.value = false;
			}
		};

		const postCompras = async (datos) => {
			try {
				loading.value = true;
				const r = await axios.post(`${url}/api/compras`, datos, {
					headers: {
						token: useUsuario.token,
					},
				});
				notifySuccessRequest("Compra agregada exitosamente.");
				return r;
			} catch (error) {
				notifyErrorRequest(error.response.data.errors[0].msg);
				console.error("Error al agregar compra:", error.response.data.errors[0].msg);
				return error;
			} finally {
				loading.value = false;
			}
		};

		const putCompras = async (id, datos) => {
			try {
				loading.value = true;
				const r = await axios.put(`${url}/api/compras/${id}`, datos, {
					headers: {
						token: useUsuario.token,
					},
				});
				notifySuccessRequest("Compra editada exitosamente.");
				return r;
			} catch (error) {
				loading.value = false;
				notifyErrorRequest(error.response.data.errors[0].msg);
				console.error("Error al editar compra:", error.response.data.errors[0].msg);
				return error;
			} finally {
				loading.value = false;
			}
		};

		return {
			getCompras,
			getComprasID,
			getComprasFechas,
			postCompras,
			putCompras,
			loading,
		};
	},
	{
		persist: true,
	}
);
