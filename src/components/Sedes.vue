<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useStoreSedes } from "../stores/Sedes.js";

const useSede = useStoreSedes();

const codigoSede = ref("")

function formatoNumerico(numero) {
    return typeof numero === 'number' ? numero.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") : undefined;
}

const selectedOption = ref("Listar Sedes"); // Establecer 'Listar Sedes' como valor por defecto
const options = [
  { label: "Listar Sedes", value: "Listar Sedes" },
  { label: "Listar Sede por Código", value: "Listar Sede por Código" },
  { label: "Listar Sedes Activas", value: "Listar Sedes Activas" },
  { label: "Listar Sedes Inactivas", value: "Listar Sedes Inactivas" },
  // { label: "Agregar Sede", value: "Agregar Sede" },
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
  { name: "codigo", label: "Código", field: (row) => formatoNumerico(row.codigo), align: "center" },
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




const mostrarFormularioAgregarSedes = ref(false);
const mostrarFormularioEditarSedes = ref(false);

const selectedSedeId = ref(null);
const nombre = ref("");
const direccion = ref("");
const codigo = ref("");
const horario = ref("");
const ciudad = ref("");
const telefono = ref("");

const estadoOptions = [
  { label: "Activo" }, // Agrega el valor 'Activo' aquí
  { label: "Inactivo" }, // Agrega el valor 'Inactivo' aquí
];
const estado = ref(estadoOptions.find(option => option.label === "Activo").label);
const limpiarCamposSede = () => {
  nombre.value = "";
  direccion.value = ""
  codigo.value = "";
  horario.value = "";
  ciudad.value = "";
  telefono.value = "";
};
const agregarSede = async () => {
  try {
    const datosSede = {
      nombre: nombre.value,
      direccion: direccion.value,
      codigo: codigo.value,
      horario: horario.value,
      ciudad: ciudad.value,
      telefono: telefono.value,
      estado: estadoOptions.find(option => option.label === estado.value).value,
    };

    const response = await useSede.postSedes(datosSede);
    if (response.status === 200) {
      listarSedes();
      estado.value = "Activo";
      limpiarCamposSede();
    } else {
      console.error('Error al agregar el sede:', response.data);
    }
  } catch (error) {
    console.error('Error al agregar el sede:', error);
  }
};
const editarSede = async () => {
  try {
    const datosSede = {
      nombre: nombre.value,
      direccion: direccion.value,
      codigo: codigo.value,
      horario: horario.value,
      ciudad: ciudad.value,
      telefono: telefono.value,
    };

    const response = await useSede.putSedes(selectedSedeId.value, datosSede);
    if (response.status === 200) {
      listarSedes();
      nombre.value = "";
      direccion.value = ""
      codigo.value = "";
      horario.value = "";
      ciudad.value = "";
      telefono.value = "";
      mostrarFormularioEditarSedes.value = false;
    } else {
      console.error('Error al editar el sede:', response.data);
    }
  } catch (error) {
    console.error('Error al editar el sede:', error);
  }
};
const mostrarDatosParaEditar = (sedes) => {
  console.log("Sede a editar:", sedes);  // Añadido para depuración
  selectedSedeId.value = sedes._id;  // Corregido
  nombre.value = sedes.nombre;
  direccion.value = sedes.direccion;
  codigo.value = sedes.codigo;
  horario.value = sedes.horario;
  ciudad.value = sedes.ciudad;
  telefono.value = sedes.telefono;

  mostrarFormularioAgregarSedes.value = false;
  mostrarFormularioEditarSedes.value = true;
};
const cancelarSede = () => {
  limpiarCamposSede();
  mostrarFormularioAgregarSedes.value = false;
  mostrarFormularioEditarSedes.value = false;
};;

onMounted(() => {
  listarSedes();
});
watch(selectedOption, (newValue) => {
  actualizarListadoSedes();
  if (newValue === "Agregar Sede") {
    mostrarFormularioAgregarSedes.value = true;
    mostrarFormularioEditarSedes.value = false;
    limpiarCamposSede()
  } else {
    mostrarFormularioEditarSedes.value = false;
    mostrarFormularioAgregarSedes.value = false;
  }
});
</script>

<template>
  <div>
    <div class="q-pa-md">
      <div>
        <h3 style="text-align: center; margin: 10px">Sedes</h3>
        <hr style="width: 70%; height: 5px; background-color: green" />
      </div>

      <div class="contSelect" style="margin-left: 5%; text-align: end; margin-right: 5%">
        <q-select background-color="green" class="q-my-md" v-model="selectedOption" outlined dense options-dense
          emit-value :options="options" />

        <input v-if="selectedOption === 'Listar Sede por Código'" v-model="codigoSede" class="q-my-md" type="text"
          name="codigoSede" id="codigoSede" placeholder="Ingrese el código de la sede" />
      </div>

      <div>
        <div style="margin-left: 5%; text-align: end; margin-right: 5%" class="q-mb-md">
          <div style="margin-left: 5%; text-align: end; margin-right: 5%" class="q-mb-md">
            <q-btn label="Agregar Sede" @click="mostrarFormularioAgregarSedes = true" />
          </div>

        </div>
        <!-- Dialogo para agregar sede -->
        <q-dialog v-model="mostrarFormularioAgregarSedes">
          <q-card>
            <q-card-section>
              <div class="text-h6">Agregar Sede</div>
            </q-card-section>

            <q-card-section>
              <q-form @submit.prevent="agregarSede">
                <q-input v-model="nombre" label="Nombre" filled required class="q-mb-md" />
                <q-input v-model="direccion" label="Dirección" filled required class="q-mb-md" />
                <q-input v-model="codigo" label="Código" type="number" filled required class="q-mb-md" />
                <q-input v-model="horario" label="Horario" filled required class="q-mb-md" />
                <q-input v-model="ciudad" label="Ciudad" filled required class="q-mb-md" />
                <q-input v-model="telefono" label="Teléfono" filled required class="q-mb-md" />
                <q-select v-model="estado" label="Estado" filled required :options="estadoOptions" class="q-mb-md" />
                <div class="q-mt-md">
                  <q-btn @click="cancelarSede" label="Cancelar" class="q-mr-sm" />
                  <q-btn type="submit" label="Agregar Sede" color="primary" class="q-ma-sm" />
                </div>
              </q-form>
            </q-card-section>
          </q-card>
        </q-dialog>

        <!-- Dialogo para editar sede -->
        <q-dialog v-model="mostrarFormularioEditarSedes">
          <q-card>
            <q-card-section>
              <div class="text-h6">Editar Sede</div>
            </q-card-section>

            <q-card-section>
              <q-form @submit.prevent="editarSede">
                <q-input v-model="nombre" label="Nombre" filled required class="q-mb-md" />
                <q-input v-model="direccion" label="Dirección" filled required class="q-mb-md" />
                <q-input v-model="codigo" label="Código" type="number" filled required class="q-mb-md" />
                <q-input v-model="horario" label="Horario" filled required class="q-mb-md" />
                <q-input v-model="ciudad" label="Ciudad" filled required class="q-mb-md" />
                <q-input v-model="telefono" label="Teléfono" filled required class="q-mb-md" />
                <div class="q-mt-md">
                  <q-btn @click="cancelarSede" label="Cancelar" class="q-mr-sm" />
                  <q-btn type="submit" label="Guardar cambios" color="primary" class="q-ma-sm" />
                </div>
              </q-form>
            </q-card-section>
          </q-card>
        </q-dialog>
      </div>

      <q-table flat bordered title="Sedes" title-class="text-green text-weight-bolder text-h5" :rows="filteredRows"
        :columns="columns" row-key="id">
        <template v-slot:body-cell-opciones="props">
          <q-td :props="props">
            <q-btn @click="mostrarDatosParaEditar(props.row)">✏️</q-btn>
            <q-btn v-if="props.row.estado == 1" @click="inactivarSede(props.row._id)">
              ❌
            </q-btn>
            <q-btn v-else @click="activarSede(props.row._id)">✅</q-btn>
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

.q-select {
  max-width: 200px;
  /* Puedes ajustar el ancho según tu preferencia */
}

.q-my-md {
  max-width: 500px;
  padding-left: 10px;
}
</style>
