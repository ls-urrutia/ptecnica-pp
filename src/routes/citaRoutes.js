const express = require('express');
const router = express.Router();
const CitaController = require('../controllers/citaController');
const { verificarToken, verificarRol } = require('../middleware/auth');

/**
 * @route POST /api/citas
 * @desc Crear nueva cita (solo pacientes)
 * @access Private (Paciente)
 */
router.post('/', 
  verificarToken,
  verificarRol(['paciente']),
  CitaController.crearCita
);

/**
 * @route GET /api/citas/paciente
 * @desc Obtener citas del paciente
 * @access Private (Paciente)
 */
router.get('/paciente',
  verificarToken,
  verificarRol(['paciente']),
  CitaController.obtenerCitasPaciente
);

/**
 * @route GET /api/citas/medico
 * @desc Obtener citas del médico
 * @access Private (Medico)
 */
router.get('/medico',
  verificarToken,
  verificarRol(['medico']),
  CitaController.obtenerCitasMedico
);

/**
 * @route GET /api/citas/medicos
 * @desc Obtener lista de médicos disponibles
 * @access Private
 */
router.get('/medicos',
  verificarToken,
  CitaController.obtenerMedicos
);

/**
 * @route PUT /api/citas/:id/confirmar
 * @desc Confirmar o rechazar cita (solo médicos)
 * @access Private (Medico)
 */
router.put('/:id/confirmar',
  verificarToken,
  verificarRol(['medico']),
  CitaController.confirmarCita
);

/**
 * @route DELETE /api/citas/:id
 * @desc Cancelar cita
 * @access Private (Paciente/Medico)
 */
router.delete('/:id',
  verificarToken,
  verificarRol(['paciente', 'medico']),
  CitaController.cancelarCita
);

module.exports = router;