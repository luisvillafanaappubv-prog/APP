// --- CONFIGURACIÓN DE SUPABASE ---
const SUPABASE_URL = "https://TU_PROYECTO.supabase.co";
const SUPABASE_KEY = "TU_LLAVE_ANON_PUBLICA";

// Usamos supabaseClient y accedemos mediante window.supabase para evitar conflictos
const supabaseClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

// --- SISTEMA DE NAVEGACIÓN ENTRE PANTALLAS ---
function navigateTo(screenId) {
  // Ocultar todas las pantallas
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
  });

  // Mostrar pantalla seleccionada
  const target = document.getElementById(screenId);
  if (target) {
    target.classList.add('active');
  }

  // Mostrar u ocultar barra inferior si es Login o Menú interno
  const bottomNav = document.getElementById('bottom-nav');
  if (screenId === 'screen-login') {
    bottomNav.style.display = 'none';
  } else {
    bottomNav.style.display = 'flex';
  }

  // Desplazar al inicio
  window.scrollTo(0, 0);
}

// Hacer que navigateTo esté disponible globalmente para los botones del HTML
window.navigateTo = navigateTo;

// --- INICIO DE SESIÓN ---
document.getElementById('form-login').addEventListener('submit', (e) => {
  e.preventDefault();
  
  const cedula = document.getElementById('login-cedula').value.trim();
  const password = document.getElementById('login-password').value.trim();

  if (cedula && password) {
    console.log("Acceso concedido para:", cedula);
    navigateTo('screen-main-menu');
  } else {
    alert("Por favor ingrese su Cédula y Contraseña.");
  }
});

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

  // Mensaje del usuario
  const userMsg = document.createElement('div');
  userMsg.className = 'chat-bubble user';
  userMsg.style.cssText = "align-self: flex-end; background: #e2e8f0; padding: 10px; border-radius: 12px; margin-top: 8px; font-size: 0.85rem;";
  userMsg.innerText = text;
  chatContainer.appendChild(userMsg);

  chatInput.value = '';

  // Respuesta simulada
  setTimeout(() => {
    const botMsg = document.createElement('div');
    botMsg.className = 'chat-bubble bot';
    botMsg.style.marginTop = '8px';
    botMsg.innerHTML = `<p>Hemos recibido tu consulta sobre <strong>"${text}"</strong>. El equipo de mediación comunitaria la responderá a la brevedad.</p>`;
    chatContainer.appendChild(botMsg);
  }, 600);
}
