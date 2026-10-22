// --- CONFIGURACIÓN DE SUPABASE ---
const SUPABASE_URL = "https://frhqpxhqmeqbdvwaar.supabase.co";
const SUPABASE_KEY = "TU_LLAVE_ANON_PUBLICA"; // <-- PEGA AQUÍ TU LLAVE ANON DE SUPABASE

const supabaseClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

// Variable global para almacenar los datos del usuario conectado
let usuarioActivo = null;

// --- SISTEMA DE NAVEGACIÓN GLOBAL ---
function navigateTo(screenId) {
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
  });

  const target = document.getElementById(screenId);
  if (target) {
    target.classList.add('active');
  }

  const bottomNav = document.getElementById('bottom-nav');
  if (screenId === 'screen-login') {
    bottomNav.style.display = 'none';
  } else {
    bottomNav.style.display = 'flex';
  }

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

// Alternar visibilidad de contraseña
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

// --- INICIO DE SESIÓN CON SUPABASE ---
document.getElementById('form-login').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const cedulaInput = document.getElementById('login-cedula').value.trim();
  const passwordInput = document.getElementById('login-password').value.trim();
  const btnSubmit = document.getElementById('btn-login-submit');

  // Normalizar la cédula eliminando caracteres especiales
  const cleanCedula = cedulaInput.replace(/[^0-9]/g, '');

  if (!cleanCedula || !passwordInput) {
    alert("Por favor ingrese su Cédula y Contraseña.");
    return;
  }

  if (!supabaseClient) {
    alert("Error de conexión: No se pudo iniciar el cliente de Supabase.");
    return;
  }

  try {
    btnSubmit.innerText = "VERIFICANDO...";
    btnSubmit.disabled = true;

    // Consultar el usuario en la base de datos de Supabase
    const { data: usuario, error } = await supabaseClient
      .from('usuarios')
      .select('*')
      .eq('cedula', cleanCedula)
      .maybeSingle();

    if (error) {
      console.error(error);
      alert("Error al consultar el sistema: " + error.message);
      return;
    }

    if (!usuario) {
      alert("Acceso denegado: Usuario no registrado en el sistema comunitario.");
      return;
    }

    if (usuario.password !== passwordInput) {
      alert("Contraseña incorrecta. Verifique sus datos.");
      return;
    }

    // Usuario autenticado exitosamente
    usuarioActivo = usuario;
    cargarDatosEnInterfaz(usuarioActivo);
    navigateTo('screen-main-menu');

  } catch (err) {
    console.error(err);
    alert("Ocurrió un error inesperado al iniciar sesión.");
  } finally {
    btnSubmit.innerText = "INICIAR SESIÓN";
    btnSubmit.disabled = false;
  }
});

// Cargar información real del usuario en la interfaz
function cargarDatosEnInterfaz(usuario) {
  // Menú Principal
  document.getElementById('user-name').innerText = `¡Bienvenido, ${usuario.nombres} ${usuario.apellidos}!`;
  document.getElementById('user-role').innerText = `${usuario.rol} - ${usuario.consejo_comunal}`;
  
  // Saludo en el consultor jurídico
  const chatGreeting = document.getElementById('chat-greeting');
  if (chatGreeting) {
    chatGreeting.innerText = `¡Hola ${usuario.nombres} ${usuario.apellidos}! ¿En qué consulta jurídica puedo ayudarte hoy?`;
  }

  // Pantalla de Perfil
  document.getElementById('profile-card-name').innerText = `${usuario.nombres} ${usuario.apellidos}`;
  document.getElementById('profile-card-role').innerText = `${usuario.rol} - ${usuario.consejo_comunal}`;
  document.getElementById('perfil-nombres').value = usuario.nombres || '';
  document.getElementById('perfil-apellidos').value = usuario.apellidos || '';
  document.getElementById('perfil-cedula').value = `V-${usuario.cedula}`;
  document.getElementById('perfil-nacimiento').value = usuario.fecha_nacimiento || '';
  document.getElementById('perfil-direccion').value = usuario.direccion || '';
  document.getElementById('perfil-telefono').value = usuario.telefono || '';
  document.getElementById('perfil-correo').value = usuario.correo || '';

  // Limpiar campos de contraseña
  document.getElementById('perfil-pass-actual').value = '';
  document.getElementById('perfil-pass-nueva').value = '';
  document.getElementById('perfil-pass-confirmar').value = '';
}

// --- GUARDAR CAMBIOS DE PERFIL EN SUPABASE ---
const btnGuardarPerfil = document.getElementById('btn-guardar-perfil');
if (btnGuardarPerfil) {
  btnGuardarPerfil.addEventListener('click', async () => {
    if (!usuarioActivo) return;

    const nombres = document.getElementById('perfil-nombres').value.trim();
    const apellidos = document.getElementById('perfil-apellidos').value.trim();
    const fechaNac = document.getElementById('perfil-nacimiento').value.trim();
    const direccion = document.getElementById('perfil-direccion').value.trim();
    const telefono = document.getElementById('perfil-telefono').value.trim();
    const correo = document.getElementById('perfil-correo').value.trim();

    const passActual = document.getElementById('perfil-pass-actual').value.trim();
    const passNueva = document.getElementById('perfil-pass-nueva').value.trim();
    const passConf = document.getElementById('perfil-pass-confirmar').value.trim();

    let passwordParaActualizar = usuarioActivo.password;

    // Validación si desea cambiar contraseña
    if (passNueva || passActual || passConf) {
      if (passActual !== usuarioActivo.password) {
        alert("La contraseña actual no es correcta.");
        return;
      }
      if (passNueva !== passConf) {
        alert("Las nuevas contraseñas no coinciden.");
        return;
      }
      if (passNueva.length < 6) {
        alert("La nueva contraseña debe tener al menos 6 caracteres.");
        return;
      }
      passwordParaActualizar = passNueva;
    }

    try {
      btnGuardarPerfil.innerText = "GUARDANDO...";
      btnGuardarPerfil.disabled = true;

      const { data, error } = await supabaseClient
        .from('usuarios')
        .update({
          nombres: nombres,
          apellidos: apellidos,
          fecha_nacimiento: fechaNac,
          direccion: direccion,
          telefono: telefono,
          correo: correo,
          password: passwordParaActualizar
        })
        .eq('cedula', usuarioActivo.cedula)
        .select()
        .single();

      if (error) {
        alert("Error al actualizar: " + error.message);
        return;
      }

      usuarioActivo = data;
      cargarDatosEnInterfaz(usuarioActivo);
      alert("¡Datos del perfil actualizados exitosamente en Supabase!");
      navigateTo('screen-main-menu');

    } catch (err) {
      console.error(err);
      alert("Ocurrió un error al guardar los cambios.");
    } finally {
      btnGuardarPerfil.innerText = "GUARDAR CAMBIOS";
      btnGuardarPerfil.disabled = false;
    }
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
