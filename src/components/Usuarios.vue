<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useStoreUsuarios } from "../stores/Usuarios.js";

const useUsuario = useStoreUsuarios();

const emailUsuario = ref("");

const selectedOption = ref("Listar Usuarios"); // Establecer 'Listar Usuarios' como valor por defecto
const options = [
  { label: "Listar Usuarios", value: "Listar Usuarios" },
  {
    label: "Listar Usuario por su Email",
    value: "Listar Usuario por su Email",
  },
  { label: "Listar Usuarios Activos", value: "Listar Usuarios Activos" },
  { label: "Listar Usuarios Inactivos", value: "Listar Usuarios Inactivos" },
  { label: "Agregar Usuario", value: "Agregar Usuario" },
];

let rows = ref([]);
const columns = ref([
  { name: "sede", label: "Sede", field: "sede", align: "center" },
  { name: "nombre", label: "Nombre", field: "nombre", align: "center" },
  { name: "email", label: "Email", field: "email", align: "center" },
  { name: "telefono", label: "Teléfono", field: "telefono", align: "center" },
  { name: "rol", label: "Rol", field: "rol", align: "center" },
  { name: "estado", label: "Estado", field: "estado", align: "center" },
  { name: "opciones", label: "Opciones", field: "opciones", align: "center" },
]);
// Función computada para manejar la lógica de qué datos mostrar
const filteredRows = computed(() => {
  switch (selectedOption.value) {
    case "Listar Usuario por su Email":
      return listarClienteEmail.value;
    default:
      return rows.value;
  }
});
async function listarUsuarios() {
  const r = await useUsuario.getUsuarios();
  console.log(r.data);
  rows.value = r.data.usuarios;
}
// Función computada para filtrar los usuarios por email
const listarClienteEmail = computed(() => {
  if (
    selectedOption.value === "Listar Usuario por su Email" &&
    emailUsuario.value
  ) {
    const searchTerm = emailUsuario.value.toLowerCase(); // Convertir el término de búsqueda a minúsculas
    return rows.value.filter((usuario) =>
      usuario.email.toLowerCase().includes(searchTerm)
    );
  } else {
    return rows.value; // Devuelve todos los usuarios si no hay un email especificado
  }
});
async function listarUsuariosActivos(id) {
  const r = await useUsuario.getUsuariosActivos();
  // console.log(r);
  rows.value = r.data.usuariosAc;
}
async function listarUsuariosInactivos(id) {
  const r = await useUsuario.getUsuariosInactivos();
  // console.log(r);
  rows.value = r.data.usuariosIn;
}
async function inactivarUsuario(id) {
  const r = await useUsuario.putUsuariosInactivar(id);
  console.log(r.data);
  actualizarListadoUsuarios();
}
async function activarUsuario(id) {
  const r = await useUsuario.putUsuariosActivar(id);
  console.log(r.data);
  actualizarListadoUsuarios();
}



const mostrarFormularioAgregarUsuarios = ref(false);
const mostrarFormularioEditarUsuarios = ref(false);

const selectedUsuarioId = ref(null);
const sede = ref("");
const nombre = ref("");
const email = ref("");
const telefono = ref("");
const password = ref("")
const rol = ref("");
const estadoOptions = [
  { label: "Activo", value: 1 },
  { label: "Inactivo", value: 0 },
];
const estado = ref(estadoOptions.find(option => option.label === "Activo").label);

const limpiarCamposUsuario = () => {
  sede.value = ""
  nombre.value = "";
  email.value = "";
  telefono.value = "";
  password.value = "",
  rol.value = "";
};
const agregarUsuario = async () => {
  try {
    const datosUsuario = {
      sede: sede.value,
      nombre: nombre.value,
      email: email.value,
      telefono: telefono.value,
      password: password.value,
      rol: rol.value,
      estado: estadoOptions.find(option => option.label === estado.value).value,
    };

    const response = await useUsuario.postUsuarios(datosUsuario);
    if (response.status === 200) {
      listarUsuarios();
      estado.value = "Activo";
      limpiarCamposUsuario();
    } else {
      console.error('Error al agregar el usuario:', response.data);
    }
  } catch (error) {
    console.error('Error al agregar el usuario:', error);
  }
};

