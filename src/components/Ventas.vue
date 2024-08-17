<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { notifyErrorRequest } from "../routes/routes.js";
import { useStoreVentas } from "../stores/Ventas.js";
import { useStoreProductos } from "../stores/Productos.js";
import { format } from "date-fns";

// Para colocar puntos decimales a los nuemros
function formatoNumerico(numero) {
  return typeof numero === 'number' ? numero.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") : undefined;
}

// Loading
const visible = ref(true);
const loadingg = ref(true)
const listarCodigo = ref("")
const listarFechasOne = ref("")
const listarFechasTwo = ref("")

// Variables parra mostrar formularios
const mostrarFormularioEditarVenta = ref(false);
const mostrarFormularioAgregarVenta = ref(false);

// Llamado de modelos
const useVenta = useStoreVentas();
const useProducto = useStoreProductos();

// Variables de los inputs de agregar y editar
const idVentaSeleccionada = ref("");
const codigoProducto = ref("");
const cantidad = ref("");

const selectedOption = ref("Listar Ventas");
const options = [
  { label: "Listar Ventas", value: "Listar Ventas" },
  { label: "Listar Ventas por Producto", value: "Listar Ventas por Producto" },
  { label: "Listar Ventas por fechas", value: "Listar Ventas por fechas" }
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
    name: "codigoProducto",
    label: "Producto",
    field: row => (row.codigoProducto ? row.codigoProducto.descripcion : ''),
    align: "center",
  },
  {
    name: "valorUnitario",
    label: "Valor Unitario",
    field: (row) => formatoNumerico(row.valorUnitario),
    align: "center",
  },
  { name: "cantidad", label: "Cantidad", field: (row) => formatoNumerico(row.cantidad), align: "center" },
  {
    name: "valorTotal",
    label: "Valor Total",
    field: (row) => formatoNumerico(row.valorTotal),
    align: "center",
  },
  { name: "opciones", label: "Opciones", field: "opciones", align: "center" },
]);

const productos = ref([])

async function listarProductos() {
  const r = await useProducto.getProductos();
  productos.value = r.data.productos;
  console.log("Productos:", productos.value);
}

const productoOptions = computed(() => {
  return productos.value
    .filter(plan => plan.estado != 0)
    .map((producto) => ({
      label: producto.descripcion,
      id: producto._id
    }));
});

async function listarVentas() {
  loadingg.value = true;
  try {
    const ventasResponse = await useVenta.getVentas();
    const ventas = ventasResponse.data.ventas;
    console.log("Ventas", ventas);

    rows.value = ventas;
  } finally {
    loadingg.value = false;
    visible.value = false;
  }
}

const filtrarFilas = computed(() => {
  if (loadingg.value) {
    return []; // Retorna una lista vacía mientras se está cargando
  }

  let ventasFiltradas = rows.value;

  if (selectedOption.value === "Listar Ventas por Producto" && listarCodigo.value) {
    ventasFiltradas = ventasFiltradas.filter(row =>
      row.codigoProducto.descripcion.toLowerCase().includes(listarCodigo.value.toLowerCase())
    );
    // notifySuccessRequest('Ventas listadas por producto exitosamente.');
  }

  if (listarFechasOne.value && listarFechasTwo.value) {
    const normalizeDate = date => new Date(date).toISOString().slice(0, 10);

    const startDate = normalizeDate(listarFechasOne.value);
    const endDate = normalizeDate(listarFechasTwo.value);

    if (startDate === endDate) {
      ventasFiltradas = ventasFiltradas.filter(venta => {
        const ventaDate = normalizeDate(venta.createdAt);
        return ventaDate === startDate;
      });
      // notifySuccessRequest('Ventas listadas por fechas exitosamente.');
    } else {
      // notifyErrorRequest('Fechas inválidas o inconsistentes.');
    }
  }

  return ventasFiltradas;
});

function limpiarCampos() {
  idVentaSeleccionada.value = "";
  codigoProducto.value = "";
  cantidad.value = "";
}

async function validarDatosVenta(venta) {
  const { codigoProducto } = venta;

  if (codigoProducto == undefined) {
    notifyErrorRequest('El Producto es requerido.');
    return false;
  }

  return true;
}

async function agregarVenta() {
  const nuevaVenta = {
    codigoProducto: codigoProducto.value.id,
    cantidad: cantidad.value
  };

  if (await validarDatosVenta(nuevaVenta)) {
    const r = await useVenta.postVentas(nuevaVenta);
    if (r.status == 200) {
      mostrarFormularioAgregarVenta.value = false
      listarVentas();
      console.log("Venta a agregar exitosamente", nuevaVenta)
    }
  }
}

function cargarVentaParaEdicion(venta) {
  idVentaSeleccionada.value = venta._id;
  codigoProducto.value = venta.codigoProducto.descripcion;
  cantidad.value = venta.cantidad;

  mostrarFormularioEditarVenta.value = true;
  console.log("Datos de la venta a editar", venta);
}

