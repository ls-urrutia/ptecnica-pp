const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcrypt');

/**
 * Modelo de Usuario
 */
const Usuario = sequelize.define('Usuario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  correo: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      esCorreo: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [6, 255]
    }
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'nombre'
  },
  apellido: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'apellido'
  },
  fono: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isNumeric: true,
      len: [10, 15]
    }
  },
  rol: {
    type: DataTypes.ENUM('paciente', 'medico'),
    allowNull: false,
    defaultValue: 'paciente'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  },
  // Campos específico para médico
  especialidad: {
    type: DataTypes.STRING,
    allowNull: true
  },
}, {
  tableName: 'usuarios', 
  timestamps: true,
  underscored: true,
  hooks: {
    beforeCreate: async (usuario) => {
      if (usuario.password) {
        usuario.password = await bcrypt.hash(usuario.password, 10);
      }
    },
    beforeUpdate: async (usuario) => {
      if (usuario.changed('password')) {
        usuario.password = await bcrypt.hash(usuario.password, 10);
      }
    }
  }
});

/**
 * Método para validar contraseña
 * @param {string} password 
 * @returns {Promise<boolean>}
 */
Usuario.prototype.validatePassword = async function(password) {  
  return await bcrypt.compare(password, this.password);
};

/**
 * Método para obtener datos públicos del usuario
 * @returns {Object}
 */
Usuario.prototype.toPublicJSON = function() {  
  return {
    id: this.id,
    correo: this.correo,
    nombre: this.nombre,
    apellido: this.apellido,
    fono: this.fono,
    rol: this.rol,
    especialidad: this.especialidad  
  };
};

module.exports = Usuario;