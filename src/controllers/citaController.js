const { Cita, Usuario } = require('../models');
const { validationResult } = require('express-validator');

/**
 * Controlador de Citas
 * Implementa la lógica de negocio para citas médicas
 */
class CitaController {
  /**
   * Crear nueva cita (solo pacientes)
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async crearCita(req, res) {
    try {
      // Validar errores de entrada
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Datos inválidos',
          details: errors.array()
        });
      }

      const { idMedico, citaFecha, citaHora, razon, monto } = req.body;
      const idPaciente = req.usuario.id;

      // Validar que el médico existe
      const medico = await Usuario.findOne({
        where: { id: idMedico, rol: 'medico', isActive: true }
      });

      if (!medico) {
        return res.status(404).json({
          error: 'Médico no encontrado',
          message: 'El médico especificado no existe o no está activo'
        });
      }

      // Verificar disponibilidad del horario
      const isAvailable = await Cita.hayCitaDisponible(idMedico, citaFecha, citaHora);
      if (!isAvailable) {
        return res.status(409).json({
          error: 'Horario no disponible',
          message: 'El horario seleccionado ya está ocupado'
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

      // Cargar datos relacionados
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
   * Confirmar cita (solo médicos)
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async confirmarCita(req, res) {
    try {
      const { id } = req.params;
      const { accion } = req.body; // 'confirmar' o 'rechazar'
      const idMedico = req.usuario.id;

      // Buscar la cita
      const cita = await Cita.findOne({
        where: { id, idMedico },
        include: [
          {
            model: Usuario,
            as: 'paciente',
            attributes: ['nombre', 'apellido', 'correo']
          }
        ]
      });

      if (!cita) {
        return res.status(404).json({
          error: 'Cita no encontrada',
          message: 'La cita no existe o no pertenece a este médico'
        });
      }

      // Verificar que la cita esté pagada (solo para confirmar)
      if (accion === 'confirmar' && cita.estado !== 'pagado') {
        return res.status(400).json({
          error: 'Cita no pagada',
          message: 'No se puede confirmar una cita que no ha sido pagada'
        });
      }

      // Actualizar estado
      const nuevoEstado = accion === 'confirmar' ? 'confirmado' : 'cancelado';
      await cita.update({ estado: nuevoEstado });

      res.json({
        message: `Cita ${accion === 'confirmar' ? 'confirmada' : 'rechazada'} exitosamente`,
        cita: {
          id: cita.id,
          estado: nuevoEstado,
          citaFecha: cita.citaFecha,
          citaHora: cita.citaHora,
          paciente: cita.paciente
        }
      });

    } catch (error) {
      console.error('Error al confirmar cita:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        message: 'No se pudo procesar la acción'
      });
    }
  }

  /**
   * Listar citas del día del médico
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async citasDelDia(req, res) {
    try {
      const idMedico = req.usuario.id;
      const { fecha } = req.query;

      // Usar fecha actual si no se especifica
      const fechaConsulta = fecha || new Date().toISOString().split('T')[0];

      // Obtener citas del día
      const citas = await Cita.getCitasHoy(idMedico, fechaConsulta);

      res.json({
        message: 'Citas del día obtenidas exitosamente',
        fecha: fechaConsulta,
        total: citas.length,
        citas: citas.map(cita => ({
          id: cita.id,
          hora: cita.citaHora,
          estado: cita.estado,
          razon: cita.razon,
          monto: cita.monto,
          paciente: {
            nombre: cita.paciente.nombre,
            apellido: cita.paciente.apellido,
            fono: cita.paciente.fono
          }
        }))
      });

    } catch (error) {
      console.error('Error al obtener citas del día:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        message: 'No se pudieron obtener las citas'
      });
    }
  }

  /**
   * Obtener agenda del paciente
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async agendaPaciente(req, res) {
    try {
      const idPaciente = req.usuario.id;

      // Obtener todas las citas del paciente
      const citas = await Cita.getCitasPaciente(idPaciente);

      res.json({
        message: 'Agenda del paciente obtenida exitosamente',
        total: citas.length,
        citas: citas.map(cita => ({
          id: cita.id,
          fecha: cita.citaFecha,
          hora: cita.citaHora,
          estado: cita.estado,
          razon: cita.razon,
          monto: cita.monto,
          medico: {
            nombre: cita.medico.nombre,
            apellido: cita.medico.apellido,
            especialidad: cita.medico.especialidad
          }
        }))
      });

    } catch (error) {
      console.error('Error al obtener agenda del paciente:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        message: 'No se pudo obtener la agenda'
      });
    }
  }

  /**
   * Listar médicos disponibles
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async listarMedicos(req, res) {
    try {
      const medicos = await Usuario.findAll({
        where: { rol: 'medico', isActive: true },
        attributes: ['id', 'nombre', 'apellido', 'especialidad']
      });

      res.json({
        message: 'Médicos disponibles',
        total: medicos.length,
        medicos
      });

    } catch (error) {
      console.error('Error al listar médicos:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        message: 'No se pudieron obtener los médicos'
      });
    }
  }
}

module.exports = CitaController;