async function editarVenta() {
  let idCodigoProducto = codigoProducto.value.id

  // Por si no cambio el producto tomar el valor del id del producto
  for (let producto of productos.value) {
    if (producto.descripcion === codigoProducto.value) {
      if (producto.estado == 1) {
        idCodigoProducto = producto._id
        break;
      } else {
        notifyErrorRequest("Producto seleccionado inactivo")
        return;
      }
    }
  }
  const ventaEditada = {
    _id: idVentaSeleccionada.value,
    codigoProducto: idCodigoProducto,
    cantidad: cantidad.value
  };
  if (await validarDatosVenta(ventaEditada)) {
    const r = await useVenta.putVentas(idVentaSeleccionada.value, ventaEditada);
    if (r.status == 200) {
      mostrarFormularioEditarVenta.value = false;
      listarVentas();
      console.log("Venta editada exitosamente", ventaEditada)
    }
  }
}

const isLoading = computed(() => visible.value);

onMounted(() => {
  listarVentas();
  listarProductos();
});

watch(selectedOption, () => {
  listarVentas();
  isLoading
  loadingg
});
</script>

<template>
  <div class="q-pa-md" v-if="!visible">
    <div>
      <h3 style="text-align: center; margin: 10px">Ventas</h3>
      <hr style="width: 70%; height: 5px; background-color: green" />
    </div>

    <div class="contSelect" style="margin-left: 5%; text-align: end; margin-right: 5%">
      <q-select background-color="green" class="q-my-md" id="q-select" v-model="selectedOption" outlined dense
        options-dense emit-value :options="options" />

      <input v-if="selectedOption === 'Listar Ventas por Producto'" v-model="listarCodigo" class="q-my-md" type="text"
        name="search" id="search" placeholder="Ingrese el producto" />

      <div v-if="selectedOption === 'Listar Ventas por fechas'"
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
        <q-btn label="Agregar Venta" @click="mostrarFormularioAgregarVenta = true">
          <!-- <q-btn label="Editar Venta" @click="mostrarFormularioEditarVenta = true" /> -->
          <q-tooltip>
            Agregar Venta
          </q-tooltip>
        </q-btn>
      </div>

      <!-- Formulario para agregar venta -->
      <q-dialog v-model="mostrarFormularioAgregarVenta" v-bind="mostrarFormularioAgregarVenta && limpiarCampos()">
        <q-card>
          <q-card-section>
            <div class="text-h6">Agregar Venta</div>
          </q-card-section>
          <q-card-section>
            <q-form @submit.prevent="agregarVenta">
              <q-select v-model="codigoProducto" label="Producto" filled outlined :options="productoOptions"
                class="q-mb-md" required>
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section>
                      No results
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
              <q-input v-model="cantidad" label="Cantidad" type="number" filled outlined class="q-mb-md" min="0"
                required />

              <q-btn label="Cancelar" color="negative" class="q-ma-sm" @click="mostrarFormularioAgregarVenta = false">
                <q-tooltip>
                  Cancelar
                </q-tooltip>
              </q-btn>
              <q-btn :loading="useProducto.loading" :disable="useProducto.loading" type="submit"
                label="Guardar Producto" color="primary" class="q-ma-sm">
                <q-tooltip>
                  Guardar Producto
                </q-tooltip>
                <template v-slot:loading>
                  <q-spinner color="white" size="1em" />
                </template>
              </q-btn>
            </q-form>
          </q-card-section>
        </q-card>
      </q-dialog>

      <!-- Formulario para editar venta -->
      <q-dialog v-model="mostrarFormularioEditarVenta">
        <q-card>
          <q-card-section>
            <div class="text-h6">Editar Venta</div>
          </q-card-section>
          <q-card-section>
            <q-form @submit.prevent="editarVenta">
              <q-select v-model="codigoProducto" label="Producto" filled outlined :options="productoOptions"
                class="q-mb-md" required>
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section>
                      No results
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
              <q-input v-model="cantidad" label="Cantidad" type="number" filled outlined class="q-mb-md" min="0"
                required />
              <q-btn label="Cancelar" color="negative" class="q-ma-sm" @click="mostrarFormularioEditarVenta = false">
                <q-tooltip>
                  Cancelar
                </q-tooltip>
              </q-btn>
              <q-btn :loading="useProducto.loading" :disable="useProducto.loading" type="submit" label="Guardar Cambios"
                color="primary" class="q-ma-sm">
                <q-tooltip>
                  Guardar Cambios
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

    <q-table flat bordered title="Ventas" title-class="text-green text-weight-bolder text-h5" :rows="filtrarFilas"
      :columns="columns" row-key="id" :loading="loadingg">
      <template v-slot:body-cell-opciones="props">
        <q-td :props="props">
          <q-btn @click="cargarVentaParaEdicion(props.row)">
            ✏️
            <q-tooltip>
              Editar Venta
            </q-tooltip>
          </q-btn>
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

.q-my-md {
  max-width: 200px;
  padding-left: 10px;
}
</style>
