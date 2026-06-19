const jwt = require('jsonwebtoken');

const SECRETO_JWT = process.env.SECRETO_JWT || 'cambia-este-secreto-en-produccion';

// Valida el token que llega en el encabezado Authorization.
module.exports = (req, res, siguiente) => {
  const encabezado = req.headers.authorization;

  if (!encabezado || !encabezado.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Falta o es inválido el encabezado Authorization' });
  }

  const token = encabezado.slice(7); // Quita el prefijo "Bearer ".
  try {
    req.usuario = jwt.verify(token, SECRETO_JWT);
    siguiente();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido: ' + err.message });
  }
};
