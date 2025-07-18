const { Pago, Cita, Usuario } = require('../models');
const { v4: uuidv4 } = require('uuid');

/**
 * Controlador de Pagos
 * Maneja el procesamiento de pagos para las citas médicas
 */
class PagoController {
  /**
   * Procesar pago de una cita
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async procesarPago(req, res) {
    try {
      const { citaId, pagoMetodo, monto } = req.body;
      const idPaciente = req.usuario.id;

      console.log('Procesando pago:', { citaId, pagoMetodo, monto, idPaciente });

      // Validar que la cita existe y pertenece al paciente
      const cita = await Cita.findOne({
        where: { 
          id: citaId,
          idPaciente: idPaciente,
          estado: 'pendiente'
        }
      });

      if (!cita) {
        return res.status(404).json({
          error: 'Cita no encontrada',
          message: 'La cita no existe o ya fue procesada'
        });
      }

      // Validar método de pago
      const metodosValidos = ['tarjeta_credito', 'tarjeta_debito', 'transferencia_bancaria'];
      if (!metodosValidos.includes(pagoMetodo)) {
        return res.status(400).json({
          error: 'Método de pago inválido',
          message: 'Selecciona un método de pago válido'
        });
      }

      // Validar monto
      if (Number(monto) !== Number(cita.monto)) {
        return res.status(400).json({
          error: 'Monto incorrecto',
          message: 'El monto no coincide con el de la cita'
        });
      }

      // Simular procesamiento de pago
      const resultadoPago = await PagoController.simularProcesamiento(pagoMetodo, monto);

      if (resultadoPago.exitoso) {
        // Crear registro de pago exitoso
        const pago = await Pago.create({
          citaId,
          monto,
          pagoMetodo,
          pagoEstado: 'completado',
          transaccionId: uuidv4(),
          fechaPagado: new Date(),
          detallesRespuesta: JSON.stringify(resultadoPago.detalles)
        });

        // Actualizar estado de la cita
        await cita.update({ estado: 'pagado' });

        return res.status(200).json({
          exitoso: true,
          message: 'Pago procesado exitosamente',
          pago,
          transaccionId: pago.transaccionId
        });
      } else {
        // Pago fallido
        const pago = await Pago.create({
          citaId,
          monto,
          pagoMetodo,
          pagoEstado: 'fallido',
          transaccionId: uuidv4(),
          fechaPagado: new Date(),
          detallesRespuesta: JSON.stringify(resultadoPago.detalles)
        });

        return res.status(400).json({
          exitoso: false,
          message: resultadoPago.mensaje,
          pago,
          error: resultadoPago.error
        });
      }

    } catch (error) {
      console.error('Error procesando pago:', error);
      return res.status(500).json({
        error: 'Error interno del servidor',
        message: 'No se pudo procesar el pago'
      });
    }
  }

  /**
   * Simular procesamiento de pago (Sandbox)
   * @param {string} metodo - Método de pago
   * @param {number} monto - Monto a procesar
   * @returns {Promise<Object>}
   */
  static async simularProcesamiento(metodo, monto) {
    // Simular latencia de red
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));

    // Simular diferentes escenarios
    const random = Math.random();
    
    // 5% de probabilidad de fallo para realismo
    if (random < 0.05) {
      return {
        exitoso: false,
        mensaje: 'Transacción rechazada por el banco',
        error: 'DECLINED',
        detalles: {
          codigoError: 'INSUFFICIENT_FUNDS',
          tiempoRespuesta: '2.1s'
        }
      };
    }

    // Procesamiento exitoso
    const comision = Math.round(monto * 0.029); // 2.9% comisión
    const autorizacion = Math.random().toString(36).substr(2, 8).toUpperCase();

    return {
      exitoso: true,
      mensaje: 'Pago procesado exitosamente',
      detalles: {
        autorizacion,
        comision,
        tiempoRespuesta: '1.3s',
        numeroTarjeta: PagoController.generarNumeroTarjetaTest(metodo)
      }
    };
  }

  /**
   * Generar número de tarjeta de prueba
   * @param {string} metodo - Método de pago
   * @returns {string}
   */
  static generarNumeroTarjetaTest(metodo) {
    const prefijos = {
      'tarjeta_credito': ['4111', '5555'],
      'tarjeta_debito': ['4000', '5200'],
      'transferencia_bancaria': ['BANK']
    };

    const prefijo = prefijos[metodo] || ['4111'];
    const prefijoSeleccionado = prefijo[Math.floor(Math.random() * prefijo.length)];
    
    if (metodo === 'transferencia_bancaria') {
      return `${prefijoSeleccionado}-${Math.floor(Math.random() * 10000)}`;
    }
    
    const sufijo = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefijoSeleccionado}****${sufijo}`;
  }

  /**
   * Obtener estado de pago de una cita
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async obtenerEstadoPago(req, res) {
    try {
      const { citaId } = req.params;
      const idPaciente = req.usuario.id;

      const pago = await Pago.findOne({
        where: { citaId },
        include: [{
          model: Cita,
          as: 'cita',
          where: { idPaciente }
        }]
      });

      if (!pago) {
        return res.status(404).json({
          error: 'Pago no encontrado',
          message: 'No se encontró información de pago para esta cita'
        });
      }

      res.json({
        pago: {
          id: pago.id,
          transaccionId: pago.transaccionId,
          pagoEstado: pago.pagoEstado,
          pagoMetodo: pago.pagoMetodo,
          monto: pago.monto,
          fechaPagado: pago.fechaPagado,
          detallesRespuesta: pago.detallesRespuesta
        }
      });

    } catch (error) {
      console.error('Error obteniendo estado de pago:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        message: 'No se pudo obtener el estado del pago'
      });
    }
  }

  /**
   * Obtener historial de pagos del paciente
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async obtenerHistorialPagos(req, res) {
    try {
      const idPaciente = req.usuario.id;

      const pagos = await Pago.findAll({
        include: [{
          model: Cita,
          as: 'cita',
          where: { idPaciente },
          include: [{
            model: Usuario,
            as: 'medico',
            attributes: ['nombre', 'apellido', 'especialidad']
          }]
        }],
        order: [['fechaPagado', 'DESC']]
      });

      res.json({
        pagos: pagos.map(pago => ({
          id: pago.id,
          transaccionId: pago.transaccionId,
          pagoEstado: pago.pagoEstado,
          pagoMetodo: pago.pagoMetodo,
          monto: pago.monto,
          fechaPagado: pago.fechaPagado,
          cita: {
            id: pago.cita.id,
            fecha: pago.cita.citaFecha,
            hora: pago.cita.citaHora,
            estado: pago.cita.estado,
            medico: pago.cita.medico
          }
        }))
      });

    } catch (error) {
      console.error('Error obteniendo historial de pagos:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        message: 'No se pudo obtener el historial de pagos'
      });
    }
  }
}

module.exports = PagoController;