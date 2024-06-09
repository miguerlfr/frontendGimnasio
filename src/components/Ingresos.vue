<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useStoreClientes } from "../stores/Clientes.js";
import { useStoreIngresos } from "../stores/Ingresos.js";
import { useStoreSedes } from "../stores/Sedes.js";
import { format } from "date-fns";
import { Notify } from "quasar";

const useCliente = useStoreClientes();
const useIngreso = useStoreIngresos();
const useSede = useStoreSedes();

const nombreClienteIngreso = ref("");
const idIngresoSeleccionado = ref(null);
const fecha = ref("");
const sede = ref("")

const sedes = ref([])

async function listarSedes() {
  try {
    const r = await useSede.getSedes();
    if (r.data && r.data.sedes) {
      sedes.value = r.data.sedes;
      console.log("Sedes listadas:", sedes.value);
    } else {
      console.error("La respuesta no contiene la propiedad 'sedes'.", r.data);
    }
  } catch (error) {
    console.error("Error al listar las sedes:", error);
  }
}

const sedeOptions = computed(() => {
  return sedes.value.map((sede) => ({
    label: sede.nombre,
    id: sede._id,
  }));
});

// const cliente = ref("");
const clientes = ref([]);
const nombreCliente = ref("");

const selectedOption = ref("Listar Ingresos"); // Establecer 'Listar Ingresos' como valor por defecto
const options = [
  { label: "Listar Ingresos", value: "Listar Ingresos" },
  {
    label: "Listar Ingreso del Cliente por su Nombre",
    value: "Listar Ingreso del Cliente por su Nombre",
  },
  // { label: "Agregar Ingreso", value: "Agregar Ingreso" },
];

let rows = ref([]);
let columns = ref([
  {
    name: "fecha",
    label: "Fecha",
    align: "center",
    field: (row) => {
      // Obtener la fecha en formato de objeto Date
      const fecha = new Date(row.fecha);
      fecha.setDate(fecha.getDate() + 1);
      // Formatear la fecha sumada como "día mes año" usando date-fns
      const fechaFormateada = format(fecha, "dd/MM/yyyy");

      return fechaFormateada;
    },
  },
  { name: "sede", label: "Sede", field: "sede", align: "center" }, // Corregido "Sede" a "sede"
  { name: "cliente", label: "Cliente", field: "cliente", align: "center" },
  { name: "opciones", label: "Opciones", field: "opciones", align: "center" },
]);

// Función computada para manejar la lógica de qué datos mostrar
const filteredRows = computed(() => {
  switch (selectedOption.value) {
    case "Listar Ingreso del Cliente por su Nombre":
      return listarIngresoPorNombreCliente.value;
    default:
      return rows.value;
  }
});

async function listarIngresos() {
  try {
    // Realizar todas las llamadas de forma simultánea
    const [clientesResponse, ingresosResponse, sedesResponse] = await Promise.all([
      useCliente.getClientes(),
      useIngreso.getIngresos(),
      useSede.getSedes()
    ]);

    // Extraer los datos de las respuestas
    const clientes = clientesResponse.data.clientes;
    const ingresos = ingresosResponse.data.ingresos;
    const sedes = sedesResponse.data.sedes;

    console.log("Clientes:", clientes);
    console.log("Ingresos:", ingresos);
    console.log("Sedes:", sedes);

    // Iterar sobre cada ingreso y asignar el nombre del cliente correspondiente
    ingresos.forEach((ingreso) => {
      // Buscar el cliente correspondiente al ingreso por su _id
      const cliente = clientes.find((c) => c._id === ingreso.cliente);
      const sede = sedes.find((s) => s._id === ingreso.sede); // Cambiar a comparar por _id en lugar de nombre

      // Si se encontró el cliente, asignar su nombre al ingreso
      if (cliente && sede) { // Asegúrate de que tanto el cliente como la sede sean encontrados
        ingreso.cliente = cliente.nombre;
        ingreso.sede = sede.nombre; // Asignar el nombre de la sede en lugar de su _id
      } else {
        ingreso.cliente = "Cliente no encontrado"; // Si no se encuentra el cliente, asignar un valor predeterminado
        ingreso.sede = "Sede no encontrada";
      }
    });

    // Asignar los ingresos actualizados a la variable 'rows'
    rows.value = ingresos;
  } catch (error) {
    console.error("Error al listar ingresos:", error);
  }
}


const listarIngresoPorNombreCliente = computed(() => {
  if (
    selectedOption.value === "Listar Ingreso del Cliente por su Nombre" &&
    nombreClienteIngreso.value
  ) {
    const nombreCliente = nombreClienteIngreso.value.toLowerCase(); // Convertir a minúsculas para comparación sin distinción entre mayúsculas y minúsculas
    return rows.value.filter((row) =>
      row.cliente.toLowerCase().includes(nombreCliente)
    );
  } else {
    return rows.value;
  }
});


