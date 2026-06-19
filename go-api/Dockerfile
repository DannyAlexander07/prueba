FROM golang:1.22-alpine AS constructor

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

# Copiamos todo el código fuente
COPY . .

# Compilamos el binario estático para Linux
RUN CGO_ENABLED=0 GOOS=linux go build -a -o servidor .

# Imagen final sin el compilador de GO
FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=constructor /app/servidor .

EXPOSE 8080
CMD ["./servidor"]
