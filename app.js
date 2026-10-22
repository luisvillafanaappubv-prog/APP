// --- CONFIGURACIÓN DE SUPABASE ---
// Reemplaza estas dos constantes con tus credenciales de Supabase:
const SUPABASE_URL = "https://TU_PROYECTO.supabase.co";
const SUPABASE_KEY = "TU_LLAVE_ANON_PUBLICA";

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

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

  // Desplazar al inicio de la pantalla
  window.scrollTo(0, 0);
}

// --- MANEJO DE INICIO DE SESIÓN ---
document.getElementById('form-login').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const cedula = document.getElementById('login-cedula').value.trim();
  const password = document.getElementById('login-password').value.trim();

  // Para pruebas inmediatas: Permite entrar automáticamente si hay datos
  if (cedula && password) {
    console.log("Iniciando sesión con:", cedula);
    // Transición directa al Menú Principal (Imagen 2)
    navigateTo('screen-main-menu');
  } else {
    alert("Por favor ingrese su Cédula y Contraseña.");
  }
});

// --- FUNCIONALIDAD BÁSICA DEL CONSULTOR JURÍDICO (CHAT) ---
document.getElementById('chat-send').addEventListener('click', sendConsultation);
document.getElementById('chat-input').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendConsultation();
});

function sendConsultation() {
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if (!text) return;

  const chatContainer = document.getElementById('chat-messages');

  // Mensaje del vecino
  const userMsg = document.createElement('div');
  userMsg.className = 'chat-bubble user';
  userMsg.style.cssText = "align-self: flex-end; background: #e2e8f0; padding: 10px; border-radius: 12px; margin-top: 8px; font-size: 0.85rem;";
  userMsg.innerText = text;
  chatContainer.appendChild(userMsg);

  input.value = '';

  // Respuesta simulada
  setTimeout(() => {
    const botMsg = document.createElement('div');
    botMsg.className = 'chat-bubble bot';
    botMsg.style.marginTop = '8px';
    botMsg.innerHTML = `<p>Hemos recibido tu consulta sobre <strong>"${text}"</strong>. El equipo de mediación y la base legal comunitaria la evaluarán a la brevedad.</p>`;
    chatContainer.appendChild(botMsg);
  }, 700);
}
