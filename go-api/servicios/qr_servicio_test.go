package servicios_test

import (
	"math"
	"testing"

	"api-go/servicios"
)

func TestFactorizarQR(t *testing.T) {
	casos := []struct {
		nombre      string
		matriz      [][]float64
		esperaError bool
	}{
		{
			nombre: "identidad 2x2",
			matriz: [][]float64{{1, 0}, {0, 1}},
		},
		{
			nombre: "rectangular 3x2",
			matriz: [][]float64{{1, 2}, {3, 4}, {5, 6}},
		},
		{
			nombre: "cuadrada 3x3 ejemplo clásico",
			matriz: [][]float64{{12, -51, 4}, {6, 167, -68}, {-4, 24, -41}},
		},
		{
			nombre: "rectangular ancha 2x3",
			matriz: [][]float64{{1, 2, 3}, {4, 5, 6}},
		},
	}

	for _, c := range casos {
		t.Run(c.nombre, func(t *testing.T) {
			Q, R, err := servicios.FactorizarQR(c.matriz)
			if (err != nil) != c.esperaError {
				t.Fatalf("error = %v, esperaError %v", err, c.esperaError)
			}
			if err != nil {
				return
			}

			m := len(c.matriz)
			n := len(c.matriz[0])
			dimensionInterna := len(Q[0])

			// La matriz original debe poder reconstruirse como Q * R.
			for i := 0; i < m; i++ {
				for j := 0; j < n; j++ {
					var suma float64
					for k := 0; k < dimensionInterna; k++ {
						suma += Q[i][k] * R[k][j]
					}
					diferencia := math.Abs(suma - c.matriz[i][j])
					if diferencia > 1e-5 {
						t.Errorf("A[%d][%d]=%.6f, (Q*R)[%d][%d]=%.6f, diferencia=%.2e",
							i, j, c.matriz[i][j], i, j, suma, diferencia)
					}
				}
			}

			// Debajo de la diagonal principal, R debe quedar en cero o casi cero.
			for i := 0; i < len(R); i++ {
				for j := 0; j < i && j < len(R[i]); j++ {
					if math.Abs(R[i][j]) > 1e-6 {
						t.Errorf("R[%d][%d] = %.2e, se esperaba ~0 (triangular superior)", i, j, R[i][j])
					}
				}
			}
		})
	}
}
