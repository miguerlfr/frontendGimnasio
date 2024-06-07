<template>
    <img class="fondo" src="../img/fondo.png" alt="" />
    <div class="container">

        <div class="login-container">
            <h3>Sign In</h3>

            <form @submit.prevent="">

                <input class="input" type="email" placeholder="Email" v-model="email" autocomplete="username" />
                <input data-v-47199182 class="input" type="password" placeholder="Password"
                    autocomplete="current-password" v-model="password" />

                <button type="submit" @click="login">Sign In</button>
            </form>

            <p>New to Gimnasio? <a href="#">Sign up now</a></p>

            <div class="social-login">

                <button class="google-btn" @click="googleLogin">
                    <img class="redSocial" src="../img/google-logo.png" alt="Google Logo" />
                </button>
                <button class="facebook-btn" @click="facebookLogin">
                    <img class="redSocial" src="../img/facebook-logo.png" alt="Facebook Logo" />
                </button>
                <button class="twitter-btn" @click="twitterLogin">
                    <img class="redSocial" src="../img/twitter-logo.png" alt="Twitter Logo" />
                </button>

            </div>

        </div>
    </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useStoreUsuarios } from "../stores/Usuarios.js";
import { notifyErrorRequest } from "../routes/routes.js";

const useUsuario = useStoreUsuarios();
const router = useRouter();
const email = ref("");
const password = ref("");

async function login() {
    const isValid = await validateCredentials();
    if (isValid) {
        const r = await useUsuario.login(email.value, password.value);
        console.log(r);
        if (r) {
            router.push('/Clientes'); // Redirige a la ruta con la barra lateral y la primera página protegida
        } else {
            notifyErrorRequest("Error al iniciar sesión. Por favor, verifica tus credenciales.");
        }
    } else {
        notifyErrorRequest("Por favor, introduce credenciales válidas");
    }
}

async function validateCredentials() {
    // Verificar si el campo de correo electrónico y contraseña están llenos
    if (email.value.trim() !== "" && password.value.trim() !== "") {
        return true; // Las credenciales son válidas
    } else {
        return false; // Las credenciales son inválidas
    }
}

function googleLogin() {
    // Google login logic here
}

function facebookLogin() {
    // Facebook login logic here
}

function twitterLogin() {
    // Twitter login logic here
}
</script>

<style scoped>
.fondo {
    width: 100%;
    height: 100vh;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    object-fit: cover;
}

.container {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}

.login-container {
    opacity: 0.9;
    text-align: center;
    margin-top: 50px;
    width: 300px;
    background-color: #fff;
    padding: 20px;
    border: 1px solid #ddd;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    padding-bottom: 40px;
}

.input:hover {
    background-color: #ac483f80;
}

.login-container h3 {
    font-weight: bold;
    color: red;
    line-height: 0.9;
}

form {
    display: flex;
    flex-direction: column;
    align-items: center;
}

input {
    width: 100%;
    height: 40px;
    margin-bottom: 20px;
    padding: 10px;
    border: 1px solid #ccc;
}

button[type="submit"] {
    width: 100%;
    height: 40px;
    background-color: #e50914;
    color: #fff;
    border: none;
    border-radius: 10px;
    cursor: pointer;
}

button[type="submit"]:hover {
    background-color: #ff69b4;
}

p {
    margin-top: 20px;
    font-size: 14px;
    color: #666;
}

a {
    text-decoration: none;
    color: #337ab7;
}

a:hover {
    color: #23527c;
}

.social-login {
    display: flex;
    flex-direction: row;
    justify-content: center;
    margin-top: 20px;
    gap: 15px;
}

.social-login button {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border: none;
    border-radius: 50%;
    background-color: transparent;
    cursor: pointer;
    transition: transform 0.2s ease-in-out;
}

.social-login button:hover {
    transform: scale(1.1);
}

.google-btn {
    background-color: #ea4335;
    color: #fff;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
}

.redSocial {
    width: 50px;
}

.facebook-btn {
    background-color: #1877f2;
    color: #fff;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
}

.twitter-btn {
    background-color: #1da1f2;
    color: #fff;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
}
</style>