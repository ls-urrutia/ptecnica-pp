const Usuario = require('./Usuario');
const Cita = require('./Cita');
const Pago = require('./Pago');

/**
 * Configuración de asociaciones entre modelos
 * Patrón Repository para relaciones
 */

// Relaciones Usuario - Cita
Usuario.hasMany(Cita, {
  foreignKey: 'idPaciente',  
  as: 'pacienteCitas'
});

Usuario.hasMany(Cita, {
  foreignKey: 'idMedico',  
  as: 'medicoCitas'
});

Cita.belongsTo(Usuario, {
  foreignKey: 'idPaciente', 
  as: 'paciente'
});

Cita.belongsTo(Usuario, {
  foreignKey: 'idMedico',  
  as: 'medico'
});

// Relaciones Cita - Pago
Cita.hasMany(Pago, {
  foreignKey: 'citaId',  
  as: 'pagos'
});

Pago.belongsTo(Cita, {
  foreignKey: 'citaId', 
  as: 'cita'
});

module.exports = {
  Usuario,
  Cita,
  Pago
};