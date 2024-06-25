<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useStoreProductos } from "../stores/Productos.js";

// Para colocar puntos decimales a los nuemros
function formatoNumerico(numero) {
  return typeof numero === 'number' ? numero.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") : undefined;
}

// Llamado de modelo
const useProducto = useStoreProductos();

const visible = ref(true);
const listarCodigo = ref("")

const mostrarFormularioAgregarProducto = ref(false);
const mostrarFormularioEditarProducto = ref(false);

const codigoProducto = ref("");
const descripcionProducto = ref("");
const valorProducto = ref("");
const cantidadProducto = ref("");
const idProductoSeleccionado = ref(null);

const selectedOption = ref("Listar Productos"); // Establecer 'Listar Productos' como valor por defecto
const options = [
  { label: "Listar Productos", value: "Listar Productos" },
  { label: "Listar Producto por Código", value: "Listar Producto por Código" }
];

let rows = ref([]);
const columns = ref([
  { name: "codigo", label: "Código", field: "codigo", align: "center" },
  {
    name: "descripcion",
    label: "Descripción",
    field: "descripcion",
    align: "center",
  },
  { name: "valor", label: "Valor", field: (row) => formatoNumerico(row.valor), align: "center" },
  { name: "cantidad", label: "Cantidad", field: (row) => formatoNumerico(row.cantidad), align: "center" },
  { name: "opciones", label: "Opciones", field: "opciones", align: "center" },
]);

const filteredRows = computed(() => {
  switch (selectedOption.value) {
    case "Listar Producto por Código":
      return listarProductoCodigo.value;
    default:
      return rows.value;
  }
});

async function listarProductos() {
  try {
    const r = await useProducto.getProductos();
    console.log('Datos de productos recibidos:', r.data.productos);
    rows.value = r.data.productos;
    visible.value = false;
  } catch (error) {
    console.error('Error al obtener los productos:', error);
  }
}

const listarProductoCodigo = computed(() => {
  if (
    selectedOption.value === "Listar Producto por Código" &&
    listarCodigo.value
  ) {
    const codigoInput = listarCodigo.value;
    return rows.value.filter((producto) =>
      producto.codigo.toString().includes(codigoInput)
    );
  } else {
    return rows.value;
  }
});

async function agregarProducto() {
  const nuevoProducto = {
    codigo: codigoProducto.value,
    descripcion: descripcionProducto.value,
    valor: valorProducto.value,
    cantidad: cantidadProducto.value,
  };

  const response = await useProducto.postProductos(nuevoProducto);
  if (response.status === 200) {
    listarProductos();
    limpiarCampos();
  } else {
    console.error("Error al agregar el producto");
  }
}

function cargarProductoParaEdicion(producto) {
  idProductoSeleccionado.value = producto._id;
  codigoProducto.value = producto.codigo;
  descripcionProducto.value = producto.descripcion;
  valorProducto.value = producto.valor;
  cantidadProducto.value = producto.cantidad;

  console.log("datos", {
    idProductoSeleccionado: idProductoSeleccionado.value,
    codigoProducto: codigoProducto.value,
    descripcionProducto: descripcionProducto.value,
    valorProducto: valorProducto.value,
    cantidadProducto: cantidadProducto.value
  });

  cambiarFormulario(false);
}

async function editarProducto() {
  console.log('Editando producto con ID:', idProductoSeleccionado.value);
  if (idProductoSeleccionado.value) {
    const productoEditado = {
      codigo: codigoProducto.value,
      descripcion: descripcionProducto.value,
      valor: valorProducto.value,
      cantidad: cantidadProducto.value,
    };

    console.log("editacion", productoEditado);
    const response = await useProducto.putProductos(idProductoSeleccionado.value, productoEditado);
    if (response.status === 200) {
      listarProductos()
      limpiarCampos();
      idProductoSeleccionado.value = null;
    } else {
      console.error('Error al editar el producto:', response);
    }
  } else {
    console.error('El ID del producto seleccionado no es válido.');
  }
}

const cancelarProducto = () => {
  mostrarFormularioAgregarProducto.value = false;
  mostrarFormularioEditarProducto.value = false;
  limpiarCampos();
};

function limpiarCampos() {
  codigoProducto.value = "";
  descripcionProducto.value = "";
  valorProducto.value = "";
  cantidadProducto.value = "";
}

