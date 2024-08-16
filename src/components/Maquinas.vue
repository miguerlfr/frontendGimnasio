<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { notifyErrorRequest } from "../routes/routes.js";
import { useStoreMaquinas } from "../stores/Maquinas.js";
import { useStoreSedes } from "../stores/Sedes.js";
import { format } from "date-fns";

const useMaquina = useStoreMaquinas();
const useSede = useStoreSedes();

const visible = ref(true);
const loadingg = ref(true)
const codigoMaquina = ref("");

// variables para mostrar el div que aparece al pasarle el mouse a la descripción
const tooltipText = ref('');
const tooltipVisible = ref(false);
const tooltipPosition = ref({ top: 0, left: 0 });

const mostrarFormularioEditarMaquina = ref(false);
const mostrarFormularioAgregarMaquina = ref(false);

const codigo = ref("");
const sede = ref("");
const descripcion = ref("");
const fechaIngreso = ref("");
const idMaquinaParaEditar = ref(null);

const sedes = ref([])

async function listarSedes() {
  const r = await useSede.getSedes();
  sedes.value = r.data.sedes;
  // console.log("Sedes listadas:", sedes.value);
}

const sedeOptions = computed(() => {
  return sedes.value
    .filter(sede => sede.estado !== 0)
    .map(sede => ({
      label: sede.nombre,
      id: sede._id,
    }));
});

const estadoOptions = [
  { label: "Activo" },
  { label: "Inactivo" },
];
const estadoM = ref("Activo");

const selectedOption = ref("Listar Máquinas"); // Establecer 'Listar Máquinas' como valor por defecto
const options = [
  { label: "Listar Máquinas", value: "Listar Máquinas" },
  { label: "Listar Máquina por Código", value: "Listar Máquina por Código" },
  { label: "Listar Máquinas Activas", value: "Listar Máquinas Activas" },
  { label: "Listar Máquinas Inactivas", value: "Listar Máquinas Inactivas" }
];

let rows = ref([]);
const columns = ref([
  { name: "codigo", label: "Código", field: "codigo", align: "center" },
  { name: "sede", label: "Sede", field: row => (row.sede.nombre), align: "center" },
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
    name: "updatedAt",
    label: "Fecha de Último Mantenimiento",
    field: (row) => format(new Date(row.updatedAt), 'dd/MM/yyyy'),
    align: "center",
  },
  { name: "estado", label: "Estado", field: "estado", align: "center" },
  { name: "opciones", label: "Opciones", field: "opciones", align: "center" },
]);

async function actualizarListadoMaquinas() {
  loadingg.value = true;
  try {
    const maquinasPromise = selectedOption.value === "Listar Máquinas Activas"
      ? useMaquina.getMaquinasActivas()
      : selectedOption.value === "Listar Máquinas Inactivas"
        ? useMaquina.getMaquinasInactivas()
        : useMaquina.getMaquinas();

    rows.value = (await maquinasPromise).data.maquinas;
    console.log("Maquinas", rows.value);
  } finally {
    loadingg.value = false;
    visible.value = false;
  }
}

const filtrarFilas = computed(() => {
  if (loadingg.value) {
    return []; // Retorna una lista vacía mientras se está cargando
  }

  const codigoInput = codigoMaquina.value ? codigoMaquina.value.toString() : '';

  return rows.value.filter(row => {
    switch (selectedOption.value) {
      case "Listar Máquina por Código":
        return row.codigo.toString().includes(codigoInput);
      default:
        return true;
    }
  });
});

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

const limpiarCampos = () => {
  codigo.value = "";
  sede.value = "";
  descripcion.value = "";
  fechaIngreso.value = "";
};

async function validarDatosMaquina(maquina) {
  const { sede } = maquina;
  if (sede == '') {
    notifyErrorRequest('La Sede es requerida.');
    return false;
  }
  return true;
}