const mostrarFormularioAgregarIngreso = ref(false);
const mostrarFormularioEditarIngreso = ref(false);

const listarClientes = async () => {
  try {
    const response = await useCliente.getClientes();
    clientes.value = response.data.clientes;
    console.log(clientes.value);
    console.log("Clientes listados:", clientes.value); // Agrega esta línea para verificar los clientes listados
  } catch (error) {
    console.error("Error al listar los clientes:", error);
  }
};
const validarCliente = () => {
  if (!nombreCliente.value || typeof nombreCliente.value !== 'string' || nombreCliente.value.trim() === '') {
    // Si nombreCliente.value no está definido, no es una cadena o está vacío, mostrar un mensaje de error
    Notify.create({
      type: "negative",
      message: "Nombre del cliente incorrecto",
    });
    return null;
  }

  // Normalizar el nombre del cliente ingresado
  const nombreClienteNormalizado = nombreCliente.value
    .trim()
    .toLowerCase();

  // Buscar el cliente encontrado en la lista de clientes
  const clienteEncontrado = clientes.value.find(
    (cliente) => cliente.nombre.trim().toLowerCase() === nombreClienteNormalizado
  );

  // Si no se encontró el cliente, mostrar una notificación y retornar null
  if (!clienteEncontrado) {
    Notify.create({
      type: "negative",
      message: "Cliente no encontrado",
    });
    return null;
  }

  // Si se encontró el cliente, retornar el objeto cliente completo
  return clienteEncontrado;
};
const cargarIngresoParaEdicion = (ingreso) => {
  idIngresoSeleccionado.value = ingreso._id;
  fecha.value = ingreso.fecha.split("T")[0];
  sede.value = ingreso.sede;
  nombreCliente.value = ingreso.cliente; // Asegúrate de actualizar correctamente el nombre del cliente
  mostrarFormularioAgregarIngreso.value = false;
  mostrarFormularioEditarIngreso.value = true;
};

// // Esta función simula la actualización de un cliente en la base de datos
// const actualizarCliente = async (cliente) => {
//   try {
//     // Aquí iría tu lógica para actualizar el cliente en la base de datos
//     // Por ejemplo, podrías hacer una petición HTTP POST o PUT a tu servidor

//     // Simulación de una respuesta exitosa
//     return { status: 200, message: "Cliente actualizado correctamente" };
//   } catch (error) {
//     // En caso de error, maneja la excepción adecuadamente
//     throw new Error("Error al actualizar el cliente: " + error.message);
//   }
// };

const agregarIngreso = async () => {
  console.log("Nombre del cliente ingresado:", nombreCliente.value);

    // Buscar la máquina seleccionada por su descripción
    const select = sede.value
    const nombre = select.nombre

    // Verificar si se encontró la máquina seleccionada
    if (!select) {
      console.log("Máquina seleccionada:", nombre);
      console.error("Máquina seleccionada no encontrada");
      return;
    }

    const idSede = select.id;
  
  const clienteId = validarCliente();
  if (!clienteId) return;

  // Obtener la fecha actual
  const fechaActual = new Date(fecha.value);

  // Sumar un día a la fecha actual
  fechaActual.setDate(fechaActual.getDate());

  // Crear un nuevo ingreso
  const nuevoIngreso = {
    fecha: fechaActual,
    sede: idSede,
    cliente: clienteId,
  };
  console.log(idSede);

  try {
    // Utilizar useIngreso.postIngresos para agregar el nuevo ingreso
    const response = await useIngreso.postIngresos(nuevoIngreso);

    if (response.status === 200) {
      mostrarFormularioAgregarIngreso.value = false
      listarIngresos();
      limpiarCamposIngreso();
    } else {
      console.error("Error al agregar el ingreso:", response);
    }
  } catch (error) {
    console.error("Error al agregar el ingreso:", error);
  }

};
const editarIngreso = async () => {

    // Buscar la máquina seleccionada por su descripción
    const select = sede.value
    const nombre = select.nombre

    // Verificar si se encontró la máquina seleccionada
    if (!select) {
      console.log("Máquina seleccionada:", nombre);
      console.error("Máquina seleccionada no encontrada");
      return;
    }

    const idSede = select.id;

  const clienteId = validarCliente();
  if (!clienteId) return;

  const ingresoEditado = {
    fecha: fecha.value,
    sede: idSede,
    cliente: clienteId,
  };

  try {
    const response = await useIngreso.putIngresos(
      idIngresoSeleccionado.value,
      ingresoEditado
    );
    if (response.status === 200) {
      mostrarFormularioEditarIngreso.value = false;
      listarIngresos();
      limpiarCamposIngreso();
      idIngresoSeleccionado.value = null;
    } else {
      console.error("Error al editar el ingreso:", response);
    }
  } catch (error) {
    console.error("Error al editar el ingreso:", error);
  }
};
const limpiarCamposIngreso = () => {
  idIngresoSeleccionado.value = null;
  fecha.value = "";
  sede.value = "";
  nombreCliente.value = "";
};
const cancelarIngreso = () => {
  mostrarFormularioAgregarIngreso.value = false;
  mostrarFormularioEditarIngreso.value = false;
  limpiarCamposIngreso();
};

