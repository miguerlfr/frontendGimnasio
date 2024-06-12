<!-- <template>
    <q-layout view="hHh lpR fFf">
      <q-header elevated class="bg-primary text-white" height-hint="98">
        <q-toolbar>
          <q-btn dense flat round icon="menu" @click="toggleLeftDrawer" />
  
          <q-toolbar-title>
            <em>Gym</em>
          </q-toolbar-title>
        </q-toolbar>
  

      </q-header>
  
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

      <q-page-container>
      <router-view />
    </q-page-container>
    </q-layout>
</template>

<script setup>
import { ref } from "vue";

const leftDrawerOpen = ref(false);

const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value;
};
</script>

<style scoped>
.drawer-links {
  text-align: center !important;
  font-size: 20px !important;
  /* Centra los enlaces horizontalmente */
  overflow: hidden;
  margin-top: 20px;
  height: 100%;
  margin: 0;
  padding-top: 20px;
  padding-bottom: 20px;
  overflow-y: auto;
}

.r {
  color: rgb(65, 60, 77);
}

.bg-primary {
  background-color: rgb(60, 63, 77) !important;
}
</style> -->

 <template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-primary text-white" height-hint="98">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="toggleLeftDrawer" />
        <q-toolbar-title>
          <em>Gym</em>
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer v-if="isAuthenticated" :model-value="leftDrawerOpen" show-if-above side="left" overlay>
      <div class="drawer-links">
        <router-link v-if="hasAccess(['Administrador', 'Recepcionista', 'Instructor'])" class="r" to="/Clientes">Clientes</router-link>
        <router-link v-if="hasAccess(['Administrador', 'Recepcionista'])" class="r" to="/Ingresos">Ingresos</router-link>
        <router-link v-if="hasAccess(['Administrador', 'Recepcionista'])" class="r" to="/Mantenimientos">Mantenimientos</router-link>
        <router-link v-if="hasAccess(['Administrador', 'Recepcionista'])" class="r" to="/Maquinas">Maquinas</router-link>
        <router-link v-if="hasAccess(['Administrador', 'Recepcionista'])" class="r" to="/Pagos">Pagos</router-link>
        <router-link v-if="hasAccess(['Administrador'])" class="r" to="/Planes">Planes</router-link>
        <router-link v-if="hasAccess(['Administrador'])" class="r" to="/Productos">Productos</router-link>
        <router-link v-if="hasAccess(['Administrador'])" class="r" to="/Sedes">Sedes</router-link>
        <router-link v-if="hasAccess(['Administrador', 'Recepcionista'])" class="r" to="/Usuarios">Usuarios</router-link>
        <router-link v-if="hasAccess(['Administrador', 'Recepcionista'])" class="r" to="/Ventas">Ventas</router-link>
      </div>
    </q-drawer>
    
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useStoreUsuarios } from '../stores/Usuarios.js';

const leftDrawerOpen = ref(false);
const useUsuario = useStoreUsuarios();

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
</script>
<style scoped>
.drawer-links {
  text-align: center !important;
  font-size: 20px !important;
  /* Centra los enlaces horizontalmente */
  overflow: hidden;
  margin-top: 20px;
  height: 100%;
  margin: 0;
  padding-top: 20px;
  padding-bottom: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.r {
  color: rgb(65, 60, 77);
}

.bg-primary {
  background-color: rgb(60, 63, 77) !important;
}
</style>