async function agregarMaquina() {
  const nuevaMaquina = {
    codigo: codigo.value,
    sede: sede.value.id,
    descripcion: descripcion.value,
    fechaIngreso: fechaIngreso.value,
    estado: estadoM.value === "Activo" ? 1 : 0
  };

  if (await validarDatosMaquina(nuevaMaquina)) {
    const r = await useMaquina.postMaquinas(nuevaMaquina);
    if (r.status == 200) {
      mostrarFormularioAgregarMaquina.value = false
      actualizarListadoMaquinas();
      estadoM.value = "Activo";
      console.log("Maquina agregada exitosamente", nuevaMaquina);
    }
  }
}

const cargarMaquinaParaEdicion = (maquina) => {
  idMaquinaParaEditar.value = maquina._id;
  codigo.value = maquina.codigo;
  sede.value = maquina.sede.nombre;
  descripcion.value = maquina.descripcion;
  fechaIngreso.value = maquina.fechaIngreso.split("T")[0];

  mostrarFormularioEditarMaquina.value = true;
  console.log("Datos de la máquina a editar:", maquina);
};

const editarMaquina = async () => {
  let idSede = sede.value.id;
  for (let sedee of sedes.value) {
    if (sedee.nombre == sede.value) {
      if (sedee.estado == 1) {
        idSede = sedee._id
        break;
      } else {
        notifyErrorRequest("Sede seleccionada inactiva")
        return;
      }
    }
  }

  const maquinaEditada = {
    codigo: codigo.value,
    sede: idSede,
    descripcion: descripcion.value,
    fechaIngreso: fechaIngreso.value,
  };

  if (await validarDatosMaquina(maquinaEditada)) {
    const r = await useMaquina.putMaquinas(idMaquinaParaEditar.value, maquinaEditada);
    if (r.status == 200) {
      mostrarFormularioEditarMaquina.value = false;
      actualizarListadoMaquinas();
      console.log("Maquina editada exitosamente", maquinaEditada);
    }
  }
};

// Funciones auxiliares
function showTooltip(event, text) {
  tooltipText.value = text;
  tooltipVisible.value = true;
  tooltipPosition.value = { top: event.clientY, left: event.clientX };
}
function hideTooltip() {
  tooltipVisible.value = false;
}
function truncateText(text, maxLength) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}
function checkAndShowTooltip(event, text, maxLength) {
  if (text.length > maxLength) {
    showTooltip(event, text);
  }
}

const isLoading = computed(() => visible.value);

// Montaje
onMounted(() => {
  actualizarListadoMaquinas();
  listarSedes();
});

watch(selectedOption, () =>
  actualizarListadoMaquinas(),
  isLoading,
  loadingg
);
</script>