watch(selectedOption, (newValue) => {
  listarIngresos();
  if (newValue === "Agregar Ingreso") {
    limpiarCamposIngreso()
    mostrarFormularioAgregarIngreso.value = true;
    mostrarFormularioEditarIngreso.value = false;
  } else {
    mostrarFormularioEditarIngreso.value = false;
    mostrarFormularioAgregarIngreso.value = false;
  }
});

onMounted(() => {
  listarIngresos(),
  listarClientes(),
  listarSedes()
});
</script>

<template>
  <div>
    <div class="q-pa-md">
      <div>
        <h3 style="text-align: center; margin: 10px">Ingresos</h3>
        <hr style="width: 70%; height: 5px; background-color: green" />
      </div>

      <div class="contSelect" style="margin-left: 5%; text-align: end; margin-right: 5%">
        <q-select background-color="green" class="q-my-md" v-model="selectedOption" outlined dense options-dense
          emit-value :options="options" />

        <input v-if="selectedOption === 'Listar Ingreso del Cliente por su Nombre'" v-model="nombreClienteIngreso"
          class="q-my-md" type="text" name="search" id="search" @dblclick="selectAllText"
          placeholder="Nombre del Cliente del Ingreso a buscar" />
      </div>

      <div>
        <div style="margin-left: 5%; text-align: end; margin-right: 5%" class="q-mb-md">
          <q-btn label="Agregar Ingreso" @click="mostrarFormularioAgregarIngreso = true" />
          <!-- <q-btn label="Editar Ingreso" @click="mostrarFormularioEditarIngreso = true" /> -->
        </div>

        <!-- Dialogo para agregar ingreso -->
        <q-dialog v-model="mostrarFormularioAgregarIngreso">
          <q-card>
            <q-card-section>
              <div class="text-h6">Agregar Ingreso</div>
            </q-card-section>

            <q-card-section>
              <q-form @submit.prevent="agregarIngreso">
                <q-input v-model="fecha" label="Fecha" type="date" outlined class="q-mb-md" />
                <q-select v-model="sede" label="Sede" outlined :options="sedeOptions" class="q-mb-md" />
                <q-input v-model="nombreCliente" label="Cliente" outlined class="q-mb-md" />
                <div class="q-mt-md">
                  <q-btn @click="cancelarIngreso" label="Cancelar" color="negative" class="q-ma-sm" />
                  <q-btn type="submit" label="Guardar Ingreso" color="primary" class="q-ma-sm" />
                </div>
              </q-form>
            </q-card-section>
          </q-card>
        </q-dialog>

        <!-- Dialogo para editar ingreso -->
        <q-dialog v-model="mostrarFormularioEditarIngreso">
          <q-card>
            <q-card-section>
              <div class="text-h6">Editar Ingreso</div>
            </q-card-section>

            <q-card-section>
              <q-form @submit.prevent="editarIngreso">
                <q-input v-model="fecha" label="Fecha" type="date" outlined class="q-mb-md" />
                <q-select v-model="sede" label="Sede" outlined :options="sedeOptions" class="q-mb-md" />
                <q-input v-model="nombreCliente" label="Cliente" outlined class="q-mb-md" />
                <div class="q-mt-md">
                  <q-btn @click="cancelarIngreso" label="Cancelar" color="negative" class="q-ma-sm" />
                  <q-btn type="submit" label="Guardar Cambios" color="primary" class="q-ma-sm" />
                </div>
              </q-form>
            </q-card-section>
          </q-card>
        </q-dialog>
      </div>

      <q-table flat bordered title="Ingresos" title-class="text-green text-weight-bolder text-h5" :rows="filteredRows"
        :columns="columns" row-key="id">
        <template v-slot:body-cell-opciones="props">
          <q-td :props="props">
            <q-btn @click="cargarIngresoParaEdicion(props.row)">✏️</q-btn>
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

.q-select {
  max-width: 200px;
  /* Puedes ajustar el ancho según tu preferencia */
}

.q-my-md {
  max-width: 500px;
  padding-left: 10px;
}
</style>
