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

watch(selectedOption, () => {
  actualizarListadoUsuarios();
});
</script>

<template>
  <div>
    <div class="q-pa-md">
      <div>
        <h3 style="text-align: center; margin: 10px">Usuarios</h3>
        <hr style="width: 70%; height: 5px; background-color: green" />
      </div>

      <div
        class="contSelect"
        style="margin-left: 5%; text-align: end; margin-right: 5%"
      >
        <q-select
          background-color="green"
          class="q-my-md"
          v-model="selectedOption"
          outlined
          dense
          options-dense
          emit-value
          :options="options"
        />

        <input
          v-if="selectedOption === 'Listar Usuario por su Email'"
          v-model="emailUsuario"
          class="q-my-md"
          type="email"
          name="emailUsuario"
          id="emailUsuario"
          placeholder="Ingrese el email del usuario"
        />
      </div>

      <q-table
        flat
        bordered
        title="Usuarios"
        title-class="text-green text-weight-bolder text-h5"
        :rows="filteredRows"
        :columns="columns"
        row-key="id"
      >
        <q-select
          background-color="green"
          class="q-my-md"
          v-model="selectedOption"
          outlined
          dense
          options-dense
          emit-value
          :options="options"
        />
        <template v-slot:body-cell-opciones="props">
          <q-td :props="props">
            <q-btn @click="putUsuarios(props.row._id)">✏️</q-btn>
            <q-btn
              v-if="props.row.estado == 1"
              @click="inactivarUsuario(props.row._id)"
            >
              ❌
            </q-btn>
            <q-btn v-else @click="activarUsuario(props.row._id)">✅</q-btn>
          </q-td>
        </template>

        <template class="a" v-slot:body-cell-estado="props">
          <q-td class="b" :props="props">
            <p
              :style="{
                color: props.row.estado === 1 ? 'green' : 'red',
                margin: 0,
              }"
            >
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

.q-select {
  max-width: 200px;
  /* Puedes ajustar el ancho según tu preferencia */
}

.q-my-md {
  max-width: 500px;
  padding-left: 10px;
}
</style>
