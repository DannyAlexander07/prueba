package servicios

import (
	"fmt"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// Credenciales define los datos que viajan dentro del token JWT.
type Credenciales struct {
	Usuario string `json:"usuario"`
	jwt.RegisteredClaims
}

func secretoJWT() []byte {
	s := os.Getenv("SECRETO_JWT")
	if s == "" {
		s = "cambia-este-secreto-en-produccion"
	}
	return []byte(s)
}

// GenerarJWT crea un token válido por 24 horas para un usuario.
func GenerarJWT(usuario string) (string, error) {
	return jwt.NewWithClaims(jwt.SigningMethodHS256, &Credenciales{
		Usuario: usuario,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "api-go",
		},
	}).SignedString(secretoJWT())
}

// GenerarJWTServicio crea un token corto para llamadas internas entre APIs.
func GenerarJWTServicio() (string, error) {
	return jwt.NewWithClaims(jwt.SigningMethodHS256, &Credenciales{
		Usuario: "api-go-servicio",
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(5 * time.Minute)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "api-go",
		},
	}).SignedString(secretoJWT())
}

// ValidarJWT comprueba la firma y devuelve los datos del token.
func ValidarJWT(tokenStr string) (*Credenciales, error) {
	tok, err := jwt.ParseWithClaims(tokenStr, &Credenciales{}, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("algoritmo de firma inesperado: %v", t.Header["alg"])
		}
		return secretoJWT(), nil
	})
	if err != nil {
		return nil, err
	}
	credenciales, ok := tok.Claims.(*Credenciales)
	if !ok || !tok.Valid {
		return nil, fmt.Errorf("credenciales del token inválidas")
	}
	return credenciales, nil
}
