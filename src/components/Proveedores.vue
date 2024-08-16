<script setup>
import { ref, onMounted, computed, watch } from "vue";
// import { notifyErrorRequest } from "../routes/routes.js";
import { useStoreProveedores } from "../stores/Proveedores.js";
import { format } from "date-fns";

// Loading
const visible = ref(true);
const listarProducto = ref("")
const listarFechasOne = ref("")
const listarFechasTwo = ref("")

// Variables parra mostrar formularios
const mostrarFormularioEditarProveedor = ref(false);
const mostrarFormularioAgregarProveedor = ref(false);

// Llamado de modelos
const useProveedor = useStoreProveedores();

// // Variables de los inputs de agregar y editar
const idProveedorSeleccionada = ref("");
const nombre = ref("");
const telefono = ref("");
const notas = ref("");
const estado = ref("");

const selectedOption = ref("Listar Proveedores");
const options = [
  { label: "Listar Proveedores", value: "Listar Proveedores" },
  { label: "Listar Proveedores por Producto", value: "Listar Proveedores por Producto" },
  { label: "Listar Proveedores por fechas", value: "Listar Proveedores por fechas" },
  { label: "Listar Proveedores Activos", value: "Listar Proveedores Activos" },
  { label: "Listar Proveedores Inactivos", value: "Listar Proveedores Inactivos" }
];

let rows = ref([]);
const columns = ref([
  {
    name: "createdAt",
    label: "Fecha",
    field: (row) => format(new Date(row.createdAt), 'dd/MM/yyyy'),
    align: "center",
  },
  {
    name: "nombre",
    label: "Nombre",
    field: "nombre",
    align: "center",
  },
  {
    name: "telefono",
    label: "Teléfono",
    field: "telefono",
    align: "center"
  },
  {
    name: "notas",
    label: "Notas",
    field: "notas",
    align: "center",
  },
  {
    name: "estado",
    label: "Estado",
    field: "estado",
    align: "center",
  },
  { name: "opciones", label: "Opciones", field: "opciones", align: "center" },
]);

async function actualizarListadoProveedores() {
  const proveedoresPromise = selectedOption.value === "Listar Proveedores Activos"
    ? useProveedor.getProveedoresActivos()
    : selectedOption.value === "Listar Proveedores Inactivos"
      ? useProveedor.getProveedoresInactivos()
      : useProveedor.getProveedores();

  rows.value = (await proveedoresPromise).data
  visible.value = false;
  console.log("Proveedores", rows.value);
}

async function inactivarProveedor(id) {
  const r = await useProveedor.putProveedoresInactivar(id);
  console.log(r.data);
  actualizarListadoProveedores();
}

async function activarProveedor(id) {
  const r = await useProveedor.putProveedoresActivar(id);
  console.log(r.data);
  actualizarListadoProveedores();
}

const filtrarFilas = computed(() => {
  let proveedoresFiltradas = rows.value;

  if (selectedOption.value === "Listar Proveedores por Producto" && listarProducto.value) {
    proveedoresFiltradas = proveedoresFiltradas.filter(row =>
      row.productos.toLowerCase().includes(listarProducto.value.toLowerCase())
    );
    // notifySuccessRequest('Proveedores listadas por producto exitosamente.');
  }

  if (listarFechasOne.value && listarFechasTwo.value) {
    const normalizeDate = date => new Date(date).toISOString().slice(0, 10);

    const startDate = normalizeDate(listarFechasOne.value);
    const endDate = normalizeDate(listarFechasTwo.value);

    if (startDate === endDate) {
      proveedoresFiltradas = proveedoresFiltradas.filter(proveedore => {
        const proveedorDate = normalizeDate(proveedore.createdAt);
        return proveedorDate === startDate;
      });
      // notifySuccessRequest('Proveedores listadas por fechas exitosamente.');
    } else {
      // notifyErrorRequest('Fechas inválidas o inconsistentes.');
    }
  }

  return proveedoresFiltradas;
});

const limpiarCampos = () => {
  idProveedorSeleccionada.value = "";
  nombre.value = "";
  telefono.value = "";
  notas.value = "";
  estado.value = "Activo";
}

async function agregarProveedor() {
  const nuevoProveedor = {
    nombre: nombre.value,
    telefono: telefono.value,
    notas: notas.value,
    estado: estado.value === "Activo" ? 1 : 0,
  };

  const r = await useProveedor.postProveedores(nuevoProveedor);
  if (r.status === 201) {
    mostrarFormularioAgregarProveedor.value = false;
    actualizarListadoProveedores();
    console.log("Proveedor agregado exitosamente", nuevoProveedor);
  }
}

const cargarProveedorParaEdicion = (proveedor) => {
  idProveedorSeleccionada.value = proveedor._id;
  nombre.value = proveedor.nombre;
  telefono.value = proveedor.telefono;
  notas.value = proveedor.notas;
  estado.value = proveedor.estado;

  mostrarFormularioEditarProveedor.value = true;
  console.log("Datos del proveedor a editar", proveedor);
}

async function editarProveedor() {
  const proveedorEditado = {
    _id: idProveedorSeleccionada.value,
    nombre: nombre.value,
    telefono: telefono.value,
    notas: notas.value,
    estado: estado.value === "Activo" ? 1 : 0,
  };

  const r = await useProveedor.putProveedores(idProveedorSeleccionada.value, proveedorEditado);
  if (r.status === 200) {
    mostrarFormularioEditarProveedor.value = false;
    actualizarListadoProveedores();
    console.log("Proveedor editado exitosamente", proveedorEditado);
  }
}

