const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');

/**
 * Controlador de Autenticación
 * Implementa el patrón MVC
 */
class AuthController {
  /**
   * Login de usuario
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async login(req, res) {
    try {
      const { correo, password } = req.body;

      // Validar entrada
      if (!correo || !password) {
        return res.status(400).json({
          error: 'Datos requeridos',
          message: 'El correo y contraseña son obligatorios'
        });
      }

      // Buscar usuario
      const usuario = await Usuario.findOne({ where: { correo } });
      if (!usuario || !usuario.isActive) {
        return res.status(401).json({
          error: 'Autenticación fallida',
          message: 'Credenciales inválidas'
        });
      }

      // Verificar contraseña
      const isValidPassword = await usuario.validatePassword(password);
      if (!isValidPassword) {
        return res.status(401).json({
          error: 'Autenticación fallida',
          message: 'Contraseña invalida'
        });
      }

      // Generar token JWT
      const token = jwt.sign(
        { 
          id: usuario.id, 
          rol: usuario.rol,
          correo: usuario.correo 
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      res.json({
        message: 'Login exitoso',
        token,
        usuario: usuario.toPublicJSON()
      });

    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        message: 'Algo salió mal durante el login'
      });
    }
  }

  /**
   * Registro de usuario
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async register(req, res) {
    try {
      const { correo, password, nombre, apellido, fono, rol, especialidad } = req.body;

      // Validaciones básicas
      if (!correo || !password || !nombre || !apellido || !rol) {
        return res.status(400).json({
          error: 'Datos requeridos',
          message: 'Todos los campos obligatorios deben ser completados'
        });
      }

      if (!['paciente', 'medico'].includes(rol)) {
        return res.status(400).json({
          error: 'Rol inválido',
          message: 'El rol debe ser paciente o medico'
        });
      }

      // Verificar si el usuario ya existe
      const existingUser = await Usuario.findOne({ where: { correo } });
      if (existingUser) {
        return res.status(409).json({
          error: 'Usuario ya existe',
          message: 'El correo ya está registrado'
        });
      }

      // Crear nuevo usuario
      const newUser = await Usuario.create({
        correo,
        password,
        nombre,
        fono,
        rol,
        especialidad: rol === 'medico' ? especialidad : null
      });

      // Generar token
      const token = jwt.sign(
        { 
          id: newUser.id, 
          rol: newUser.rol,
          correo: newUser.correo 
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      res.status(201).json({
        message: 'Usuario creado exitosamente',
        token,
        usuario: newUser.toPublicJSON()
      });

    } catch (error) {
      console.error('Error en registro:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        message: 'Algo salió mal durante el registro'
      });
    }
  }
}

module.exports = AuthController;