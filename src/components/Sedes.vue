<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useStoreSedes } from "../stores/Sedes.js";

// Para colocar puntos decimales a los nuemros
function formatoNumerico(numero) {
  return typeof numero === 'number' ? numero.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") : undefined;
}

// Variables parra mostrar formularios
const mostrarFormularioAgregarSedes = ref(false);
const mostrarFormularioEditarSedes = ref(false);

// Variables de los inputs de agregar y editar
const selectedSedeId = ref(null);
const nombre = ref("");
const direccion = ref("");
const codigo = ref("");
const horario = ref("");
const ciudad = ref("");
const telefono = ref("");

const estadoOptions = [
  { label: "Activo" },
  { label: "Inactivo" },
];

// estado predeterminado
const estado = ref(estadoOptions.find(option => option.label === "Activo").label);

// Llamado de modelo
const useSede = useStoreSedes();

// Loading
const visible = ref(true);
const loadingg = ref(true)

const codigoSede = ref("")

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

const filteredRows = computed(() => {
  if (loadingg.value) {
    return []; // Retorna una lista vacía mientras se está cargando
  }

  const codigoInput = selectedOption.value === "Listar Sede por Código" && codigoSede.value.trim();

  // Filtra por código si se ha especificado un código y se ha seleccionado la opción correspondiente
  return codigoInput
    ? rows.value.filter(sede => sede.codigo.toString().includes(codigoInput))
    : rows.value;
});

