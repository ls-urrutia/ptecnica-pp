const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { Op } = require('sequelize');

/**
 * Modelo de Cita Médica
 * Con validaciones de negocio y horarios
 */
const Cita = sequelize.define('Cita', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  idPaciente: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'id'
    },
    field: 'id_paciente'
  },
  idMedico: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'id'
    },
    field: 'id_medico'
  },
  citaFecha: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'cita_fecha'
  },
  citaHora: {
    type: DataTypes.TIME,
    allowNull: false,
    field: 'cita_hora'
  },
  estado: {
    type: DataTypes.ENUM('pendiente', 'pagado', 'confirmado', 'cancelado'),
    defaultValue: 'pendiente',
    allowNull: false
  },
  razon: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  monto: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 50000
  }
}, {
  tableName: 'citas',
  timestamps: true,
  underscored: true
});

/**
 * Verificar disponibilidad de horario
 * @param {number} idMedico - ID del médico
 * @param {string} fecha - Fecha en formato YYYY-MM-DD
 * @param {string} hora - Hora en formato HH:MM:SS
 * @returns {Promise<boolean>}
 */
Cita.hayCitaDisponible = async function(idMedico, fecha, hora) {
  try {
    const citaExistente = await this.findOne({
      where: {
        idMedico,
        citaFecha: fecha,
        citaHora: hora,
        estado: {
          [Op.in]: ['pendiente', 'pagado', 'confirmado']
        }
      }
    });
    
    return !citaExistente; // Retorna true si NO existe cita (disponible)
  } catch (error) {
    console.error('Error verificando disponibilidad:', error);
    return false;
  }
};

/**
 * Obtener citas del día para un médico
 * @param {number} idMedico - ID del médico
 * @param {string} fecha - Fecha en formato YYYY-MM-DD
 * @returns {Promise<Array>}
 */
Cita.getCitasHoy = async function(idMedico, fecha) {
  try {
    const Usuario = require('./Usuario');
    
    return await this.findAll({
      where: {
        idMedico,
        citaFecha: fecha
      },
      include: [
        {
          model: Usuario,
          as: 'paciente',
          attributes: ['nombre', 'apellido', 'fono']
        }
      ],
      order: [['citaHora', 'ASC']]
    });
  } catch (error) {
    console.error('Error obteniendo citas del día:', error);
    throw error;
  }
};

/**
 * Obtener todas las citas de un paciente
 * @param {number} idPaciente - ID del paciente
 * @returns {Promise<Array>}
 */
Cita.getCitasPaciente = async function(idPaciente) {
  try {
    const Usuario = require('./Usuario');
    
    return await this.findAll({
      where: { idPaciente },
      include: [
        {
          model: Usuario,
          as: 'medico',
          attributes: ['nombre', 'apellido', 'especialidad']
        }
      ],
      order: [['citaFecha', 'DESC'], ['citaHora', 'DESC']]
    });
  } catch (error) {
    console.error('Error obteniendo citas del paciente:', error);
    throw error;
  }
};

module.exports = Cita;