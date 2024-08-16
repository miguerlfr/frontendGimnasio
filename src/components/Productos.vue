<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useStoreProductos } from "../stores/Productos.js";
import { useStoreProveedores } from "../stores/Proveedores.js";

// Para colocar puntos decimales a los nuemros
function formatoNumerico(numero) {
  return typeof numero === 'number' ? numero.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") : undefined;
}

// Llamado de modelos
const useProducto = useStoreProductos();
const useProveedor = useStoreProveedores();

// variables para mostrar el div que aparece al pasarle el mouse a la descripción
const tooltipText = ref('');
const tooltipVisible = ref(false);
const tooltipPosition = ref({ top: 0, left: 0 });

const visible = ref(true)
const loadingg = ref(true)
const listarCodigo = ref("")

const mostrarFormularioAgregarProducto = ref(false);
const mostrarFormularioEditarProducto = ref(false);

const idProductoSeleccionado = ref(null);
const codigoProducto = ref("");
const proveedor = ref("");
const descripcionProducto = ref("");
const valorProducto = ref("");
const cantidadProducto = ref("");

const selectedOption = ref("Listar Productos"); // Establecer 'Listar Productos' como valor por defecto
const options = [
  { label: "Listar Productos", value: "Listar Productos" },
  { label: "Listar Productos Activos", value: "Listar Productos Activos" },
  { label: "Listar Productos Inactivos", value: "Listar Productos Inactivos" },
  { label: "Listar Producto por Código", value: "Listar Producto por Código" }
];

const estadoOptions = [
  { label: "Activo" },
  { label: "Inactivo" },
];
const estadoProducto = ref("Activo");

let rows = ref([]);
const columns = ref([
  { name: "codigo", label: "Código", field: "codigo", align: "center" },
  { name: "proveedor", label: "Proveedor", field: row => row.proveedor ? row.proveedor.nombre : '', align: "center" },
  {
    name: "descripcion",
    label: "Descripción",
    field: "descripcion",
    align: "center",
  },
  { name: "valor", label: "Valor", field: (row) => formatoNumerico(row.valor), align: "center" },
  { name: "cantidad", label: "Cantidad", field: (row) => formatoNumerico(row.cantidad), align: "center" },
  { name: "estado", label: "Estado", field: "estado", align: "center" },
  { name: "opciones", label: "Opciones", field: "opciones", align: "center" }
]);

const proveedores = ref([])

const proveedorOptions = computed(() => {
  return proveedores.value
    .filter(proveedor => proveedor.estado != 0)
    .map((proveedor) => ({
      label: proveedor.nombre,
      id: proveedor._id
    }));
});

// Funciones async
async function listarProveedores() {
  const r = await useProveedor.getProveedores();
  console.log("Proveedores", r.data);
  proveedores.value = r.data;
}

const actualizarListadoProductos = async () => {
  loadingg.value = true;
  try {
    const productosPromise = selectedOption.value === "Listar Productos Activos"
      ? useProducto.getProductosActivos()
      : selectedOption.value === "Listar Productos Inactivos"
        ? useProducto.getProductosInactivos()
        : useProducto.getProductos();

    rows.value = (await productosPromise).data.productos;
  } finally {
    loadingg.value = false;
    visible.value = false;
  }
};

const filteredRows = computed(() => {
  if (loadingg.value) {
    return []; // Retorna una lista vacía mientras se está cargando
  }

  const codigoInput = selectedOption.value.includes("Código")
    ? listarCodigo.value
    : "";

  return codigoInput
    ? rows.value.filter(item => item.codigo.toString().includes(codigoInput))
    : rows.value;
});

// const filteredRows = computed(() => {
//   if (selectedOption.value.includes("Código")) {

//     loadingg.value = true;
//     const codigoInput = listarCodigo.value;

//     const result = codigoInput
//       ? rows.value.filter(item => item.codigo.toString().includes(codigoInput))
//       : rows.value;

//     setTimeout(function () {
//       loadingg.value = false;
//     }, 3000)
//     return result;
//   } else {
//     return rows.value;
//   }
// });

