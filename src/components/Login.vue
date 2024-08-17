<template>
    <img class="fondo" src="../img/fondo.png" alt="" />
    <div class="container">

        <div class="login-container">
            <h3>Login</h3>

            <form @submit.prevent="">
                <div style="margin-top: -10px;">
                    <q-input type="email" placeholder="Email" v-model="email" autocomplete="username" class="q-mb-md" />
                    <q-input v-model="password" :type="isPwd ? 'password' : 'text'" placeholder="Password"
                        class="q-mb-md" autocomplete="current-password">
                        <template v-slot:append>
                            <q-icon :name="isPwd ? 'visibility_off' : 'visibility'" class="cursor-pointer"
                                @click="isPwd = !isPwd" />
                        </template>
                    </q-input>
                </div>

                <p style="font-size: 12px;margin: -10px; padding-top: 10px; border: 0;"><a href="/#/password">¿Olvidaste
                        tu
                        contraseña?</a></p>
                <q-btn style="margin-top: 40px; margin-bottom: 15px;" type="submit" :loading="useUsuario.loading"
                    :disable="useUsuario.loading" @click="login">
                    Sign In
                    <template v-slot:loading>
                        <q-spinner color="white" size="1em" />
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
const isPwd = ref(true);

async function login() {
    const isValid = await validateCredentials();
    if (isValid) {
        try {
            const r = await useUsuario.login(email.value, password.value);
            // console.log(r.response.data.msg);
            if (r.status == 200) {
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
    width: 320px;
    background: linear-gradient(to bottom, rgba(255, 255, 255, 0.842), rgb(255, 255, 255), rgb(255, 255, 255), rgb(255, 255, 255), rgba(255, 255, 255, 0.918));
    padding: 44px;
    border: 2px solid #ddd;
    border-radius: 10px;
    box-shadow: rgba(0, 0, 0, 0.17) 0px -23px 25px 0px inset,
        rgba(0, 0, 0, 0.15) 0px -36px 30px 0px inset,
        rgba(255, 1, 1, 0.1) 0px -79px 40px 0px inset,
        rgba(0, 0, 0, 0.38) 0px 2px 1px,
        rgba(0, 0, 0, 0.09) 0px 4px 2px,
        rgba(80, 68, 58, 0.482) -1px 10px 8px 13px,
        rgb(149, 107, 107) 60px 15676px 8px,
        rgb(0, 0, 0) 0px 32px 16px;
    /* padding-bottom: 10px;
    padding-top: 2px; */
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

.q-mb-md {
    padding-inline: 20px;
}

.cursor-pointer {
    font-size: 20px;
}

.input-container input:focus {
    background: transparent;
    outline: none;
    /* Elimina el borde de enfoque predeterminado */
    box-shadow: none;
    /* Elimina la sombra del cuadro de enfoque predeterminado */
}

button[type="submit"] {
    width: 100%;
    height: 40px;
    background-color: #d19376a8;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    font-weight: bold;
    box-shadow: rgba(202, 13, 13, 0.164) 0px -23px 25px 0px inset,
        rgba(0, 0, 0, 0.366) 0px -36px 30px 0px inset,
        rgb(255, 255, 255) 0px -79px 40px 0px inset,
        rgba(0, 0, 0, 0.06) 0px 2px 1px,
        rgba(201, 31, 31, 0.322) 0px 4px 2px,
        rgba(0, 0, 0, 0.09) 0px 8px 4px,
        rgba(0, 0, 0, 0.09) 0px 16px 8px,
        rgba(0, 0, 0, 0.09) 0px 32px 16px;
}

a {
    color: #8400ff;
    position: relative;
    top: -6px;
    font-size: 11px;
}

/* .social-login {
    display: flex;
    flex-direction: row;
    justify-content: center;
    margin-top: 20px;
    gap: 15px;
} */

/* .social-login button {
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
} */

/* .social-login button:hover {
    transform: scale(1.1);
} */

/* .google-btn {
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
} */
</style>