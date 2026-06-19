package servicios

import (
	"math"
)

// FactorizarQR descompone una matriz A en dos matrices: Q y R.
// Q es ortogonal, R es triangular o trapezoidal superior, y A se reconstruye como Q * R.
func FactorizarQR(matriz [][]float64) (Q, R [][]float64, err error) {
	m := len(matriz)
	n := len(matriz[0])

	R = copiarMatriz(matriz)
	Q = identidad(m)

	limite := min(m, n)
	for k := 0; k < limite; k++ {
		// Tomamos la parte de la columna que todavía falta transformar.
		x := make([]float64, m-k)
		for i := k; i < m; i++ {
			x[i-k] = R[i][k]
		}

		normaX := norma(x)
		if normaX == 0 {
			continue
		}

		// El signo ayuda a reducir errores numéricos en el cálculo.
		signo := 1.0
		if x[0] < 0 {
			signo = -1.0
		}
		x[0] += signo * normaX

		normaV := norma(x)
		if normaV == 0 {
			continue
		}
		for i := range x {
			x[i] /= normaV
		}

		// Actualizamos R con la reflexión de Householder.
		for j := k; j < n; j++ {
			var producto float64
			for i := range x {
				producto += x[i] * R[k+i][j]
			}
			for i := range x {
				R[k+i][j] -= 2 * x[i] * producto
			}
		}

		// Acumulamos la misma transformación en Q.
		for i := 0; i < m; i++ {
			var producto float64
			for j := range x {
				producto += Q[i][k+j] * x[j]
			}
			for j := range x {
				Q[i][k+j] -= 2 * producto * x[j]
			}
		}
	}

	return redondearMatriz(Q), redondearMatriz(R), nil
}

func copiarMatriz(matriz [][]float64) [][]float64 {
	copia := make([][]float64, len(matriz))
	for i := range matriz {
		copia[i] = append([]float64(nil), matriz[i]...)
	}
	return copia
}

func identidad(tamano int) [][]float64 {
	matriz := make([][]float64, tamano)
	for i := range matriz {
		matriz[i] = make([]float64, tamano)
		matriz[i][i] = 1
	}
	return matriz
}

func norma(vector []float64) float64 {
	var suma float64
	for _, valor := range vector {
		suma += valor * valor
	}
	return math.Sqrt(suma)
}

func redondearMatriz(matriz [][]float64) [][]float64 {
	resultado := make([][]float64, len(matriz))
	for i := range matriz {
		resultado[i] = make([]float64, len(matriz[i]))
		for j := range matriz[i] {
			resultado[i][j] = redondear(matriz[i][j], 8)
		}
	}
	return resultado
}

func redondear(valor float64, decimales int) float64 {
	potencia := math.Pow(10, float64(decimales))
	return math.Round(valor*potencia) / potencia
}
