<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useStoreMantenimientos } from "../stores/Mantenimientos.js";
import { useStoreMaquinas } from "../stores/Maquinas.js";
import { format } from "date-fns";

const useMaquina = useStoreMaquinas();
const useMantenimiento = useStoreMantenimientos();

const nombreMaquinaMantenimiento = ref("");
const fechaSeleccionada = ref("");

const selectedOption = ref("Listar Mantenimientos"); // Establecer 'Listar Mantenimientos' como valor por defecto
const options = [
  { label: "Listar Mantenimientos", value: "Listar Mantenimientos" },
  {
    label: "Listar Mantenimiento de la Máquina por su Nombre",
    value: "Listar Mantenimiento de la Máquina por su Nombre",
  },
  {
    label: "Listar Mantenimientos por Fecha",
    value: "Listar Mantenimientos por Fecha",
  },
  { label: "Agregar Mantenimiento", value: "Agregar Mantenimiento" },
];

let rows = ref([]);
const columns = ref([
  {
    name: "idMaquina",
    label: "Máquina",
    field: "idMaquina",
    align: "center",
  },
  {
    name: "fecha",
    label: "Fecha",
    align: "center",
    field: (row) => {
      // Obtener la fecha en formato de objeto Date
      const fecha = new Date(row.fecha);
      fecha.setDate(fecha.getDate() + 1);
      // Formatear la fecha sumada como "día/mes/año" usando date-fns
      const fechaFormateada = format(fecha, "dd/MM/yyyy");

      return fechaFormateada;
    },
  },
  {
    name: "descripcion",
    label: "Descripción",
    field: "descripcion",
    align: "center",
  },
  {
    name: "responsable",
    label: "Responsable",
    field: "responsable",
    align: "center",
  },
  {
    name: "precio",
    label: "Precio",
    field: "precio",
    align: "center",
  },
  {
    name: "estado",
    label: "Estado",
    field: "estado",
    align: "center",
  },
  {
    name: "opciones",
    label: "Opciones",
    field: "opciones",
    align: "center",
  },
]);

// Función computada para manejar la lógica de qué datos mostrar
const filteredRows = computed(() => {
  switch (selectedOption.value) {
    case "Listar Mantenimiento de la Máquina por su Nombre":
      return listarMantenimientosPorNombreMaquina.value;
    case "Listar Mantenimientos por Fecha":
      return listarMantenimientosPorFecha.value;
    default:
      return rows.value;
  }
});

async function listarMantenimientos() {
  const productosResponse = await useMaquina.getMaquinas();
  const productos = productosResponse.data.maquinas;
  console.log(productos);

  // Obtener la lista de ventas
  const ventasResponse = await useMantenimiento.getMantenimientos();
  const ventas = ventasResponse.data.mantenimientos;
  console.log(ventas);

  // Iterar sobre cada venta y asignar el descripcion del producto correspondiente
  ventas.forEach((venta) => {
    // Buscar el producto correspondiente al venta por su _id
    const producto = productos.find(
      (c) => c._id.toString() === venta.idMaquina.toString()
    );

    // Si se encontró el producto, asignar su descripcion al venta
    if (producto) {
      venta.idMaquina = producto.descripcion; // Suponiendo que `descripcion` es la propiedad que contiene el descripcion del producto
    } else {
      venta.idMaquina = "producto no encontrado"; // Si no se encuentra el producto, asignar un valor predeterminado
    }
  });

  // Asignar los ventas actualizados a la variable 'rows'
  rows.value = ventas;
}

const listarMantenimientosPorNombreMaquina = computed(() => {
  if (
    selectedOption.value ===
    "Listar Mantenimiento de la Máquina por su Nombre" &&
    nombreMaquinaMantenimiento.value
  ) {
    const nombreMaquina = nombreMaquinaMantenimiento.value.toLowerCase(); // Convertir a minúsculas para comparación sin distinción entre mayúsculas y minúsculas
    return rows.value.filter((row) =>
      row.idMaquina.toLowerCase().includes(nombreMaquina)
    );
  } else {
    return rows.value;
  }
});

