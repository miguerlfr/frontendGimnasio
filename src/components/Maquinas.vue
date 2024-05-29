<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useStoreMaquinas } from "../stores/Maquinas.js";
import { format } from "date-fns";

const useMaquina = useStoreMaquinas();

const codigoMaquina = ref("");

const selectedOption = ref("Listar Máquinas"); // Establecer 'Listar Máquinas' como valor por defecto
const options = [
  { label: "Listar Máquinas", value: "Listar Máquinas" },
  { label: "Listar Máquina por Código", value: "Listar Máquina por Código" },
  { label: "Listar Máquinas Activas", value: "Listar Máquinas Activas" },
  { label: "Listar Máquinas Inactivas", value: "Listar Máquinas Inactivas" },
  { label: "Agregar Máquina", value: "Agregar Máquina" },
];

let rows = ref([]);
const columns = ref([
  { name: "codigo", label: "Código", field: "codigo", align: "center" },
  { name: "sede", label: "Sede", field: "sede", align: "center" },
  {
    name: "descripcion",
    label: "Descripción",
    field: "descripcion",
    align: "center",
  },
  {
    name: "fechaIngreso",
    label: "Fecha de Ingreso",
    field: (row) => {
      const fecha = new Date(row.fechaIngreso);
      fecha.setDate(fecha.getDate() + 1);
      const fechaFormateada = format(fecha, "dd/MM/yyyy");
      return fechaFormateada;
    },
    align: "center",
  },
  {
    name: "fechaUltMan",
    label: "Fecha de Último Mantenimiento",
    field: (row) => {
      const fecha = new Date(row.fechaUltMan);
      fecha.setDate(fecha.getDate() + 1);
      const fechaFormateada = format(fecha, "dd/MM/yyyy");
      return fechaFormateada;
    },
    align: "center",
  },
  { name: "estado", label: "Estado", field: "estado", align: "center" },
  { name: "opciones", label: "Opciones", field: "opciones", align: "center" },
]);

// Función computada para manejar la lógica de qué datos mostrar
const filteredRows = computed(() => {
  switch (selectedOption.value) {
    case "Listar Máquina por Código":
      return listarmaquinaCodigo.value;
    default:
      return rows.value;
  }
});

async function listarMaquinas() {
  const r = await useMaquina.getMaquinas();
  // console.log(r.data);
  rows.value = r.data.maquinas;
}

async function listarMaquinasActivas() {
  const r = await useMaquina.getMaquinasActivas();
  console.log(r);
  rows.value = r.data.maquinasAc;
}

async function listarMaquinasInactivas() {
  const r = await useMaquina.getMaquinasInactivas();
  // console.log(r.data);
  rows.value = r.data.maquinasIn;
}

const listarmaquinaCodigo = computed(() => {
  if (
    selectedOption.value === "Listar Máquina por Código" &&
    codigoMaquina.value
  ) {
    const codigoInput = codigoMaquina.value; // Obtener el código ingresado por el usuario
    return rows.value.filter((row) =>
      row.codigo.toString().includes(codigoInput)
    );
  } else {
    return rows.value;
  }
});

const actualizarListadoMaquinas = () => {
  switch (selectedOption.value) {
    case "Listar Máquinas Activas":
      listarMaquinasActivas();
      break;
    case "Listar Máquinas Inactivas":
      listarMaquinasInactivas();
      break;
    default:
      listarMaquinas();
      break;
  }
};

async function inactivarMaquina(id) {
  const r = await useMaquina.putMaquinasInactivar(id);
  console.log(r.data);
  actualizarListadoMaquinas();
}

async function activarMaquina(id) {
  const r = await useMaquina.putMaquinasActivar(id);
  console.log(r.data);
  actualizarListadoMaquinas();
}

onMounted(() => {
  listarMaquinas();
});

watch(selectedOption, () => {
  actualizarListadoMaquinas();
});

</script>

<template>
  <div>
    <div class="q-pa-md">
      <div>
        <h3 style="text-align: center; margin: 10px">Máquinas</h3>
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
          v-if="selectedOption === 'Listar Máquina por Código'"
          v-model="codigoMaquina"
          class="q-my-md"
          type="text"
          name="search"
          id="codigoMaquina"
          placeholder="Ingrese el código del cliente"
        />
      </div>

      <q-table
        flat
        bordered
        title="Maquinas"
        title-class="text-green text-weight-bolder text-h5"
        :rows="filteredRows"
        :columns="columns"
        row-key="id"
      >
        <template v-slot:body-cell-opciones="props">
          <q-td :props="props">
            <q-btn @click="putMaquinas(props.row._id)">✏️</q-btn>
            <q-btn
              v-if="props.row.estado == 1"
              @click="inactivarMaquina(props.row._id)"
            >
              ❌
            </q-btn>
            <q-btn v-else @click="activarMaquina(props.row._id)">✅</q-btn>
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
