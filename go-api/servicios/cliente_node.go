package servicios

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"time"
)

// ResultadoEstadisticas guarda la respuesta que devuelve la API Node.js.
type ResultadoEstadisticas map[string]interface{}

// ObtenerEstadisticas envía Q y R a Node.js y devuelve las métricas calculadas.
func ObtenerEstadisticas(Q, R [][]float64) (ResultadoEstadisticas, error) {
	urlNode := os.Getenv("URL_API_NODE")
	if urlNode == "" {
		urlNode = "http://localhost:3000"
	}

	// La llamada interna también usa JWT para mantener el mismo esquema de seguridad.
	token, err := GenerarJWTServicio()
	if err != nil {
		return nil, fmt.Errorf("token de servicio: %w", err)
	}

	cuerpo, _ := json.Marshal(map[string]interface{}{"Q": Q, "R": R})

	peticion, err := http.NewRequest(http.MethodPost, urlNode+"/api/estadisticas", bytes.NewBuffer(cuerpo))
	if err != nil {
		return nil, fmt.Errorf("construir petición: %w", err)
	}
	peticion.Header.Set("Content-Type", "application/json")
	peticion.Header.Set("Authorization", "Bearer "+token)

	cliente := &http.Client{Timeout: 10 * time.Second}
	respuesta, err := cliente.Do(peticion)
	if err != nil {
		return nil, fmt.Errorf("llamar api-node: %w", err)
	}
	defer respuesta.Body.Close()

	if respuesta.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("api-node respondió con código %d", respuesta.StatusCode)
	}

	var resultado ResultadoEstadisticas
	if err := json.NewDecoder(respuesta.Body).Decode(&resultado); err != nil {
		return nil, fmt.Errorf("decodificar respuesta: %w", err)
	}
	return resultado, nil
}
