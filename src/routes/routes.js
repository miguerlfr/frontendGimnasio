import { Notify } from "quasar";
import { useStoreUsuarios } from "../stores/Usuarios.js";

import Login from "../components/Login.vue";
import barraLateral from "../components/barraLateral.vue";
import Clientes from "../components/Clientes.vue";
import Ingresos from "../components/Ingresos.vue";
import Mantenimientos from "../components/Mantenimientos.vue";
import Maquinas from "../components/Maquinas.vue";
import Pagos from "../components/Pagos.vue";
import Planes from "../components/Planes.vue";
import Productos from "../components/Productos.vue";
import Sedes from "../components/Sedes.vue";
import Usuarios from "../components/Usuarios.vue";
import Ventas from "../components/Ventas.vue";

import { createRouter, createWebHashHistory } from "vue-router";

export const notifyErrorRequest = (msg, position = "top") => {
	Notify.create({
		color: "negative",
		message: msg,
		icon: "error",
		position: position,
		timeout: 4500,
	});
};

export const notifySuccessRequest = (msg, position = "top") => {
	Notify.create({
		color: "positive",
		message: msg,
		icon: "check",
		position: position,
		timeout: 3500,
	});
};

export const notifyWarningRequest = (msg, position = "top") => {
	Notify.create({
		color: "warning",
		message: msg,
		icon: "warning",
		textColor: "black",
		position: position,
		timeout: 18000,
	});
};

const auth = (to, from, next) => {
	if (checkAuth()) {
		const useUsuario = useStoreUsuarios();
		const rol = useUsuario.user.rol
		if (!to.meta.rol.includes(rol)) {
			return next({ name: 'login' })
		}
		next()
	} else {
		console.log("Rol:", rol);
		return next({ name: 'login' })
	}
}

const checkAuth = async () => {
	const useUsuario = useStoreUsuarios();
	const token = useUsuario.token;
	if (!token) return false;
	return true;
};

// const routes = [
// 	{ path: "/", component: Login, name: "login" },
// 	// { path: "/barraLateral", component: barraLateral, },
// 	{ path: "/Clientes", component: Clientes, },
// 	{ path: "/Ingresos", component: Ingresos, },
// 	{ path: "/Mantenimientos", component: Mantenimientos, },
// 	{ path: "/Maquinas", component: Maquinas, },
// 	{ path: "/Pagos", component: Pagos, },
// 	{ path: "/Planes", component: Planes, },
// 	{ path: "/Productos", component: Productos, },
// 	{ path: "/Sedes", component: Sedes, },
// 	{ path: "/Usuarios", component: Usuarios, },
// 	{ path: "/Ventas", component: Ventas, },
// ];

// const routes = [
// 	{ path: "/", component: Login, name: "login" },
// 	{ path: "/Clientes", component: Clientes, beforeEnter: auth, meta: { rol: ["Administrador", "Recepcionista", "Instructor"] } },
// 	{ path: "/Ingresos", component: Ingresos, beforeEnter: auth, meta: { rol: ["Administrador", "Recepcionista"] } },
// 	{ path: "/Mantenimientos", component: Mantenimientos, beforeEnter: auth, meta: { rol: ["Administrador", "Recepcionista"] } },
// 	{ path: "/Maquinas", component: Maquinas, beforeEnter: auth, meta: { rol: ["Administrador", "Recepcionista"] } },
// 	{ path: "/Pagos", component: Pagos, beforeEnter: auth, meta: { rol: ["Administrador", "Recepcionista"] } },
// 	{ path: "/Planes", component: Planes, beforeEnter: auth, meta: { rol: ["Administrador"] } },
// 	{ path: "/Productos", component: Productos, beforeEnter: auth, meta: { rol: ["Administrador"] } },
// 	{ path: "/Sedes", component: Sedes, beforeEnter: auth, meta: { rol: ["Administrador"] } },
// 	{ path: "/Usuarios", component: Usuarios, beforeEnter: auth, meta: { rol: ["Administrador", "Recepcionista"] } },
// 	{ path: "/Ventas", component: Ventas, beforeEnter: auth, meta: { rol: ["Administrador", "Recepcionista"] } },
// ];

const routes = [
	{ path: "/", component: Login, name: "login" },
	{
		path: "/",
		component: barraLateral,
		children: [
			{ path: "Clientes", component: Clientes, beforeEnter: auth, meta: { rol: ["Administrador", "Recepcionista", "Instructor"] } },
			{ path: "Ingresos", component: Ingresos, beforeEnter: auth, meta: { rol: ["Administrador", "Recepcionista"] } },
			{ path: "Mantenimientos", component: Mantenimientos, beforeEnter: auth, meta: { rol: ["Administrador", "Recepcionista"] } },
			{ path: "Maquinas", component: Maquinas, beforeEnter: auth, meta: { rol: ["Administrador", "Recepcionista"] } },
			{ path: "Pagos", component: Pagos, beforeEnter: auth, meta: { rol: ["Administrador", "Recepcionista"] } },
			{ path: "Planes", component: Planes, beforeEnter: auth, meta: { rol: ["Administrador"] } },
			{ path: "Productos", component: Productos, beforeEnter: auth, meta: { rol: ["Administrador"] } },
			{ path: "Sedes", component: Sedes, beforeEnter: auth, meta: { rol: ["Administrador"] } },
			{ path: "Usuarios", component: Usuarios, beforeEnter: auth, meta: { rol: ["Administrador", "Recepcionista"] } },
			{ path: "Ventas", component: Ventas, beforeEnter: auth, meta: { rol: ["Administrador", "Recepcionista"] } },
		]
	},
];

export const router = createRouter({
	history: createWebHashHistory(),
	routes,
});