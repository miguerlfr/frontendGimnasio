import { defineStore } from "pinia";
import { ref } from "vue"
import { useStoreUsuarios } from "../stores/Usuarios.js";
import axios from "axios";
import { notifyErrorRequest, notifySuccessRequest } from "../routes/routes.js";

// const url = "https://backendgimnasio-ip8j.onrender.com"
const url = "http://localhost:4505"

export const useStoreVentas = defineStore("Venta", () => {
	let loading = ref(false)
	const useUsuario = useStoreUsuarios();

	const getVentas = async () => {
		try {
			loading.value = true
			const r = await axios.get(`${url}/api/ventas`, {
				headers: {
					token: useUsuario.token,
				},
			});
			notifySuccessRequest("Ventas listadas exitosamente.");
			return r;
		} catch (error) {
			console.error("Error al listar ventas:", error.response.data);
			return error;
		} finally {
			loading.value = false
		}
	};

	const getVentasID = async (id) => {
		try {
			loading.value = true
			const r = await axios.get(`${url}/api/ventas/${id}`, {
				headers: {
					token: useUsuario.token,
				},
			});
			notifySuccessRequest("Ventas encontrada exitosamente.");
			return r;
		} catch (error) {
			console.error("Error al buscar venta:", error.response.data);
			return error;
		} finally {
			loading.value = false
		}
	};

	const getVentasFechas = async (fechainicio, fechafin) => {
		try {
			loading.value = true
			const r = await axios.get(`${url}/api/ventas/fechas/${fechainicio}/${fechafin}`, {
				headers: {
					token: useUsuario.token,
				},
			});
			notifySuccessRequest("Ventas listadas por fechas exitosamente.");
			return r
		} catch (error) {
			console.error("Error al listar ventas por fechas:", error);
			return error;
		} finally {
			loading.value = false
		}
	};

	const postVentas = async (datos) => {
		try {
			loading.value = true
			const r = await axios.post(`${url}/api/ventas`, datos, {
				headers: {
					token: useUsuario.token,
				},
			});
			notifySuccessRequest("Venta agregada exitosamente.");
			return r;
		} catch (error) {
			notifyErrorRequest(error.response.data.errors[0].msg);
			console.error("Error al agregar venta:", error.response.data.errors[0].msg);
			return error;
		} finally {
			loading.value = false
		}
	};

	const putVentas = async (id, datos) => {
		try {
			loading.value = true
			const r = await axios.put(`${url}/api/ventas/${id}`, datos, {
				headers: {
					token: useUsuario.token,
				},
			});
			notifySuccessRequest("Venta editada exitosamente.");
			return r;
		} catch (error) {
			loading.value = false;
			notifyErrorRequest(error.response.data.errors[0].msg);
			console.error("Error al editar venta:", error.response.data.errors[0].msg);
			return error;
		}
		finally {
			loading.value = false
		}
	};

	return {
		getVentas,
		getVentasID,
		getVentasFechas,
		postVentas,
		putVentas,
		loading
	};
},
	{
		persist: true,
	}
);
