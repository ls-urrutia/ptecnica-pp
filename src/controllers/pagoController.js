const { Cita, Pago } = require('../models');
const PaymentService = require('../services/PaymentService');
const { validationResult } = require('express-validator');

/**
 * Controlador de Pagos
 * Maneja el procesamiento de pagos de citas
 */
class PagoController {
  constructor() {
    this.paymentService = new PaymentService();
  }

  /**
   * Procesar pago de cita
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async procesarPago(req, res) {
    try {
      // Validar errores de entrada
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Datos inválidos',
          details: errors.array()
        });
      }

      const { citaId, pagoMetodo } = req.body;
      const idPaciente = req.usuario.id;

      // Verificar que la cita existe y pertenece al paciente
      const cita = await Cita.findOne({
        where: { id: citaId, idPaciente }
      });

      if (!cita) {
        return res.status(404).json({
          error: 'Cita no encontrada',
          message: 'La cita no existe o no pertenece a este paciente'
        });
      }

      // Verificar que la cita esté en estado pendiente
      if (cita.estado !== 'pendiente') {
        return res.status(400).json({
          error: 'Estado de cita inválido',
          message: 'Solo se pueden pagar citas en estado pendiente'
        });
      }

      // Verificar si ya existe un pago completado
      const pagoExistente = await Pago.findOne({
        where: { 
          citaId, 
          pagoEstado: 'completado' 
        }
      });

      if (pagoExistente) {
        return res.status(400).json({
          error: 'Cita ya pagada',
          message: 'Esta cita ya ha sido pagada'
        });
      }

      const paymentService = new PaymentService();

      // Crear registro de pago
      const pago = await paymentService.createPayment({
        citaId,
        monto: cita.monto,
        pagoMetodo
      });

      // Procesar pago con el gateway
      const paymentResult = await paymentService.processPayment({
        monto: cita.monto,
        pagoMetodo
      });

      // Actualizar estado del pago
      await paymentService.updatePaymentStatus(pago.id, {
        estado: paymentResult.success ? 'completado' : 'fallido',
        transaccionId: paymentResult.transaccionId,
        gatewayResponse: paymentResult.gatewayResponse
      });

      if (paymentResult.success) {
        // Actualizar estado de la cita
        await cita.update({ estado: 'pagado' });

        res.json({
          message: 'Pago procesado exitosamente',
          pago: {
            id: pago.id,
            monto: cita.monto,
            estado: 'completado',
            transaccionId: paymentResult.transaccionId
          },
          cita: {
            id: cita.id,
            estado: 'pagado'
          }
        });
      } else {
        res.status(400).json({
          error: 'Pago fallido',
          message: 'El pago no pudo ser procesado',
          details: paymentResult.gatewayResponse
        });
      }

    } catch (error) {
      console.error('Error al procesar pago:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        message: 'No se pudo procesar el pago'
      });
    }
  }

  /**
   * Obtener estado de pago de una cita
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async estadoPago(req, res) {
    try {
      const { citaId } = req.params;
      const idPaciente = req.usuario.id;

      // Verificar que la cita pertenece al paciente
      const cita = await Cita.findOne({
        where: { id: citaId, idPaciente }
      });

      if (!cita) {
        return res.status(404).json({
          error: 'Cita no encontrada',
          message: 'La cita no existe o no pertenece a este paciente'
        });
      }

      // Buscar pagos relacionados
      const pagos = await Pago.findAll({
        where: { citaId },
        order: [['createdAt', 'DESC']]
      });

      const paymentService = new PaymentService();
      const estaPagada = await paymentService.citaEstaPagada(citaId);

      res.json({
        message: 'Estado de pago obtenido exitosamente',
        cita: {
          id: cita.id,
          estado: cita.estado,
          monto: cita.monto
        },
        estaPagada,
        pagos: pagos.map(pago => ({
          id: pago.id,
          monto: pago.monto,
          estado: pago.pagoEstado,
          metodo: pago.pagoMetodo,
          fecha: pago.fechaPagado,
          transaccionId: pago.transaccionId
        }))
      });

    } catch (error) {
      console.error('Error al obtener estado de pago:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        message: 'No se pudo obtener el estado del pago'
      });
    }
  }
}

module.exports = PagoController;