const cambiarFormulario = (agregar) => {
  mostrarFormularioAgregarProducto.value = agregar;
  mostrarFormularioEditarProducto.value = !agregar;
};

watch(selectedOption, () => {
  listarProductos()
});

onMounted(() => {
  listarProductos();
});
</script>

<template>
  <div>
    <div class="q-pa-md" v-if="!visible">
      <div>
        <h3 style="text-align: center; margin: 10px">Productos</h3>
        <hr style="width: 70%; height: 5px; background-color: green" />
      </div>

      <div class="contSelect" style="margin-left: 5%; text-align: end; margin-right: 5%">
        <q-select background-color="green" class="q-my-md" v-model="selectedOption" outlined dense options-dense
          emit-value :options="options" />

        <input v-if="selectedOption === 'Listar Producto por Código'" v-model="listarCodigo" class="q-my-md" type="text"
          name="listarCodigo" id="listarCodigo" placeholder="Ingrese el código del producto" />
      </div>

      <div>
        <div style="margin-left: 5%; text-align: end; margin-right: 5%" class="q-mb-md">
          <q-btn label="Agregar Producto" @click="mostrarFormularioAgregarProducto = true">
            <q-tooltip>
              {{ 'Agregar Producto' }}
            </q-tooltip>
          </q-btn>
          <!-- <q-btn label="Editar Producto" @click="mostrarFormularioEditarProducto = true" /> -->
        </div>

        <!-- Diálogo para agregar producto -->
        <q-dialog v-model="mostrarFormularioAgregarProducto">
          <q-card>
            <q-card-section>
              <div class="text-h5" style="padding: 10px 0 0 25px;">Agregar Producto</div>
            </q-card-section>

            <q-card-section>
              <q-form @submit.prevent="agregarProducto">
                <q-input v-model="codigoProducto" label="Código del producto" filled required class="q-mb-md" />
                <q-input v-model="descripcionProducto" label="Descripción del producto" filled required
                  class="q-mb-md" />
                <q-input v-model="valorProducto" label="Valor del producto" type="number" filled required
                  class="q-mb-md" />
                <q-input v-model="cantidadProducto" label="Cantidad del producto" type="number" filled required
                  class="q-mb-md" />

                <!-- Botones de acción -->
                <div class="q-mt-md">
                  <q-btn @click="cancelarProducto" label="Cancelar" color="negative" class="q-mr-sm" >
                                    <q-tooltip>
                    {{ 'Cancelar' }}
                  </q-tooltip>
                </q-btn>   
                  <q-btn type="submit" label="Agregar Producto" color="primary">
                    <q-tooltip>
                      {{ 'Agregar Plan' }}
                    </q-tooltip>
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
                <q-input v-model="codigoProducto" label="Código del producto" filled required class="q-mb-md" />
                <q-input v-model="descripcionProducto" label="Descripción del producto" filled required
                  class="q-mb-md" />
                <q-input v-model="valorProducto" label="Valor del producto" type="number" filled required
                  class="q-mb-md" />
                <q-input v-model="cantidadProducto" label="Cantidad del producto" type="number" filled required
                  class="q-mb-md" />
 <!-- style="padding: 10px 0 0 25px;" -->
                <!-- Botones de acción -->
                <div class="q-mt-md">
                  <q-btn @click="cancelarProducto" label="Cancelar" color="negative" class="q-mr-sm" >
                                    <q-tooltip>
                    {{ 'Cancelar' }}
                  </q-tooltip>
                </q-btn>   
                  <q-btn type="submit" label="Guardar Cambios" color="primary">
                    <q-tooltip>
                      {{ 'Guardar Cambios' }}
                    </q-tooltip>
                  </q-btn>
                </div>
              </q-form>
            </q-card-section>
          </q-card>
        </q-dialog>
      </div>

      <q-table flat bordered title="Productos" title-class="text-green text-weight-bolder text-h5" :rows="filteredRows"
        :columns="columns" row-key="id">
        <template v-slot:body-cell-opciones="props">
          <q-td :props="props">
            <q-btn @click="cargarProductoParaEdicion(props.row)">
              ✏️
              <q-tooltip>
                {{ 'Editar Plan' }}
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

.q-select {
  max-width: 200px;
  /* Puedes ajustar el ancho según tu preferencia */
}

.q-my-md {
  max-width: 500px;
  padding-left: 10px;
}
</style>
