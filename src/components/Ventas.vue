<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useStoreVentas } from "../stores/Ventas.js";
import { useStoreProductos } from "../stores/Productos.js";
import { format } from "date-fns";

const useVenta = useStoreVentas();
const useProducto = useStoreProductos();

const codigoProducto = ref("");
const idVentaSeleccionada = ref("");
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
  },
  // { label: "Agregar Venta", value: "Agregar Venta" },
];

function formatoNumerico(numero) {
  return typeof numero === 'number' ? numero.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") : undefined;
}

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
    field: "codigoProducto",
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
  try {
    const r = await useProducto.getProductos();
    if (r.data && r.data.productos) {
      productos.value = r.data.productos;
      // console.log("productos listadas:", productos.value);
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
  }));
});

async function listarVentas() {
  // Obtener la lista de productos
  const productosResponse = await useProducto.getProductos();
  const productos = productosResponse.data.productos;
  console.log("produc", productos);

  // Obtener la lista de ventas
  const ventasResponse = await useVenta.getVentas();
  const ventas = ventasResponse.data.ventas;
  console.log("ventas", ventas);

  // Iterar sobre cada venta y asignar el descripcion del producto correspondiente
  ventas.forEach((venta) => {
    // Buscar el producto correspondiente al venta por su codigo
    const producto = productos.find((c) => c.descripcion.toString() === venta.codigoProducto.toString());


    // Si se encontró el producto, asignar su descripcion al venta
    if (producto) {
      venta.codigoProducto = producto.descripcion;
      venta.valorUnitario = producto.valor
    } else {
      venta.codigoProducto = "producto no encontrado";
    }
  });

  // Asignar los ventas actualizados a la variable 'rows'
  rows.value = ventas;
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

const mostrarFormularioEditarVenta = ref(false);
const mostrarFormularioAgregarVenta = ref(false);

async function agregarVenta() {

  const select = codigoProducto.value
    const label = select.label

    // Verificar si se encontró la máquina seleccionada
    if (!select) {
      console.error("Máquina seleccionada no encontrada", select);
      return;
      }
    // console.log("sede seleccionada:", label);

    // const idSede = select.id;


    const sele = codigoProducto.value;
    const labe = sele.label;
    console.log("Plan seleccionado:", labe);
    let valo = "";

    for (const producto of productos.value) {
      if (producto.descripcion === labe) {
        valo = producto.valor;
        break; // Exit the loop once a match is found
      }
    }

    const valoReal = valo;
    console.log("Valor real:", valoReal);



  const nuevaVenta = {
    fecha: fecha.value, // Accede al valor de fecha usando .value
    codigoProducto: label, // Accede al valor de codigoProducto usando .value
    valorUnitario: valo, // Accede al valor de valo usando .value
    cantidad: cantidad.value, // Accede al valor de cantidad usando .value
    valorTotal: (valo * cantidad.value), // Calcula el valor total
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
  // Formatear la fecha antes de asignarla al valor de fecha
  fecha.value = venta.fecha.split("T")[0], // Suponiendo que venta.fecha está en formato ISO8601
  codigoProducto.value = venta.codigoProducto;
  valorUnitario.value = venta.valorUnitario;
  cantidad.value = venta.cantidad;
  valorTotal.value = venta.valorUnitario * venta.cantidad;

  mostrarFormularioEditarVenta.value = true;
  mostrarFormularioAgregarVenta.value = false;
  console.log("Cargar", {
    id: idVentaSeleccionada.value,
    fecha: fecha.value, // Accede al valor de fecha usando .value
    codigoProducto: codigoProducto.value, // Accede al valor de codigoProducto usando .value
    valorUnitario: valorUnitario.value, // Accede al valor de valorUnitario usando .value
    cantidad: cantidad.value, // Accede al valor de cantidad usando .value
    valorTotal: valorUnitario.value * cantidad.value, // Calcula el valor total
  });
}


async function editarVenta() {

  const select = codigoProducto.value
  console.log(select);
    const label = select.label

    // Verificar si se encontró la máquina seleccionada
    if (!select) {
      console.error("Máquina seleccionada no encontrada", select);
      return;
      }
    console.log("sede seleccionada:", label);

    // const idSede = select.id;


    const sele = codigoProducto.value;
    const labe = sele.label;
    console.log("Plan seleccionado:", labe);
    let valo = "";

    for (const producto of productos.value) {
      if (producto.descripcion === labe) {
        valo = producto.valor;
        break; // Exit the loop once a match is found
      }
    }

    const valoReal = valo;
    console.log("Valor real:", valoReal);



  const ventaEditada = {
    id: idVentaSeleccionada.value,
    fecha: fecha.value,
    codigoProducto: label,
    valorUnitario: parseFloat(valo), // Convertir a número
    cantidad: parseInt(cantidad.value),
    valorTotal: valo * cantidad.value,
  };


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

// async function agregarVenta() {
//   const nuevaVenta = {
//     fecha: format(new Date(fecha.value), "yyyy-MM-dd"),
//     codigoProducto: codigoProducto.value.trim(),
//     valorUnitario: parseFloat(valorUnitario.value),
//     cantidad: parseInt(cantidad.value),
//     valorTotal: parseFloat(valorUnitario.value) * parseInt(cantidad.value)
//   };

//   if (!nuevaVenta.fecha ||
//       !nuevaVenta.codigoProducto ||
//       isNaN(nuevaVenta.valorUnitario) || nuevaVenta.valorUnitario <= 0 ||
//       isNaN(nuevaVenta.cantidad) || nuevaVenta.cantidad <= 0) {
//     console.error('Datos inválidos:', nuevaVenta);
//     return;
//   }

//   try {
//     if (idVentaSeleccionada.value) {
//       // Si hay una venta seleccionada, significa que estamos editando
//       await useStoreVentas().putVentas(idVentaSeleccionada.value, nuevaVenta);
//     } else {
//       // Si no hay una venta seleccionada, estamos creando una nueva
//       const response = await useStoreVentas().postVentas(nuevaVenta);
//       if (response.status === 200 || response.status === 201) {
//         listarVentas();
//         limpiarCampos();
//       } else {
//         console.error('Error al agregar la venta:', response);
//       }
//     }
//   } catch (error) {
//     console.error('Error al agregar o editar la venta:', error);
//   }
// }


function limpiarCampos() {
  idVentaSeleccionada.value = "";
  fecha.value = "";
  codigoProducto.value = "";
  valorUnitario.value = "";
  cantidad.value = "";
  valorTotal.value = "";
}
const cancelarEdicion = () => {
  // Ocultar el formulario de edición
  mostrarFormularioEditarVenta.value = false;
  // Limpiar los campos del formulario
  limpiarCampos();
};

watch(selectedOption, (newValue) => {
  listarVentas();
  if (newValue === "Agregar Venta") {
    // limpiarCampos(); // Esto parece ser una función para limpiar los campos, si es necesario, puedes llamarla aquí
    mostrarFormularioAgregarVenta.value = true; // Mostrar el formulario de agregar venta
    mostrarFormularioEditarVenta.value = false;
  } else {
    // limpiarCampos(); // Esto parece ser una función para limpiar los campos, si es necesario, puedes llamarla aquí
    mostrarFormularioEditarVenta.value = false;
    mostrarFormularioAgregarVenta.value = false; // Ocultar el formulario de agregar venta si se selecciona otra opción
  }
});

onMounted(() => {
  listarVentas();
  listarProductos();
});
</script>

<template>
  <div>
    <div class="q-pa-md">
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
          <q-btn label="Agregar Venta" @click="mostrarFormularioAgregarVenta = true" />
          <!-- <q-btn label="Editar Venta" @click="mostrarFormularioEditarVenta = true" /> -->
        </div>

        <!-- Formulario para agregar venta -->
        <q-dialog v-model="mostrarFormularioAgregarVenta">
          <q-card>
            <q-card-section>
              <div class="text-h6">Agregar Venta</div>
            </q-card-section>
            <q-card-section>
              <q-form @submit.prevent="agregarVenta">
                <q-input v-model="fecha" label="Fecha de Venta" type="date" outlined />
                <q-select v-model="codigoProducto" label="Código Producto" outlined :options="productoOptions" class="q-mb-md" />
                <q-input v-model="valorUnitario" label="Valor Unitario" type="number" outlined  style="display: none;" />
                <q-input v-model="valorTotal" label="Valor Total" type="number" outlined style="display: none;" />
                <q-input v-model="cantidad" label="Cantidad" type="number" outlined />
                <q-btn type="submit" label="Guardar Venta" color="primary" class="q-ma-sm" />
                <q-btn label="Limpiar" color="negative" class="q-ma-sm" @click="limpiarCampos" />
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
                <q-input v-model="fecha" label="Fecha de Venta" type="date" outlined />
                <q-select v-model="codigoProducto" label="Código Producto" outlined :options="productoOptions" class="q-mb-md" />
                <q-input v-model="valorUnitario" label="Valor Unitario" type="number" outlined  style="display: none;" />
                <q-input v-model="valorTotal" label="Valor Total" type="number" outlined style="display: none;" />
                <q-input v-model="cantidad" label="Cantidad" type="number" outlined />
                <q-btn type="submit" label="Guardar Cambios" color="primary" class="q-ma-sm" />
                <q-btn label="Cancelar" color="negative" class="q-ma-sm" @click="cancelarEdicion" />
              </q-form>
            </q-card-section>
          </q-card>
        </q-dialog>
      </div>

      <q-table flat bordered title="Ventas" title-class="text-green text-weight-bolder text-h5"
        :rows="listarVentasPorCodigoProducto" :columns="columns" row-key="id">
        <template v-slot:body-cell-opciones="props">
          <q-td :props="props">
            <q-btn @click="cargarVentaParaEdicion(props.row)">✏️</q-btn>
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

.q-my-md {
  max-width: 200px;
  padding-left: 10px;
}
</style>
