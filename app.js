// =========================================================================
// PEGA AQUÍ TUS DATOS REALES DE SUPABASE (Settings ⚙️ -> API):
// =========================================================================
const SUPABASE_URL = "https://joimemhrozfnvekdgzpm.supabase.co"; 
const SUPABASE_KEY = "sb_publishable_Mm_rg00ryH-d6ql8BmlvkQ_tt6SEYYG";

// Inicializar cliente Supabase
const supabaseClient = (window.supabase && SUPABASE_URL !== "PEGA_AQUI_TU_PROJECT_URL") 
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) 
  : null;

// Variable global para almacenar los datos del usuario conectado
let usuarioActivo = null;

// 1. RECUPERAR DE LA MEMORIA INTERNA AL CARGAR LA APP
window.addEventListener('DOMContentLoaded', () => {
  const datosLocales = localStorage.getItem('usuarioComuna');
  if (datosLocales) {
    try {
      usuarioActivo = JSON.parse(datosLocales);
      cargarDatosEnInterfaz(usuarioActivo);
      navigateTo('screen-main-menu');
    } catch (err) {
      console.error("Error al cargar datos locales:", err);
      localStorage.removeItem('usuarioComuna');
    }
  }
});

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

// --- CARGAR Y MOSTRAR CONTENIDO DE LEYES ---
async function cargarLey(rutaArchivo, tituloLey) {
  const tituloElem = document.getElementById('visor-ley-titulo');
  const contenidoElem = document.getElementById('visor-ley-contenido');

  if (tituloElem) tituloElem.innerText = tituloLey;
  if (contenidoElem) {
    contenidoElem.innerHTML = '<p class="cargando-texto"><i class="fa-solid fa-spinner fa-spin"></i> Cargando contenido...</p>';
  }

  // Abrir pantalla del visor
  navigateTo('screen-visor-ley');

  try {
    const respuesta = await fetch(rutaArchivo);
    if (!respuesta.ok) {
      throw new Error(`Archivo no encontrado (${respuesta.status})`);
    }

    const contenido = await respuesta.text();

    if (!contenido || contenido.trim().length === 0) {
      contenidoElem.innerHTML = '<p class="cargando-texto">El contenido de esta ley aún no ha sido cargado en el archivo correspondiente.</p>';
      return;
    }

    // Si tiene etiquetas HTML lo interpreta como formato web, sino como texto limpio
    if (/<[a-z][\s\S]*>/i.test(contenido)) {
      contenidoElem.innerHTML = contenido;
    } else {
      contenidoElem.textContent = contenido;
    }

  } catch (error) {
    console.error("Error al cargar la ley:", error);
    if (contenidoElem) {
      contenidoElem.innerHTML = `<p class="cargando-texto" style="color: #dc2626;"><i class="fa-solid fa-triangle-exclamation"></i> No se pudo cargar el archivo: ${rutaArchivo}</p>`;
    }
  }
}

window.cargarLey = cargarLey;

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

  const cleanCedula = cedulaInput.replace(/[^0-9]/g, '');

  if (!cleanCedula || !passwordInput) {
    alert("Por favor ingrese su Cédula y Contraseña.");
    return;
  }

  if (!supabaseClient) {
    alert("Falta configurar la URL y la Llave de Supabase en el archivo app.js.");
    return;
  }

  try {
    btnSubmit.innerText = "VERIFICANDO...";
    btnSubmit.disabled = true;

    // Consultar el usuario en Supabase
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

    // Usuario autenticado con éxito y guardado en la memoria interna
    usuarioActivo = usuario;
    localStorage.setItem('usuarioComuna', JSON.stringify(usuarioActivo));
    cargarDatosEnInterfaz(usuarioActivo);
    navigateTo('screen-main-menu');

  } catch (err) {
    console.error(err);
    alert("Error de conexión: Verifique que la URL de Supabase sea la correcta.");
  } finally {
    btnSubmit.innerText = "INICIAR SESIÓN";
    btnSubmit.disabled = false;
  }
});