const editarUsuario = async () => {
  try {
    const datosUsuario = {
      sede: sede.value,
      nombre: nombre.value,
      email: email.value,
      telefono: telefono.value,
      password: password.value,
      rol: rol.value,
    };

    const response = await useUsuario.putUsuarios(selectedUsuarioId.value, datosUsuario);
    if (response.status === 200) {
      listarUsuarios();
      limpiarCamposUsuario();
      mostrarFormularioEditarUsuarios.value = false;
    } else {
      console.error('Error al editar el usuario:', response.data);
    }
  } catch (error) {
    console.error('Error al editar el usuario:', error);
  }
};
const mostrarDatosParaEditar = (usuarios) => {
  console.log("usuario a editar:", usuarios);
  selectedUsuarioId.value = usuarios._id;
  sede.value = usuarios.sede;
  nombre.value = usuarios.nombre;
  email.value = usuarios.email;
  telefono.value = usuarios.telefono;
  password.value = "",
  rol.value = usuarios.rol;

  mostrarFormularioAgregarUsuarios.value = false;
  mostrarFormularioEditarUsuarios.value = true;
};

const cancelarUsuario = () => {
  mostrarFormularioAgregarUsuarios.value = false;
  mostrarFormularioEditarUsuarios.value = false;
};

const actualizarListadoUsuarios = async () => {
  switch (selectedOption.value) {
    case "Listar Usuarios Activos":
      await listarUsuariosActivos();
      break;
    case "Listar Usuarios Inactivos":
      await listarUsuariosInactivos();
      break;
    default:
      await listarUsuarios();
      break;
  }
};

onMounted(() => {
  listarUsuarios();
});

watch(selectedOption, (newValue) => {
  actualizarListadoUsuarios();
  if (newValue === "Agregar Usuario") {
    mostrarFormularioAgregarUsuarios.value = true;
    mostrarFormularioEditarUsuarios.value = false;
    limpiarCamposUsuario();
  } else {
    mostrarFormularioEditarUsuarios.value = false;
    mostrarFormularioAgregarUsuarios.value = false;
  }
});


// Variable reactiva para controlar la visibilidad de la contraseña
const showPassword = ref(false);

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};

const selectAllText = (event) => {
  const input = event.target;
  input.select();
};
</script>

