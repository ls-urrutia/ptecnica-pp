const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { verificarToken } = require('../middleware/auth');

/**
 * @route POST /api/auth/register
 * @desc Registrar nuevo usuario
 * @access Public
 */
router.post('/register', AuthController.register);

/**
 * @route POST /api/auth/login
 * @desc Login de usuario
 * @access Public
 */
router.post('/login', AuthController.login);

/**
 * @route GET /api/auth/profile
 * @desc Obtener perfil del usuario
 * @access Private
 */
router.get('/profile', verificarToken, AuthController.getProfile);

/**
 * @route PUT /api/auth/profile
 * @desc Actualizar perfil del usuario
 * @access Private
 */
router.put('/profile', verificarToken, AuthController.updateProfile);

/**
 * @route POST /api/auth/logout
 * @desc Logout de usuario
 * @access Private
 */
router.post('/logout', verificarToken, AuthController.logout);

module.exports = router;