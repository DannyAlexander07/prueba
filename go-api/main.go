package main

import (
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"

	"api-go/manejadores"
	autenticacion "api-go/middleware"
)

func main() {
	app := fiber.New(fiber.Config{
		AppName: "API Factorización QR",
		// Si ocurre un error, respondemos en JSON para mantener el mismo formato.
		ErrorHandler: func(c *fiber.Ctx, err error) error {
			codigo := fiber.StatusInternalServerError
			if e, ok := err.(*fiber.Error); ok {
				codigo = e.Code
			}
			return c.Status(codigo).JSON(fiber.Map{"error": err.Error()})
		},
	})

	app.Use(logger.New())
	app.Use(cors.New())

	// Sirve para comprobar que la API está levantada.
	app.Get("/salud", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"estado": "activo", "servicio": "api-go"})
	})

	// Entrega un token de prueba para consumir las rutas protegidas.
	app.Post("/api/auth/token", manejadores.GenerarToken)

	// Estas rutas requieren Authorization: Bearer <token>.
	api := app.Group("/api", autenticacion.Protegido())
	api.Post("/factorizar", manejadores.Factorizar)

	puerto := os.Getenv("PUERTO")
	if puerto == "" {
		puerto = os.Getenv("PORT")
	}
	if puerto == "" {
		puerto = "8080"
	}

	log.Printf("API Go escuchando en el puerto :%s", puerto)
	log.Fatal(app.Listen(":" + puerto))
}
