const API_GO = window.API_GO_URL || 'http://localhost:8080';
let tokenJWT = '';

const elementos = {
  usuario: document.getElementById('campoUsuario'),
  contrasena: document.getElementById('campoContrasena'),
  estadoToken: document.getElementById('estadoToken'),
  filas: document.getElementById('cantidadFilas'),
  columnas: document.getElementById('cantidadColumnas'),
  grillaMatriz: document.getElementById('grillaMatriz'),
  botonToken: document.getElementById('botonToken'),
  botonAleatorio: document.getElementById('botonAleatorio'),
  botonFactorizar: document.getElementById('botonFactorizar'),
  cargando: document.getElementById('cargando'),
  panelResultados: document.getElementById('panelResultados'),
  mensajeEstado: document.getElementById('mensajeEstado'),
};

async function iniciarSesion() {
  try {
    const respuesta = await fetch(`${API_GO}/api/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usuario: elementos.usuario.value,
        contrasena: elementos.contrasena.value,
      }),
    });
    const datos = await respuesta.json();
    if (!respuesta.ok) throw new Error(datos.error || respuesta.statusText);

    tokenJWT = datos.token;
    elementos.estadoToken.textContent = 'token OK';
    elementos.estadoToken.className = 'etiqueta bien';
    elementos.botonFactorizar.disabled = false;
    mostrarEstado('Token JWT obtenido correctamente.', 'bien');
  } catch (err) {
    elementos.estadoToken.textContent = 'error';
    elementos.estadoToken.className = 'etiqueta mal';
    mostrarEstado('Error al autenticar: ' + err.message, 'mal');
  }
}

function construirGrilla() {
  const filas = parseInt(elementos.filas.value, 10) || 3;
  const columnas = parseInt(elementos.columnas.value, 10) || 3;

  elementos.grillaMatriz.style.gridTemplateColumns = `repeat(${columnas}, minmax(52px, 64px))`;
  elementos.grillaMatriz.innerHTML = '';

  for (let i = 0; i < filas; i++) {
    for (let j = 0; j < columnas; j++) {
      const celda = document.createElement('input');
      celda.type = 'number';
      celda.step = 'any';
      celda.value = '0';
      celda.id = `celda_${i}_${j}`;
      elementos.grillaMatriz.appendChild(celda);
    }
  }
}

function obtenerMatriz() {
  const filas = parseInt(elementos.filas.value, 10);
  const columnas = parseInt(elementos.columnas.value, 10);

  return Array.from({ length: filas }, (_, i) =>
    Array.from({ length: columnas }, (_, j) =>
      parseFloat(document.getElementById(`celda_${i}_${j}`).value) || 0
    )
  );
}

function establecerMatriz(datos) {
  elementos.filas.value = datos.length;
  elementos.columnas.value = datos[0].length;
  construirGrilla();
  datos.forEach((fila, i) =>
    fila.forEach((valor, j) => {
      document.getElementById(`celda_${i}_${j}`).value = valor;
    })
  );
}

function rellenarAleatorio() {
  const filas = parseInt(elementos.filas.value, 10) || 3;
  const columnas = parseInt(elementos.columnas.value, 10) || 3;

  establecerMatriz(
    Array.from({ length: filas }, () =>
      Array.from({ length: columnas }, () => Math.round((Math.random() * 20 - 10) * 10) / 10)
    )
  );
}

async function ejecutarFactorizacion() {
  const matriz = obtenerMatriz();
  elementos.cargando.classList.remove('oculto');
  elementos.botonFactorizar.disabled = true;
  elementos.panelResultados.classList.add('oculto');

  try {
    const respuesta = await fetch(`${API_GO}/api/factorizar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenJWT}`,
      },
      body: JSON.stringify({ matriz }),
    });
    const datos = await respuesta.json();
    if (!respuesta.ok) throw new Error(datos.error || respuesta.statusText);

    mostrarResultados(datos);
    mostrarEstado('Factorización completada con éxito.', 'bien');
  } catch (err) {
    mostrarEstado('Error: ' + err.message, 'mal');
  } finally {
    elementos.cargando.classList.add('oculto');
    elementos.botonFactorizar.disabled = false;
  }
}

function renderizarMatriz(idContenedor, matriz) {
  if (!matriz || matriz.length === 0) return;

  const columnas = matriz[0].length;
  let html = '<div class="tabla-scroll"><table><thead><tr><th></th>';
  for (let j = 0; j < columnas; j++) html += `<th>col ${j}</th>`;
  html += '</tr></thead><tbody>';
  matriz.forEach((fila, i) => {
    html += `<tr><th>fila ${i}</th>`;
    fila.forEach((valor) => {
      html += `<td>${typeof valor === 'number' ? valor.toFixed(6) : valor}</td>`;
    });
    html += '</tr>';
  });
  html += '</tbody></table></div>';
  document.getElementById(idContenedor).innerHTML = html;
}

function mostrarResultados(datos) {
  renderizarMatriz('tablaQ', datos.Q);
  renderizarMatriz('tablaR', datos.R);

  document.getElementById('dimensionesQ').textContent =
    datos.Q ? `(${datos.Q.length} x ${datos.Q[0].length})` : '';
  document.getElementById('dimensionesR').textContent =
    datos.R ? `(${datos.R.length} x ${datos.R[0].length})` : '';

  const estadisticas = datos.estadisticas;
  const combinado = estadisticas.combinado || {};
  const items = [
    ['Valor máximo', combinado.valor_maximo],
    ['Valor mínimo', combinado.valor_minimo],
    ['Promedio', combinado.promedio],
    ['Suma total', combinado.suma_total],
  ];

  document.getElementById('listaEstadisticas').innerHTML = items
    .map(([etiqueta, valor]) =>
      `<li><span>${etiqueta}</span><strong>${typeof valor === 'number' ? valor.toFixed(6) : valor}</strong></li>`
    )
    .join('');

  actualizarEtiquetaDiagonal('qEsDiagonal', estadisticas.Q && estadisticas.Q.es_diagonal);
  actualizarEtiquetaDiagonal('rEsDiagonal', estadisticas.R && estadisticas.R.es_diagonal);
  elementos.panelResultados.classList.remove('oculto');
}

function actualizarEtiquetaDiagonal(id, valor) {
  const etiqueta = document.getElementById(id);
  etiqueta.textContent = valor ? 'Sí' : 'No';
  etiqueta.className = `etiqueta ${valor ? 'bien' : 'mal'}`;
}

function mostrarEstado(mensaje, tipo) {
  elementos.mensajeEstado.textContent = mensaje;
  elementos.mensajeEstado.className = tipo;
}

elementos.botonToken.addEventListener('click', iniciarSesion);
elementos.botonAleatorio.addEventListener('click', rellenarAleatorio);
elementos.botonFactorizar.addEventListener('click', ejecutarFactorizacion);
elementos.filas.addEventListener('change', construirGrilla);
elementos.columnas.addEventListener('change', construirGrilla);

construirGrilla();
rellenarAleatorio();
