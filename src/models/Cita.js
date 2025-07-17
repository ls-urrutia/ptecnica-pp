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
    field: 'id_paciente',
    references: {
      model: 'usuarios',  
      key: 'id'
    }
  },
  idMedico: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'id_medico',
    references: {
      model: 'usuarios',  
      key: 'id'
    }
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
    type: DataTypes.ENUM('pendiente', 'pagado', 'confirmado', 'cancelado', 'completado'),
    allowNull: false,
    defaultValue: 'pendiente'
  },
  razon: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  notas: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  monto: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 50.000
  }
}, {
  tableName: 'citas',
  timestamps: true,
  underscored: true,
  validate: {
    /**
     * Validación personalizada para horarios permitidos
     */
    horasValidasTrabajo() {
      const hora_cita = this.citaHora;
      const hora = parseInt(hora_cita.split(':')[0]);
      
      // Horarios permitidos: 7:00-12:00 y 14:00-18:00
      const hora_inicio_am = 7;
      const hora_termino_am = 12;
      const hora_inicio_pm = 14;
      const hora_termino_pm = 18;
      
      if (!((hora >= hora_inicio_am && hora < hora_termino_am) || 
            (hora >= hora_inicio_pm && hora < hora_termino_pm))) {
        throw new Error('La cita debe estar en horario de atención: 7:00-12:00 o 14:00-18:00');
      }
    }
  }
});

/**
 * Método estático para verificar disponibilidad
 * @param {number} idMedico - ID del médico
 * @param {string} fecha - Fecha de la cita
 * @param {string} hora_cita - Hora de la cita
 * @param {number} excludeId - ID de cita a excluir (para actualizaciones)
 * @returns {Promise<boolean>}
 */
Cita.hayCitaDisponible = async function(idMedico, fecha, hora_cita, excludeId = null) { 
  const whereClause = {
    idMedico,
    citaFecha: fecha,
    citaHora: hora_cita,
    estado: {
      [Op.notIn]: ['cancelado']
    }
  };

  if (excludeId) {
    whereClause.id = { [Op.ne]: excludeId };
  }

  const existingCita = await this.findOne({
    where: whereClause
  });

  return !existingCita;
};

/**
 * Método para obtener citas del día de un médico
 * @param {number} idMedico - ID del médico
 * @param {string} fecha - Fecha (YYYY-MM-DD)
 * @returns {Promise<Array>}
 */
Cita.getCitasHoy = async function(idMedico, fecha) {
  return await this.findAll({
    where: {
      idMedico,
      citaFecha: fecha,
      estado: {
        [Op.notIn]: ['cancelado']
      }
    },
    order: [['citaHora', 'ASC']],
    include: [{
      model: sequelize.models.Usuario,
      as: 'paciente', 
      attributes: ['nombre', 'apellido', 'fono', 'correo']
    }]
  });
};

/**
 * Método para obtener agenda de paciente
 * @param {number} idPaciente - ID del paciente
 * @returns {Promise<Array>}
 */
Cita.getCitasPaciente = async function(idPaciente) {
  return await this.findAll({
    where: {
      idPaciente,
      estado: {
        [Op.notIn]: ['cancelado']
      }
    },
    order: [['citaFecha', 'ASC'], ['citaHora', 'ASC']],
    include: [{
      model: sequelize.models.Usuario,
      as: 'medico',
      attributes: ['nombre', 'apellido', 'especialidad']
    }]
  });
};

module.exports = Cita;