import { defineStore } from "pinia";
import { ref } from "vue";
import { useStoreUsuarios } from "../stores/Usuarios.js";
import axios from "axios";
import { notifyErrorRequest, notifySuccessRequest } from "../routes/routes.js";

const url = "https://backendgimnasio-ip8j.onrender.com";
// const url = "http://localhost:4505"

export const useStoreClientes = defineStore(
	"Cliente",
	() => {
		let loading = ref(false);
		const useUsuario = useStoreUsuarios();

		const getClientes = async () => {
			try {
				loading.value = true;
				const r = await axios.get(`${url}/api/clientes`, {
					headers: {
						token: useUsuario.token,
					},
				});
				notifySuccessRequest("Clientes listados exitosamente.");
				return r;
			} catch (error) {
				console.error("Error al listar clientes:", error.response.data);
				return error;
			} finally {
				loading.value = false;
			}
		};

		const getClientesActivos = async () => {
			try {
				loading.value = true;
				const r = await axios.get(`${url}/api/clientes/activos`, {
					headers: {
						token: useUsuario.token,
					},
				});
				notifySuccessRequest("Clientes activos listados exitosamente.");
				return r;
			} catch (error) {
				console.error("Error al listar clientes activos:", error.response.data);
				return error;
			} finally {
				loading.value = false;
			}
		};

		const getClientesInactivos = async () => {
			try {
				loading.value = true;
				const r = await axios.get(`${url}/api/clientes/inactivos`, {
					headers: {
						token: useUsuario.token,
					},
				});
				notifySuccessRequest("Clientes inactivos listados exitosamente.");
				return r;
			} catch (error) {
				console.error("Error al listar clientes inactivos:", error.response.data);
				return error;
			} finally {
				loading.value = false;
			}
		};

		const getClientesID = async (id) => {
			try {
				loading.value = true;
				const r = await axios.get(`${url}/api/clientes/${id}`, {
					headers: {
						token: useUsuario.token,
					},
				});
				notifySuccessRequest("Cliente encontrado exitosamente.");
				return r;
			} catch (error) {
				console.error("Error al buscar cliente:", error.response.data);
				return error;
			} finally {
				loading.value = false;
			}
		};

		const getClientesSeguimientoID = async (id) => {
			try {
				loading.value = true;
				const r = await axios.get(`${url}/api/clientes/seguimiento/${id}`, {
					headers: {
						token: useUsuario.token,
					},
				});
				notifySuccessRequest("Clientes listados por su fecha de seguimiento exitosamente.");
				return r;
			} catch (error) {
				console.error("Error al listar clientes por su fecha de seguimiento:", error.response.data);
				return error;
			} finally {
				loading.value = false;
			}
		};

		const getClientesPlan = async (plan) => {
			try {
				loading.value = true;
				const r = await axios.get(`${url}/api/clientes/plan/${plan}`, {
					headers: {
						token: useUsuario.token,
					},
				});
				notifySuccessRequest("Clientes listados por plan exitosamente.");
				return r;
			} catch (error) {
				console.error("Error al listar clientes por su plan:", error.response.data);
				return error;
			} finally {
				loading.value = false;
			}
		};

		const getClientesCumpleaños = async (fecha) => {
			try {
				loading.value = true;
				const r = await axios.get(`${url}/api/clientes/cumpleanos/${fecha}`, {
					headers: {
						token: useUsuario.token,
					},
				});
				notifySuccessRequest("Clientes listados por su fecha de cumpleaños exitosamente.");
				return r;
			} catch (error) {
				console.error("Error al listar clientes por su fecha de cumpleaños:", error.response.data);
				return error;
			} finally {
				loading.value = false;
			}
		};

		const getClientesIngresaron = async (fecha) => {
			try {
				loading.value = true;
				const r = await axios.get(`${url}/api/clientes/ingresaron/${fecha}`, {
					headers: {
						token: useUsuario.token,
					},
				});
				notifySuccessRequest("Clientes listados por su fecha de ingreso exitosamente.");
				return r;
			} catch (error) {
				console.error("Error al listar clientes por su fecha de ingreso:", error.response.data);
				return error;
			} finally {
				loading.value = false;
			}
		};

		const postClientes = async (datos) => {
			try {
				loading.value = true;
				const r = await axios.post(`${url}/api/clientes`, datos, {
					headers: {
						token: useUsuario.token,
					},
				});
				notifySuccessRequest("Cliente agregado exitosamente.");
				return r;
			} catch (error) {
				notifyErrorRequest(error.response.data.errors[0].msg);
				console.error("Error al agregar cliente:", error.response.data.errors[0].msg);
				return error;
			} finally {
				loading.value = false;
			}
		};

		const putClientes = async (id, datos) => {
			try {
				loading.value = true;
				const r = await axios.put(`${url}/api/clientes/${id}`, datos, {
					headers: {
						token: useUsuario.token,
					},
				});
				notifySuccessRequest("Cliente editado exitosamente.");
				return r;
			} catch (error) {
				notifyErrorRequest(error.response.data.errors[0].msg);
				console.error("Error al editar cliente:", error.response.data.errors[0].msg);
				return error;
			} finally {
				loading.value = false;
			}
		};

		const putClientesActivar = async (id) => {
			try {
				loading.value = true;
				const r = await axios.put(
					`${url}/api/clientes/activar/${id}`,
					{},
					{
						headers: {
							token: useUsuario.token,
						},
					}
				);
				notifySuccessRequest("Cliente activado exitosamente.");
				return r;
			} catch (error) {
				notifyErrorRequest(error.response.data);
				console.error("Error al activar el cliente:", error.response.data);
				return error;
			} finally {
				loading.value = false;
			}
		};

		const putClientesInactivar = async (id) => {
			try {
				loading.value = true;
				const r = await axios.put(
					`${url}/api/clientes/inactivar/${id}`,
					{},
					{
						headers: {
							token: useUsuario.token,
						},
					}
				);
				notifySuccessRequest("Cliente inactivado exitosamente.");
				return r;
			} catch (error) {
				notifyErrorRequest(error.response.data);
				console.error("Error al inactivar el cliente:", error.response.data);
				return error;
			} finally {
				loading.value = false;
			}
		};

		return {
			getClientes,
			getClientesActivos,
			getClientesInactivos,
			getClientesID,
			getClientesSeguimientoID,
			getClientesPlan,
			getClientesCumpleaños,
			getClientesIngresaron,
			postClientes,
			putClientes,
			putClientesActivar,
			putClientesInactivar,
			loading,
		};
	},
	{
		persist: true,
	}
);