const listarMantenimientosPorFecha = computed(() => {
  if (
    selectedOption.value === "Listar Mantenimientos por Fecha" &&
    fechaSeleccionada.value
  ) {
    const fechaSeleccionadaValue = new Date(fechaSeleccionada.value); // Usar la fecha seleccionada almacenada en fechaSeleccionada.value
    return rows.value.filter((row) => {
      const fechaMantenimiento = new Date(row.fecha);
      return (
        fechaMantenimiento.toDateString() ===
        fechaSeleccionadaValue.toDateString()
      );
    });
  } else {
    return rows.value;
  }
});
const maquinas = ref([]);

const listarMaquinas = async () => {
  try {
    const response = await useMaquina.getMaquinas(); // Ajusta según tu API de servicio
    if (response.data) {
      maquinas.value = response.data.maquinas; // Ajusta según la estructura de respuesta de tu API
      console.log("Maquinas listadas:", maquinas.value);
      // Verifica si selectedMachine y selectedMachine.value están definidos
    } else {
      console.error("La respuesta no contiene datos:", response);
    }
  } catch (error) {
    console.error("Error al listar las máquinas:", error);
  }
};

const maquinasOptions = computed(() => {
  return maquinas.value.map((maquina) => ({
    label: maquina.descripcion,
    id: maquina._id,
  }));
});

const selectedMachine = ref(null);
const idMaquina = ref('');
const fecha = ref('');
const descripcion = ref('');
const responsable = ref('');
const precio = ref("");
const idMantenimientoSeleccionado = ref(null);


const estadoOptions = [
  { label: "Activo" },
  { label: "Inactivo" },
];

const estadoM = ref(estadoOptions.find(option => option.label === "Activo").label);

const agregarMantenimiento = async () => {
  try {
    // Buscar la máquina seleccionada por su descripción
    const select = selectedMachine.value
    const label = select.label

    // Verificar si se encontró la máquina seleccionada
    if (!select) {
      console.log("Máquina seleccionada:", label);
      console.error("Máquina seleccionada no encontrada");
      return;
    }

    const idMaquinaSeleccionada = select.id;

    console.log("ID de la máquina seleccionada:", idMaquinaSeleccionada);

    // Verifica si fecha.value tiene un valor válido antes de continuar
    if (!fecha.value) {
      console.error("El valor de fecha es nulo o indefinido");
      return;
    }

    const fechaDate = new Date(fecha.value);
    fechaDate.setDate(fechaDate.getDate() + 1);

    // Asignar el valor de eA basado en el estado seleccionado
    const eA = estadoM.value === "Activo" ? 1 : 0;

    const mantenimientoData = {
      idMaquina: idMaquinaSeleccionada,
      fecha: fecha.value,
      descripcion: descripcion.value,
      responsable: responsable.value,
      precio: precio.value,
      estado: eA
    };

    console.log("id", idMaquinaSeleccionada);

    const resultado = await useMantenimiento.postMantenimientos(mantenimientoData);
    listarMantenimientos();
    estadoM.value = estadoOptions.find(option => option.label === "Activo").label; // Estado predeterminado
    limpiarCampos();
  } catch (error) {
    console.error("Error al agregar el mantenimiento:", error);
  }
};

const editarMantenimiento = async () => {
  console.log("ID de mantenimiento seleccionado:", idMantenimientoSeleccionado.value);
  console.log("Datos a enviar:", {
    idMaquina: idMaquina.value,
    fecha: formatDate(fecha.value),
    descripcion: descripcion.value,
    responsable: responsable.value,
    precio: precio.value,
  });

  const select = selectedMachine.value
    const label = select.label

    // Verificar si se encontró la máquina seleccionada
    if (!select) {
      console.log("Máquina seleccionada:", label);
      console.error("Máquina seleccionada no encontrada");
      return;
    }

    const idMaquinaSeleccionada = select.id;

console.log("ID de la máquina seleccionada:", idMaquinaSeleccionada);


  const mantenimientoEditado = {
      idMaquina: idMaquinaSeleccionada,
    fecha: formatDate(fecha.value),
    descripcion: descripcion.value,
    responsable: responsable.value,
    precio: precio.value,
  };

  try {
    if (!idMantenimientoSeleccionado.value) {
      throw new Error("ID del Mantenimiento no proporcionado para la actualización");
    }
    const response = await useMantenimiento.putMantenimientos(
      idMantenimientoSeleccionado.value,
      mantenimientoEditado
    );
    if (response.data) {
      listarMantenimientos()
      idMantenimientoSeleccionado.value = null;
      idMaquina.value = "";
      fecha.value = "";
      descripcion.value = "";
      responsable.value = "";
      precio.value = "";
      console.log("Mantenimiento editado con éxito:", response.data);
    } else {
      console.error("La respuesta no contiene datos:", response);
    }
  } catch (error) {
    console.error("Error al editar el mantenimiento:", error);
  }
};

