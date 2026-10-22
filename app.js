// --- CONFIGURACIÓN DE SUPABASE ---
const SUPABASE_URL = "https://TU_PROYECTO.supabase.co";
const SUPABASE_KEY = "TU_LLAVE_ANON_PUBLICA";

// Cliente Supabase conectado sin colisión de nombres
const supabaseClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

// --- SISTEMA DE NAVEGACIÓN GLOBAL ---
function navigateTo(screenId) {
  // Ocultar todas las pantallas
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
  });

  // Mostrar pantalla objetivo
  const target = document.getElementById(screenId);
  if (target) {
    target.classList.add('active');
  }

  // Mostrar u ocultar barra inferior si es Login o menú interno
  const bottomNav = document.getElementById('bottom-nav');
  if (screenId === 'screen-login') {
    bottomNav.style.display = 'none';
  } else {
    bottomNav.style.display = 'flex';
  }

  // Actualizar icono activo en barra inferior
  const navHome = document.getElementById('nav-btn-home');
  const navProfile = document.getElementById('nav-btn-profile');

  if (navHome && navProfile) {
    navHome.classList.remove('active');
    navProfile.classList.remove('active');

    if (screenId === 'screen-main-menu') {
      navHome.classList.add('active');
    } else if (screenId === 'screen-perfil') {
      navProfile.classList.add('active');
    }
  }

  window.scrollTo(0, 0);
}

window.navigateTo = navigateTo;

// Alternar visibilidad de contraseña (mostrar/ocultar con el icono del ojo)
function togglePasswordVisibility(inputId, iconElement) {
  const input = document.getElementById(inputId);
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text';
    iconElement.classList.replace('fa-eye', 'fa-eye-slash');
  } else {
    input.type = 'password';
    iconElement.classList.replace('fa-eye-slash', 'fa-eye');
  }
}
window.togglePasswordVisibility = togglePasswordVisibility;

// --- INICIO DE SESIÓN ---
document.getElementById('form-login').addEventListener('submit', (e) => {
  e.preventDefault();
  const cedula = document.getElementById('login-cedula').value.trim();
  const password = document.getElementById('login-password').value.trim();

  if (cedula && password) {
    navigateTo('screen-main-menu');
  } else {
    alert("Por favor ingrese su Cédula y Contraseña.");
  }
});

// --- GUARDAR CAMBIOS DE PERFIL ---
const btnGuardarPerfil = document.getElementById('btn-guardar-perfil');
if (btnGuardarPerfil) {
  btnGuardarPerfil.addEventListener('click', () => {
    const nombres = document.getElementById('perfil-nombres').value;
    const apellidos = document.getElementById('perfil-apellidos').value;
    const passNueva = document.getElementById('perfil-pass-nueva').value;
    const passConf = document.getElementById('perfil-pass-confirmar').value;

    if (passNueva && passNueva !== passConf) {
      alert("Las nuevas contraseñas no coinciden.");
      return;
    }

    // Actualiza el saludo del Menú Principal
    const userNameElem = document.getElementById('user-name');
    if (userNameElem) {
      userNameElem.innerText = `¡Bienvenido, ${nombres} ${apellidos}!`;
    }

    alert("¡Datos del perfil actualizados correctamente!");
    navigateTo('screen-main-menu');
  });
}

// --- CONSULTOR JURÍDICO (CHAT) ---
const sendBtn = document.getElementById('chat-send');
const chatInput = document.getElementById('chat-input');

if (sendBtn && chatInput) {
  sendBtn.addEventListener('click', sendConsultation);
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendConsultation();
  });
}

function sendConsultation() {
  const text = chatInput.value.trim();
  if (!text) return;

  const chatContainer = document.getElementById('chat-messages');
  const userMsg = document.createElement('div');
  userMsg.className = 'chat-bubble user';
  userMsg.style.cssText = "align-self: flex-end; background: #e2e8f0; padding: 10px; border-radius: 12px; margin-top: 8px; font-size: 0.85rem;";
  userMsg.innerText = text;
  chatContainer.appendChild(userMsg);

  chatInput.value = '';

  setTimeout(() => {
    const botMsg = document.createElement('div');
    botMsg.className = 'chat-bubble bot';
    botMsg.style.marginTop = '8px';
    botMsg.innerHTML = `<p>Hemos recibido tu consulta sobre <strong>"${text}"</strong>. El equipo de mediación comunitaria responderá a la brevedad.</p>`;
    chatContainer.appendChild(botMsg);
  }, 600);
}
