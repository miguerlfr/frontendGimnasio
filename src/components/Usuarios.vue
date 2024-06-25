<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useStoreUsuarios } from "../stores/Usuarios.js";
import { useStoreSedes } from "../stores/Sedes.js";

// Loading
const visible = ref(true);

// Variables parra mostrar formularios
const mostrarFormularioAgregarUsuarios = ref(false);
const mostrarFormularioEditarUsuarios = ref(false);

// Llamado de modelos
const useUsuario = useStoreUsuarios();
const useSede = useStoreSedes();

// Variables del input para peticiones get
const emailUsuario = ref("");

// Variables de los inputs de agregar y editar
const selectedUsuarioId = ref(null);
const sede = ref("");
const nombre = ref("");
const email = ref("");
const telefono = ref("");
const password = ref("")
const rol = ref("");

// Array de modelo de sedes
const sedes = ref([])

async function listarSedes() {
  try {
    const r = await useSede.getSedes();
    if (r.data && r.data.sedes) {
      sedes.value = r.data.sedes;
    visible.value = false;
    // console.log("Sedes listadas:", sedes.value);
    } else {
      console.error("La respuesta no contiene la propiedad 'sedes'.", r.data);
    }
  } catch (error) {
    console.error("Error al listar las sedes:", error);
  }
}

const sedeOptions = computed(() => {
  return sedes.value
    .filter(sede => sede.estado !== 0)
    .map(sede => ({
      label: sede.nombre,
      id: sede._id,
    }));
});

const rolOptions = [
  { label: "Administrador" }, 
  { label: "Recepcionista" }, 
  { label: "Instructor" }
];

const estadoOptions = [
  { label: "Activo", value: 1 },
  { label: "Inactivo", value: 0 },
];

const estado = ref(estadoOptions.find(option => option.label === "Activo").label);


const selectedOption = ref("Listar Usuarios"); // Establecer 'Listar Usuarios' como valor por defecto
const options = [
  { label: "Listar Usuarios", value: "Listar Usuarios" },
  {
    label: "Listar Usuario por su Email",
    value: "Listar Usuario por su Email",
  },
  { label: "Listar Usuarios Activos", value: "Listar Usuarios Activos" },
  { label: "Listar Usuarios Inactivos", value: "Listar Usuarios Inactivos" }
];