// Cargar información real del usuario en la app
function cargarDatosEnInterfaz(usuario) {
  document.getElementById('user-name').innerText = `¡Bienvenido, ${usuario.nombres} ${usuario.apellidos}!`;
  document.getElementById('user-role').innerText = `${usuario.rol} - ${usuario.consejo_comunal}`;
  
  // Control de foto: si no tiene foto en la base de datos, deja el espacio vacío
  const userAvatar = document.getElementById('user-avatar');
  const profileImg = document.getElementById('profile-img');

  if (usuario.foto) {
    userAvatar.src = usuario.foto;
    userAvatar.style.display = 'block';
    profileImg.src = usuario.foto;
    profileImg.style.display = 'block';
  } else {
    userAvatar.src = '';
    userAvatar.style.display = 'none';
    profileImg.src = '';
    profileImg.style.display = 'none';
  }

  const chatGreeting = document.getElementById('chat-greeting');
  if (chatGreeting) {
    chatGreeting.innerText = `¡Hola ${usuario.nombres} ${usuario.apellidos}! ¿En qué consulta jurídica puedo ayudarte hoy?`;
  }

  document.getElementById('profile-card-name').innerText = `${usuario.nombres} ${usuario.apellidos}`;
  document.getElementById('profile-card-role').innerText = `${usuario.rol} - ${usuario.consejo_comunal}`;
  document.getElementById('perfil-nombres').value = usuario.nombres || '';
  document.getElementById('perfil-apellidos').value = usuario.apellidos || '';
  document.getElementById('perfil-cedula').value = `V-${usuario.cedula}`;
  document.getElementById('perfil-nacimiento').value = usuario.fecha_nacimiento || '';
  document.getElementById('perfil-direccion').value = usuario.direccion || '';
  document.getElementById('perfil-telefono').value = usuario.telefono || '';
  document.getElementById('perfil-correo').value = usuario.correo || '';

  document.getElementById('perfil-pass-actual').value = '';
  document.getElementById('perfil-pass-nueva').value = '';
  document.getElementById('perfil-pass-confirmar').value = '';
}

// Variable temporal para almacenar la imagen seleccionada
let fotoTemporalBase64 = null;

// Capturar foto desde cámara o galería de archivos
const inputFotoPerfil = document.getElementById('input-foto-perfil');
if (inputFotoPerfil) {
  inputFotoPerfil.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Optimizar y redimensionar imagen para ahorro de memoria
        const canvas = document.createElement('canvas');
        const MAX_DIM = 280;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIM) {
            height *= MAX_DIM / width;
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width *= MAX_DIM / height;
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        fotoTemporalBase64 = canvas.toDataURL('image/jpeg', 0.85);

        // Vista previa inmediata en la pantalla de perfil
        const profileImg = document.getElementById('profile-img');
        if (profileImg) {
          profileImg.src = fotoTemporalBase64;
          profileImg.style.display = 'block';
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });
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

    // Determinar la foto definitiva a guardar
    const fotoParaGuardar = fotoTemporalBase64 !== null ? fotoTemporalBase64 : (usuarioActivo.foto || null);

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
          password: passwordParaActualizar,
          foto: fotoParaGuardar
        })
        .eq('cedula', usuarioActivo.cedula)
        .select()
        .single();

      if (error) {
        alert("Error al actualizar: " + error.message);
        return;
      }

      // 1. Guardar en la variable en memoria
      usuarioActivo = data;
      fotoTemporalBase64 = null;

      // 2. Guardar obligatoriamente en la memoria interna del equipo
      localStorage.setItem('usuarioComuna', JSON.stringify(usuarioActivo));

      // 3. Reflejar en la interfaz visual
      cargarDatosEnInterfaz(usuarioActivo);
      alert("¡Perfil y foto guardados con éxito en la memoria interna y en Supabase!");
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

// --- CERRAR SESIÓN ---
const btnLogout = document.getElementById('btn-logout');
if (btnLogout) {
  btnLogout.addEventListener('click', () => {
    if (confirm("¿Está seguro de que desea cerrar la sesión actual?")) {
      // 1. Limpiar usuario en memoria
      usuarioActivo = null;

      // 2. Eliminar sesión de la memoria interna del equipo
      localStorage.removeItem('usuarioComuna');

      // 3. Limpiar formulario de inicio de sesión
      const formLogin = document.getElementById('form-login');
      if (formLogin) formLogin.reset();

      // 4. Redirigir a la pantalla de inicio de sesión
      navigateTo('screen-login');
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
    botMsg.innerHTML = `<p>Hemos recibido tu consulta sobre <strong>"${text}"</strong>. El equipo de mediación responderá a la brevedad.</p>`;
    chatContainer.appendChild(botMsg);
  }, 600);
}
