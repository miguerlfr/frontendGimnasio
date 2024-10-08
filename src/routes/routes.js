import { Notify } from "quasar";
import { useStoreUsuarios } from "../stores/Usuarios.js";

import Login from "../components/Login.vue";
import barraLateral from "../components/barraLateral.vue";
import Clientes from "../components/Clientes.vue";
import Compras from "../components/Compras.vue";
import Ingresos from "../components/Ingresos.vue";
import Mantenimientos from "../components/Mantenimientos.vue";
import Maquinas from "../components/Maquinas.vue";
import Pagos from "../components/Pagos.vue";
import Planes from "../components/Planes.vue";
import Productos from "../components/Productos.vue";
import Proveedores from "../components/Proveedores.vue";
import Sedes from "../components/Sedes.vue";
import Usuarios from "../components/Usuarios.vue";
import Ventas from "../components/Ventas.vue";
import ForgotPassword from "../components/forgot-password.vue";
import RestablecerContrasena from "../components/Restablecer-contrasena.vue";

import { createRouter, createWebHashHistory } from "vue-router";

export const notifyErrorRequest = (msg, position = "bottom") => {
	Notify.create({
		color: "negative",
		message: msg,
		icon: "error",
		position: position,
		timeout: 4500,
	});
};

export const notifySuccessRequest = (msg, position = "bottom") => {
	Notify.create({
		color: "positive",
		message: msg,
		icon: "check",
		position: position,
		timeout: 3500,
	});
};

export const notifyWarningRequest = (msg, position = "bottom") => {
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
// 	{ path: "/Compras", component: Compras, },
// 	{ path: "/Ingresos", component: Ingresos, },
// 	{ path: "/Mantenimientos", component: Mantenimientos, },
// 	{ path: "/Maquinas", component: Maquinas, },
// 	{ path: "/Pagos", component: Pagos, },
// 	{ path: "/Planes", component: Planes, },
// 	{ path: "/Productos", component: Productos, },
// 	{ path: "/Proveedores", component: Proveedores, },
// 	{ path: "/Sedes", component: Sedes, },
// 	{ path: "/Usuarios", component: Usuarios, },
// 	{ path: "/Ventas", component: Ventas, },
// ];

// const routes = [
// 	{ path: "/", component: Login, name: "login" },
// 	{ path: "/Clientes", component: Clientes, beforeEnter: auth, meta: { rol: ["Administrador", "Recepcionista", "Instructor"] } },
// 	{ path: "/Compras", component: Compras, beforeEnter: auth, meta: { rol: ["Administrador"] } },
// 	{ path: "/Ingresos", component: Ingresos, beforeEnter: auth, meta: { rol: ["Administrador", "Recepcionista"] } },
// 	{ path: "/Mantenimientos", component: Mantenimientos, beforeEnter: auth, meta: { rol: ["Administrador", "Recepcionista"] } },
// 	{ path: "/Maquinas", component: Maquinas, beforeEnter: auth, meta: { rol: ["Administrador", "Recepcionista"] } },
// 	{ path: "/Pagos", component: Pagos, beforeEnter: auth, meta: { rol: ["Administrador", "Recepcionista"] } },
// 	{ path: "/Planes", component: Planes, beforeEnter: auth, meta: { rol: ["Administrador"] } },
// 	{ path: "/Productos", component: Productos, beforeEnter: auth, meta: { rol: ["Administrador"] } },
// 	{ path: "/Proveedores", component: Proveedores, beforeEnter: auth, meta: { rol: ["Administrador"] } },
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
			{ path: "Compras", component: Compras, beforeEnter: auth, meta: { rol: ["Administrador"] } },
			{ path: "Ingresos", component: Ingresos, beforeEnter: auth, meta: { rol: ["Administrador", "Recepcionista"] } },
			{ path: "Mantenimientos", component: Mantenimientos, beforeEnter: auth, meta: { rol: ["Administrador", "Recepcionista"] } },
			{ path: "Maquinas", component: Maquinas, beforeEnter: auth, meta: { rol: ["Administrador", "Recepcionista"] } },
			{ path: "Pagos", component: Pagos, beforeEnter: auth, meta: { rol: ["Administrador", "Recepcionista"] } },
			{ path: "Planes", component: Planes, beforeEnter: auth, meta: { rol: ["Administrador"] } },
			{ path: "Productos", component: Productos, beforeEnter: auth, meta: { rol: ["Administrador"] } },
			{ path: "Proveedores", component: Proveedores, beforeEnter: auth, meta: { rol: ["Administrador"] } },
			{ path: "Sedes", component: Sedes, beforeEnter: auth, meta: { rol: ["Administrador"] } },
			{ path: "Usuarios", component: Usuarios, beforeEnter: auth, meta: { rol: ["Administrador"] } },
			{ path: "Ventas", component: Ventas, beforeEnter: auth, meta: { rol: ["Administrador", "Recepcionista"] } },
		]
	},
	{ path: "/password", component: ForgotPassword, name: "forgot-password" },
	{ path: "/restablecer-contrasena", component: RestablecerContrasena, name: "restablecer-contrasena" }
];


export const router = createRouter({
	history: createWebHashHistory(),
	routes,
});