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
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  apellido: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  correo: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  fono: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  rol: {
    type: DataTypes.ENUM('paciente', 'medico'),
    allowNull: false,
    defaultValue: 'paciente'
  },
  especialidad: {
    type: DataTypes.STRING(100),
    allowNull: true
  }
}, {
  tableName: 'usuarios',
  timestamps: true,
  underscored: true,
  hooks: {
    beforeCreate: async (usuario) => {
      console.log('Hook beforeCreate ejecutado para:', usuario.correo);
      if (usuario.password) {
        usuario.password = await bcrypt.hash(usuario.password, 10);
        console.log('Contraseña hasheada exitosamente');
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
 */
Usuario.prototype.validatePassword = async function(password) {  
  console.log('Validando contraseña para:', this.correo);
  console.log('Contraseña ingresada:', password);
  console.log('Hash almacenado:', this.password);
  
  const isValid = await bcrypt.compare(password, this.password);
  console.log('Contraseña válida:', isValid);
  
  return isValid;
};

/**
 * Método para obtener datos públicos del usuario
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