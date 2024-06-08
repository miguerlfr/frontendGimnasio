import { defineStore } from "pinia";
import axios from "axios";
import { useStoreUsuarios } from "../stores/Usuarios.js";

const url = "https://backendgimnasio-ip8j.onrender.com";

export const useStoreVentas = defineStore("Venta", () => {
	const useUsuario = useStoreUsuarios();

	const getVentas = async () => {
		try {
			const r = await axios.get(`${url}/api/ventas`, {
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

	const getVentasID = async (id) => {
		try {
			const r = await axios.get(`${url}/api/ventas/${id}`, {
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

	const postVentas = async (datos) => {
		try {
			const r = await axios.post(`${url}/api/ventas`, datos, {
				headers: {
					token: useUsuario.token,
				},
			});
			return r;
		} catch (error) {
			console.log("error", error);
			return error;
		}
	};

	const putVentas = async (id, datos) => {
		try {
			const r = await axios.put(`${url}/api/ventas/${id}`, datos, {
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

	return {
		getVentas,
		getVentasID,
		postVentas,
		putVentas,
	};
},
	{
		persist: true,
	}
);
