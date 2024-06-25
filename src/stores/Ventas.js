import { defineStore } from "pinia";
import axios from "axios";
import { useStoreUsuarios } from "../stores/Usuarios.js";
import { ref } from "vue"
import { notifyErrorRequest } from "../routes/routes.js";
import { notifySuccessRequest } from "../routes/routes.js";

const url = "https://backendgimnasio-ip8j.onrender.com"
// const url = "http://localhost:4505"

export const useStoreVentas = defineStore("Venta", () => {
    let loading=ref(false)
	const useUsuario = useStoreUsuarios();

	const getVentas = async () => {
		try {
            loading.value=true
			const r = await axios.get(`${url}/api/ventas`, {
				headers: {
					token: useUsuario.token,
				},
			});
            notifySuccessRequest("Ventas listadas exitosamente");
			return r;
		} catch (error) {
            loading.value=true
			console.log("Error al listar ventas:", error);
			return error;
		} finally{
            loading.value=false
        }
	};

	const getVentasID = async (id) => {
		try {
            loading.value=true
			const r = await axios.get(`${url}/api/ventas/${id}`, {
				headers: {
					token: useUsuario.token,
				},
			});
            notifySuccessRequest("Ventas listadas por su ID exitosamente");
			return r;
		} catch (error) {
            loading.value=true
			console.log("Error al listar ventas por su ID:",error);
			return error;
		} finally{
            loading.value=false
        }
	};

	const postVentas = async (datos) => {
		try {
            loading.value=true
			const r = await axios.post(`${url}/api/ventas`, datos, {
				headers: {
					token: useUsuario.token,
				},
			});
            notifySuccessRequest("Venta agregada exitosamente");
			return r;
		} catch (error) {
            loading.value=true
			console.log("Error al agregar la venta:", error);
			return error;
		} finally{
            loading.value=false
        }
	};

	const putVentas = async (id, datos) => {
		try {
            loading.value=true
			const r = await axios.put(`${url}/api/ventas/${id}`, datos, {
				headers: {
					token: useUsuario.token,
				},
			});
            notifySuccessRequest("Venta modificada exitosamente");
			return r;
		} catch (error) {
            loading.value=true
			console.log("Error al modificar la venta:", error);
			return error;
		} finally{
            loading.value=false
        }
	};

	return {
		getVentas,
		getVentasID,
		postVentas,
		putVentas,
        loading
	};
},
	{
		persist: true,
	}
);
