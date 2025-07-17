const sequelize = require('./database');

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Conexión exitosa!');
  } catch (error) {
    console.error('Conexión fallida:', error);
  } finally {
    await sequelize.close();
  }
}

testConnection();