async function agregarProducto() {
  const nuevoProducto = {
    codigo: codigoProducto.value,
    proveedor: proveedor.value.id,
    descripcion: descripcionProducto.value,
    valor: valorProducto.value,
    cantidad: cantidadProducto.value,
    estado: estadoProducto.value === "Activo" ? 1 : 0,
  };

  if (await validarDatosProducto(nuevoProducto)) {
    const r = await useProducto.postProductos(nuevoProducto);
    if (r.status == 200) {
      mostrarFormularioAgregarProducto.value = false
      actualizarListadoProductos();
      estadoProducto.value = "Activo";
      console.log("Producto agregado exitosamente", nuevoProducto);
    }
  }
}

function cargarProductoParaEdicion(producto) {
  idProductoSeleccionado.value = producto._id;
  codigoProducto.value = producto.codigo;
  proveedor.value = producto.proveedor.nombre;
  descripcionProducto.value = producto.descripcion;
  valorProducto.value = producto.valor;
  cantidadProducto.value = producto.cantidad;

  mostrarFormularioEditarProducto.value = true
  console.log("Datos del producto a editar", producto);
}

async function editarProducto() {
  let proveedorActual = proveedorAgregar.value.id;

  for (let proveedor of proveedores.value) {
    if (proveedor.descripcion === proveedorAgregar.value) {
      if (proveedor.estado == 1) {
        proveedorActual = proveedor._id;
        break;
      } else {
        notifyErrorRequest("Proveedor seleccionado inactivo")
        return;
      }
    }
  }

  const productoEditado = {
    codigo: codigoProducto.value,
    proveedor: proveedorActual.value,
    descripcion: descripcionProducto.value,
    valor: valorProducto.value,
    cantidad: cantidadProducto.value,
  };

  if (await validarDatosProducto(productoEditado)) {
    const r = await useProducto.putProductos(idProductoSeleccionado.value, productoEditado);
    if (r.status == 200) {
      mostrarFormularioEditarProducto.value = false;
      actualizarListadoProductos()
      console.log("Producto editado exitosamente", productoEditado);
    }
  }
}

async function validarDatosProducto(produto) {
  const { proveedor } = produto;

  if (proveedor === '') {
    notifyErrorRequest(`El Proveedor es requerido.`);
    return false;
  }
  return true;
}

async function inactivarProducto(id) {
  const r = await useProducto.putProductosInactivar(id);
  console.log(r.data);
  actualizarListadoProductos();
}

async function activarProducto(id) {
  const r = await useProducto.putProductosActivar(id);
  console.log(r.data);
  actualizarListadoProductos();
}

function limpiarCampos() {
  codigoProducto.value = "";
  proveedor.value = '';
  descripcionProducto.value = "";
  valorProducto.value = "";
  cantidadProducto.value = "";
}

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
  actualizarListadoProductos();
  listarProveedores();
});

watch(selectedOption, () =>
  actualizarListadoProductos(),
  isLoading,
  loadingg
);
</script>

