<script setup>
import { ref, onMounted, computed } from "vue";
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




// Referencias para los campos del formulario
const selectedMachine = ref(null);
const idMaquina = ref('');
const fecha = ref('');
const descripcion = ref('');
const responsable = ref('');
const precio = ref(0);
const estado = ref('');
const idMantenimientoSeleccionado = ref(null);
const maquinas = ref([]);

// Función para listar las máquinas
const listarMaquinas = async () => {
  try {
    const response = await useMaquina.getMaquinas(); // Ajusta según tu API de servicio
    if (response.data) {
      maquinas.value = response.data.maquinas; // Ajusta según la estructura de respuesta de tu API
      console.log("Maquinas listadas:", maquinas.value);
    } else {
      console.error("La respuesta no contiene datos:", response);
    }
  } catch (error) {
    console.error("Error al listar las máquinas:", error);
  }
};

const agregarMantenimiento = async () => {
  // Convertir la cadena de fecha a un objeto Date
  const fechaDate = new Date(fecha.value);

  // Sumar un día a la fecha
  fechaDate.setDate(fechaDate.getDate() + 1);

  const mantenimientoData = {
    idMaquina: idMaquina.value,
    fecha: fechaDate, // Usar el objeto Date con un día agregado
    descripcion: descripcion.value,
    responsable: responsable.value,
    precio: precio.value,
    estado: estado.value,
  };

  try {
    const resultado = await useMantenimiento.postMantenimientos(mantenimientoData);
    console.log("Mantenimiento agregado con éxito:", resultado);
    listarMantenimientos()
    limpiarCampos();
  } catch (error) {
    console.error("Error al agregar el mantenimiento:", error);
  }
};

const editarMantenimiento = async () => {
  const fechaDate = new Date(fecha.value);

  // Sumar un día a la fecha
  fechaDate.setDate(fechaDate.getDate() + 1);

  const mantenimientoEditado = {
    idMaquina: idMaquina.value,
    fecha: fechaDate, // Usar el objeto Date con un día agregado
    descripcion: descripcion.value,
    responsable: responsable.value,
    precio: precio.value,
    estado: estado.value,
  };

  try {
    const response = await useMantenimiento.putMantenimientos(
      idMantenimientoSeleccionado.value,
      mantenimientoEditado
    ); // Ajusta según tu API de servicio
    if (response.data) {
      // Lógica para manejar la respuesta exitosa
      limpiarCampos();
      console.log("Mantenimiento editado con éxito:", response.data);
    } else {
      console.error("La respuesta no contiene datos:", response);
    }
  } catch (error) {
    console.error("Error al editar el mantenimiento:", error);
  }
};



// Función para limpiar los campos del formulario
const limpiarCampos = () => {
  idMantenimientoSeleccionado.value = null;
  idMaquina.value = "";
  fecha.value = "";
  descripcion.value = "";
  responsable.value = "";
  precio.value = 0;
  estado.value = ""; // Estado predeterminado
};

// Computed property para las opciones de máquinas
const maquinasOptions = computed(() => {
  return maquinas.value.map((maquina) => ({
    label: maquina.descripcion,
    value: maquina._id,
  }));
});

// Función para manejar la selección de la máquina
const handleMaquinaSelection = () => {
  idMaquina.value = selectedMachine.value; // Asigna directamente el _id de la máquina seleccionada
};
const cargarMantenimientoParaEdicion = (mantenimiento) => {
  idMaquina.value = mantenimiento.idMaquina;
  if (mantenimiento.fecha) {
    fecha.value = formatDate(mantenimiento.fecha);
  } else {
    fecha.value = ""; // o establecer un valor predeterminado en caso de que sea null
  }
  descripcion.value = mantenimiento.descripcion;
  responsable.value = mantenimiento.responsable;
  precio.value = mantenimiento.precio;
  estado.value = mantenimiento.estado;

  // Establecer el valor seleccionado del select
  const maquinaSeleccionada = maquinasOptions.value.find(
    (maquina) => maquina.value === mantenimiento.idMaquina
  );
  if (maquinaSeleccionada) {
    selectedMachine.value = maquinaSeleccionada.value;
    console.log("Máquina seleccionada para edición:", maquinaSeleccionada);
  }
};




const formatDate = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  const year = date.getFullYear();
  let month = date.getMonth() + 1;
  let day = date.getDate();

  if (month < 10) {
    month = "0" + month;
  }
  if (day < 10) {
    day = "0" + day;
  }

  return `${year}-${month}-${day}`;
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

onMounted(() => {
  listarMantenimientos();
  listarMaquinas();
});
</script>

<template>
  <div>
    <div class="q-pa-md">
      <div>
        <h3 style="text-align: center; margin: 10px">Mantenimientos</h3>
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
          v-if="
            selectedOption ===
            'Listar Mantenimiento de la Máquina por su Nombre'
          "
          v-model="nombreMaquinaMantenimiento"
          class="q-my-md"
          type="text"
          name="search"
          id="searchMaquina"
          @dblclick="selectAllText"
          placeholder="Nombre de la Máquina del Mantenimiento a buscar"
        />

        <input
          v-if="selectedOption === 'Listar Mantenimientos por Fecha'"
          v-model="fechaSeleccionada"
          class="q-my-md"
          type="date"
          name="search"
          id="fechaMantenimiento"
          placeholder="Selecciona una fecha"
        />
      </div>

      <div>
    <!-- Selección de máquina -->
    <select v-model="selectedMachine" @change="handleMaquinaSelection">
      <option v-for="maquina in maquinasOptions" :key="maquina.value" :value="maquina.value">
        {{ maquina.label }}
      </option>
    </select>

    <!-- Campos del formulario de mantenimiento -->
    <input v-model="fecha" type="date" placeholder="Fecha" />
    <input v-model="descripcion" type="text" placeholder="Descripción" />
    <input v-model="responsable" type="text" placeholder="Responsable" />
    <input v-model="precio" type="number" placeholder="Precio" />
    <input v-model="estado" type="text" placeholder="Estado" />

    <!-- Botones para agregar y editar mantenimiento -->
    <button @click="agregarMantenimiento">Agregar Mantenimiento</button>
    <button @click="editarMantenimiento">Editar Mantenimiento</button>
  </div>

      <q-table
        flat
        bordered
        title="Mantenimientos"
        title-class="text-green text-weight-bolder text-h5"
        :rows="filteredRows"
        :columns="columns"
        row-key="id"
      >
        <template v-slot:body-cell-opciones="props">
          <q-td :props="props">
            <q-btn @click="cargarMantenimientoParaEdicion(props.row)">✏️</q-btn>
            <q-btn
              v-if="props.row.estado == 1"
              @click="inactivarMantenimiento(props.row._id)"
            >
              ❌
            </q-btn>
            <q-btn v-else @click="activarMantenimiento(props.row._id)"
              >✅</q-btn
            >
          </q-td>
        </template>

        <template class="a" v-slot:body-cell-estado="props">
          <q-td class="b" :props="props">
            <p
              :style="{
                color: props.row.estado === 1 ? 'green' : 'red',
                margin: 0,
              }"
            >
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