const limpiarCampos = () => {
  idMantenimientoSeleccionado.value = null;
  idMaquina.value = "";
  fecha.value = "";
  descripcion.value = "";
  responsable.value = "";
  precio.value = "";
};
const mostrarFormularioAgregarMantenimiento = ref(false);
const mostrarFormularioEditarMantenimiento = ref(false);

const cambiarFormulario = (agregar) => {
  mostrarFormularioAgregarMantenimiento.value = agregar;
  mostrarFormularioEditarMantenimiento.value = !agregar;
};

const cargarMantenimientoParaEdicion = (mantenimiento) => {
  // Cargar los datos del mantenimiento en los campos del formulario
  idMantenimientoSeleccionado.value = mantenimiento._id; // Asegúrate de que el ID está siendo seleccionado
  selectedMachine.value = mantenimiento.idMaquina;
  fecha.value = mantenimiento.fecha.split("T")[0],// Manejar la fecha nula
  descripcion.value = mantenimiento.descripcion;
  responsable.value = mantenimiento.responsable;
  precio.value = mantenimiento.precio;

  // Cambiar al formulario de edición
  cambiarFormulario(false);
};
const formatDate = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  date.setDate(date.getDate() + 1); // Sumar un día
  const year = date.getFullYear();
  let month = date.getMonth() + 1;
  let day = date.getDate();

  // Agregar ceros delante si el día o el mes son menores que 10
  if (month < 10) {
    month = "0" + month;
  }
  if (day < 10) {
    day = "0" + day;
  }

  return `${year}-${month}-${day}`;
};
const cancelarMantenimiento = () => {
  mostrarFormularioAgregarMantenimiento.value = false;
  mostrarFormularioEditarMantenimiento.value = false;
  limpiarCampos();
};
async function inactivarMantenimiento(id) {
  const r = await useMantenimiento.putMantenimientosInactivar(id);
  console.log(r.data);
  listarMantenimientos();
}
async function activarMantenimiento(id) {
  const r = await useMantenimiento.putMantenimientosActivar(id);
  console.log(r.data);
  listarMantenimientos();
}
onMounted(async () => {
  await listarMaquinas(); // Asegúrate de que las máquinas se carguen antes de listar mantenimientos
  listarMantenimientos();
});

watch(selectedOption, (newValue) => {
  listarMantenimientos();
  if (newValue === "Agregar Mantenimiento" || newValue === "Agregar Mantenimiento" && mostrarFormularioAgregarMantenimiento.value === false) {
    mostrarFormularioAgregarMantenimiento.value = true; // Asignar el valor a la propiedad value
    mostrarFormularioEditarMantenimiento.value = false; // Asegurarse de asignar a la propiedad value
    // limpiarCampos()
  } else {
    mostrarFormularioEditarMantenimiento.value = false; // Asegurarse de asignar a la propiedad value
    mostrarFormularioAgregarMantenimiento.value = false; // Asignar el valor a la propiedad value
  }
});

</script>

