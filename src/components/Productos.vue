<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useStoreProductos } from "../stores/Productos.js";

const useProducto = useStoreProductos();

const codigoProducto = ref("");
const descripcionProducto = ref("");
const valorProducto = ref("");
const cantidadProducto = ref("");
const idProductoSeleccionado = ref(null);

const selectedOption = ref("Listar Productos"); // Establecer 'Listar Productos' como valor por defecto
const options = [
  { label: "Listar Productos", value: "Listar Productos" },
  { label: "Listar Producto por Código", value: "Listar Producto por Código" },
  { label: "Agregar Producto", value: "Agregar Producto" },
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
  { name: "valor", label: "Valor", field: "valor", align: "center" },
  { name: "cantidad", label: "Cantidad", field: "cantidad", align: "center" },
  { name: "opciones", label: "Opciones", field: "opciones", align: "center" },
]);

// Función computada para manejar la lógica de qué datos mostrar
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
  } catch (error) {
    console.error('Error al obtener los productos:', error);
  }
}


// Función computada para filtrar los productos por código
const listarProductoCodigo = computed(() => {
  if (
    selectedOption.value === "Listar Producto por Código" &&
    codigoProducto.value
  ) {
    const codigoInput = codigoProducto.value; // Obtener el código ingresado por el usuario
    return rows.value.filter((producto) =>
      producto.codigo.toString().includes(codigoInput)
    );
  } else {
    return rows.value; // Devuelve todos los productos si no hay un código especificado
  }
});

// Agregar un nuevo producto
async function agregarProducto() {
  const nuevoProducto = {
    codigo: codigoProducto.value,
    descripcion: descripcionProducto.value,
    valor: valorProducto.value,
    cantidad: cantidadProducto.value,
  };

  const response = await useProducto.postProductos(nuevoProducto);
  if (response.status === 200) {
    // Actualizar la lista de productos después de agregar uno nuevo
    listarProductos();
    // Limpiar los campos del formulario después de agregar el producto
    limpiarCampos();
  } else {
    console.error("Error al agregar el producto");
  }
}

// Función para editar un producto
async function editarProducto() {
  console.log('Editando producto con ID:', idProductoSeleccionado.value);
  if (idProductoSeleccionado.value) {
    const productoEditado = {
      codigo: codigoProducto.value,
      descripcion: descripcionProducto.value,
      valor: valorProducto.value,
      cantidad: cantidadProducto.value,
    };

    const response = await useProducto.putProductos(idProductoSeleccionado.value, productoEditado);
    if (response.status === 200) {
      // Actualiza el producto en la lista local
      const index = rows.value.findIndex(prod => prod._id === idProductoSeleccionado.value);
      if (index !== -1) {
        rows.value[index] = { ...rows.value[index], ...productoEditado };
      }
      limpiarCampos();
      idProductoSeleccionado.value = null;
    } else {
      console.error('Error al editar el producto:', response);
    }
  } else {
    console.error('El ID del producto seleccionado no es válido.');
  }
}


// Función para cargar los datos de un producto en el formulario para editar
function cargarProductoParaEdicion(producto) {
  idProductoSeleccionado.value = producto._id;  // Asegúrate de usar _id
  codigoProducto.value = producto.codigo;
  descripcionProducto.value = producto.descripcion;
  valorProducto.value = producto.valor;
  cantidadProducto.value = producto.cantidad;
  selectedOption.value = 'Editar Producto';
}



// // Función para obtener un producto por su ID
// function obtenerProductoPorId(id) {
//   // Supongamos que 'rows.value' contiene la lista de productos
//   const producto = rows.value.find(producto => producto.id === id);
//   return producto; // Devuelve el producto encontrado o undefined si no se encuentra
// }

async function putProductos(id, datos) {
  console.log('ID del producto a editar:', id);
  console.log('datos del producto a editar:', datos); // Verifica el ID recibido

  // Buscar el producto en la lista de productos
  const producto = rows.value.find(prod => prod._id === id); // Usar `_id` para la comparación

  if (producto) {
    // Si se encuentra el producto, cargar los datos del producto en el formulario para editar
    console.log('Producto encontrado:', producto); // Verifica el producto encontrado
    cargarProductoParaEdicion(producto);
  } else {
    // Si el producto no se encuentra, manejar el caso apropiadamente (por ejemplo, mostrar un mensaje de error)
    console.error('El producto no fue encontrado');
  }
}





// Limpiar los campos del formulario
function limpiarCampos() {
  codigoProducto.value = "";
  descripcionProducto.value = "";
  valorProducto.value = "";
  cantidadProducto.value = "";
}

onMounted(() => {
  listarProductos();
});
</script>

<template>
  <div>
    <div class="q-pa-md">
      <div>
        <h3 style="text-align: center; margin: 10px">Productos</h3>
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
          v-if="selectedOption === 'Listar Producto por Código'"
          v-model="codigoProducto"
          class="q-my-md"
          type="text"
          name="codigoProducto"
          id="codigoProducto"
          placeholder="Ingrese el código del producto"
        />
      </div>

      <q-table
        flat
        bordered
        title="Productos"
        title-class="text-green text-weight-bolder text-h5"
        :rows="filteredRows"
        :columns="columns"
        row-key="id"
      >
        <template v-slot:body-cell-opciones="props">
          <q-td :props="props">
            <q-btn @click="putProductos(props.row._id)">✏️</q-btn>
          </q-td>
        </template>

      </q-table>
    </div>

        <!-- Formulario para agregar un nuevo producto -->
    <div v-if="selectedOption === 'Agregar Producto'">
      <h3>Agregar Producto</h3>
      <form @submit.prevent="agregarProducto">
        <input v-model="codigoProducto" type="text" placeholder="Código del producto" required>
        <input v-model="descripcionProducto" type="text" placeholder="Descripción del producto" required>
        <input v-model="valorProducto" type="number" placeholder="Valor del producto" required>
        <input v-model="cantidadProducto" type="number" placeholder="Cantidad del producto" required>
        <button type="submit">Agregar Producto</button>
      </form>
    </div>

        <!-- Formulario para editar un producto -->
    <div v-if="selectedOption === 'Editar Producto'">
      <h3>Editar Producto</h3>
      <form @submit.prevent="editarProducto">
        <!-- Aquí puedes mostrar los campos del formulario -->
        <input v-model="codigoProducto" type="text" placeholder="Código del producto" required>
        <input v-model="descripcionProducto" type="text" placeholder="Descripción del producto" required>
        <input v-model="valorProducto" type="number" placeholder="Valor del producto" required>
        <input v-model="cantidadProducto" type="number" placeholder="Cantidad del producto" required>
        <button type="submit">Editar Producto</button>
      </form>
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
