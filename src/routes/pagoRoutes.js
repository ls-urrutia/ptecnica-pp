const express = require('express');
const router = express.Router();
const PagoController = require('../controllers/pagoController');
const { verificarToken, verificarRol } = require('../middleware/auth');

/**
 * @route POST /api/pagos
 * @desc Procesar pago de una cita
 * @access Private (Paciente)
 */
router.post('/', 
  verificarToken,
  verificarRol(['paciente']),
  PagoController.procesarPago
);

/**
 * @route GET /api/pagos/cita/:citaId
 * @desc Obtener estado de pago de una cita
 * @access Private (Paciente)
 */
router.get('/cita/:citaId',
  verificarToken,
  verificarRol(['paciente']),
  PagoController.obtenerEstadoPago
);

/**
 * @route GET /api/pagos/historial
 * @desc Obtener historial de pagos del paciente
 * @access Private (Paciente)
 */
router.get('/historial',
  verificarToken,
  verificarRol(['paciente']),
  PagoController.obtenerHistorialPagos
);

/**
 * @route GET /api/pagos/sandbox/info
 * @desc Obtener información del sandbox
 * @access Private
 */
router.get('/sandbox/info',
  verificarToken,
  (req, res) => {
    res.json({
      environment: 'sandbox',
      metodosDisponibles: [
        'tarjeta_credito',
        'tarjeta_debito', 
        'transferencia_bancaria'
      ],
      tarjetasPrueba: {
        visa_aprobada: '4111111111111111',
        visa_rechazada: '4111111111110000',
        mastercard_aprobada: '5555555555554444',
        amex_aprobada: '378282246310005'
      },
      comisionPorcentaje: 2.9,
      tiempoProcesamientoPromedio: '1-3 segundos',
      tasaExito: '95%'
    });
  }
);

module.exports = router;