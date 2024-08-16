<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { notifyErrorRequest, notifySuccessRequest } from "../routes/routes.js";
import { useStoreUsuarios } from '../stores/Usuarios.js';

let nuevaContrasenia = ref('');
let confirmarContrasenia = ref('');
const token = ref("");
const aviso = ref("");
const router = useRouter();
const route = useRoute();
const useUsuario = useStoreUsuarios();
const passwordFieldType = ref('password');

function togglePasswordVisibility() {
	passwordFieldType.value = passwordFieldType.value === 'password' ? 'text' : 'password';
}

async function avisoo() {
	try {
		const res = await useUsuario.contraseñaCambiada(token.value);
		if (res.data.code == "ERR_BAD_REQUEST") {
			aviso.value = false;
		}
		aviso.value = true;
	} catch (error) {
		console.log(error);
	}
}

const restablecerContrasenia = async () => {
	try {
		if (!nuevaContrasenia.value.trim() || !confirmarContrasenia.value.trim()) {
			notifyErrorRequest('LLena todos los campos');
			return;
		}
		if (nuevaContrasenia.value !== confirmarContrasenia.value) {
			notifyErrorRequest('Las contraseñas no coinciden');
			return;
		}
		const datos = {
			nuevaContrasenia: nuevaContrasenia.value,
		};
		const response = await useUsuario.putUsuariosPassword(token.value, datos);

	} catch (error) {
		notifyErrorRequest('Error en el servidor.');
		console.log(error);
	}
};

function regresar() {
	router.push('/');
}

onMounted(() => {
	token.value = route.query.tokenP || "";
	avisoo();
});
</script>
<template>
	<div class="padre">
		<div>
			<q-header elevated class="lol" height-hint="98">
				<q-toolbar>
					<q-toolbar-title>
						<em class="titlee" @click="regresar()">Gym Monsters</em>
					</q-toolbar-title>
				</q-toolbar>
			</q-header>
		</div>

		<div class="hijo">
			<div class="title">
				<h2>Restablecer Contraseña</h2>
				<p>Ingresa tu nueva contraseña</p>
			</div>
			<form @submit.prevent="restablecerContrasenia">
				<div class="input_contrasena">
					<input :type="passwordFieldType" class="input" placeholder="Nueva contraseña"
						v-model="nuevaContrasenia" autocomplete="new-password" />
					<button type="button" @click="togglePasswordVisibility">
						<q-icon :name="passwordFieldType === 'password' ? 'visibility_off' : 'visibility'" />
					</button>
				</div>
				<div class="input_contrasena">
					<input :type="passwordFieldType" class="input" placeholder="Confirmar contraseña"
						v-model="confirmarContrasenia" autocomplete="new-password" />
					<button type="button" @click="togglePasswordVisibility">
						<q-icon :name="passwordFieldType === 'password' ? 'visibility_off' : 'visibility'" />
					</button>
				</div>
				<div class="div_button">
					<q-btn style="color: black;" class="submit black" type="submit">
						Restablecer
					</q-btn>
				</div>
			</form>
		</div>
	</div>
</template>


<style scoped>
* {
	font-family: cursive;
	font-style: italic;
}

.titlee {
	font-family: cursive;
	font-style: italic;
	font-size: 17px;
	color: black;
	margin-left: 200px;
	padding-bottom: 1px solid black;
	cursor: pointer;
}

.lol {
	/* background-color: transparent !important; */
	color: black !important;
	background-color: white !important;
	padding-bottom: 5px;
	border-bottom: 1px solid rgba(18, 17, 16, 0.487);
}

.padre {
	display: flex;
	justify-content: center;
	align-items: center;
	height: 100%;
	background-image: url('../img/gym.jpg');
	background-size: cover;
	background-repeat: no-repeat;
	background-position: center;
	background-attachment: fixed;
}

.hijo {
	width: 400px;
	background-color: rgba(255, 255, 255, 0.356);
	padding: 20px;
	border-radius: 10px;
	box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
	position: fixed;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
}

.title {
	display: flex;
	flex-direction: column;
	align-items: center;
}

.title h2 {
	font-size: 24px;
	color: #333;
	margin-top: 10px;
}

.title p {
	font-size: 16px;
	color: #666;
	margin-top: 10px;
}

.input_contrasena {
	display: flex;
	justify-content: center;
	align-items: center;
	margin-bottom: 20px;
}

.input_contrasena input {
	width: 80%;
	height: 45px;
	padding: 10px;
	border: 1px solid #ccc;
	border-radius: 10px;
	font-size: 16px;
}

.div_button {
	display: flex;
	flex-direction: column;
	display: flex;
	align-items: center;
}

.input_contrasena button {
	margin-left: 10px;
	background: none;
	border: none;
	color: #666;
	cursor: pointer;
}

.submit {
	width: 50%;
	font-size: 16px;
}
</style>