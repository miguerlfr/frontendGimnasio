<!-- <template>
      <q-drawer show-if-above v-model="leftDrawerOpen" side="left" bordered>
        <div class="drawer-links">
          <router-link class="r" to="/">Login</router-link><br />
          <router-link class="r" to="/Clientes">Clientes</router-link><br />
          <router-link class="r" to="/Ingresos">Ingresos</router-link><br />
          <router-link class="r" to="/Mantenimientos">Mantenimientos</router-link><br />
          <router-link class="r" to="/Maquinas">Maquinas</router-link><br />
          <router-link class="r" to="/Pagos">Pagos</router-link><br />
          <router-link class="r" to="/Planes">Planes</router-link><br />
          <router-link class="r" to="/Productos">Productos</router-link><br />
          <router-link class="r" to="/Sedes">Sedes</router-link><br />
          <router-link class="r" to="/Usuarios">Usuarios</router-link><br />
          <router-link class="r" to="/Ventas">Ventas</router-link>
        </div>
      </q-drawer>
</template>-->

<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-primary text-white" height-hint="98">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="toggleLeftDrawer" />
        <q-toolbar-title>
          <em style="font-weight: bold; font-family: cursive;">Gym Monsters</em>
        </q-toolbar-title>
        <div class="tooltip-container" @click="handleLogout">
            <svg class="cerrar" height="24" viewBox="0 0 24 24" width="24" focusable="false" >
              <path d="M0 0h24v24H0z" fill="none">
              </path>
              <path
                d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z">
              </path>
            </svg>
          <q-tooltip ref="cerrarTooltip" anchor="top middle" self="bottom middle">
            Cerrar Sesión
          </q-tooltip>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer v-if="isAuthenticated" :model-value="leftDrawerOpen" show-if-above side="left" bordered overlay
      style="background-color: #f0f0f0b8; overflow-y: hidden;">

      <div class="q-img q-img--menu relative-top" role="img" style="height: 204px;">
        <div style="padding-bottom: 82.5195%;"></div>
        <div class="q-img__container absolute-full"><img
            class="q-img__image q-img__image--with-transition q-img__image--loaded" fetchpriority="auto"
            aria-hidden="true" draggable="false" src="../img/fondoAzul.png"
            style="object-fit: cover; object-position: 50% 50%;"></div>
        <div class="q-img__content absolute-full q-anchor--skip">
          <div class="absolute-bottom bg-transparent">
            <div class="q-avatar q-mb-sm" style="font-size: 56px;">
              <div class="q-avatar__content row flex-center overflow-hidden"><img src="../img/avatar.png"></div>
            </div>
            <div class="text-weight-bold">¡¡ Bienvenido
              {{ useUsuario.user.nombre }} !!</div>
            <div
              style="font-family: 'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif;">
              {{ useUsuario.user.email }}</div>
            <div class="rol">Rol:&nbsp;<b class="rolP">{{ useUsuario.user.rol }}</b></div>
          </div>
        </div>
      </div>

      <div class="drawer-links">
        <div v-if="hasAccess(['Administrador', 'Recepcionista', 'Instructor'])">
          🗣️
          <router-link id="link" class="r" to="/Clientes">Clientes</router-link>
        </div>
        <div v-if="hasAccess(['Administrador', 'Recepcionista'])">
          💰
          <router-link id="link" class="r" to="/Ingresos">Ingresos</router-link>
        </div>
        <div v-if="hasAccess(['Administrador', 'Recepcionista'])">
          📋
          <router-link id="link" class="r" to="/Mantenimientos">Mantenimientos</router-link>
        </div>
        <div v-if="hasAccess(['Administrador', 'Recepcionista'])">
          📒
          <router-link id="link" class="r" to="/Maquinas">Maquinas</router-link>
        </div>
        <div v-if="hasAccess(['Administrador', 'Recepcionista'])">
          💰
          <router-link id="link" class="r" to="/Pagos">Pagos</router-link>
        </div>
        <div v-if="hasAccess(['Administrador'])">
          💳
          <router-link id="link" class="r" to="/Planes">Planes</router-link>
        </div>
        <div v-if="hasAccess(['Administrador'])">
          📦
          <router-link id="link" class="r" to="/Productos">Productos</router-link>
        </div>
        <div v-if="hasAccess(['Administrador'])">
          🏘️
          <router-link id="link" class="r" to="/Sedes">Sedes</router-link>
        </div>
        <div v-if="hasAccess(['Administrador'])">
          👤
          <router-link id="link" class="r" to="/Usuarios">Usuarios</router-link>
        </div>
        <div v-if="hasAccess(['Administrador', 'Recepcionista'])">
          📉
          <router-link id="link" class="r" to="/Ventas">Ventas</router-link>
        </div>
      </div>

      <!-- <div class="footerBarra">
        <hr width="70%" size="2" color="blue">
        <p style="text-align: center; font-size: 10px;">Los términos y condiciones son</p>
        <p style="text-align: center; font-size: 10px; margin-top: -20px;">autorizados...</p>
      </div> -->
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
    <!-- style=" padding: 0 !important;" -->

  </q-layout>
</template>

<script setup>
import { ref, computed } from 'vue';
import { notifySuccessRequest } from "../routes/routes.js";
import { useStoreUsuarios } from '../stores/Usuarios.js';
import { useRouter } from "vue-router";

const leftDrawerOpen = ref(false);
const useUsuario = useStoreUsuarios();
const router = useRouter();

// Función de alternancia para abrir y cerrar el cajón
const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value;
};

// Comprobar si el usuario está autenticado
const isAuthenticated = computed(() => !!useUsuario.token);

// Función para comprobar si el usuario tiene acceso en función de los roles
const hasAccess = (allowedRoles) => {
  return allowedRoles.includes(useUsuario.user.rol);
};

const handleLogout = () => {
  useUsuario.logout();
  router.push("/");
  notifySuccessRequest("Sesión cerrada con éxito");
};
</script>

<style scoped>
.text-weight-bold {
  font-family: cursive;
  font-variant: small-caps;
  font-style: italic;
  padding-bottom: 5px;
}

.rol {
  position: absolute;
  top: 0;
  right: 0;
  font-size: 14px;
  font-weight: bold;
  font-family: cursive;
  padding-right: 20px;
  padding: 10px 20px;
  font-size: 16px;
  outline: none;
  text-shadow: 0 0 5px rgb(61, 55, 167);
  /* transition: border-color 0.3s ease; */
}

/* @keyframes brillar {
  0% {
    text-shadow: 0 0 5px rgba(240, 240, 240, 0.281);
  }

  50% {
    text-shadow: 0 0 5px rgb(0, 0, 0);
  }

  100% {
    text-shadow: 0 0 5px rgba(255, 255, 255, 0.151);
  }
} */

.rolP {
  animation: brillar 1s infinite;
}

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
}

.cerrar {
  position: fixed;
  top: 0;
  right: 0;
  cursor: pointer;
  width: 33px;
  height: 50px;
  margin-right: 13px;
  /* filter: invert(1); */
}

.tooltip-container {
  position: absolute;
  top: 100px;
  left: 94%;
  display: inline-block;
}

.bg-primary {
  /* background-color: transparent !important; */
  color: black !important;
  background-color: #ffffff29 !important;
  padding-bottom: 5px;
  border-bottom: 1px solid rgb(18, 17, 16);
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

/* .footerBarra {
  position: absolute;
  bottom: 0;
  width: 100%;
  margin: 0;
  padding: 0;
  border: 0;
} */

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
</style>