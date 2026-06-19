const { calcularEstadisticas, esDiagonal, aplanar } = require('../src/servicios/servicioEstadisticas');

describe('esDiagonal', () => {
  test('la matriz identidad es diagonal', () => {
    expect(esDiagonal([[1, 0], [0, 1]])).toBe(true);
  });

  test('matriz diagonal con valores distintos de 1', () => {
    expect(esDiagonal([[3, 0, 0], [0, 7, 0], [0, 0, -2]])).toBe(true);
  });

  test('matriz con valores fuera de la diagonal no es diagonal', () => {
    expect(esDiagonal([[1, 2], [0, 3]])).toBe(false);
  });

  test('matriz no cuadrada devuelve false', () => {
    expect(esDiagonal([[1, 0, 0], [0, 1, 0]])).toBe(false);
  });

  test('tolera valores muy pequeños producidos por operaciones de punto flotante', () => {
    expect(esDiagonal([[1, 1e-12], [0, 1]])).toBe(true);
  });
});

describe('aplanar', () => {
  test('convierte una matriz 2x2 en un arreglo plano', () => {
    expect(aplanar([[1, 2], [3, 4]])).toEqual([1, 2, 3, 4]);
  });
});

describe('calcularEstadisticas', () => {
  const Q = [[1, 0], [0, 1]];
  const R = [[2, 0], [0, 3]];

  test('valor máximo y mínimo combinados son correctos', () => {
    const { combinado } = calcularEstadisticas(Q, R);
    expect(combinado.valor_maximo).toBe(3);
    expect(combinado.valor_minimo).toBe(0);
  });

  test('suma total combinada es correcta', () => {
    // Q suma 2, R suma 5, total 7.
    const { combinado } = calcularEstadisticas(Q, R);
    expect(combinado.suma_total).toBe(7);
  });

  test('promedio combinado es correcto', () => {
    // Hay 8 valores en total.
    const { combinado } = calcularEstadisticas(Q, R);
    expect(combinado.promedio).toBeCloseTo(0.875, 6);
  });

  test('Q (identidad) es reportada como diagonal', () => {
    expect(calcularEstadisticas(Q, R).Q.es_diagonal).toBe(true);
  });

  test('R (diagonal) es reportada como diagonal', () => {
    expect(calcularEstadisticas(Q, R).R.es_diagonal).toBe(true);
  });

  test('Q no diagonal devuelve es_diagonal = false', () => {
    const noDiagonal = [[1, 2], [3, 4]];
    expect(calcularEstadisticas(noDiagonal, R).Q.es_diagonal).toBe(false);
  });

  test('las dimensiones se reportan correctamente', () => {
    const { Q: estadQ, R: estadR } = calcularEstadisticas(Q, R);
    expect(estadQ.dimensiones).toEqual({ filas: 2, columnas: 2 });
    expect(estadR.dimensiones).toEqual({ filas: 2, columnas: 2 });
  });
});
