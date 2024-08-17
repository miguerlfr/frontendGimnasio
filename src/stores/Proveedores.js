import { defineStore } from "pinia";
import { ref } from "vue";
import { useStoreUsuarios } from "../stores/Usuarios.js";
import axios from "axios";
import { notifyErrorRequest, notifySuccessRequest } from "../routes/routes.js";

const url = "https://backendgimnasio-ip8j.onrender.com"
// const url = "http://localhost:4505";

export const useStoreProveedores = defineStore(
	"Proveedore",
	() => {
		let loading = ref(false);
		const useUsuario = useStoreUsuarios();

		const getProveedores = async () => {
			try {
				loading.value = true;
				const r = await axios.get(`${url}/api/proveedores`, {
					headers: {
						token: useUsuario.token,
					},
				});
				notifySuccessRequest("Proveedores listadas exitosamente.");
				return r;
			} catch (error) {
				console.error("Error al listar proveedores:", error.response.data);
				return error;
			} finally {
				loading.value = false;
			}
		};

		const getProveedoresActivos = async () => {
			try {
				loading.value = true;
				const r = await axios.get(`${url}/api/proveedores/activos`, {
					headers: {
						token: useUsuario.token,
					},
				});
				notifySuccessRequest("Proveedores activos listados exitosamente.");
				return r;
			} catch (error) {
				console.error("Error al listar proveedores activos:", error.response.data);
				return error;
			} finally {
				loading.value = false;
			}
		};

		const getProveedoresInactivos = async () => {
			try {
				loading.value = true;
				const r = await axios.get(`${url}/api/proveedores/inactivos`, {
					headers: {
						token: useUsuario.token,
					},
				});
				notifySuccessRequest("Proveedores inactivos listados exitosamente.");
				return r;
			} catch (error) {
				console.error("Error al listar proveedores inactivos:", error.response.data);
				return error;
			} finally {
				loading.value = false;
			}
		};

		const getProveedoresID = async (id) => {
			try {
				loading.value = true;
				const r = await axios.get(`${url}/api/proveedores/${id}`, {
					headers: {
						token: useUsuario.token,
					},
				});
				notifySuccessRequest("Proveedores encontrada exitosamente.");
				return r;
			} catch (error) {
				console.error("Error al buscar proveedor:", error.response.data);
				return error;
			} finally {
				loading.value = false;
			}
		};

		const postProveedores = async (datos) => {
			try {
				loading.value = true;
				const r = await axios.post(`${url}/api/proveedores`, datos, {
					headers: {
						token: useUsuario.token,
					},
				});
				notifySuccessRequest("Proveedor agregada exitosamente.");
				return r;
			} catch (error) {
				notifyErrorRequest(error.response.data.errors[0].msg);
				console.error("Error al agregar proveedor:", error.response.data.errors[0].msg);
				return error;
			} finally {
				loading.value = false;
			}
		};

		const putProveedores = async (id, datos) => {
			try {
				loading.value = true;
				const r = await axios.put(`${url}/api/proveedores/${id}`, datos, {
					headers: {
						token: useUsuario.token,
					},
				});
				notifySuccessRequest("Proveedor editada exitosamente.");
				return r;
			} catch (error) {
				loading.value = false;
				notifyErrorRequest(error.response.data.errors[0].msg);
				console.error("Error al editar proveedor:", error.response.data.errors[0].msg);
				return error;
			} finally {
				loading.value = false;
			}
		};

		const putProveedoresActivar = async (id) => {
			try {
				loading.value = true;
				const r = await axios.put(
					`${url}/api/proveedores/activar/${id}`,
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

		const putProveedoresInactivar = async (id) => {
			try {
				loading.value = true;
				const r = await axios.put(
					`${url}/api/proveedores/inactivar/${id}`,
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
			getProveedores,
			getProveedoresActivos,
			getProveedoresInactivos,
			getProveedoresID,
			postProveedores,
			putProveedores,
			putProveedoresActivar,
			putProveedoresInactivar,
			loading,
		};
	},
	{
		persist: true,
	}
);
