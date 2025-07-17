const sequelize = require('../src/config/database');
const { Usuario, Cita, Pago } = require('../src/models');
const PaymentService = require('../src/services/PaymentService');

/**
 * Pruebas básicas de funcionalidad
 */
async function runBasicTests() {
  try {
    console.log('Ejecutando pruebas básicas...\n');

    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('Conexión a BD exitosa');

    // Test 1: Verificar que existen usuarios
    const usuarioCount = await Usuario.count();
    console.log(`Usuarios en BD: ${usuarioCount}`);

    // Test 2: Buscar un médico
    const medico = await Usuario.findOne({ where: { rol: 'medico' } });
    if (medico) {
      console.log(`Médico encontrado: ${medico.nombre} ${medico.apellido}`);
    } else {
      console.log('No se encontró médico');
    }

    // Test 3: Buscar un paciente
    const paciente = await Usuario.findOne({ where: { rol: 'paciente' } });
    if (paciente) {
      console.log(`Paciente encontrado: ${paciente.nombre} ${paciente.apellido}`);
    } else {
      console.log('No se encontró paciente');
    }

    // Test 4: Verificar validación de contraseña
    if (paciente) {
      const isValidPassword = await paciente.validatePassword('password123');
      console.log(`Validación de contraseña: ${isValidPassword ? 'CORRECTA' : 'INCORRECTA'}`);
    }

    // Test 5: Verificar horarios disponibles
    if (medico) {
      const hayDisponibilidad = await Cita.hayCitaDisponible(
        medico.id, 
        '2025-07-19', 
        '09:00:00'
      );
      console.log(`Horario disponible (19/07 09:00): ${hayDisponibilidad ? 'SÍ' : 'NO'}`);
    }

    // Test 6: Obtener citas del día
    if (medico) {
      const citasHoy = await Cita.getCitasHoy(
        medico.id, 
        '2025-07-18'
      );
      console.log(`Citas del día (18/07): ${citasHoy.length}`);
    }

    // Test 7: Probar servicio de pagos
    const paymentService = new PaymentService();
    const paymentResult = await paymentService.processPayment({
      monto: 50.000,
      pagoMetodo: 'tarjeta_credito'
    });
    console.log(`Simulación de pago: ${paymentResult.success ? 'EXITOSO' : 'FALLIDO'}`);

    // Test 8: Verificar cita pagada
    const isPaid = await paymentService.citaEstaPagada(1);
    console.log(`Cita ID 1 pagada: ${isPaid ? 'SÍ' : 'NO'}`);

    console.log('\n Todas las pruebas básicas completadas');

  } catch (error) {
    console.error('Error en pruebas:', error);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  runBasicTests();
}

module.exports = runBasicTests;