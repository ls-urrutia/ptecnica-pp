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
    const medicos = await Usuario.bulkCreate([
      {
        correo: 'medico1@hospital.cl',
        password: 'password123',
        nombre: 'Dr. Juan',
        apellido: 'Pérez',
        fono: '+569912341293',
        rol: 'medico',
        especialidad: 'Cardiología',
      },
      {
        correo: 'medico2@hospital.cl',
        password: 'password123',
        nombre: 'Dra. María',
        apellido: 'González',
        fono: '+56983123571',
        rol: 'medico',
        especialidad: 'Neurología',
      }
    ]);

    // Crear pacientes
    const pacientes = await Usuario.bulkCreate([
      {
        correo: 'paciente1@gmail.com',
        password: 'password123',
        nombre: 'Ana',
        apellido: 'Rodríguez',
        fono: '+56938213550',
        rol: 'paciente'
      },
      {
        correo: 'paciente2@gmail.com',
        password: 'password123',
        nombre: 'Carlos',
        apellido: 'López',
        fono: '+56983140221',
        rol: 'paciente'
      }
    ]);

    // Algunas citas de prueba
    const citas = await Cita.bulkCreate([
      {
        idPaciente: pacientes[0].id,
        idMedico: medicos[0].id,
        citaFecha: '2025-07-18',
        citaHora: '09:00:00',
        estado: 'pendiente',
        razon: 'Consulta general',
        monto: 75.000
      },
      {
        idPaciente: pacientes[1].id,
        idMedico: medicos[1].id,
        citaFecha: '2025-07-18',
        citaHora: '10:00:00',
        estado: 'pagado',
        razon: 'Control neurológico',
        monto: 100.000
      }
    ]);

    // Crear un pago de prueba
    await Pago.create({
      citaId: citas[1].id, 
      monto: 100.00,
      pagoMetodo: 'tarjeta_credito', 
      pagoEstado: 'completado',
      transaccionId: 'TXN_TEST_001',
      fechaPagado: new Date()
    });

    console.log('Datos de prueba insertados exitosamente');
    console.log('Datos creados:');
    console.log(`   - ${medicos.length} médicos`);
    console.log(`   - ${pacientes.length} pacientes`);
    console.log(`   - ${citas.length} citas`);
    console.log('   - 1 pago');

    console.log('\n Usuarios de prueba:');
    console.log('Médicos:');
    console.log('  - medico1@hospital.cl / password123');
    console.log('  - medico2@hospital.cl / password123');
    console.log('Pacientes:');
    console.log('  - paciente1@gmail.com / password123');
    console.log('  - paciente2@gmail.com / password123');
    console.log('Citas creadas:', citas);

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