<template>
  <div class="q-pa-md" v-if="!visible">
    <div>
      <h3 style="text-align: center; margin: 10px">Productos</h3>
      <hr style="width: 70%; height: 5px; background-color: green" />
    </div>

    <div class="contSelect" style="margin-left: 5%; text-align: end; margin-right: 5%">
      <q-select background-color="green" class="q-my-md" v-model="selectedOption" outlined dense options-dense
        emit-value :options="options" />

      <input v-if="selectedOption === 'Listar Producto por Código'" v-model="listarCodigo" class="q-my-md" type="text"
        name="listarCodigo" id="listarCodigo" placeholder="Código del producto" />
    </div>

    <div>
      <div style="margin-left: 5%; text-align: end; margin-right: 5%" class="q-mb-md">
        <q-btn label="Agregar Producto" @click="mostrarFormularioAgregarProducto = true">
          <q-tooltip>
            Agregar Producto
          </q-tooltip>
        </q-btn>
        <!-- <q-btn label="Editar Producto" @click="mostrarFormularioEditarProducto = true" /> -->
      </div>

      <!-- Diálogo para agregar producto -->
      <q-dialog v-model="mostrarFormularioAgregarProducto" v-bind="mostrarFormularioAgregarProducto && limpiarCampos()">
        <q-card>
          <q-card-section>
            <div class="text-h5" style="padding: 10px 0 0 25px;">Agregar Producto</div>
          </q-card-section>

          <q-card-section>
            <q-form @submit.prevent="agregarProducto">
              <q-input v-model.trim="codigoProducto" label="Código del producto" filled required class="q-mb-md" />
              <q-select v-model="proveedor" label="Proveedor" filled outlined :options="proveedorOptions"
                class="q-mb-md" style="max-width: 100%;" required>
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section>
                      No results
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
              <q-input v-model.trim="descripcionProducto" type="textarea" label="Descripción del producto" filled
                required class="q-mb-md" />
              <q-input v-model="valorProducto" label="Valor del producto" type="number" filled required class="q-mb-md"
                min="0" />
              <q-input v-model="cantidadProducto" label="Cantidad del producto" type="number" filled required
                class="q-mb-md" min="0" />
              <q-select v-model="estadoProducto" label="Estado" filled outlined :options="estadoOptions" required
                class="q-mb-md" style="max-width: 100%;" />

              <!-- Botones de acción -->
              <div class="q-mt-md">
                <q-btn @click="mostrarFormularioAgregarProducto = false" label="Cancelar" color="negative"
                  class="q-mr-sm">
                  <q-tooltip>
                    Cancelar
                  </q-tooltip>
                </q-btn>
                <q-btn :loading="useProducto.loading" :disable="useProducto.loading" type="submit"
                  label="Guardar Producto" color="primary">
                  <q-tooltip>
                    Guardar Producto
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

      <!-- Diálogo para editar producto -->
      <q-dialog v-model="mostrarFormularioEditarProducto">
        <q-card>
          <q-card-section>
            <div class="text-h5" style="padding: 10px 0 0 25px;">Editar Producto</div>
          </q-card-section>

          <q-card-section>
            <q-form @submit.prevent="editarProducto">
              <q-input v-model.trim="codigoProducto" label="Código del producto" filled required class="q-mb-md" />
              <q-select v-model="proveedor" label="Proveedor" filled outlined :options="proveedorOptions"
                class="q-mb-md" style="max-width: 100%;" required>
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section>
                      No results
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
              <q-input v-model.trim="descripcionProducto" type="textarea" label="Descripción del producto" filled
                required class="q-mb-md" />
              <q-input v-model="valorProducto" label="Valor del producto" type="number" filled required class="q-mb-md"
                min="0" />
              <q-input v-model="cantidadProducto" label="Cantidad del producto" type="number" filled required
                class="q-mb-md" min="0" />
              <!-- style="padding: 10px 0 0 25px;" -->
              <!-- Botones de acción -->
              <div class="q-mt-md">
                <q-btn @click="mostrarFormularioEditarProducto = false" label="Cancelar" color="negative"
                  class="q-mr-sm">
                  <q-tooltip>
                    Cancelar
                  </q-tooltip>
                </q-btn>
                <q-btn :loading="useProducto.loading" :disable="useProducto.loading" type="submit"
                  label="Guardar Cambios" color="primary">
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
    <q-table flat bordered title="Productos" title-class="text-green text-weight-bolder text-h5" :rows="filteredRows"
      :columns="columns" row-key="id" :loading="loadingg">

      <template v-slot:body-cell-opciones="props">
        <q-td :props="props">
          <q-btn @click="cargarProductoParaEdicion(props.row)">
            ✏️
            <q-tooltip>
              Editar Producto
            </q-tooltip>
          </q-btn>
          <q-btn v-if="props.row.estado == 1" @click="inactivarProducto(props.row._id)">
            ❌
            <q-tooltip>
              Inactivar Producto
            </q-tooltip>
          </q-btn>
          <q-btn v-else @click="activarProducto(props.row._id)">
            ✅
            <q-tooltip>
              Activar Producto
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
}

.q-my-md {
  max-width: 500px;
  padding-left: 10px;
}
</style>
