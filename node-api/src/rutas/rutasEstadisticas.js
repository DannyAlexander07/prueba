const express = require('express');
const enrutador = express.Router();
const autenticacion = require('../middleware/autenticacion');
const { calcularEstadisticas } = require('../servicios/servicioEstadisticas');

/**
 * POST /api/estadisticas
 * Recibe las matrices Q y R y responde con sus estadísticas.
 */
enrutador.post('/estadisticas', autenticacion, (req, res, siguiente) => {
  try {
    const { Q, R } = req.body;

    if (!Array.isArray(Q) || !Array.isArray(R)) {
      return res.status(400).json({ error: 'Q y R deben ser arreglos de arreglos' });
    }
    if (Q.length === 0 || R.length === 0) {
      return res.status(400).json({ error: 'Q y R no pueden estar vacías' });
    }

    const estadisticas = calcularEstadisticas(Q, R);
    res.json(estadisticas);
  } catch (err) {
    siguiente(err);
  }
});

module.exports = enrutador;
