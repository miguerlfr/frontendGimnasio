<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { notifyErrorRequest } from "../routes/routes.js";
import { useStoreUsuarios } from "../stores/Usuarios.js";
import { useStoreSedes } from "../stores/Sedes.js";

// Loading
const visible = ref(true);
const loadingg = ref(true)

// Variables parra mostrar formularios
const mostrarFormularioAgregarUsuarios = ref(false);
const mostrarFormularioEditarUsuarios = ref(false);

// Variables del input para peticiones get
const emailUsuario = ref("");

const isPwd = ref(true);

// Variables de los inputs de agregar y editar
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

const selectedOption = ref("Listar Usuarios");

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

// Array de modelo de sedes
const sedes = ref([])

const rolOptions = [
  { label: "Administrador" },
  { label: "Recepcionista" },
  { label: "Instructor" }
];

// Opciones de filtro
const options = [
  { label: "Listar Usuarios", value: "Listar Usuarios" },
  { label: "Listar Usuario por su Email", value: "Listar Usuario por su Email" },
  { label: "Listar Usuarios Activos", value: "Listar Usuarios Activos" },
  { label: "Listar Usuarios Inactivos", value: "Listar Usuarios Inactivos" }
];

// Llamado de modelos
const useUsuario = useStoreUsuarios();
const useSede = useStoreSedes();

// Funciones async
async function listarSedes() {
  const r = await useSede.getSedes();
  sedes.value = r.data.sedes;
  // console.log("Sedes:", sedes.value);
}

async function actualizarListadoUsuarios() {
  loadingg.value = true;
  try {
    const usuariosPromise = selectedOption.value === "Listar Usuarios Activos"
      ? useUsuario.getUsuariosActivos()
      : selectedOption.value === "Listar Usuarios Inactivos"
        ? useUsuario.getUsuariosInactivos()
        : useUsuario.getUsuarios();

    rows.value = (await usuariosPromise).data.usuarios
    console.log("Usuarios", rows.value);
  } finally {
    loadingg.value = false;
    visible.value = false;
  }
}

async function inactivarUsuario(id) {
  const r = await useUsuario.putUsuariosInactivar(id);
  // console.log(r.data);
  actualizarListadoUsuarios();
}

async function activarUsuario(id) {
  const r = await useUsuario.putUsuariosActivar(id);
  // console.log(r.data);
  actualizarListadoUsuarios();
}

const agregarUsuario = async () => {
  const datosUsuario = {
    sede: sede.value.id,
    nombre: nombre.value,
    email: email.value,
    telefono: telefono.value,
    password: password.value,
    rol: rol.value.label,
    estado: estado.value === "Activo" ? 1 : 0
  };

  if (await validarDatosUsuario(datosUsuario)) {
    const r = await useUsuario.postUsuarios(datosUsuario);
    if (r.status == 200) {
      mostrarFormularioAgregarUsuarios.value = false;
      actualizarListadoUsuarios();
      estado.value = "Activo";
      console.log("Usuario agregado exitosamente", datosUsuario);
    }
  }
};

const editarUsuario = async () => {
  let idSede = sede.value.id

  // Por si no cambio de sede tomar el valor del id de la sede
  for (let sedee of sedes.value) {
    if (sedee.nombre === sede.value) {
      if (sedee.estado == 1) {
        idSede = sedee._id;
        break;
      } else {
        notifyErrorRequest("Sede seleccionada inactiva")
        return;
      }
    }
  }
  const datosUsuario = {
    sede: idSede,
    nombre: nombre.value,
    email: email.value,
    telefono: telefono.value,
    // password: password.value,
    rol: rol.value ? (rol.value.label ? rol.value.label : rol.value) : '',
  };

  if (await validarDatosUsuario(datosUsuario)) {
    const r = await useUsuario.putUsuarios(selectedUsuarioId.value, datosUsuario);
    if (r.status == 200) {
      mostrarFormularioEditarUsuarios.value = false;
      actualizarListadoUsuarios();
      console.log("Usuario editado exitosamente", datosUsuario);
    }
  }
};

// Funciones auxiliares
const limpiarCampos = () => {
  sede.value = "";
  nombre.value = "";
  email.value = "";
  telefono.value = "";
  password.value = "";
  rol.value = "";
};

