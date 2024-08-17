<script setup>
import { ref } from 'vue';
import { notifyErrorRequest } from "../routes/routes.js";
import { useStoreUsuarios } from '../stores/Usuarios.js';
import { useRouter } from 'vue-router';

const useUsuario = useStoreUsuarios();
const router = useRouter();

let email = ref('');
let loading = ref(false);

async function solicitarRestablecimiento() {
	if (email.value === '') {
		notifyErrorRequest("El correo no puede estar vacío");
		return;
	}
	loading.value = true;
	const r = await useUsuario.recuperarContrasena(email.value);
	loading.value = false;
}

function regresar() {
	router.push('/');
}
</script>

<template>
	<div class="abuelo">
		<div>
			<q-header elevated class="bg-primary" height-hint="98">
				<q-toolbar>
					<q-toolbar-title>
						<em class="title" @click="regresar()">Gym Monsters</em>
					</q-toolbar-title>
				</q-toolbar>
			</q-header>
		</div>

		<div class="padre">
			<div class="hijo">
				<div>
					<img src="../img/candado.png" alt="centered image">
				</div>
				<h6
					style="font-family: Cambria, Cochin, Georgia, Times, 'Times New Roman', serif; text-align: center; top: -40px; position: relative;">
					¿Tienes problemas para iniciar sesión?</h6>
				<p style="top: -40px; position: relative; text-align: center; color: rgba(89, 76, 76, 1.706);">Ingresa
					tu correo electrónico, y te enviaremos un enlace para que recuperes el acceso a tu cuenta.</p>

				<form>
					<div class="div_correo" style="top: -20px; position: relative;">
						<input type="email" class="input" placeholder="Correo electrónico" v-model="email" />
					</div>

					<div class="div_button">
						<q-btn @click="regresar()">
							Regresar
						</q-btn>
						<q-btn :loading="loading" @click="solicitarRestablecimiento()">
							Enviar Código
							<template v-slot:loading>
								<q-spinner color="secondary" size="1em" />
							</template>
						</q-btn>
					</div>
				</form>
			</div>
		</div>
	</div>
</template>

<style scoped>
.title {
	font-family: cursive;
	font-style: italic;
	font-size: 17px;
	color: black;
	margin-left: 200px;
	padding-bottom: 1px solid black;
	cursor: pointer;
}

.bg-primary {
	color: black !important;
	background-color: white !important;
	padding-bottom: 5px;
	border-bottom: 1px solid rgba(18, 17, 16, 0.487);
}

.abuelo {
	display: flex;
	justify-content: center;
	align-items: center;
	margin-top: 50px;
}

.padre {
	display: flex;
	justify-content: center;
	align-items: center;
}

.hijo {
	width: 360px;
	background-color: rgba(255, 255, 255, 0.8);
	padding: 20px;
	box-shadow: rgba(0, 0, 0, 0.19) 0px 10px 20px, rgba(0, 0, 0, 0.23) 0px 6px 6px;
}

.hijo div {
	width: 100%;
}

.hijo div img {
	width: 140px;
	display: flex;
	justify-content: center;
	align-items: center;
	margin: auto;
}

.div_correo {
	display: flex;
	align-items: center;
	margin-bottom: 20px;
}

.div_correo input {
	width: 100%;
	height: 45px;
	padding: 10px;
	border: 1px solid #ccc;
	border-radius: 10px;
	font-size: 16px;
	color: #333;
}

.div_button {
	display: flex;
	flex-direction: column;
	gap: 10px;
}

.div_button q-btn {
	background-color: rgba(230, 201, 201, 0.446);
	width: 100%;
	height: 45px;
	border-radius: 10px;
	font-size: 14px;
	color: black;
}
</style>