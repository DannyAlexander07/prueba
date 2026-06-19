package manejadores

import (
	"api-go/servicios"
	"github.com/gofiber/fiber/v2"
)

// PeticionMatriz representa el JSON que llega desde el frontend o desde un cliente HTTP.
type PeticionMatriz struct {
	Matriz [][]float64 `json:"matriz"`
}

// GenerarToken valida credenciales simples de demostración y devuelve un JWT.
// En un entorno real estas credenciales deberían venir de una base de datos pero por ahora lo coloco aqui.
func GenerarToken(c *fiber.Ctx) error {
	var body struct {
		Usuario    string `json:"usuario"`
		Contrasena string `json:"contrasena"`
	}
	if err := c.BodyParser(&body); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "cuerpo de petición inválido")
	}
	if body.Usuario != "admin" || body.Contrasena != "admin123" {
		return fiber.NewError(fiber.StatusUnauthorized, "credenciales incorrectas")
	}
	token, err := servicios.GenerarJWT(body.Usuario)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "no se pudo generar el token")
	}
	return c.JSON(fiber.Map{"token": token, "tipo": "Bearer"})
}

// Factorizar valida la matriz, calcula Q y R, y luego pide las estadísticas a Node.js.
func Factorizar(c *fiber.Ctx) error {
	var peticion PeticionMatriz
	if err := c.BodyParser(&peticion); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "cuerpo de petición inválido")
	}
	if len(peticion.Matriz) == 0 {
		return fiber.NewError(fiber.StatusBadRequest, "la matriz no puede estar vacía")
	}

	// Todas las filas deben tener el mismo tamaño para que sea una matriz rectangular.
	columnas := len(peticion.Matriz[0])
	if columnas == 0 {
		return fiber.NewError(fiber.StatusBadRequest, "las filas no pueden estar vacías")
	}
	for _, fila := range peticion.Matriz {
		if len(fila) != columnas {
			return fiber.NewError(fiber.StatusBadRequest, "todas las filas deben tener el mismo número de columnas")
		}
	}

	Q, R, err := servicios.FactorizarQR(peticion.Matriz)
	if err != nil {
		return fiber.NewError(fiber.StatusUnprocessableEntity, err.Error())
	}

	estadisticas, err := servicios.ObtenerEstadisticas(Q, R)
	if err != nil {
		return fiber.NewError(fiber.StatusBadGateway, "servicio de estadísticas: "+err.Error())
	}

	return c.JSON(fiber.Map{
		"matriz_original": peticion.Matriz,
		"Q":               Q,
		"R":               R,
		"estadisticas":    estadisticas,
	})
}
