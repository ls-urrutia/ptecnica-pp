const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const apiRoutes = require('./routes/apiRoutes');
require('dotenv').config();

const app = express();

// Middleware de seguridad
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));

// Middleware para parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rutas básicas
app.get('/', (req, res) => {
  res.json({ 
    message: 'API de Citas Médicas',
    version: '1.0.0',
    status: 'Running',
    endpoints: {
      auth: '/api/auth/login, /api/auth/register',
      citas: '/api/citas, /api/citas/dia, /api/citas/paciente',
      pagos: '/api/pagos, /api/pagos/cita/:id',
      medicos: '/api/medicos'
    }
  });
});

// Rutas de la API
app.use('/api', apiRoutes);

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Algo salió mal'
  });
});

// Ruta 404
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Ruta no encontrada',
    path: req.originalUrl,
    method: req.method
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
  console.log(`Entorno: ${process.env.NODE_ENV}`);
  console.log(`API: http://localhost:${PORT}/api`);
});

module.exports = app;