const mostrarDatosParaEditar = (usuarios) => {
  console.log("usuario a editar:", usuarios);

  selectedUsuarioId.value = usuarios._id;
  sede.value = usuarios.sede.nombre;
  nombre.value = usuarios.nombre;
  email.value = usuarios.email;
  telefono.value = usuarios.telefono;
  // password.value = "";
  rol.value = usuarios.rol;

  mostrarFormularioAgregarUsuarios.value = false;
  mostrarFormularioEditarUsuarios.value = true;
};

async function validarDatosUsuario(usuario) {
  const { sede, rol } = usuario;

  if (sede == undefined) {
    notifyErrorRequest('La sede es requerida.');
    return false;
  }
  if (rol == undefined) {
    notifyErrorRequest('El rol es requerido.');
    return false;
  }
  return true;
}

// Funciones computadas
const filtrarFilas = computed(() => {
  if (loadingg.value) {
    return []; // Retorna una lista vacía mientras se está cargando
  }

  if (selectedOption.value === "Listar Usuario por su Email" && emailUsuario.value) {
    const searchTerm = emailUsuario.value;
    return rows.value.filter(usuario =>
      usuario.email.includes(searchTerm)
    );
  }
  return rows.value;
});

const sedeOptions = computed(() => {
  return sedes.value
    .filter(sede => sede.estado !== 0)
    .map(sede => ({
      label: sede.nombre,
      id: sede._id,
    }));
});

// Propiedad calculada para comprobar si el usuario es un administrador
const esAdmin = computed(() => useUsuario.user.rol === 'Administrador');

const isLoading = computed(() => visible.value);

// Funciones auxiliares
// const mostrarContraseña = ref(false);
// const alternarVisibilidadContraseña = () => {
//   mostrarContraseña.value = !mostrarContraseña.value;
// };
const seleccionarTodoElTexto = (event) => {
  const input = event.target;
  input.select();
};

// Montaje
onMounted(() => {
  actualizarListadoUsuarios();
  listarSedes()
});

watch(selectedOption, () =>
  actualizarListadoUsuarios(),
  isLoading,
  loadingg
);
</script>