<template>
  <div class="q-pa-md" v-if="!visible">
    <div>
      <h3 style="text-align: center; margin: 10px">Máquinas</h3>
      <hr style="width: 70%; height: 5px; background-color: green" />
    </div>

    <div class="contSelect" style="margin-left: 5%; text-align: end; margin-right: 5%">
      <q-select background-color="green" class="q-my-md" v-model="selectedOption" outlined dense options-dense
        emit-value :options="options" />

      <input v-if="selectedOption === 'Listar Máquina por Código'" v-model="codigoMaquina" class="q-my-md" type="text"
        name="search" id="codigoMaquina" placeholder="Código de la máquina" />
    </div>

    <div>
      <div style="margin-left: 5%; text-align: end; margin-right: 5%" class="q-mb-md">
        <q-btn label="Agregar Máquina" @click="mostrarFormularioAgregarMaquina = true">
          <!-- <q-btn label="Editar Máquina" @click="mostrarFormularioEditarMaquina = true" /> -->
          <q-tooltip>
            Agregar Máquina
          </q-tooltip>
        </q-btn>
      </div>
      <!-- Dialogo para agregar máquina -->
      <q-dialog v-model="mostrarFormularioAgregarMaquina" v-bind="mostrarFormularioAgregarMaquina && limpiarCampos()">
        <q-card>
          <q-card-section>
            <div class="text-h5" style="padding: 10px 0 0 25px;">Agregar Máquina</div>
          </q-card-section>

          <q-card-section>
            <div class="q-pa-md">
              <q-form @submit.prevent="agregarMaquina">
                <!-- Campos del formulario de agregar máquina -->
                <q-input v-model.trim="codigo" label="Código" filled outlined class="q-mb-md" required />
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
                <q-input v-model.trim="descripcion" label="Descripción" type="textarea" filled outlined class="q-mb-md"
                  required />
                <q-input v-model="fechaIngreso" label="Fecha de Ingreso" filled type="date" outlined class="q-mb-md"
                  required />
                <q-select v-model="estadoM" label="Estado" outlined :options="estadoOptions" filled class="q-mb-md"
                  style="max-width: 100%;" />

                <!-- Botones de acción -->
                <div class="q-mt-md">
                  <q-btn @click="mostrarFormularioAgregarMaquina = false" label="Cancelar" color="negative"
                    class="q-ma-sm">
                    <q-tooltip>
                      Cancelar
                    </q-tooltip>
                  </q-btn>
                  <q-btn :loading="useMaquina.loading" :disable="useMaquina.loading" type="submit"
                    label="Guardar Máquina" color="primary" class="q-ma-sm">
                    <q-tooltip>
                      Guardar Máquina
                    </q-tooltip>
                    <template v-slot:loading>
                      <q-spinner color="white" size="1em" />
                    </template>
                  </q-btn>
                </div>
              </q-form>
            </div>
          </q-card-section>
        </q-card>
      </q-dialog>

      <!-- Dialogo para editar máquina -->
      <q-dialog v-model="mostrarFormularioEditarMaquina">
        <q-card>
          <q-card-section>
            <div class="text-h5" style="padding: 10px 0 0 25px;">Editar Máquina</div>
          </q-card-section>

          <q-card-section>
            <div class="q-pa-md">
              <q-form @submit.prevent="editarMaquina">
                <!-- Campos del formulario de editar máquina -->
                <q-input v-model.trim="codigo" label="Código" filled outlined class="q-mb-md" required />
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
                <q-input v-model.trim="descripcion" label="Descripción" type="textarea" filled outlined class="q-mb-md"
                  required />
                <q-input v-model="fechaIngreso" label="Fecha de Ingreso" filled type="date" outlined class="q-mb-md"
                  required />

                <!-- Botones de acción -->
                <div class="q-mt-md">
                  <q-btn @click="mostrarFormularioEditarMaquina = false" label="Cancelar" color="negative"
                    class="q-ma-sm">
                    <q-tooltip>
                      Cancelar
                    </q-tooltip>
                  </q-btn>
                  <q-btn :loading="useMaquina.loading" :disable="useMaquina.loading" type="submit"
                    label="Guardar Cambios" color="primary" class="q-ma-sm">
                    <q-tooltip>
                      Guardar Cambios
                    </q-tooltip>
                    <template v-slot:loading>
                      <q-spinner color="white" size="1em" />
                    </template>
                  </q-btn>
                </div>
              </q-form>
            </div>
          </q-card-section>
        </q-card>
      </q-dialog>
    </div>

    <q-table flat bordered title="Maquinas" title-class="text-green text-weight-bolder text-h5" :rows="filtrarFilas"
      :columns="columns" row-key="id" :loading="loadingg">
      <template v-slot:body-cell-opciones="props">
        <q-td :props="props">
          <q-btn @click="cargarMaquinaParaEdicion(props.row)">
            ✏️
            <q-tooltip>
              Editar Maquina
            </q-tooltip>
          </q-btn>
          <q-btn v-if="props.row.estado == 1" @click="inactivarMaquina(props.row._id)">
            ❌
            <q-tooltip>
              Inactivar Maquina
            </q-tooltip>
          </q-btn>
          <q-btn v-else @click="activarMaquina(props.row._id)">
            ✅
            <q-tooltip>
              Activar Maquina
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

      <!-- Descripcion Column -->
      <template v-slot:body-cell-descripcion="props">
        <q-td :props="props" class="relative">
          <div class="truncated-text" @mouseover="checkAndShowTooltip($event, props.row.descripcion, 20)"
            @mouseleave="hideTooltip">
            {{ truncateText(props.row.descripcion, 20) }}
          </div>
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
  /* Puedes ajustar el ancho según tu preferencia */
}

.q-my-md {
  max-width: 500px;
  padding-left: 10px;
}
</style>