async function actualizarListadoSedes() {
  loadingg.value = true;
  try {
    const sedePromise = selectedOption.value === "Listar Sedes Activas"
      ? useSede.getSedesActivas()
      : selectedOption.value === "Listar Sedes Inactivas"
        ? useSede.getSedesInactivas()
        : useSede.getSedes();

    rows.value = (await sedePromise).data.sedes;
    console.log("Sedes", rows.value);
  } finally {
    loadingg.value = false;
    visible.value = false;
  }
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

const limpiarCampos = () => {
  nombre.value = "";
  direccion.value = ""
  codigo.value = "";
  horario.value = "";
  ciudad.value = "";
  telefono.value = "";
};

const agregarSede = async () => {
  const datosSede = {
    nombre: nombre.value,
    direccion: direccion.value,
    codigo: codigo.value,
    horario: horario.value,
    ciudad: ciudad.value,
    telefono: telefono.value,
    estado: estado.value === "Activo" ? 1 : 0,
  };

  const r = await useSede.postSedes(datosSede);
  if (r.status == 200) {
    mostrarFormularioAgregarSedes.value = false
    actualizarListadoSedes();
    estado.value = "Activo";
    console.log("Sede agregada exitosamente", datosSede);
  }
};

const editarSede = async () => {
  const datosSede = {
    nombre: nombre.value,
    direccion: direccion.value,
    codigo: codigo.value,
    horario: horario.value,
    ciudad: ciudad.value,
    telefono: telefono.value,
  };

  const r = await useSede.putSedes(selectedSedeId.value, datosSede);
  if (r.status == 200) {
    mostrarFormularioEditarSedes.value = false;
    actualizarListadoSedes();
    console.log("Sede editada exitosamente", datosSede);
  }
};

const mostrarDatosParaEditar = (sedes) => {
  selectedSedeId.value = sedes._id;
  nombre.value = sedes.nombre;
  direccion.value = sedes.direccion;
  codigo.value = sedes.codigo;
  horario.value = sedes.horario;
  ciudad.value = sedes.ciudad;
  telefono.value = sedes.telefono;

  console.log("Datos de la sede a editar:", sedes);
  mostrarFormularioEditarSedes.value = true;
};

const isLoading = computed(() => visible.value);

onMounted(() => {
  actualizarListadoSedes();
});

watch(selectedOption, () => {
  actualizarListadoSedes();
  isLoading
  loadingg
});
</script>

<template>
  <div class="q-pa-md" v-if="!visible">
    <div>
      <h3 style="text-align: center; margin: 10px">Sedes</h3>
      <hr style="width: 70%; height: 5px; background-color: green" />
    </div>

    <div class="contSelect" style="margin-left: 5%; text-align: end; margin-right: 5%">
      <q-select background-color="green" class="q-my-md" v-model="selectedOption" outlined dense options-dense
        emit-value :options="options" />

      <input v-if="selectedOption === 'Listar Sede por Código'" v-model="codigoSede" class="q-my-md" type="text"
        name="codigoSede" id="codigoSede" placeholder="Código de la sede" />
    </div>

    <div>
      <div style="margin-left: 5%; text-align: end; margin-right: 5%" class="q-mb-md">
        <div style="margin-left: 5%; text-align: end; margin-right: 5%" class="q-mb-md">
          <q-btn label="Agregar Sede" @click="mostrarFormularioAgregarSedes = true">
            <q-tooltip>
              Agregar Sede
            </q-tooltip>
          </q-btn>
        </div>

      </div>
      <!-- Dialogo para agregar sede -->
      <q-dialog v-model="mostrarFormularioAgregarSedes" v-bind="mostrarFormularioAgregarSedes && limpiarCampos()">
        <q-card>
          <q-card-section>
            <div class="text-h6">Agregar Sede</div>
          </q-card-section>

          <q-card-section>
            <q-form @submit.prevent="agregarSede">
              <q-input v-model.trim="nombre" label="Nombre" filled required class="q-mb-md" />
              <q-input v-model.trim="direccion" label="Dirección" filled required class="q-mb-md" />
              <q-input v-model="codigo" label="Código" type="number" filled required class="q-mb-md" />
              <q-input v-model.trim="horario" label="Horario" filled required class="q-mb-md" />
              <q-input v-model.trim="ciudad" label="Ciudad" filled required class="q-mb-md" />
              <q-input v-model="telefono" label="Teléfono" type="number" filled required class="q-mb-md" min="0" />
              <q-select v-model="estado" label="Estado" filled required :options="estadoOptions" class="q-mb-md"
                style="max-width: 100%;" />
              <div class="q-mt-md">
                <q-btn @click="mostrarFormularioAgregarSedes = false" label="Cancelar" class="q-mr-sm">
                  <q-tooltip>
                    Cancelar
                  </q-tooltip>
                </q-btn>
                <q-btn :loading="useSede.loading" :disable="useSede.loading" type="submit" label="Guardar Sede"
                  color="primary" class="q-ma-sm">
                  <q-tooltip>
                    Guardar Sede
                  </q-tooltip>
                  <template v-slot:loading>
                    <q-spinner color="white" size="1em" />
                  </template>
                </q-btn>
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
              <q-input v-model.trim="nombre" label="Nombre" filled required class="q-mb-md" />
              <q-input v-model.trim="direccion" label="Dirección" filled required class="q-mb-md" />
              <q-input v-model="codigo" label="Código" type="number" filled required class="q-mb-md" />
              <q-input v-model.trim="horario" label="Horario" filled required class="q-mb-md" />
              <q-input v-model.trim="ciudad" label="Ciudad" filled required class="q-mb-md" />
              <q-input v-model="telefono" label="Teléfono" type="number" filled required class="q-mb-md" min="0" />
              <div class="q-mt-md">
                <q-btn @click="mostrarFormularioEditarSedes = false" label="Cancelar" class="q-mr-sm">
                  <q-tooltip>
                    Cancelar
                  </q-tooltip>
                </q-btn>
                <q-btn :loading="useSede.loading" :disable="useSede.loading" type="submit" label="Guardar cambios"
                  color="primary" class="q-ma-sm">
                  <q-tooltip>
                    Guardar cambios
                  </q-tooltip>
                  <template v-slot:loading>
                    <q-spinner color="white" size="1em" />
                  </template>
                </q-btn>
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </q-dialog>
    </div>

    <q-table flat bordered title="Sedes" title-class="text-green text-weight-bolder text-h5" :rows="filteredRows"
      :columns="columns" row-key="id" :loading="loadingg">
      <template v-slot:body-cell-opciones="props">
        <q-td :props="props">
          <q-btn @click="mostrarDatosParaEditar(props.row)">
            ✏️
            <q-tooltip>
              Editar Sede
            </q-tooltip>
          </q-btn>
          <q-btn v-if="props.row.estado == 1" @click="inactivarSede(props.row._id)">
            ❌
            <q-tooltip>
              Inactivar Sede
            </q-tooltip>
          </q-btn>
          <q-btn v-else @click="activarSede(props.row._id)">
            ✅
            <q-tooltip>
              Activar Sede
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
* {
  font-family: cursive;
  font-style: italic;
}

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