<template>
  <div>
    <div class="q-pa-md">
      <div>
        <h3 style="text-align: center; margin: 10px">Mantenimientos</h3>
        <hr style="width: 70%; height: 5px; background-color: green" />
      </div>

      <div class="contSelect" style="margin-left: 5%; text-align: end; margin-right: 5%">
        <q-select background-color="green" class="q-my-md" v-model="selectedOption" outlined dense options-dense
          emit-value :options="options" />

        <input v-if="
          selectedOption ===
          'Listar Mantenimiento de la Máquina por su Nombre'
        " v-model="nombreMaquinaMantenimiento" class="q-my-md" type="text" name="search" id="searchMaquina"
          @dblclick="selectAllText" placeholder="Nombre de la Máquina del Mantenimiento a buscar" />

        <input v-if="selectedOption === 'Listar Mantenimientos por Fecha'" v-model="fechaSeleccionada" class="q-my-md"
          type="date" name="search" id="fechaMantenimiento" placeholder="Selecciona una fecha" />
      </div>

      <div>
        <!-- Dialogo para agregar mantenimiento -->
        <q-dialog v-model="mostrarFormularioAgregarMantenimiento">
          <q-card>
            <q-card-section>
              <div class="text-h6">Agregar Mantenimiento</div>
            </q-card-section>

            <q-card-section>
              <div class="q-pa-md">
                <q-form @submit.prevent="agregarMantenimiento">
                  <!-- Campos del formulario de agregar mantenimiento -->
                  <!-- Selección de máquina -->
                  <q-select v-model="selectedMachine" filled outlined label="Máquina" :options="maquinasOptions"
                    class="q-mb-md" />

                  <q-input v-model="fecha" label="Fecha" type="date" filled class="q-mb-md" />
                  <q-input v-model="descripcion" label="Descripción" filled class="q-mb-md" />
                  <q-input v-model="responsable" label="Responsable" filled class="q-mb-md" />
                  <q-input v-model="precio" label="Precio" type="number" filled class="q-mb-md" />
                  <q-select v-model="estadoM" label="Estado" outlined :options="estadoOptions" filled class="q-mb-md" />

                  <!-- Botón para agregar mantenimiento -->
                  <div class="q-mt-md">
                    <q-btn @click="cancelarMantenimiento" label="Cancelar" color="negative" class="q-ma-sm" />
                    <q-btn type="submit" label="Agregar Mantenimiento" color="primary" class="q-ma-sm" />
                  </div>
                </q-form>
              </div>
            </q-card-section>
          </q-card>
        </q-dialog>

        <!-- Dialogo para editar mantenimiento -->
        <q-dialog v-model="mostrarFormularioEditarMantenimiento">
          <q-card>
            <q-card-section>
              <div class="text-h6">Editar Mantenimiento</div>
            </q-card-section>

            <q-card-section>
              <div class="q-pa-md">
                <q-form @submit.prevent="editarMantenimiento">
                  <!-- Campos del formulario de editar mantenimiento -->
                  <!-- Selección de máquina -->
                  <q-select v-model="selectedMachine" filled outlined label="Máquina" :options="maquinasOptions"
                    class="q-mb-md" />

                  <q-input v-model="fecha" label="Fecha" type="date" filled class="q-mb-md" />
                  <q-input v-model="descripcion" label="Descripción" filled class="q-mb-md" />
                  <q-input v-model="responsable" label="Responsable" filled class="q-mb-md" />
                  <q-input v-model="precio" label="Precio" type="number" filled class="q-mb-md" />

                  <!-- Botón para editar mantenimiento -->
                  <div class="q-mt-md">
                    <q-btn @click="cancelarMantenimiento" label="Cancelar" color="negative" class="q-ma-sm" />
                    <q-btn type="submit" label="Editar Mantenimiento" color="primary" class="q-ma-sm" />
                  </div>
                </q-form>
              </div>
            </q-card-section>
          </q-card>
        </q-dialog>
      </div>

      <q-table flat bordered title="Mantenimientos" title-class="text-green text-weight-bolder text-h5"
        :rows="filteredRows" :columns="columns" row-key="id">
        <template v-slot:body-cell-opciones="props">
          <q-td :props="props">
            <q-btn @click="cargarMantenimientoParaEdicion(props.row)">✏️</q-btn>
            <q-btn v-if="props.row.estado == 1" @click="inactivarMantenimiento(props.row._id)">
              ❌
            </q-btn>
            <q-btn v-else @click="activarMantenimiento(props.row._id)">✅</q-btn>
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
  </div>
</template>

<style scoped>
.contSelect {
  display: flex;
  flex-direction: row;
  gap: 20px;
}

.q-select {
  max-width: 250px;
  /* Puedes ajustar el ancho según tu preferencia */
}

.q-my-md {
  max-width: 500px;
  padding-left: 10px;
}
</style>
