const { v4: uuidv4 } = require('uuid');
const Pago = require('../models/Pago');

/**
 * Servicio de Pagos - Implementación Sandbox
 * Patrón Strategy para diferentes gateways
 */
class PaymentService {
  constructor() {
    this.gatewayUrl = process.env.PAYMENT_GATEWAY_URL || 'https://sandbox.payment.com';
    this.apiKey = process.env.PAYMENT_API_KEY || 'sandbox_key_123';
  }

  /**
   * Procesar pago (simulación sandbox)
   * @param {Object} paymentData - Datos del pago
   * @returns {Promise<Object>}
   */
  async processPayment(paymentData) {
    try {
      // Simular latencia de red
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generar ID de transacción único
      const transaccionId = `TXN_${uuidv4()}`;

      // Simular respuesta del gateway (90% éxito, 10% fallo)
      const isSuccess = Math.random() > 0.1;

      const gatewayResponse = {
        id_transaccion: transaccionId,
        estado: isSuccess ? 'confirmado' : 'cancelado',
        monto: paymentData.monto,
        currency: 'CLP',
        metodo_pago: paymentData.pagoMetodo,
        timestamp: new Date().toISOString(),
        gateway: 'sandbox',
        razon_cancelado: isSuccess ? null : 'fondos_insuficientes'
      };

      return {
        success: isSuccess,
        transaccionId,
        gatewayResponse,
        estado: isSuccess ? 'completado' : 'fallido'
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        estado: 'fallido'
      };
    }
  }

  /**
   * Crear registro de pago
   * @param {Object} paymentData - Datos del pago
   * @returns {Promise<Pago>}
   */
  async createPayment(paymentData) {
    return await Pago.create({
      citaId: paymentData.citaId,
      monto: paymentData.monto,
      pagoMetodo: paymentData.pagoMetodo,
      pagoEstado: 'pendiente'
    });
  }

  /**
   * Actualizar estado del pago
   * @param {number} paymentId - ID del pago
   * @param {Object} updateData - Datos de actualización
   * @returns {Promise<Pago>}
   */
  async updatePaymentStatus(paymentId, updateData) {
    const pago = await Pago.findByPk(paymentId);
    if (!pago) {
      throw new Error('Pago no encontrado');
    }

    return await pago.update({
      pagoEstado: updateData.estado,
      transaccionId: updateData.transaccionId,
      gatewayResponse: updateData.gatewayResponse,
      fechaPagado: updateData.estado === 'completado' ? new Date() : null
    });
  }

  /**
   * Verificar si una cita está pagada
   * @param {number} citaId - ID de la cita
   * @returns {Promise<boolean>}
   */
  async citaEstaPagada(citaId) { 
    const pago = await Pago.findOne({
      where: {
        citaId,
        pagoEstado: 'completado'
      }
    });

    return !!pago;
  }
}

module.exports = PaymentService;