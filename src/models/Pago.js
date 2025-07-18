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
    references: {
      model: 'citas',
      key: 'id'
    },
    field: 'cita_id'
  },
  monto: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  pagoMetodo: {
    type: DataTypes.ENUM('tarjeta_credito', 'tarjeta_debito', 'transferencia_bancaria'),
    allowNull: false,
    field: 'pago_metodo'
  },
  pagoEstado: {
    type: DataTypes.ENUM('pendiente', 'completado', 'fallido'),
    defaultValue: 'pendiente',
    allowNull: false
  },
  transaccionId: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    field: 'transaccion_id'
  },
  fechaPagado: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'fecha_pagado'
  },
  detallesRespuesta: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'detalles_respuesta'
  }
}, {
  tableName: 'pagos',
  timestamps: true,
  underscored: true
});

module.exports = Pago;