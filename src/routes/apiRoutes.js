const express = require('express');
const router = express.Router();

// Importar las rutas específicas
const authRoutes = require('./authRoutes');
const citaRoutes = require('./citaRoutes');
const pagoRoutes = require('./pagoRoutes');

// Configurar las rutas
router.use('/auth', authRoutes);
router.use('/citas', citaRoutes);
router.use('/pagos', pagoRoutes);

// Ruta de información de la API
router.get('/', (req, res) => {
  res.json({
    message: 'API de Sistema de Citas Médicas',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      citas: '/api/citas',
      pagos: '/api/pagos'
    }
  });
});

module.exports = router;