(function(){
    "use strict";
    const BACKEND_URL =
  "https://script.google.com/macros/s/AKfycbxgQ-_5P4Dz45CiqJkbR1NEwK4sMBbMif-gg83-qXnZ0nnU0HG0ZAFphljXYhbdS9QcIQ/exec";
    const form = document.getElementById("advisoryForm");
    const steps = Array.from(document.querySelectorAll(".form-step"));
    const nextBtn = document.getElementById("nextBtn");
    const prevBtn = document.getElementById("prevBtn");
    const submitBtn = document.getElementById("submitBtn");
    const status = document.getElementById("formStatus");
    const stepLabel = document.getElementById("stepLabel");
    const percent = document.getElementById("progressPercent");
    const fill = document.getElementById("progressFill");
    const bar = document.getElementById("progressBar");
    const summary = document.getElementById("summary");
    let current = 0;
    let sending = false;
  
    const menuToggle = document.getElementById("menuToggle");
    const nav = document.getElementById("mainNav");
    const secretToggle = document.getElementById("secretToggle");
    const secretText = document.getElementById("secretText");
  
    function setMenu(open){
      nav.classList.toggle("is-open", open);
      menuToggle.setAttribute("aria-expanded", String(open));
      menuToggle.querySelector(".sr-only").textContent = open ? "Cerrar menú" : "Abrir menú";
    }
    menuToggle.addEventListener("click", () => setMenu(menuToggle.getAttribute("aria-expanded") !== "true"));
    nav.addEventListener("click", e => { if(e.target.closest("a")) setMenu(false); });
    document.addEventListener("keydown", e => { if(e.key === "Escape") setMenu(false); });
  
    secretToggle.addEventListener("click", () => {
      const open = secretToggle.getAttribute("aria-expanded") === "true";
      secretToggle.setAttribute("aria-expanded", String(!open));
      secretText.hidden = open;
      secretToggle.textContent = open ? "Descubre el significado →" : "Ocultar significado ←";
    });
  
    document.getElementById("currentYear").textContent = new Date().getFullYear();
  
    function values(name){
      return Array.from(form.querySelectorAll(`[name="${name}"]:checked`)).map(i => i.value);
    }
    function firstValue(name){
      const v = values(name);
      return v.length ? v[0] : "";
    }
    function showError(step, message){
      const err = step.querySelector(":scope > .field-error");
      if(err){ err.textContent = message; err.hidden = false; }
    }
    function clearError(step){
      step.querySelectorAll(".field-error").forEach(e => { e.hidden = true; e.textContent = ""; });
    }

    function fieldVisible(field) {
        if (!field) {
          return false;
        }
      
        // Comprueba las condiciones del elemento y sus antecesores,
        // sin depender de su estado hidden anterior.
        let elemento = field;
      
        while (elemento && elemento !== form) {
          const condicion = elemento.dataset?.showIf;
      
          if (condicion) {
            const seleccionados = values(condicion);
      
            let permitidos;
      
            if (
              elemento.classList.contains("form-step") &&
              condicion === "uso"
            ) {
              // Lista explícita: una de las opciones contiene comas.
              permitidos = [
                "Universidad o instituto",
                "Programación y desarrollo de software",
                "Diseño gráfico o fotografía",
                "Edición de video o creación de contenido",
                "Ingeniería, arquitectura o herramientas técnicas",
                "Otro uso"
              ];
            } else {
              permitidos = (elemento.dataset.showValues || "")
                .split(",")
                .map(valor => valor.trim())
                .filter(Boolean);
            }
      
            if (!seleccionados.some(valor => permitidos.includes(valor))) {
              return false;
            }
          }
      
          elemento = elemento.parentElement;
        }
      
        return true;
      }
    
      function updateConditionalFields() {
        form.querySelectorAll(".conditional-field").forEach(campo => {
          const visible = fieldVisible(campo);
      
          campo.hidden = !visible;
      
          if (!visible) {
            campo.querySelectorAll("input, select, textarea").forEach(control => {
              if (
                control.type === "radio" ||
                control.type === "checkbox"
              ) {
                control.checked = false;
              } else {
                control.value = "";
              }
            });
          }
        });
      }

    function cleanObsoleteAnswers(){
      steps.forEach(step => {
        step.querySelectorAll("[data-name]").forEach(group => {
          if(!fieldVisible(group)){
            group.querySelectorAll("input").forEach(i => { i.checked = false; });
          }
        });
      });
      updateConditionalFields();
    }
  
    function validateStep(index){
      const step = steps[index];
      clearError(step);
      let valid = true;
      let firstInvalid = null;
  
      step.querySelectorAll("[data-name]").forEach(group => {
        if(!fieldVisible(group)) return;
        const name = group.dataset.name;
        const required = group.dataset.required === "true";
        const selected = values(name);
        if(required && !selected.length){
          valid = false;
          showError(step, "Selecciona al menos una opción para continuar.");
          if(!firstInvalid) firstInvalid = group;
        }
      });
  
      step.querySelectorAll("input[required]").forEach(input => {
        const err = input.closest(".field")?.querySelector(".field-error");
        let msg = "";
        if(!input.value.trim()) msg = "Este campo es obligatorio.";
        else if(input.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.value.trim())) msg = "Ingresa un correo electrónico válido.";
        else if(input.type === "tel"){
          const digits = input.value.replace(/[^\d]/g, "");
          if(digits.length < 7 || digits.length > 15) msg = "Ingresa un número de WhatsApp válido.";
        }
        if(msg){
          valid = false;
          if(err){ err.textContent = msg; err.hidden = false; }
          if(!firstInvalid) firstInvalid = input;
        }
      });
  
      if(firstInvalid) firstInvalid.focus();
      return valid;
    }
  
    function buildSummary(){
      const labels = {
        solicitante:"Tipo de solicitud", cantidad:"Cantidad de equipos", uso:"Uso principal",
        area:"Área o actividad", programas:"Programas", programasDetalle:"Programas indicados",
        exigencia:"Exigencia", sistema:"Sistema operativo", presupuesto:"Presupuesto",
        alcancePresupuesto:"Alcance del presupuesto", urgencia:"Urgencia", condiciones:"Condiciones",
        preferencias:"Preferencias", preferenciasDetalle:"Preferencias indicadas",
        nombre:"Nombre", correo:"Correo", whatsapp:"WhatsApp"
      };
      summary.innerHTML = "";
      Object.entries(labels).forEach(([name,label]) => {
        const input = form.querySelector(`[name="${name}"]`);
        if(!input) return;
        const group = input.closest("[data-name]") || input.closest(".conditional-field");
        if(group && !fieldVisible(group)) return;
        const val = values(name).join(", ") || input.value.trim();
        if(!val) return;
        const item = document.createElement("div");
        item.className = "summary-item";
        const strong = document.createElement("strong");
        strong.textContent = label;
        const p = document.createElement("p");
        p.textContent = val;
        const edit = document.createElement("button");
        edit.type = "button";
        edit.className = "summary-edit";
        edit.textContent = "Editar";
        const target = steps.findIndex(s => s.querySelector(`[name="${name}"]`));
        edit.addEventListener("click", () => goToStep(target));
        item.append(strong,p,edit);
        summary.append(item);
      });
    }
  
    function updateProgress(){
      const p = Math.round(((current + 1) / steps.length) * 100);
      stepLabel.textContent = `Paso ${current + 1} de ${steps.length}`;
      percent.textContent = `${p}%`;
      fill.style.width = `${p}%`;
      bar.setAttribute("aria-valuenow", String(p));
      prevBtn.hidden = current === 0;
      nextBtn.hidden = current === steps.length - 1;
      submitBtn.hidden = current !== steps.length - 1;
      if(current === steps.length - 2) buildSummary();
    }
  
    function goToStep(index){
      current = Math.max(0, Math.min(steps.length - 1, index));
      steps.forEach((s,i) => s.classList.toggle("is-active", i === current));
      updateProgress();
      document.getElementById("asesoria").scrollIntoView({behavior:"smooth", block:"start"});
    }
  
    nextBtn.addEventListener("click", () => {
      if(!validateStep(current)) return;
      cleanObsoleteAnswers();
      goToStep(current + 1);
    });
    prevBtn.addEventListener("click", () => goToStep(current - 1));
  
    form.addEventListener("change", e => {
      if(e.target.matches("input[type=radio],input[type=checkbox]")){
        const group = e.target.closest("[data-name]");
        if(group && group.dataset.type === "single"){
          group.querySelectorAll("input").forEach(i => { if(i !== e.target) i.checked = false; });
        }
        updateConditionalFields();
        clearError(e.target.closest(".form-step"));
      }
    });
  
    function setStatus(text, type){
      status.textContent = text;
      status.className = "form-status" + (type ? ` is-${type}` : "");
    }
  
// Se conserva al reintentar para evitar duplicar una misma solicitud.
let solicitudIdPendiente = "";

function crearSolicitudId() {
  if (
    globalThis.crypto &&
    typeof globalThis.crypto.randomUUID === "function"
  ) {
    return globalThis.crypto.randomUUID();
  }

  return (
    "sol-" +
    Date.now().toString(36) +
    "-" +
    Math.random().toString(36).slice(2) +
    Math.random().toString(36).slice(2)
  );
}

function recopilarSolicitud() {
  const datos = {};
  const formulario = new FormData(form);

  // Conserva como listas todas las respuestas de selección múltiple.
  for (const nombre of new Set(formulario.keys())) {
    const control = form.elements.namedItem(nombre);
    const elemento = control instanceof Element
      ? control
      : control?.[0];

    const grupo = elemento?.closest("[data-name]");
    const contenedorCondicional =
      elemento?.closest(".conditional-field");

    // No envía campos condicionales ocultos.
    if (contenedorCondicional?.hidden) {
      continue;
    }

    const valores = formulario
      .getAll(nombre)
      .map(valor => String(valor).trim());

    datos[nombre] =
      grupo?.dataset.type === "multiple"
        ? valores
        : valores[0];
  }

  // Descarta el área cuando no corresponde al uso seleccionado.
  const usosConArea = [
    "Universidad o instituto",
    "Programación y desarrollo de software",
    "Diseño gráfico o fotografía",
    "Edición de video o creación de contenido",
    "Ingeniería, arquitectura o herramientas técnicas",
    "Otro uso"
  ];

  const usos = Array.isArray(datos.uso)
    ? datos.uso
    : [datos.uso].filter(Boolean);

  if (!usos.some(uso => usosConArea.includes(uso))) {
    delete datos.area;
  }

  const variosEquipos = [
    "Dos o tres",
    "Entre cuatro y diez",
    "Más de diez"
  ].includes(datos.cantidad);

  if (!variosEquipos) {
    delete datos.alcancePresupuesto;
  }

  return datos;
}

form.addEventListener("submit", async e => {
  e.preventDefault();

  if (sending) {
    return;
  }

  // Comprueba todos los pasos, no solamente los datos de contacto.
  for (let indice = 0; indice < steps.length; indice++) {
    const paso = steps[indice];

    // Los pasos condicionales no aplicables no se validan.
    if (paso.dataset.showIf === "uso") {
      const usosConArea = [
        "Universidad o instituto",
        "Programación y desarrollo de software",
        "Diseño gráfico o fotografía",
        "Edición de video o creación de contenido",
        "Ingeniería, arquitectura o herramientas técnicas",
        "Otro uso"
      ];

      if (!values("uso").some(uso => usosConArea.includes(uso))) {
        continue;
      }
    }

    if (!validateStep(indice)) {
      goToStep(indice);

      setStatus(
        "Revisa la respuesta de este paso antes de enviar.",
        "error"
      );

      return;
    }
  }

  if (!BACKEND_URL) {
    setStatus(
      "El envío todavía no está habilitado.",
      "error"
    );
    return;
  }

  if (!solicitudIdPendiente) {
    solicitudIdPendiente = crearSolicitudId();
  }

  const datos = recopilarSolicitud();
  datos.solicitudId = solicitudIdPendiente;

  sending = true;

  const textoOriginal = submitBtn.textContent;
  const controles = Array.from(form.elements);
  const estadosOriginales = controles.map(control => control.disabled);

  // Impide cambiar respuestas mientras se procesa el envío.
  controles.forEach(control => {
    control.disabled = true;
  });

  submitBtn.textContent = "Enviando…";
  form.setAttribute("aria-busy", "true");

  setStatus("Registrando tu solicitud…");

  const controlador = new AbortController();
  const temporizador = setTimeout(() => {
    controlador.abort();
  }, 45000);

  try {
    const respuesta = await fetch(BACKEND_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=UTF-8"
      },
      body: JSON.stringify(datos),
      redirect: "follow",
      credentials: "omit",
      signal: controlador.signal
    });

    if (!respuesta.ok) {
      throw new Error("El servidor no respondió correctamente.");
    }

    const resultado = await respuesta.json();

    if (
      resultado.ok !== true ||
      resultado.solicitudId !== solicitudIdPendiente
    ) {
      throw new Error(
        resultado.mensaje ||
        "El servidor no confirmó el registro."
      );
    }

    form.reset();
    solicitudIdPendiente = "";

    // Restablece los campos condicionales tras limpiar el formulario.
    form.querySelectorAll(".conditional-field").forEach(campo => {
      campo.hidden = true;
    });

    goToStep(0);

    setStatus(
      "Tu solicitud quedó registrada correctamente. " +
      "Identificador: " + resultado.solicitudId,
      "success"
    );

  } catch (error) {
    console.error("Error al registrar la solicitud:", error);

    const mensaje = error.name === "AbortError"
      ? "La confirmación tardó demasiado."
      : "No pudimos confirmar el registro.";

    setStatus(
      mensaje +
      " Tus respuestas se conservaron. " +
      "Puedes volver a presionar “Enviar solicitud”; " +
      "se reutilizará el mismo identificador para evitar duplicados.",
      "error"
    );

  } finally {
    clearTimeout(temporizador);

    controles.forEach((control, indice) => {
      control.disabled = estadosOriginales[indice];
    });

    submitBtn.textContent = textoOriginal;
    form.removeAttribute("aria-busy");
    sending = false;
  }
});
  
    updateProgress();
  })();
  