<template>
  <div class="q-pa-md" v-if="!visible">
    <div>
      <h3 style="text-align: center; margin: 10px">Usuarios</h3>
      <hr style="width: 70%; height: 5px; background-color: green" />
    </div>

    <div class="contSelect" style="margin-left: 5%; text-align: end; margin-right: 5%">
      <q-select background-color="green" class="q-my-md" v-model="selectedOption" outlined dense options-dense
        emit-value :options="options" />

      <input v-if="selectedOption === 'Listar Usuario por su Email'" v-model="emailUsuario" class="q-my-md" type="email"
        name="emailUsuario" id="emailUsuario" placeholder="Email del usuario" />
    </div>

    <div>
      <div style="margin-left: 5%; text-align: end; margin-right: 5%" class="q-mb-md">
        <q-btn label="Agregar Usuario" @click="mostrarFormularioAgregarUsuarios = true">
          <!-- <q-btn label="Editar Usuario" @click="mostrarFormularioEditarUsuarios = true" /> -->
          <q-tooltip>
            Agregar Usuario
          </q-tooltip>
        </q-btn>
      </div>

      <!-- Formulario para agregar usuario -->
      <q-dialog v-model="mostrarFormularioAgregarUsuarios" v-bind="mostrarFormularioAgregarUsuarios && limpiarCampos()">
        <q-card>
          <q-card-section>
            <div class="text-h6">Agregar Usuario</div>
          </q-card-section>
          <q-card-section>
            <q-form @submit.prevent="agregarUsuario">
              <q-select v-model="sede" label="Sede" filled outlined :options="sedeOptions" class="q-mb-md"
                style="max-width: 100%;">
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section>
                      No results
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
              <q-input v-model.trim="nombre" label="Nombre" filled outlined autocomplete="username"
                @dblclick="seleccionarTodoElTexto" class="q-mb-md" required />
              <q-input v-model.trim="email" label="Email" filled type="email" outlined autocomplete="email"
                class="q-mb-md" required />
              <q-input v-model="telefono" label="Telefono" type="number" filled outlined autocomplete="tel"
                @dblclick="seleccionarTodoElTexto" class="q-mb-md" min="0" required />

              <q-input v-model="password" filled :type="isPwd ? 'password' : 'text'" placeholder="Password"
                class="q-mb-md">
                <template v-slot:append>
                  <q-icon :name="isPwd ? 'visibility_off' : 'visibility'" class="cursor-pointer"
                    @click="isPwd = !isPwd" />
                </template>
              </q-input>

              <q-select v-model="rol" label="Rol" filled outlined :options="rolOptions" class="q-mb-md"
                @dblclick="seleccionarTodoElTexto" style="max-width: 100%;" />
              <q-select v-model="estado" label="Estado" filled outlined :options="estadoOptions" class="q-mb-md"
                style="max-width: 100%;" />
              <q-btn @click="mostrarFormularioAgregarUsuarios = false" label="Cancelar" class="q-ma-sm">
                <q-tooltip>
                  Cancelar
                </q-tooltip>
              </q-btn>
              <q-btn :loading="useUsuario.loading" :disable="useUsuario.loading" type="submit" label="Guardar Usuario"
                color="primary" class="q-ma-sm">
                <q-tooltip>
                  Guardar Usuario
                </q-tooltip>
                <template v-slot:loading>
                  <q-spinner color="white" size="1em" />
                </template>
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
              <q-select v-model="sede" label="Sede" filled outlined :options="sedeOptions" class="q-mb-md"
                style="max-width: 100%;">
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section>
                      No results
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
              <q-input v-model.trim="nombre" label="Nombre" filled outlined autocomplete="username"
                @dblclick="seleccionarTodoElTexto" class="q-mb-md" required />
              <q-input v-model.trim="email" label="Email" type="email" filled outlined autocomplete="email"
                class="q-mb-md" required />
              <q-input v-model="telefono" label="Telefono" type="number" filled outlined autocomplete="tel"
                @dblclick="seleccionarTodoElTexto" class="q-mb-md" min="0" required />

              <!-- <q-input v-model="password" filled :type="isPwd ? 'password' : 'text'" placeholder="Password"
                  class="q-m|b-md">
                  <template v-slot:append>
                    <q-icon :name="isPwd ? 'visibility_off' : 'visibility'" class="cursor-pointer"
                      @click="isPwd = !isPwd" />
                  </template>
                </q-input> -->

              <q-select v-model="rol" label="Rol" filled outlined :options="rolOptions" class="q-mb-md"
                @dblclick="seleccionarTodoElTexto" style="max-width: 100%;" />
              <q-btn @click="mostrarFormularioEditarUsuarios = false" label="Cancelar" class="q-ma-sm">
                <q-tooltip>
                  Cancelar
                </q-tooltip>
              </q-btn>
              <q-btn :loading="useUsuario.loading" :disable="useUsuario.loading" type="submit" label="Guardar cambios"
                color="primary" class="q-ma-sm">
                <q-tooltip>
                  Guardar cambios
                </q-tooltip>
                <template v-slot:loading>
                  <q-spinner color="white" size="1em" />
                </template>
              </q-btn>
            </q-form>
          </q-card-section>
        </q-card>
      </q-dialog>
    </div>

    <q-table flat bordered title="Usuarios" title-class="text-green text-weight-bolder text-h5" :rows="filtrarFilas"
      :columns="columns" row-key="id" :loading="loadingg">

      <q-select background-color="green" class="q-my-md" v-model="selectedOption" outlined dense options-dense
        emit-value :options="options" />
      <template v-slot:body-cell-opciones="props">
        <q-td :props="props">
          <q-btn @click="mostrarDatosParaEditar(props.row)">
            ✏️
            <q-tooltip>
              Editar Usuario
            </q-tooltip>
          </q-btn>
          <!-- Botón para Inactivar Usuario -->
          <q-btn v-if="!(props.row._id === useUsuario.user._id && esAdmin) && props.row.estado === 1"
            @click="inactivarUsuario(props.row._id)">
            ❌
            <q-tooltip>
              Inactivar Usuario
            </q-tooltip>
          </q-btn>

          <!-- Botón para Activar Usuario -->
          <q-btn v-if="!(props.row._id === useUsuario.user._id && esAdmin) && props.row.estado === 0"
            @click="activarUsuario(props.row._id)">
            ✅
            <q-tooltip>
              Activar Usuario
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

      <template v-slot:loading>
        <q-inner-loading :showing="loadingg" label="Por favor espere..." label-class="text-teal"
          label-style="font-size: 1.1em">
        </q-inner-loading>
      </template>
    </q-table>
  </div>
  <q-inner-loading :showing="isLoading" label="Por favor espere..." label-class="text-teal"
    label-style="font-size: 1.1em" />
</template>

<style scoped>
.contSelect {
  display: flex;
  flex-direction: row;
  gap: 20px;
}

.q-select {
  max-width: 200px;
}

.q-my-md {
  max-width: 500px;
  padding-left: 10px;
}
</style>
