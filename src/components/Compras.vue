<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { notifyErrorRequest } from "../routes/routes.js";
import { useStoreCompras } from "../stores/Compras.js";
import { useStoreProductos } from "../stores/Productos.js";
import { format } from "date-fns";

// Para colocar puntos decimales a los nuemros
function formatoNumerico(numero) {
  return typeof numero === 'number' ? numero.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") : undefined;
}

// Loading
const visible = ref(true);
const listarCodigo = ref("")
const listarFechasOne = ref("")
const listarFechasTwo = ref("")

// // Variables parra mostrar formularios
const mostrarFormularioAgregarCompra = ref(false);
const mostrarFormularioEditarCompra = ref(false);

// Llamado de modelos
const useCompra = useStoreCompras();
const useProducto = useStoreProductos();

// // Variables de los inputs de agregar y editar
const idCompraSeleccionada = ref("");
const cantidad = ref("");
const codigoProducto = ref("");

const selectedOption = ref("Listar Compras");
const options = [
  { label: "Listar Compras", value: "Listar Compras" },
  { label: "Listar Compras por Producto", value: "Listar Compras por Producto" },
  { label: "Listar Compras por fechas", value: "Listar Compras por fechas" }
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
    field: row => row.codigoProducto ? row.codigoProducto.descripcion : '',
    align: "center",
    // field: row => row.productos.map(p => p.producto ? p.producto : '').join(', '),
    // field: row => row.productos ? row.productos.map(p => `Producto: ${p.producto}, Cantidad: ${formatoNumerico(p.cantidad)}, Precio: ${formatoNumerico(p.precio)}`).join(', ') : '',
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

async function listarCompras() {
  const comprasResponse = await useCompra.getCompras();
  const compras = comprasResponse.data;
  console.log("Compras", compras);

  rows.value = compras;
  visible.value = false;
}

const filtrarFilas = computed(() => {
  let comprasFiltradas = rows.value;

  if (selectedOption.value === "Listar Compras por Producto" && listarCodigo.value) {
    comprasFiltradas = comprasFiltradas.filter(row =>
      row.codigoProducto.descripcion.toLowerCase().includes(listarCodigo.value.toLowerCase())
    );
    // notifySuccessRequest('Compras listadas por producto exitosamente.');
  }

  if (listarFechasOne.value && listarFechasTwo.value) {
    const normalizeDate = date => new Date(date).toISOString().slice(0, 10);

    const startDate = normalizeDate(listarFechasOne.value);
    const endDate = normalizeDate(listarFechasTwo.value);

    if (startDate === endDate) {
      comprasFiltradas = comprasFiltradas.filter(compra => {
        const compraDate = normalizeDate(compra.createdAt);
        return compraDate === startDate;
      });
      // notifySuccessRequest('Compras listadas por fechas exitosamente.');
    } else {
      // notifyErrorRequest('Fechas inválidas o inconsistentes.');
    }
  }

  return comprasFiltradas;
});

const limpiarCampos = () => {
  codigoProducto.value = "";
  cantidad.value = "";
};

async function validarDatosCompra(compra) {
  const { codigoProducto } = compra;

  // Verificar si el codigoProducto está definido
  if (!codigoProducto) {
    notifyErrorRequest('El Producto es requerido.');
    return false;
  }

  return true;
}

async function agregarCompra() {
  const nuevaCompra = {
    codigoProducto: codigoProducto.value.id,
    cantidad: cantidad.value
  };

  if (await validarDatosCompra(nuevaCompra)) {
    const r = await useCompra.postCompras(nuevaCompra);
    if (r.status == 201) {
      mostrarFormularioAgregarCompra.value = false
      listarCompras();
      console.log("Compra agregada exitosamente", nuevaCompra)
    }
  }
}

function cargarCompraParaEdicion(compra) {
  idCompraSeleccionada.value = compra._id;
  codigoProducto.value = compra.codigoProducto.descripcion;
  cantidad.value = compra.cantidad;

  mostrarFormularioEditarCompra.value = true;
  console.log("Datos de la compra a editar", compra);
}

async function editarCompra() {
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
  const compraEditada = {
    _id: idCompraSeleccionada.value,
    codigoProducto: idCodigoProducto,
    cantidad: cantidad.value
  };

  if (await validarDatosCompra(compraEditada)) {
    const r = await useCompra.putCompras(idCompraSeleccionada.value, compraEditada);
    if (r.status === 200) {
      mostrarFormularioEditarCompra.value = false;
      listarCompras();
      console.log("Compra editada exitosamente", compraEditada);
    }
  }
}

const isLoading = computed(() => visible.value);

// Variable para aparecer le h5 de productos
const hasProductos = computed(() => cardProductos.value.length > 0);

onMounted(() => {
  listarCompras();
  listarProductos();
});

watch(selectedOption, () => {
  listarCompras();
  isLoading
});

</script>

<template>
  <div class="q-pa-md" v-if="!visible">
    <div>
      <h3 style="text-align: center; margin: 10px">Compras</h3>
      <hr style="width: 70%; height: 5px; background-color: green" />
    </div>

    <div class="contSelect" style="margin-left: 5%; text-align: end; margin-right: 5%">
      <q-select background-color="green" class="q-my-md" id="q-select" v-model="selectedOption" outlined dense
        options-dense emit-value :options="options" />

      <input v-if="selectedOption === 'Listar Compras por Producto'" v-model="listarCodigo" class="q-my-md" type="text"
        name="search" id="search" placeholder="Ingrese el producto" />

      <div v-if="selectedOption === 'Listar Compras por fechas'"
        style="display: flex; flex-direction: row; text-align: center; flex-wrap: wrap; position: absolute; top: 150px; left: 270px;">
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
        <q-btn label="Agregar Compra" @click="mostrarFormularioAgregarCompra = true">
          <q-tooltip>
            Agregar Compra
          </q-tooltip>
        </q-btn>
      </div>

      <!-- Formulario para agregar compra -->
      <q-dialog v-model="mostrarFormularioAgregarCompra" v-bind="mostrarFormularioAgregarCompra && limpiarCampos()">
        <q-card style="width: 380px;">
          <q-card-section>
            <div class="text-h6" style="padding: 10px 0 0 25px;">Agregar Compra</div>
          </q-card-section>
          <q-card-section style="padding: 20px 8px;">
            <q-form @submit.prevent="agregarCompra">

              <q-select v-model="codigoProducto" label="Producto" filled outlined :options="productoOptions"
                class="q-mb-md" required style="width: 85%; margin: auto; margin-bottom: 20px;">
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section>
                      No results
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
              <q-input v-model="cantidad" label="Cantidad" type="number" filled outlined class="q-mb-md" min="0"
                required style="width: 85%; margin: auto; margin-bottom: 20px;"/>

              <div style="display: flex; width: 100%; justify-content: center;">
              <q-btn label="Cancelar" color="negative" class="q-ma-sm" @click="mostrarFormularioAgregarCompra = false">
                <q-tooltip>
                  Cancelar
                </q-tooltip>
              </q-btn>
              <q-btn :loading="useCompra.loading" :disable="useCompra.loading" type="submit" label="Guardar Compra"
                color="primary" class="q-ma-sm">
                <q-tooltip>
                  Guardar Compra
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

      <!-- Formulario para editar compra -->
      <q-dialog v-model="mostrarFormularioEditarCompra">
        <q-card style="width: 380px;">
          <q-card-section>
            <div class="text-h6" style="padding: 10px 0 0 25px;">Editar Compra</div>
          </q-card-section>
          <q-card-section style="padding: 20px 8px;">
            <q-form @submit.prevent="editarCompra">

              <q-select v-model="codigoProducto" label="Producto" filled outlined :options="productoOptions"
                class="q-mb-md" required style="width: 85%; margin: auto; margin-bottom: 20px;">
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section>
                      No results
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
              <q-input v-model="cantidad" label="Cantidad" type="number" filled outlined class="q-mb-md" min="0"
              required style="width: 85%; margin: auto; margin-bottom: 20px;"/>

              <div style="display: flex; width: 100%; justify-content: center;">
                <q-btn label="Cancelar" color="negative" class="q-ma-sm" @click="mostrarFormularioEditarCompra = false">
                  <q-tooltip>
                    Cancelar
                  </q-tooltip>
                </q-btn>
                <q-btn :loading="useCompra.loading" :disable="useCompra.loading" type="submit" label="Guardar Cambios"
                  color="primary" class="q-ma-sm">
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

    <q-table flat bordered title="Compras" title-class="text-green text-weight-bolder text-h5" :rows="filtrarFilas"
      :columns="columns" row-key="id">
      <template v-slot:body-cell-opciones="props">
        <q-td :props="props">
          <q-btn @click="cargarCompraParaEdicion(props.row)">
            ✏️
            <q-tooltip>
              Editar Compra
            </q-tooltip>
          </q-btn>
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
