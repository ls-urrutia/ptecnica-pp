const Usuario = require('./Usuario');
const Cita = require('./Cita');
const Pago = require('./Pago');

// Definir asociaciones
Usuario.hasMany(Cita, { foreignKey: 'idPaciente', as: 'citasPaciente' });
Usuario.hasMany(Cita, { foreignKey: 'idMedico', as: 'citasMedico' });

Cita.belongsTo(Usuario, { foreignKey: 'idPaciente', as: 'paciente' });
Cita.belongsTo(Usuario, { foreignKey: 'idMedico', as: 'medico' });

Cita.hasMany(Pago, { foreignKey: 'citaId', as: 'pagos' });
Pago.belongsTo(Cita, { foreignKey: 'citaId', as: 'cita' });

module.exports = {
  Usuario,
  Cita,
  Pago
};