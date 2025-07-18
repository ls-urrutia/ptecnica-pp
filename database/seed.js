const sequelize = require('../src/config/database');
const { Usuario, Cita, Pago } = require('../src/models');

/**
 * Script de datos de prueba
 */
async function seedDatabase() {
  try {
    console.log('Conectando a la base de datos...');
    await sequelize.authenticate();
    
    console.log('Insertando datos de prueba...');

    // Crear médicos 
    const medico1 = await Usuario.create({
      correo: 'medico1@hospital.cl',
      password: 'password123',
      nombre: 'Juan',
      apellido: 'Pérez',
      fono: '+569912341293',
      rol: 'medico',
      especialidad: 'Cardiología',
    });

    const medico2 = await Usuario.create({
      correo: 'medico2@hospital.cl',
      password: 'password123',
      nombre: 'María',
      apellido: 'González',
      fono: '+56983123571',
      rol: 'medico',
      especialidad: 'Neurología',
    });

    // Crear pacientes
    const paciente1 = await Usuario.create({
      correo: 'paciente1@gmail.com',
      password: 'password123',
      nombre: 'Ana',
      apellido: 'Rodríguez',
      fono: '+56938213550',
      rol: 'paciente'
    });

    const paciente2 = await Usuario.create({
      correo: 'paciente2@gmail.com',
      password: 'password123',
      nombre: 'Carlos',
      apellido: 'López',
      fono: '+56983140221',
      rol: 'paciente'
    });

    console.log('Usuarios creados exitosamente');

    // Crear citas de prueba
    const cita1 = await Cita.create({
      idPaciente: paciente1.id,
      idMedico: medico1.id,
      citaFecha: '2025-07-18',
      citaHora: '09:00:00',
      estado: 'pendiente',
      razon: 'Consulta general',
      monto: 75000
    });

    const cita2 = await Cita.create({
      idPaciente: paciente2.id,
      idMedico: medico2.id,
      citaFecha: '2025-07-18',
      citaHora: '10:00:00',
      estado: 'completado',
      razon: 'Control neurológico',
      monto: 100000
    });

    console.log('Citas creadas exitosamente');

    // Crear un pago de prueba
    await Pago.create({
      citaId: cita2.id, 
      monto: 100000,
      pagoMetodo: 'tarjeta_credito', 
      pagoEstado: 'completado',
      transaccionId: 'TXN_TEST_001',
      fechaPagado: new Date()
    });

    console.log('Datos de prueba insertados exitosamente');
    console.log('Datos creados:');
    console.log(`   - 2 médicos`);
    console.log(`   - 2 pacientes`);
    console.log(`   - 2 citas`);
    console.log('   - 1 pago');

    console.log('\n=== USUARIOS DE PRUEBA ===');
    console.log('Médicos:');
    console.log('  - medico1@hospital.cl / password123');
    console.log('  - medico2@hospital.cl / password123');
    console.log('Pacientes:');
    console.log('  - paciente1@gmail.com / password123');
    console.log('  - paciente2@gmail.com / password123');


  } catch (error) {
    console.error('Error al insertar datos:', error);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;