<template>
    <img class="fondo" src="../img/fondo.png" alt="" />
    <div class="container">

        <div class="login-container">
            <h3>Login</h3>

            <form @submit.prevent="">

                <div>
                    <div class="input-container">
                        <input class="input" type="email" placeholder=" " v-model="email" autocomplete="username" />
                        <label>Email</label>
                    </div>
                    <div class="input-container">
                        <input class="input" type="password" placeholder=" " v-model="password"
                            autocomplete="current-password" />
                        <label>Password</label>
                    </div>
                </div>
                <p style="font-size: 12px;margin: -10px; padding: 0; border: 0;"><a href="#">¿Olvidaste tu
                        contraseña?</a></p>

                <q-btn style="margin-top: 40px; margin-bottom: 15px;" type="submit" :loading="useUsuario.loading" @click="login">
                    Sign In
                    <template v-slot:loading>
                        <q-spinner color="black" size="1em" />
                    </template>
                </q-btn>
            </form>


            <!-- <div class="social-login">
                <button class="google-btn" @click="googleLogin">
                    <img class="redSocial" src="../img/google-logo.png" alt="Google Logo" />
                </button>
                <button class="facebook-btn" @click="facebookLogin">
                    <img class="redSocial" src="../img/facebook-logo.png" alt="Facebook Logo" />
                </button>
                <button class="twitter-btn" @click="twitterLogin">
                    <img class="redSocial" src="../img/twitter-logo.png" alt="Twitter Logo" />
                </button>
            </div> -->
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
        try {
            const r = await useUsuario.login(email.value, password.value);
            // console.log(r.response.data.msg);
            if (r) {
                router.push('/Clientes');
            }
        } catch (error) {
            console.error(error); // Imprime el error en la consola para verificar qué está pasando
            if (error.response && error.response.data && error.response.data.msg) {
                notifyErrorRequest(error.response.data.msg);
            } else {
                notifyErrorRequest("Error al iniciar sesión. Por favor, intenta de nuevo más tarde.");
            }
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

// function googleLogin() {
//     // Google login logic here
// }

// function facebookLogin() {
//     // Facebook login logic here
// }

// function twitterLogin() {
//     // Twitter login logic here
// }
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
    text-align: center;
    width: 300px;
    background: linear-gradient(to bottom, rgba(255, 255, 255, 0.842), rgb(255, 255, 255), rgb(255, 255, 255), rgb(255, 255, 255), rgba(255, 255, 255, 0.918));
    padding: 50px;
    border: 2px solid #ddd;
    border-radius: 10px;
    box-shadow: rgba(0, 0, 0, 0.17) 0px -23px 25px 0px inset, 
                rgba(0, 0, 0, 0.15) 0px -36px 30px 0px inset, 
                rgba(0, 0, 0, 0.1) 0px -79px 40px 0px inset, 
                rgba(0, 0, 0, 0.06) 0px 2px 1px, 
                rgba(0, 0, 0, 0.09) 0px 4px 2px, 
                rgba(0, 0, 0, 0.09) 0px 8px 4px, 
                rgba(0, 0, 0, 0.09) 0px 16px 8px, 
                rgba(0, 0, 0, 0.09) 0px 32px 16px;
}

.input:hover {
    background-color: #ac483f27;
}

.login-container h3 {
    font-weight: bold;
    color: red;
    line-height: 0.9;
    padding-bottom: 10px;
}

form {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.input-container {
    position: relative;
    margin-bottom: 20px;
}

.input-container input {
    width: 100%;
    padding: 10px 2px 10px 5px;
    display: block;
    border: none;
    border-bottom: 1px solid #757575;
    background: transparent;
    font-size: 16px;
    /* height: 40px;
    margin-bottom: 20px;
    padding: 10px;*/
    /* border: 1px solid #ccc;  */
}

.input-container input:focus {
    outline: none;
    /* background-color: inherit; */
}

.input-container input:focus~label,
.input-container input:not(:placeholder-shown)~label {
    top: -15px;
    font-size: 12px;
    color: #5264AE;
}

.input-container label {
    color: #999;
    /* font-size: 16px; */
    font-weight: normal;
    position: absolute;
    pointer-events: none;
    left: 5px;
    top: 10px;
    transition: 0.2s ease all;
}

.input-container input:focus~label {
    background: transparent;
    color: #5264AE;
}

button[type="submit"] {
    width: 82%;
    height: 40px;
    background-color: #ff69b4;
    color: white;
    border: none;
    border-radius: 10px;
    cursor: pointer;
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