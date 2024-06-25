<template>
  <q-layout view="hHh lpR fFf">
  <!--   <q-header elevated class="bg-primary text-white" height-hint="98">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="toggleLeftDrawer" />

        <q-toolbar-title>
          <em>Gym Natural</em>
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer show-if-above v-model="leftDrawerOpen" side="left" bordered style="background-color: #f0f0f0b8;">

      <div class="q-img q-img--menu relative-top" role="img" style="height: 204px;">
        <div style="padding-bottom: 82.5195%;"></div>
        <div class="q-img__container absolute-full"><img
            class="q-img__image q-img__image--with-transition q-img__image--loaded" fetchpriority="auto"
            aria-hidden="true" draggable="false" src="./img/fondoAzul.png"
            style="object-fit: cover; object-position: 50% 50%;"></div>
        <div class="q-img__content absolute-full q-anchor--skip">
          <div class="absolute-bottom bg-transparent">
            <div class="q-avatar q-mb-sm" style="font-size: 56px;">
              <div class="q-avatar__content row flex-center overflow-hidden"><img src="./img/avatar.png"></div>
            </div>
            <div class="text-weight-bold">&nbsp;&nbsp;¡¡ Bienvenido {{ useUsuario.user.nombre }} !!</div>
            <div>{{ useUsuario.user.email }}</div>
          </div>
        </div>
      </div>

      <div class="drawer-links">

        <div class="tooltip-container">
          <img class="cerrar" src="./img/CerrarSesion.png" alt="Logo de Cerrar Sesión" @click="handleLogout" />
          <q-tooltip ref="cerrarTooltip" anchor="top middle" self="bottom middle">
            Cerrar Sesión
          </q-tooltip>
        </div>

        <div>
          🏠
          <router-link id="link" class="r" to="/">Login</router-link>
        </div>
        <div>
          🗣️
          <router-link id="link" class="r" to="/Clientes">Clientes</router-link>
        </div>
        <div>
          💰
          <router-link id="link" class="r" to="/Ingresos">Ingresos</router-link>
        </div>
        <div>
          📋
          <router-link id="link" class="r" to="/Mantenimientos">Mantenimientos</router-link>
        </div>
        <div>
          📒
          <router-link id="link" class="r" to="/Maquinas">Maquinas</router-link>
        </div>
        <div>
          💰
          <router-link id="link" class="r" to="/Pagos">Pagos</router-link>
        </div>
        <div>
          💳
          <router-link id="link" class="r" to="/Planes">Planes</router-link>
        </div>
        <div>
          📦
          <router-link id="link" class="r" to="/Productos">Productos</router-link>
        </div>
        <div>
          🏘️
          <router-link id="link" class="r" to="/Sedes">Sedes</router-link>
        </div>
        <div>
          👤
          <router-link id="link" class="r" to="/Usuarios">Usuarios</router-link>
        </div>
        <div>
          📉
          <router-link id="link" class="r" to="/Ventas">Ventas</router-link>
        </div>
      </div>

      <div class="footerBarra">
        <hr width="70%" size="2" color="blue">
        <p style="text-align: center; font-size: 10px;">Los términos y condiciones son</p>
        <p style="text-align: center; font-size: 10px; margin-top: -20px;">autorizados...</p>
      </div>
    </q-drawer> -->

    <q-page-container>
      <router-view />
    </q-page-container>

  </q-layout>
</template>

<!-- <script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useStoreUsuarios } from "./stores/Usuarios.js";

const useUsuario = useStoreUsuarios();
const router = useRouter();
const leftDrawerOpen = ref(false);

const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value;
};

// Función para verificar acceso basado en roles (opcional)
const hasAccess = (allowedRoles) => {
  return useUsuario.user && allowedRoles.includes(useUsuario.user.rol);
};

const handleLogout = () => {
  useUsuario.logout();
  router.push("/");
};
</script>

<style scoped>
.logoCasa {
  width: 19px;
}

#link {
  margin-left: 10px;
}

.drawer-links {
  font-size: 20px !important;
  overflow: hidden;
  margin-top: 20px;
  height: min-content;
  margin: 0;
  padding-top: 20px;
  padding-bottom: 20px;
  overflow-y: auto;
}

.cerrar {
  position: fixed;
  top: 0;
  cursor: pointer;
}

.tooltip-container {
  position: absolute;
  top: 100px;
  margin-left: 227px;
  display: inline-block;
}

.bg-primary {
  background-color: rgb(45, 75, 207) !important;
}

body {
  margin: 0;
  font-family: 'Arial', sans-serif;
}

#appHeader {
  height: 50px;
  display: flex;
  align-items: center;
  padding: 0 20px;
}

.toolbar {
  display: flex;
  align-items: center;
}

.menu-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
}

.menu-icon {
  font-size: 24px;
}

.toolbar-title {
  margin-left: 10px;
  font-size: 20px;
}

.footerBarra {
  position: absolute;
  bottom: 0;
  width: 100%;
}

#sideDrawer {
  position: fixed;
  top: 0;
  left: -300px;
  width: 300px;
  height: 100%;
  background-color: #f0f0f0;
  transition: transform 0.3s ease;
  z-index: 1000;
  padding-top: 50px;
}

#sideDrawer.open {
  transform: translateX(300px);
}

.drawer-links {
  display: flex;
  flex-direction: column;
  padding-left: 20px;
}

.hijos {
  position: relative;
  display: flex;
  flex-direction: row;
  gap: 30px;
}

.drawer-links .r {
  text-decoration: none;
  color: black;
  font-size: 18px;
  margin-top: -20px;
}

.drawer-links .r:hover {
  color: #007bff;
}
</style> -->