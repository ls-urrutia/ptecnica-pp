const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Modelo de Pago
 * Maneja los pagos de las citas médicas
 */
const Pago = sequelize.define('Pago', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  citaId: {  
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'id_cita',
    references: {
      model: 'citas',
      key: 'id'
    }
  },
  monto: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  pagoMetodo: {
    type: DataTypes.ENUM('tarjeta_credito', 'tarjeta_debito', 'transferencia_bancaria'),
    allowNull: false,
    field: 'metodo_pago'
  },
  pagoEstado: {
    type: DataTypes.ENUM('pendiente', 'pagado', 'confirmado', 'cancelado', 'completado'),
    allowNull: false,
    defaultValue: 'pendiente',
    field: 'estado_pago'
  },
  transaccionId: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'id_transaccion'
  },
  gatewayResponse: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'gateway_response'
  },
  fechaPagado: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'pago_fecha'
  }
}, {
  tableName: 'pagos',
  timestamps: true,
  underscored: true
});

module.exports = Pago;