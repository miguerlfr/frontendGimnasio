<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useStoreVentas } from "../stores/Ventas.js";
import { useStoreProductos } from "../stores/Productos.js";
import { format } from "date-fns";

// Para colocar puntos decimales a los nuemros
function formatoNumerico(numero) {
  return typeof numero === 'number' ? numero.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") : undefined;
}

// Loading
const visible = ref(true);

// Variables parra mostrar formularios
const mostrarFormularioEditarVenta = ref(false);
const mostrarFormularioAgregarVenta = ref(false);

// Llamado de modelos
const useVenta = useStoreVentas();
const useProducto = useStoreProductos();

// Variables de los inputs de agregar y editar
const idVentaSeleccionada = ref("");
const codigoProducto = ref("");
const fecha = ref("");
const valorUnitario = ref("");
const cantidad = ref("");
const valorTotal = ref("");

const selectedOption = ref("Listar Ventas"); // Establecer 'Listar Ventas' como valor por defecto
const options = [
  { label: "Listar Ventas", value: "Listar Ventas" },
  {
    label: "Listar Ventas por Código del Producto",
    value: "Listar Ventas por Código del Producto",
  }
];

let rows = ref([]);
const columns = ref([
  {
    name: "fecha",
    label: "Fecha",
    field: (row) => {
      const fecha = new Date(row.fecha);
      fecha.setDate(fecha.getDate() + 1);
      const fechaFormateada = format(fecha, "dd/MM/yyyy");
      return fechaFormateada;
    },
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

// Array de modelo
const productos = ref([])

async function listarProductos() {
  try {
    const r = await useProducto.getProductos();
    if (r.data && r.data.productos) {
      productos.value = r.data.productos;
      console.log("productos listados:", productos.value);
    } else {
      console.error("La respuesta no contiene la propiedad 'productos'.", r.data);
    }
  } catch (error) {
    console.error("Error al listar las productos:", error);
  }
}

const productoOptions = computed(() => {
  return productos.value.map((producto) => ({
    label: producto.descripcion,
    id: producto._id,
    valor: producto.valor
  }));
});

async function listarVentas() {
  const ventasResponse = await useVenta.getVentas();
  const ventas = ventasResponse.data.ventas;
  console.log("ventas", ventas);

<<<<<<< HEAD
=======
  // Iterar sobre cada venta y asignar el descripcion del producto correspondiente
  ventas.forEach((venta) => {
    // Buscar el producto correspondiente al venta por su codigo
    const producto = productos.find((c) => c.descripcion.toString() === venta.codigoProducto.toString());


    // Si se encontró el producto, asignar su descripcion al venta
    if (producto) {
      venta.codigoProducto = producto.descripcion;
      venta.valorUnitario = producto.valor
      venta.valorTotal = producto.valor * venta.cantidad
    } else {
      venta.codigoProducto = "producto no encontrado";
    }
  });

  // Asignar los ventas actualizados a la variable 'rows'
>>>>>>> a45999c47dc0ad44c1a48f0aeb56572f157523e4
  rows.value = ventas;
  visible.value = false;
}

const listarVentasPorCodigoProducto = computed(() => {
  if (
    selectedOption.value === "Listar Ventas por Código del Producto" &&
    codigoProducto.value
  ) {
    const codigoInput = codigoProducto.value; // Obtener el código ingresado por el usuario
    return rows.value.filter((row) =>
      row.codigoProducto.toString().includes(codigoInput)
    );
  } else {
    return rows.value;
  }
});

function limpiarCampos() {
  idVentaSeleccionada.value = "";
  fecha.value = "";
  codigoProducto.value = "";
  valorUnitario.value = "";
  cantidad.value = "";
  valorTotal.value = "";
}

const cancelarEdicion = () => {
  mostrarFormularioEditarVenta.value = false;
  mostrarFormularioAgregarVenta.value = false;

  limpiarCampos();
};

async function agregarVenta() {

  let idCodigoProducto = codigoProducto.value.id
  let valor = codigoProducto.value.valor;

  // console.log("idCodigoProducto:", idCodigoProducto)
  // console.log("Valor:", valor);

  const nuevaVenta = {
    fecha: fecha.value,
    codigoProducto: idCodigoProducto,
    valorUnitario: valor,
    cantidad: cantidad.value,
    valorTotal: (valor * cantidad.value)
  };

  console.log(nuevaVenta);

  try {
    const response = await useVenta.postVentas(nuevaVenta);
    if (response.status === 200) {
      limpiarCampos()
      listarVentas();
    } else {
      console.error("Error al agregar la venta:", response);
    }

  } catch (error) {
    console.error("Error al agregar la venta:", error);
  }
  mostrarFormularioAgregarVenta.value = false
}

function cargarVentaParaEdicion(venta) {
  idVentaSeleccionada.value = venta._id;
  fecha.value = venta.fecha.split("T")[0],
  codigoProducto.value = venta.codigoProducto.descripcion;
  valorUnitario.value = venta.valorUnitario;
  cantidad.value = venta.cantidad;
  valorTotal.value = venta.valorUnitario * venta.cantidad;

  mostrarFormularioEditarVenta.value = true;
  mostrarFormularioAgregarVenta.value = false;

  console.log("Cargar", {
    id: idVentaSeleccionada.value,
    fecha: fecha.value,
    codigoProducto: codigoProducto.value,
    valorUnitario: valorUnitario.value,
    cantidad: cantidad.value,
    valorTotal: valorUnitario.value * cantidad.value,
  });
}

async function editarVenta() {
  console.log("c", codigoProducto.value);
  let idCodigoProducto;
  let valor;

  for (let producto of productos.value) {
    if (producto.descripcion === codigoProducto.value) {
      idCodigoProducto = producto._id
      valor = producto.valor;
      break;
    } else if (producto._id === codigoProducto.value.id) {
      idCodigoProducto = producto._id
      valor = producto.valor;
      break;
    }
  }

  const ventaEditada = {
    id: idVentaSeleccionada.value,
    fecha: fecha.value,
    codigoProducto: idCodigoProducto,
    valorUnitario: valor,
    cantidad: cantidad.value,
    valorTotal: (valor * cantidad.value),
  };

  console.log("idCodigoProducto", idCodigoProducto);
  console.log("Valor", valor);
  console.log("Editar", ventaEditada);

  try {
    const response = await useVenta.putVentas(
      idVentaSeleccionada.value,
      ventaEditada
    );
    if (response.status === 200) {
      listarVentas();
      limpiarCampos();
      idVentaSeleccionada.value = "";

    } else {
      console.error("Error al editar la venta:", response);
    }
  } catch (error) {
    console.error("Error al editar la venta:", error);
  }
}

onMounted(() => {
  listarVentas(),
    listarProductos();
});

watch(selectedOption, () => {
  listarVentas();
});
</script>

<template>
  <div>
    <div class="q-pa-md" v-if="!visible">
      <div>
        <h3 style="text-align: center; margin: 10px">Ventas</h3>
        <hr style="width: 70%; height: 5px; background-color: green" />
      </div>

      <div class="contSelect" style="margin-left: 5%; text-align: end; margin-right: 5%">
        <q-select background-color="green" class="q-my-md" id="q-select" v-model="selectedOption" outlined dense
          options-dense emit-value :options="options" />

        <input v-if="selectedOption === 'Listar Ventas por Código del Producto'" v-model="codigoProducto"
          class="q-my-md" type="text" name="search" id="search" placeholder="Ingrese el código del producto" />
      </div>

      <div>
        <div style="margin-left: 5%; text-align: end; margin-right: 5%" class="q-mb-md">
          <q-btn label="Agregar Venta" @click="mostrarFormularioAgregarVenta = true">
            <!-- <q-btn label="Editar Venta" @click="mostrarFormularioEditarVenta = true" /> -->
            <q-tooltip>
              {{ 'Agregar Venta' }}
            </q-tooltip>
          </q-btn>
        </div>

        <!-- Formulario para agregar venta -->
        <q-dialog v-model="mostrarFormularioAgregarVenta">
          <q-card>
            <q-card-section>
              <div class="text-h6">Agregar Venta</div>
            </q-card-section>
            <q-card-section>
              <q-form @submit.prevent="agregarVenta">
                <q-input v-model="fecha" label="Fecha de Venta" type="date" filled outlined class="q-mb-md" required/>
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
                <q-input v-model="valorUnitario" label="Valor Unitario" type="number" outlined style="display: none;" />
                <q-input v-model="valorTotal" label="Valor Total" type="number" outlined style="display: none;" />
                <q-input v-model="cantidad" label="Cantidad" type="number" filled outlined class="q-mb-md" required/>
                <q-btn label="Cancelar" color="negative" class="q-ma-sm" @click="cancelarEdicion">
                  <q-tooltip>
                    {{ 'Cancelar' }}
                  </q-tooltip>
                </q-btn>
                <q-btn type="submit" label="Guardar Cambios" color="primary" class="q-ma-sm">
                  <q-tooltip>
                    {{ 'Guardar Cambios' }}
                  </q-tooltip>
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
                <q-input v-model="fecha" label="Fecha de Venta" type="date" filled outlined class="q-mb-md" required/>
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
                <q-input v-model="valorUnitario" label="Valor Unitario" type="number" outlined style="display: none;" />
                <q-input v-model="valorTotal" label="Valor Total" type="number" outlined style="display: none;" />
                <q-input v-model="cantidad" label="Cantidad" type="number" filled outlined class="q-mb-md" required/>
                <q-btn label="Cancelar" color="negative" class="q-ma-sm" @click="cancelarEdicion">
                  <q-tooltip>
                    {{ 'Cancelar' }}
                  </q-tooltip>
                </q-btn>
                <q-btn type="submit" label="Guardar Cambios" color="primary" class="q-ma-sm">
                  <q-tooltip>
                    {{ 'Guardar Cambios' }}
                  </q-tooltip>
                </q-btn>
              </q-form>
            </q-card-section>
          </q-card>
        </q-dialog>
      </div>

      <q-table flat bordered title="Ventas" title-class="text-green text-weight-bolder text-h5"
        :rows="listarVentasPorCodigoProducto" :columns="columns" row-key="id">
        <template v-slot:body-cell-opciones="props">
          <q-td :props="props">
            <q-btn @click="cargarVentaParaEdicion(props.row)">
              ✏️
              <q-tooltip>
                {{ 'Editar Venta' }}
              </q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </div>
  </div>
  <q-inner-loading :showing="visible" label="Por favor espere..." label-class="text-teal"
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
