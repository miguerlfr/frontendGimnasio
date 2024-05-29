<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useStoreSedes } from "../stores/Sedes.js";

const useSede = useStoreSedes();

const codigoSede = ref("")

const selectedOption = ref("Listar Sedes"); // Establecer 'Listar Sedes' como valor por defecto
const options = [
  { label: "Listar Sedes", value: "Listar Sedes" },
  { label: "Listar Sede por Código", value: "Listar Sede por Código" },
  { label: "Listar Sedes Activas", value: "Listar Sedes Activas" },
  { label: "Listar Sedes Inactivas", value: "Listar Sedes Inactivas" },
  { label: "Agregar Sede", value: "Agregar Sede" },
];

let rows = ref([]);
const columns = ref([
  { name: "nombre", label: "Nombre", field: "nombre", align: "center" },
  {
    name: "direccion",
    label: "Dirección",
    field: "direccion",
    align: "center",
  },
  { name: "codigo", label: "Código", field: "codigo", align: "center" },
  { name: "horario", label: "Horario", field: "horario", align: "center" },
  { name: "ciudad", label: "Ciudad", field: "ciudad", align: "center" },
  { name: "telefono", label: "Teléfono", field: "telefono", align: "center" },
  { name: "estado", label: "Estado", field: "estado", align: "center" },
  { name: "opciones", label: "Opciones", field: "opciones", align: "center" },
]);

// Función computada para manejar la lógica de qué datos mostrar
const filteredRows = computed(() => {
  switch (selectedOption.value) {
    case "Listar Sede por Código":
      return listarSedeCodigo.value;
    default:
      return rows.value;
  }
});

async function listarSedes() {
  const r = await useSede.getSedes();
  console.log(r.data);
  rows.value = r.data.sedes;
}

// Función computada para filtrar las sedes por código
const listarSedeCodigo = computed(() => {
  if (
    selectedOption.value === "Listar Sede por Código" &&
    codigoSede.value.trim() !== ""
  ) {
    const codigoInput = codigoSede.value.trim(); // Obtener el código ingresado por el usuario
    return rows.value.filter((sede) =>
      sede.codigo.toString().includes(codigoInput)
    );
  } else {
    return rows.value; // Devuelve todas las sedes si no hay un código especificado
  }
});

async function listarSedesActivos(id) {
  const r = await useSede.getSedesActivas();
  // console.log(r);
  rows.value = r.data.sedesAc;
}

async function listarSedesInactivos(id) {
  const r = await useSede.getSedesInactivas();
  // console.log(r);
  rows.value = r.data.sedesIn;
}

async function inactivarSede(id) {
  const r = await useSede.putSedesInactivar(id);
  console.log(r.data);
  actualizarListadoSedes();
}

async function activarSede(id) {
  const r = await useSede.putSedesActivar(id);
  console.log(r.data);
  actualizarListadoSedes();
}

const actualizarListadoSedes = () => {
  switch (selectedOption.value) {
    case "Listar Sedes Activas":
      listarSedesActivos();
      break;
    case "Listar Sedes Inactivas":
      listarSedesInactivos();
      break;
    default:
      listarSedes();
      break;
  }
};

onMounted(() => {
  listarSedes();
});

watch(selectedOption, () => {
  actualizarListadoSedes();
});
</script>

<template>
  <div>
    <div class="q-pa-md">
      <div>
        <h3 style="text-align: center; margin: 10px">Sedes</h3>
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
          v-if="selectedOption === 'Listar Sede por Código'"
          v-model="codigoSede"
          class="q-my-md"
          type="text"
          name="codigoSede"
          id="codigoSede"
          placeholder="Ingrese el código de la sede"
        />
      </div>

      <q-table
        flat
        bordered
        title="Sedes"
        title-class="text-green text-weight-bolder text-h5"
        :rows="filteredRows"
        :columns="columns"
        row-key="id"
      >
        <template v-slot:body-cell-opciones="props">
          <q-td :props="props">
            <q-btn @click="putSedes(props.row._id)">✏️</q-btn>
            <q-btn
              v-if="props.row.estado == 1"
              @click="inactivarSede(props.row._id)"
            >
              ❌
            </q-btn>
            <q-btn v-else @click="activarSede(props.row._id)">✅</q-btn>
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
