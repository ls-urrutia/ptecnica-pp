const { Cita, Usuario } = require('../models');
const { Op } = require('sequelize');

/**
 * Controlador de Citas
 * Maneja todas las operaciones relacionadas con citas médicas
 */
class CitaController {
  /**
   * Crear nueva cita
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async crearCita(req, res) {
    try {
      const { idMedico, citaFecha, citaHora, razon, monto } = req.body;
      const idPaciente = req.usuario.id;

      // Verificar que el médico existe
      const medico = await Usuario.findOne({
        where: { id: idMedico, rol: 'medico' }
      });

      if (!medico) {
        return res.status(404).json({
          error: 'Médico no encontrado',
          message: 'El médico seleccionado no existe'
        });
      }

      // Verificar disponibilidad
      const citaExistente = await Cita.findOne({
        where: {
          idMedico,
          citaFecha,
          citaHora,
          estado: { [Op.in]: ['pendiente', 'pagado', 'confirmado'] }
        }
      });

      if (citaExistente) {
        return res.status(400).json({
          error: 'Horario no disponible',
          message: 'Ya existe una cita en este horario'
        });
      }

      // Crear la cita
      const nuevaCita = await Cita.create({
        idPaciente,
        idMedico,
        citaFecha,
        citaHora,
        razon,
        monto: monto || 50000,
        estado: 'pendiente'
      });

      // Obtener la cita completa con información del médico
      const citaCompleta = await Cita.findByPk(nuevaCita.id, {
        include: [
          {
            model: Usuario,
            as: 'medico',
            attributes: ['nombre', 'apellido', 'especialidad']
          },
          {
            model: Usuario,
            as: 'paciente',
            attributes: ['nombre', 'apellido', 'fono']
          }
        ]
      });

      res.status(201).json({
        message: 'Cita creada exitosamente',
        cita: citaCompleta
      });

    } catch (error) {
      console.error('Error al crear cita:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        message: 'No se pudo crear la cita'
      });
    }
  }

  /**
   * Obtener citas del paciente
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async obtenerCitasPaciente(req, res) {
    try {
      const idPaciente = req.usuario.id;

      const citas = await Cita.findAll({
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

      // Transformar datos para el frontend
      const citasTransformadas = citas.map(cita => ({
        id: cita.id,
        fecha: cita.citaFecha,
        hora: cita.citaHora,
        estado: cita.estado,
        razon: cita.razon,
        monto: cita.monto,
        medico: cita.medico
      }));

      res.json({
        citas: citasTransformadas
      });

    } catch (error) {
      console.error('Error obteniendo citas del paciente:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        message: 'No se pudieron obtener las citas'
      });
    }
  }

  /**
   * Obtener citas del médico
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async obtenerCitasMedico(req, res) {
    try {
      const idMedico = req.usuario.id;
      const { fecha } = req.query; 

      // Construir la condición WHERE
      const whereCondition = { idMedico };
      
      // Si se proporciona fecha, filtrar por ella
      if (fecha) {
        whereCondition.citaFecha = fecha;
      }

      const citas = await Cita.findAll({
        where: whereCondition,
        include: [
          {
            model: Usuario,
            as: 'paciente',
            attributes: ['nombre', 'apellido', 'fono']
          }
        ],
        order: [['citaFecha', 'ASC'], ['citaHora', 'ASC']]
      });

      res.json({
        citas: citas.map(cita => ({
          id: cita.id,
          fecha: cita.citaFecha,
          hora: cita.citaHora,
          estado: cita.estado,
          razon: cita.razon,
          monto: cita.monto,
          paciente: cita.paciente
        }))
      });

    } catch (error) {
      console.error('Error obteniendo citas del médico:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        message: 'No se pudieron obtener las citas'
      });
    }
  }

  /**
   * Confirmar cita (solo médicos)
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async confirmarCita(req, res) {
    try {
      const { id } = req.params;
      const { accion } = req.body; // 'confirmar' o 'rechazar'
      const idMedico = req.usuario.id;

      const cita = await Cita.findOne({
        where: { id, idMedico, estado: 'pagado' }
      });

      if (!cita) {
        return res.status(404).json({
          error: 'Cita no encontrada',
          message: 'La cita no existe o no está pagada'
        });
      }

      const nuevoEstado = accion === 'confirmar' ? 'confirmado' : 'cancelado';
      await cita.update({ estado: nuevoEstado });

      res.json({
        message: `Cita ${accion === 'confirmar' ? 'confirmada' : 'rechazada'} exitosamente`,
        cita: {
          id: cita.id,
          estado: cita.estado
        }
      });

    } catch (error) {
      console.error('Error confirmando cita:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        message: 'No se pudo confirmar la cita'
      });
    }
  }

  /**
   * Cancelar cita
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async cancelarCita(req, res) {
    try {
      const { id } = req.params;
      const usuarioId = req.usuario.id;
      const usuarioRol = req.usuario.rol;

      // Buscar la cita según el rol del usuario
      const whereClause = usuarioRol === 'paciente' 
        ? { id, idPaciente: usuarioId }
        : { id, idMedico: usuarioId };

      const cita = await Cita.findOne({ where: whereClause });

      if (!cita) {
        return res.status(404).json({
          error: 'Cita no encontrada',
          message: 'La cita no existe o no tienes permisos para cancelarla'
        });
      }

      if (cita.estado === 'cancelado') {
        return res.status(400).json({
          error: 'Cita ya cancelada',
          message: 'Esta cita ya fue cancelada'
        });
      }

      await cita.update({ estado: 'cancelado' });

      res.json({
        message: 'Cita cancelada exitosamente',
        cita: {
          id: cita.id,
          estado: cita.estado
        }
      });

    } catch (error) {
      console.error('Error cancelando cita:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        message: 'No se pudo cancelar la cita'
      });
    }
  }

  /**
   * Obtener lista de médicos disponibles
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async obtenerMedicos(req, res) {
    try {
      const medicos = await Usuario.findAll({
        where: { rol: 'medico' },
        attributes: ['id', 'nombre', 'apellido', 'especialidad']
      });

      res.json({
        medicos
      });

    } catch (error) {
      console.error('Error obteniendo médicos:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        message: 'No se pudieron obtener los médicos'
      });
    }
  }
}

module.exports = CitaController;