<template>
  <div>
    <div class="q-pa-md">
      <div>
        <h3 style="text-align: center; margin: 10px">Usuarios</h3>
        <hr style="width: 70%; height: 5px; background-color: green" />
      </div>

      <div class="contSelect" style="margin-left: 5%; text-align: end; margin-right: 5%">
        <q-select background-color="green" class="q-my-md" v-model="selectedOption" outlined dense options-dense
          emit-value :options="options" />

        <input v-if="selectedOption === 'Listar Usuario por su Email'" v-model="emailUsuario" class="q-my-md"
          type="email" name="emailUsuario" id="emailUsuario" placeholder="Ingrese el email del usuario" />
      </div>

      <div>
    <!-- Botones para abrir los formularios -->
    <!-- <q-btn label="Agregar Usuario" @click="mostrarFormularioAgregarUsuarios = true" />
    <q-btn label="Editar Usuario" @click="mostrarFormularioEditarUsuarios = true" /> -->

    <!-- Formulario para agregar usuario -->
    <q-dialog v-model="mostrarFormularioAgregarUsuarios">
      <q-card>
        <q-card-section>
          <div class="text-h6">Agregar Usuario</div>
        </q-card-section>
        <q-card-section>
          <q-form @submit.prevent="agregarUsuario">
            <q-input v-model="sede" label="Sede" outlined @dblclick="selectAllText" />
            <q-input v-model="nombre" label="Nombre" outlined autocomplete="username" @dblclick="selectAllText" />
            <q-input v-model="email" label="Email" type="email" outlined autocomplete="email" />
            <q-input v-model="telefono" label="Telefono" type="tel" outlined autocomplete="tel" @dblclick="selectAllText" />
            <q-input v-model="password" :type="showPassword ? 'text' : 'password'" placeholder="Password" autocomplete="current-password" @dblclick="selectAllText">
              <template v-slot:append>
                <div class="eye-wrapper" @click="togglePasswordVisibility">
                  <div style="display: flex; flex-direction: column;">
                    <svg class="eye-icon" width="24" height="24" viewBox="0 0 24 24" style="margin-bottom: -13px;">
                      <!-- Inserta aquí el SVG del ojo abierto -->
                      <path fill="currentColor" d="M11.999 4.5c-3.598 0-6.59 2.399-7.633 5.662a.75.75 0 1 0 1.395.548c.808-2.387 3.083-4.21 6.238-4.21 3.17 0 5.45 1.83 6.262 4.236a.75.75 0 1 0 1.387-.556C18.605 6.919 15.614 4.5 11.999 4.5zm0 2.25c1.875 0 3.463 1.299 4.256 3.001a.75.75 0 0 0 1.418-.49C16.729 9.42 14.253 8.25 11.999 8.25s-4.732 1.169-5.674 2.511a.75.75 0 1 0 1.414.487c.776-1.62 2.701-2.748 5.259-2.748zm0 3.375a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5z" />
                    </svg>
                    <svg class="eye-icon" width="24" height="24" viewBox="0 0 24 24" style="transform: rotate(180deg); margin-top: -13px; animation: flip 1s;">
                      <!-- SVG del ojo al revés -->
                      <path fill="currentColor" d="M11.999 4.5c-3.598 0-6.59 2.399-7.633 5.662a.75.75 0 1 0 1.395.548c.808-2.387 3.083-4.21 6.238-4.21 3.17 0 5.45 1.83 6.262 4.236a.75.75 0 1 0 1.387-.556C18.605 6.919 15.614 4.5 11.999 4.5zm0 2.25c1.875 0 3.463 1.299 4.256 3.001a.75.75 0 0 0 1.418-.49C16.729 9.42 14.253 8.25 11.999 8.25s-4.732 1.169-5.674 2.511a.75.75 0 1 0 1.414.487c.776-1.62 2.701-2.748 5.259-2.748zm0 3.375a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5z" />
                    </svg>
                  </div>
                </div>
              </template>
            </q-input>
            <q-input v-model="rol" label="Rol" outlined @dblclick="selectAllText" />
            <q-select v-model="estado" label="Estado" outlined :options="estadoOptions" />
            <q-btn @click="cancelarUsuario" class="q-ma-sm">Cancelar</q-btn>
            <q-btn type="submit" color="primary" class="q-ma-sm">Agregar Usuario</q-btn>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Formulario para editar usuario -->
    <q-dialog v-model="mostrarFormularioEditarUsuarios">
      <q-card>
        <q-card-section>
          <div class="text-h6">Editar Usuario</div>
        </q-card-section>
        <q-card-section>
          <q-form @submit.prevent="editarUsuario">
            <q-input v-model="sede" label="Sede" outlined @dblclick="selectAllText" />
            <q-input v-model="nombre" label="Nombre" outlined autocomplete="username" @dblclick="selectAllText" />
            <q-input v-model="email" label="Email" type="email" outlined autocomplete="email" />
            <q-input v-model="telefono" label="Telefono" type="tel" outlined autocomplete="tel" @dblclick="selectAllText" />
            <q-input v-model="password" :type="showPassword ? 'text' : 'password'" placeholder="Password" autocomplete="current-password" @dblclick="selectAllText">
              <template v-slot:append>
                <div class="eye-wrapper" @click="togglePasswordVisibility">
                  <div style="display: flex; flex-direction: column;">
                    <svg class="eye-icon" width="24" height="24" viewBox="0 0 24 24" style="margin-bottom: -13px;">
                      <!-- Inserta aquí el SVG del ojo abierto -->
                      <path fill="currentColor" d="M11.999 4.5c-3.598 0-6.59 2.399-7.633 5.662a.75.75 0 1 0 1.395.548c.808-2.387 3.083-4.21 6.238-4.21 3.17 0 5.45 1.83 6.262 4.236a.75.75 0 1 0 1.387-.556C18.605 6.919 15.614 4.5 11.999 4.5zm0 2.25c1.875 0 3.463 1.299 4.256 3.001a.75.75 0 0 0 1.418-.49C16.729 9.42 14.253 8.25 11.999 8.25s-4.732 1.169-5.674 2.511a.75.75 0 1 0 1.414.487c.776-1.62 2.701-2.748 5.259-2.748zm0 3.375a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5z" />
                    </svg>
                    <svg class="eye-icon" width="24" height="24" viewBox="0 0 24 24" style="transform: rotate(180deg); margin-top: -13px; animation: flip 1s;">
                      <!-- SVG del ojo al revés -->
                      <path fill="currentColor" d="M11.999 4.5c-3.598 0-6.59 2.399-7.633 5.662a.75.75 0 1 0 1.395.548c.808-2.387 3.083-4.21 6.238-4.21 3.17 0 5.45 1.83 6.262 4.236a.75.75 0 1 0 1.387-.556C18.605 6.919 15.614 4.5 11.999 4.5zm0 2.25c1.875 0 3.463 1.299 4.256 3.001a.75.75 0 0 0 1.418-.49C16.729 9.42 14.253 8.25 11.999 8.25s-4.732 1.169-5.674 2.511a.75.75 0 1 0 1.414.487c.776-1.62 2.701-2.748 5.259-2.748zm0 3.375a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5z" />
                    </svg>
                  </div>
                </div>
              </template>
            </q-input>
            <q-input v-model="rol" label="Rol" outlined @dblclick="selectAllText" />
            <q-btn @click="cancelarUsuario" class="q-ma-sm">Cancelar</q-btn>
            <q-btn type="submit" color="primary" class="q-ma-sm">Editar Usuario</q-btn>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>

      <q-table flat bordered title="Usuarios" title-class="text-green text-weight-bolder text-h5" :rows="filteredRows"
        :columns="columns" row-key="id">
        <q-select background-color="green" class="q-my-md" v-model="selectedOption" outlined dense options-dense
          emit-value :options="options" />
        <template v-slot:body-cell-opciones="props">
          <q-td :props="props">
            <q-btn @click="mostrarDatosParaEditar(props.row)">✏️</q-btn>
            <q-btn v-if="props.row.estado == 1" @click="inactivarUsuario(props.row._id)">
              ❌
            </q-btn>
            <q-btn v-else @click="activarUsuario(props.row._id)">✅</q-btn>
          </q-td>
        </template>

        <template class="a" v-slot:body-cell-estado="props">
          <q-td class="b" :props="props">
            <p :style="{
              color: props.row.estado === 1 ? 'green' : 'red',
              margin: 0,
            }">
              {{ props.row.estado === 1 ? "Activo" : "Inactivo" }}
            </p>
          </q-td>
        </template>
      </q-table>
    </div>
  </div>
</template>

<style scoped>
.contSelect {
  display: flex;
  flex-direction: row;
  gap: 20px;
}

.eye-wrapper {
  display: flex;
  align-items: center;
  /* Centra verticalmente el ícono */
}

.eye-icon {
  font-size: 24px;
  /* Tamaño base del ícono */
}

.q-select {
  max-width: 200px;
  /* Puedes ajustar el ancho según tu preferencia */
}

.q-my-md {
  max-width: 500px;
  padding-left: 10px;
}
</style>
