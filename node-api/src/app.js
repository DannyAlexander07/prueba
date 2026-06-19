const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rutasEstadisticas = require('./rutas/rutasEstadisticas');

const app = express();

app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '5mb' }));

// Permite comprobar si el servicio está levantado.
app.get('/salud', (req, res) => {
  res.json({ estado: 'activo', servicio: 'api-node' });
});

app.use('/api', rutasEstadisticas);

// Devuelve los errores en formato JSON.
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  const codigo = err.status || 500;
  res.status(codigo).json({ error: err.message });
});

const PUERTO = process.env.PUERTO || process.env.PORT || 3000;
app.listen(PUERTO, () => {
  console.log(`API Node.js de Estadísticas corriendo en el puerto ${PUERTO}`);
});

module.exports = app;
