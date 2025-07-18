const { v4: uuidv4 } = require('uuid');
const Pago = require('../models/Pago');
const Cita = require('../models/Cita');

/**
 * Servicio de Pagos - Implementación Sandbox
 * Simula una pasarela de pago completa
 */
class PagoServicio {
  constructor() {
    this.apiKey = process.env.PAYMENT_API_KEY || 'sandbox_123';
    this.environment = 'sandbox';
  }

  /**
   * Procesar pago - Simulación
   * @param {Object} pagoData - Datos del pago
   * @returns {Promise<Object>}
   */
  async procesarPago(pagoData) {
    try {
      const { citaId, pagoMetodo, monto } = pagoData;
      
      // Simular validaciones de tarjeta/método
      const validacionMetodo = this.validarMetodoPago(pagoMetodo);
      if (!validacionMetodo.valido) {
        throw new Error(validacionMetodo.mensaje);
      }

      // Simular delay (1-3 segundos)
      await this.simularLatencia();

      // Simular escenarios de pago
      const resultado = this.simularProcesamiento(pagoMetodo, monto);

      if (resultado.exitoso) {
        // Crear registro de pago exitoso
        const pago = await Pago.create({
          citaId,
          monto,
          pagoMetodo,
          pagoEstado: 'completado',
          transaccionId: uuidv4(),
          fechaPagado: new Date(),
          detallesRespuesta: JSON.stringify(resultado)
        });

        // Actualizar estado de la cita
        await Cita.update(
          { estado: 'pagado' },
          { where: { id: citaId } }
        );

        return {
          exitoso: true,
          pago,
          transaccionId: pago.transaccionId,
          mensaje: 'Pago procesado exitosamente'
        };
      } else {
        // Pago fallido
        const pago = await Pago.create({
          citaId,
          monto,
          pagoMetodo,
          pagoEstado: 'fallido',
          transaccionId: uuidv4(),
          fechaPagado: new Date(),
          detallesRespuesta: JSON.stringify(resultado)
        });

        return {
          exitoso: false,
          pago,
          error: resultado.error,
          mensaje: resultado.mensaje
        };
      }

    } catch (error) {
      console.error('Error procesando pago:', error);
      throw error;
    }
  }

  /**
   * Validar método de pago
   * @param {string} metodo - Método de pago
   * @returns {Object}
   */
  validarMetodoPago(metodo) {
    const metodosValidos = ['tarjeta_credito', 'tarjeta_debito', 'transferencia_bancaria'];
    
    if (!metodosValidos.includes(metodo)) {
      return {
        valido: false,
        mensaje: 'Método de pago no válido'
      };
    }

    // Simular validaciones específicas
    switch (metodo) {
      case 'tarjeta_credito':
        // Simular validación de tarjeta
        const numeroTarjeta = this.generarNumeroTarjetaTest();
        if (numeroTarjeta.endsWith('0000')) {
          return {
            valido: false,
            mensaje: 'Tarjeta rechazada por el banco'
          };
        }
        break;
      
      case 'transferencia_bancaria':
        // Simular validación de cuenta bancaria
        const horaActual = new Date().getHours();
        if (horaActual < 8 || horaActual > 18) {
          return {
            valido: false,
            mensaje: 'Transferencias bancarias solo entre 8:00 AM y 6:00 PM'
          };
        }
        break;
    }

    return { valido: true };
  }

  /**
   * Simular procesamiento de pago con diferentes escenarios
   * @param {string} metodo - Método de pago
   * @param {number} monto - Monto a pagar
   * @returns {Object}
   */
  simularProcesamiento(metodo, monto) {
    // Simular diferentes escenarios basados en el monto
    const random = Math.random();
    
    // 5% de probabilidad de fallo para simular realismo
    if (random < 0.05) {
      return {
        exitoso: false,
        error: 'DECLINED',
        mensaje: 'Transacción rechazada por el banco',
        codigoError: 'INSUFFICIENT_FUNDS'
      };
    }

    // Simular procesamiento lento para montos altos
    if (monto > 100000) {
      return {
        exitoso: true,
        mensaje: 'Pago procesado - Verificación adicional requerida',
        tiempoRespuesta: '3.2s',
        autorizacion: this.generarCodigoAutorizacion(),
        comision: Math.round(monto * 0.029) // 2.9% comisión simulada
      };
    }

    // Procesamiento exitoso normal
    return {
      exitoso: true,
      mensaje: 'Pago procesado exitosamente',
      tiempoRespuesta: '1.1s',
      autorizacion: this.generarCodigoAutorizacion(),
      comision: Math.round(monto * 0.029)
    };
  }

  /**
   * Simular latencia de red
   * @returns {Promise}
   */
  async simularLatencia() {
    const delay = Math.random() * 2000 + 1000; // 1-3 segundos
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * Generar número de tarjeta de prueba
   * @returns {string}
   */
  generarNumeroTarjetaTest() {
    const prefijos = ['4111', '5555', '3782']; // Visa, MC, Amex test
    const prefijo = prefijos[Math.floor(Math.random() * prefijos.length)];
    const sufijo = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefijo}****${sufijo}`;
  }

  /**
   * Generar código de autorización
   * @returns {string}
   */
  generarCodigoAutorizacion() {
    return Math.random().toString(36).substr(2, 8).toUpperCase();
  }

  /**
   * Verificar si una cita está pagada
   * @param {number} citaId - ID de la cita
   * @returns {Promise<boolean>}
   */
  async citaEstaPagada(citaId) {
    try {
      const pagoExitoso = await Pago.findOne({
        where: {
          citaId,
          pagoEstado: 'completado'
        }
      });

      return !!pagoExitoso;
    } catch (error) {
      console.error('Error verificando pago:', error);
      return false;
    }
  }

  /**
   * Obtener información de sandbox
   * @returns {Object}
   */
  getInfoSandbox() {
    return {
      environment: this.environment,
      apiKey: this.apiKey,
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
      tiempoProcesamientoPromedio: '1-3 segundos'
    };
  }
}

module.exports = PagoServicio;