let rows = ref([]);
const columns = ref([
  { name: "sede", label: "Sede", field: row => (row.sede.nombre), align: "center" },
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
  try {
    const usuariosR = await useUsuario.getUsuarios()
    const usuarios = usuariosR.data.usuarios;
    console.log("usuarios:", usuarios);
    rows.value = usuarios;
    
  } catch (error) {
    console.error("Error al listar los usuarios:", error);
  }
}

// Función computada para filtrar los usuarios por email
const listarClienteEmail = computed(() => {
  if (
    selectedOption.value === "Listar Usuario por su Email" &&
    emailUsuario.value
  ) {
    const searchTerm = emailUsuario.value.toLowerCase();
    return rows.value.filter((usuario) =>
      usuario.email.toLowerCase().includes(searchTerm)
    );
  } else {
    return rows.value;
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

    // Buscar la máquina seleccionada por su descripción
    const select = sede.value
    const label = select.label

    // Verificar si se encontró la máquina seleccionada
    if (!select) {
      console.error("Máquina seleccionada no encontrada", select);
      console.log("Máquina seleccionada:", label);
      return;
      }

    const idSede = select.id;

    console.log("sede seleccionada:", rol.value);
    const sele = rol.value
    const labe = sele.label
    console.log("sede seleccionada:", sele);

    // Verificar si se encontró la máquina seleccionada
    if (!sele) {
      console.error("Máquina seleccionada no encontrada", sele);
      return;
      }
    const datosUsuario = {
      sede: idSede,
      nombre: nombre.value,
      email: email.value,
      telefono: telefono.value,
      password: password.value,
      rol: labe,
      estado: estadoOptions.find(option => option.label === estado.value).value,
    };

    console.log("Datos a agregar", datosUsuario);

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

const mostrarDatosParaEditar = (usuarios) => {
  console.log("usuario a editar:", usuarios);
  selectedUsuarioId.value = usuarios._id;
  sede.value = usuarios.sede.nombre;
  nombre.value = usuarios.nombre;
  email.value = usuarios.email;
  telefono.value = usuarios.telefono;
  password.value = "",
  rol.value = usuarios.rol;

  mostrarFormularioAgregarUsuarios.value = false;
  mostrarFormularioEditarUsuarios.value = true;
};

const editarUsuario = async () => {
  try {
    const select = sede.value
    const label = select.label

    // Verificar si se encontró la máquina seleccionada
    if (!select) {
      console.error("Máquina seleccionada no encontrada", select);
      console.log("Máquina seleccionada:", label);
      return;
      }

    const idSede = select.id;

    console.log("sede seleccionada:", rol.value);
    const sele = rol.value
    const labe = sele.label
    console.log("sede seleccionada:", sele);

    // Verificar si se encontró la máquina seleccionada
    if (!sele) {
      console.error("Máquina seleccionada no encontrada", sele);
      return;
      }

    const datosUsuario = {
      sede: idSede,
      nombre: nombre.value,
      email: email.value,
      telefono: telefono.value,
      password: password.value,
      rol: labe,
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
  listarUsuarios(),
  listarSedes()
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
    <div class="q-pa-md" v-if="!visible">
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
        <div style="margin-left: 5%; text-align: end; margin-right: 5%" class="q-mb-md">
          <q-btn label="Agregar Usuario" @click="mostrarFormularioAgregarUsuarios = true" >
          <!-- <q-btn label="Editar Usuario" @click="mostrarFormularioEditarUsuarios = true" /> -->
          <q-tooltip>
                {{ 'Agregar Usuario' }}
              </q-tooltip>
            </q-btn>
        </div>

        <!-- Formulario para agregar usuario -->
        <q-dialog v-model="mostrarFormularioAgregarUsuarios">
          <q-card>
            <q-card-section>
              <div class="text-h6">Agregar Usuario</div>
            </q-card-section>
            <q-card-section>
              <q-form @submit.prevent="agregarUsuario">
                <q-select v-model="sede" label="Sede" filled outlined :options="sedeOptions" class="q-mb-md" style="max-width: 100%;" >
                  <template v-slot:no-option>
                      <q-item>
                        <q-item-section>
                          No results
                        </q-item-section>
                      </q-item>
                    </template>
                  </q-select>
                <q-input v-model="nombre" label="Nombre" filled outlined autocomplete="username" @dblclick="selectAllText" class="q-mb-md" />
                <q-input v-model="email" label="Email" filled type="email" outlined autocomplete="email" class="q-mb-md" />
                <q-input v-model="telefono" label="Telefono" filled type="tel" outlined autocomplete="tel"
                  @dblclick="selectAllText" class="q-mb-md" />
                <q-input v-model="password" filled :type="showPassword ? 'text' : 'password'" placeholder="Password"
                  autocomplete="current-password" @dblclick="selectAllText" class="q-mb-md" >
                  <template v-slot:append>
                    <div class="eye-wrapper" @click="togglePasswordVisibility">
                      <div style="display: flex; flex-direction: column;">
                        <svg class="eye-icon" width="24" height="24" viewBox="0 0 24 24" style="margin-bottom: -13px;">
                          <!-- Inserta aquí el SVG del ojo abierto -->
                          <path fill="currentColor"
                            d="M11.999 4.5c-3.598 0-6.59 2.399-7.633 5.662a.75.75 0 1 0 1.395.548c.808-2.387 3.083-4.21 6.238-4.21 3.17 0 5.45 1.83 6.262 4.236a.75.75 0 1 0 1.387-.556C18.605 6.919 15.614 4.5 11.999 4.5zm0 2.25c1.875 0 3.463 1.299 4.256 3.001a.75.75 0 0 0 1.418-.49C16.729 9.42 14.253 8.25 11.999 8.25s-4.732 1.169-5.674 2.511a.75.75 0 1 0 1.414.487c.776-1.62 2.701-2.748 5.259-2.748zm0 3.375a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5z" />
                        </svg>
                        <svg class="eye-icon" width="24" height="24" viewBox="0 0 24 24"
                          style="transform: rotate(180deg); margin-top: -13px; animation: flip 1s;">
                          <!-- SVG del ojo al revés -->
                          <path fill="currentColor"
                            d="M11.999 4.5c-3.598 0-6.59 2.399-7.633 5.662a.75.75 0 1 0 1.395.548c.808-2.387 3.083-4.21 6.238-4.21 3.17 0 5.45 1.83 6.262 4.236a.75.75 0 1 0 1.387-.556C18.605 6.919 15.614 4.5 11.999 4.5zm0 2.25c1.875 0 3.463 1.299 4.256 3.001a.75.75 0 0 0 1.418-.49C16.729 9.42 14.253 8.25 11.999 8.25s-4.732 1.169-5.674 2.511a.75.75 0 1 0 1.414.487c.776-1.62 2.701-2.748 5.259-2.748zm0 3.375a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5z" />
                        </svg>
                      </div>
                    </div>
                  </template>
                </q-input>
                <q-select v-model="rol" label="Rol" filled outlined :options="rolOptions" class="q-mb-md" @dblclick="selectAllText"  style="max-width: 100%;" />
                <q-select v-model="estado" label="Estado" filled outlined :options="estadoOptions" class="q-mb-md"  style="max-width: 100%;" />
                <q-btn @click="cancelarUsuario" label="Cancelar" class="q-ma-sm">
                <q-tooltip>
                    {{ 'Cancelar' }}
                  </q-tooltip>
                </q-btn>                
                <q-btn type="submit" label="Guardar Usuario" color="primary" class="q-ma-sm">
                <q-tooltip>
                {{ 'Guardar Usuario' }}
              </q-tooltip>
            </q-btn>
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
                <q-select v-model="sede" label="Sede" filled outlined :options="sedeOptions" class="q-mb-md" style="max-width: 100%;" >
                  <template v-slot:no-option>
                      <q-item>
                        <q-item-section>
                          No results
                        </q-item-section>
                      </q-item>
                    </template>
                  </q-select>
                <q-input v-model="nombre" label="Nombre" filled outlined autocomplete="username" @dblclick="selectAllText" class="q-mb-md" />
                <q-input v-model="email" label="Email" type="email" filled outlined autocomplete="email" class="q-mb-md" />
                <q-input v-model="telefono" label="Telefono" type="tel" filled outlined autocomplete="tel" @dblclick="selectAllText" class="q-mb-md" />
                <q-input v-model="password" filled :type="showPassword ? 'text' : 'password'" placeholder="Password"
                  autocomplete="current-password" @dblclick="selectAllText" class="q-mb-md" >
                  <template v-slot:append>
                    <div class="eye-wrapper" @click="togglePasswordVisibility">
                      <div style="display: flex; flex-direction: column;">
                        <svg class="eye-icon" width="24" height="24" viewBox="0 0 24 24" style="margin-bottom: -13px;">
                          <!-- Inserta aquí el SVG del ojo abierto -->
                          <path fill="currentColor"
                            d="M11.999 4.5c-3.598 0-6.59 2.399-7.633 5.662a.75.75 0 1 0 1.395.548c.808-2.387 3.083-4.21 6.238-4.21 3.17 0 5.45 1.83 6.262 4.236a.75.75 0 1 0 1.387-.556C18.605 6.919 15.614 4.5 11.999 4.5zm0 2.25c1.875 0 3.463 1.299 4.256 3.001a.75.75 0 0 0 1.418-.49C16.729 9.42 14.253 8.25 11.999 8.25s-4.732 1.169-5.674 2.511a.75.75 0 1 0 1.414.487c.776-1.62 2.701-2.748 5.259-2.748zm0 3.375a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5z" />
                        </svg>
                        <svg class="eye-icon" width="24" height="24" viewBox="0 0 24 24"
                          style="transform: rotate(180deg); margin-top: -13px; animation: flip 1s;">
                          <!-- SVG del ojo al revés -->
                          <path fill="currentColor"
                            d="M11.999 4.5c-3.598 0-6.59 2.399-7.633 5.662a.75.75 0 1 0 1.395.548c.808-2.387 3.083-4.21 6.238-4.21 3.17 0 5.45 1.83 6.262 4.236a.75.75 0 1 0 1.387-.556C18.605 6.919 15.614 4.5 11.999 4.5zm0 2.25c1.875 0 3.463 1.299 4.256 3.001a.75.75 0 0 0 1.418-.49C16.729 9.42 14.253 8.25 11.999 8.25s-4.732 1.169-5.674 2.511a.75.75 0 1 0 1.414.487c.776-1.62 2.701-2.748 5.259-2.748zm0 3.375a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5z" />
                        </svg>
                      </div>
                    </div>
                  </template>
                </q-input>
                <q-select v-model="rol" label="Rol" filled outlined :options="rolOptions" class="q-mb-md" @dblclick="selectAllText" style="max-width: 100%;" />
                <q-btn @click="cancelarUsuario" label="Cancelar" class="q-ma-sm">
                <q-tooltip>
                    {{ 'Cancelar' }}
                  </q-tooltip>
                </q-btn>
                <q-btn type="submit" label="Guardar cambios" color="primary" class="q-ma-sm">
                <q-tooltip>
                {{ 'Guardar cambios' }}
              </q-tooltip>
            </q-btn>
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
            <q-btn @click="mostrarDatosParaEditar(props.row)">
              ✏️
            <q-tooltip>
                {{ 'Editar Usuario' }}
              </q-tooltip>
            </q-btn>
            <q-btn v-if="props.row.estado == 1" @click="inactivarUsuario(props.row._id)">
              ❌
              <q-tooltip>
                {{ 'Inactivar Usuario' }}
              </q-tooltip>
            </q-btn>
            <q-btn v-else @click="activarUsuario(props.row._id)">
              ✅
              <q-tooltip>
                {{ 'Activar Usuario' }}
              </q-tooltip>
            </q-btn>
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
  <q-inner-loading :showing="visible" label="Por favor espere..." label-class="text-teal"
    label-style="font-size: 1.1em" />
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
