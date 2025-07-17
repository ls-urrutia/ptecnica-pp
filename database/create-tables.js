const sequelize = require('../src/config/database');

// Importar modelos para que se registren las asociaciones
const { Usuario, Cita, Pago } = require('../src/models');

/**
 * Script para crear todas las tablas de la base de datos
 */
async function createTables() {
  try {
    console.log('Conectando a la base de datos...');
    
    // Verificar conexión
    await sequelize.authenticate();
    console.log('Conexión exitosa a la base de datos');

    console.log('Creando tablas...');
    
    // Crear tablas (force: true elimina tablas existentes)
    await sequelize.sync({ force: true });
    
    console.log('Tablas creadas exitosamente');
    console.log('Tablas creadas:');
    console.log('- usuarios');
    console.log('- citas');
    console.log('- pagos');
    
  } catch (error) {
    console.error('Error al crear tablas:', error);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  createTables();
}

module.exports = createTables;