const express = require('express');
const { body, query, param } = require('express-validator');
const AuthController = require('../controllers/authController');
const CitaController = require('../controllers/citaController');
const PagoController = require('../controllers/pagoController');
const AuthMiddleware = require('../middleware/auth');

const router = express.Router();

// Rutas de autenticación
router.post('/auth/login', [
  body('correo').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 })
], AuthController.login);

router.post('/auth/register', [
  body('correo').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('nombre').trim().isLength({ min: 2 }),
  body('apellido').trim().isLength({ min: 2 }),
  body('rol').isIn(['paciente', 'medico'])
], AuthController.register);

// Rutas de citas
router.get('/medicos', 
  AuthMiddleware.authenticateToken,
  CitaController.listarMedicos
);

router.post('/citas', 
  AuthMiddleware.authenticateToken,
  AuthMiddleware.authorizeRole(['paciente']),
  [
    body('idMedico').isInt(),
    body('citaFecha').isISO8601(),
    body('citaHora').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/),
    body('razon').optional().isLength({ min: 5 }),
    body('monto').optional().isDecimal()
  ],
  CitaController.crearCita
);

router.put('/citas/:id/confirmar',
  AuthMiddleware.authenticateToken,
  AuthMiddleware.authorizeRole(['medico']),
  [
    param('id').isInt(),
    body('accion').isIn(['confirmar', 'rechazar'])
  ],
  CitaController.confirmarCita
);

router.get('/citas/dia',
  AuthMiddleware.authenticateToken,
  AuthMiddleware.authorizeRole(['medico']),
  [
    query('fecha').optional().isISO8601()
  ],
  CitaController.citasDelDia
);

router.get('/citas/paciente',
  AuthMiddleware.authenticateToken,
  AuthMiddleware.authorizeRole(['paciente']),
  CitaController.agendaPaciente
);

// Rutas de pagos
router.post('/pagos',
  AuthMiddleware.authenticateToken,
  AuthMiddleware.authorizeRole(['paciente']),
  [
    body('citaId').isInt(),
    body('pagoMetodo').isIn(['tarjeta_credito', 'tarjeta_debito', 'transferencia_bancaria'])
  ],
  PagoController.procesarPago
);

router.get('/pagos/cita/:citaId',
  AuthMiddleware.authenticateToken,
  AuthMiddleware.authorizeRole(['paciente']),
  [
    param('citaId').isInt()
  ],
  PagoController.estadoPago
);

module.exports = router;