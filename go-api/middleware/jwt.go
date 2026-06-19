package middleware

import (
	"strings"

	"api-go/servicios"
	"github.com/gofiber/fiber/v2"
)

// Protegido permite continuar solo si la petición trae un JWT válido.
func Protegido() fiber.Handler {
	return func(c *fiber.Ctx) error {
		encabezado := c.Get("Authorization")
		if encabezado == "" {
			return fiber.NewError(fiber.StatusUnauthorized, "falta el encabezado Authorization")
		}
		partes := strings.SplitN(encabezado, " ", 2)
		if len(partes) != 2 || partes[0] != "Bearer" {
			return fiber.NewError(fiber.StatusUnauthorized, "se esperaba: Bearer <token>")
		}
		credenciales, err := servicios.ValidarJWT(partes[1])
		if err != nil {
			return fiber.NewError(fiber.StatusUnauthorized, "token inválido: "+err.Error())
		}
		c.Locals("usuario", credenciales.Usuario)
		return c.Next()
	}
}
