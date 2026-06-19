'use strict';

/**
 * Convierte una matriz en una lista simple de números.
 * @param {number[][]} matriz
 * @returns {number[]}
 */
function aplanar(matriz) {
  return matriz.reduce((acumulador, fila) => acumulador.concat(fila), []);
}

/**
 * Revisa si una matriz es cuadrada y solo tiene valores fuera de la diagonal cercanos a cero.
 * @param {number[][]} matriz
 * @returns {boolean}
 */
function esDiagonal(matriz) {
  const filas = matriz.length;
  const columnas = matriz[0] ? matriz[0].length : 0;

  // Para este caso, solo consideramos diagonal a una matriz cuadrada.
  if (filas !== columnas) return false;

  for (let i = 0; i < filas; i++) {
    for (let j = 0; j < columnas; j++) {
      // Fuera de la diagonal principal solo se aceptan valores muy cercanos a cero.
      if (i !== j && Math.abs(matriz[i][j]) > 1e-9) return false;
    }
  }
  return true;
}

/**
 * Calcula las métricas básicas de una lista de números.
 * @param {number[]} valores
 */
function calcularMetricas(valores) {
  const suma_total = valores.reduce((acc, v) => acc + v, 0);
  const valor_maximo = valores.reduce((max, v) => Math.max(max, v), -Infinity);
  const valor_minimo = valores.reduce((min, v) => Math.min(min, v), Infinity);
  return {
    valor_maximo: redondear(valor_maximo),
    valor_minimo: redondear(valor_minimo),
    promedio: redondear(suma_total / valores.length),
    suma_total: redondear(suma_total),
    cantidad: valores.length,
  };
}

function redondear(n) {
  return parseFloat(n.toFixed(8));
}

/**
 * Calcula estadísticas para Q, para R y para ambas matrices combinadas.
 * @param {number[][]} Q  — matriz ortogonal de la factorización QR
 * @param {number[][]} R  — matriz triangular superior de la factorización QR
 */
function calcularEstadisticas(Q, R) {
  const valoresQ = aplanar(Q);
  const valoresR = aplanar(R);
  const todosCombinados = valoresQ.concat(valoresR);

  return {
    combinado: calcularMetricas(todosCombinados),
    Q: {
      ...calcularMetricas(valoresQ),
      es_diagonal: esDiagonal(Q),
      dimensiones: { filas: Q.length, columnas: Q[0].length },
    },
    R: {
      ...calcularMetricas(valoresR),
      es_diagonal: esDiagonal(R),
      dimensiones: { filas: R.length, columnas: R[0].length },
    },
  };
}

module.exports = { calcularEstadisticas, esDiagonal, aplanar };