const isLoading = computed(() => visible.value);

onMounted(() => {
  actualizarListadoProveedores();
});

watch(selectedOption, () => {
  actualizarListadoProveedores();
  isLoading
});

</script>

<template>
  <div>
    <div class="q-pa-md" v-if="!visible">
      <h3 style="text-align: center; margin: 10px">Proveedores</h3>
      <hr style="width: 70%; height: 5px; background-color: green" />
    </div>

    <div class="contSelect" style="margin-left: 5%; text-align: end; margin-right: 5%">
      <q-select background-color="green" class="q-my-md" id="q-select" v-model="selectedOption" outlined dense
        options-dense emit-value :options="options" />

      <input v-if="selectedOption === 'Listar Proveedores por Producto'" v-model="listarProducto" class="q-my-md"
        type="text" name="search" id="search" placeholder="Ingrese el producto" />

      <div v-if="selectedOption === 'Listar Proveedores por fechas'"
        style="display: flex; flex-direction: row; text-align: center; flex-wrap: wrap; position: absolute; top: 150px; left: 240px;">
        <label for="listarFechasOne" style="height: 100%; line-height: 88px; margin-left: 40px;">De:</label>
        <q-input v-model="listarFechasOne" class="q-my-md" type="date" name="search" id="listarFechasOne"
          placeholder="Ingrese la fecha" />

        <label for="listarFechasTwo" style="height: 100%; line-height: 88px; margin-left: 40px;">A:</label>
        <q-input v-model="listarFechasTwo" class="q-my-md" type="date" name="search" id="listarFechasTwo"
          placeholder="Ingrese la fecha" />
      </div>
    </div>

    <div>
      <div style="margin-left: 5%; text-align: end; margin-right: 5%" class="q-mb-md">
        <q-btn label="Agregar Proveedor" @click="mostrarFormularioAgregarProveedor = true">
          <q-tooltip>
            Agregar Proveedor
          </q-tooltip>
        </q-btn>
      </div>

      <!-- Formulario para agregar proveedor -->
      <q-dialog v-model="mostrarFormularioAgregarProveedor"
        v-bind="mostrarFormularioAgregarProveedor && limpiarCampos()">
        <q-card style="width: 340px;">
          <q-card-section>
            <div class="text-h6" style="padding: 10px 0 0 15px;">Agregar Proveedor</div>
          </q-card-section>
          <q-card-section style="padding: 10px 25px;">
            <q-form @submit.prevent="agregarProveedor">
              <q-input v-model="nombre" label="Nombre" filled outlined class="q-mb-md" required />
              <q-input v-model="telefono" label="Teléfono" type="number" filled outlined class="q-mb-md" required />
              <q-input v-model="notas" label="Notas" type="notas" filled outlined class="q-mb-md" required />
              <q-select v-model="estado" label="Estado" :options="[{ label: 'Activo' }, { label: 'Inactivo' }]" filled
                outlined class="q-mb-md" required />
              <div class="q-mt-md" style="display: flex; justify-content: flex-end;">
                <q-btn label="Cancelar" color="negative" class="q-ma-sm"
                  @click="mostrarFormularioAgregarProveedor = false">
                  <q-tooltip>
                    Cancelar
                  </q-tooltip>
                </q-btn>
                <q-btn :loading="useProveedor.loading" :disable="useProveedor.loading" type="submit"
                  label="Guardar Proveedor" color="primary" class="q-ma-sm">
                  <q-tooltip>
                    Guardar Proveedor
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

      <!-- Formulario para editar proveedor -->
      <q-dialog v-model="mostrarFormularioEditarProveedor">
        <q-card>
          <q-card-section>
            <div class="text-h6">Editar Proveedor</div>
          </q-card-section>
          <q-card-section style="padding: 10px 25px;">
            <q-form @submit.prevent="editarProveedor">
              <q-input v-model="nombre" label="Nombre" filled outlined class="q-mb-md" required />
              <q-input v-model="telefono" label="Teléfono" type="number" filled outlined class="q-mb-md" required />
              <q-input v-model="notas" label="Notas" type="notas" filled outlined class="q-mb-md" required />

              <div class="q-mt-md" style="display: flex; justify-content: flex-end;">
                <q-btn label="Cancelar" color="negative" class="q-ma-sm"
                  @click="mostrarFormularioEditarProveedor = false">
                  <q-tooltip>
                    Cancelar
                  </q-tooltip>
                </q-btn>
                <q-btn :loading="useProveedor.loading" :disable="useProveedor.loading" type="submit"
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
          </q-card-section>
        </q-card>
      </q-dialog>
    </div>

    <q-table flat bordered title="Proveedores" title-class="text-green text-weight-bolder text-h5" :rows="filtrarFilas"
      :columns="columns" row-key="id">
      <template v-slot:body-cell-opciones="props">
        <q-td :props="props">
          <q-btn @click="cargarProveedorParaEdicion(props.row)">
            ✏️
            <q-tooltip>
              Editar Proveedor
            </q-tooltip>
          </q-btn>
          <q-btn v-if="props.row.estado == 1" @click="inactivarProveedor(props.row._id)">
            ❌
            <q-tooltip>
              Inactivar Proveedor
            </q-tooltip>
          </q-btn>
          <q-btn v-else @click="activarProveedor(props.row._id)">
            ✅
            <q-tooltip>
              Activar Proveedor
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

.q-my-md {
  max-width: 200px;
  padding-left: 10px;
}
</style>
