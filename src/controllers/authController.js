const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');
const { validationResult } = require('express-validator');

/**
 * Controlador de Autenticación
 * Maneja registro, login y gestión de usuarios
 */
class AuthController {
  /**
   * Registrar nuevo usuario
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async register(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Datos inválidos',
          message: errors.array()[0].msg
        });
      }

      const { nombre, apellido, correo, password, fono, rol, especialidad } = req.body;

      // Verificar si el usuario ya existe
      const usuarioExistente = await Usuario.findOne({ where: { correo } });
      if (usuarioExistente) {
        return res.status(400).json({
          error: 'Usuario ya existe',
          message: 'Ya existe un usuario con este correo'
        });
      }

      // Encriptar contraseña
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Crear usuario
      const nuevoUsuario = await Usuario.create({
        nombre,
        apellido,
        correo, 
        password: hashedPassword,
        fono,
        rol: rol || 'paciente',
        especialidad: rol === 'medico' ? especialidad : null
      });

      // Generar token JWT
      const token = jwt.sign(
        { 
          id: nuevoUsuario.id,
          correo: nuevoUsuario.correo,
          rol: nuevoUsuario.rol
        },
        process.env.JWT_SECRET || 'tu_jwt_secret_aqui',
        { expiresIn: '24h' }
      );

      res.status(201).json({
        message: 'Usuario registrado exitosamente',
        usuario: {
          id: nuevoUsuario.id,
          nombre: nuevoUsuario.nombre,
          apellido: nuevoUsuario.apellido,
          email: nuevoUsuario.correo, 
          fono: nuevoUsuario.fono,
          rol: nuevoUsuario.rol,
          especialidad: nuevoUsuario.especialidad
        },
        token
      });

    } catch (error) {
      console.error('Error en registro:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        message: 'No se pudo registrar el usuario'
      });
    }
  }

  /**
   * Login de usuario
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async login(req, res) {
    try {
      console.log('Datos recibidos en login:', req.body);
      
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Datos inválidos',
          message: errors.array()[0].msg
        });
      }

      const { correo, password } = req.body;
      
      console.log('Email recibido:', correo);
      console.log('Password recibido:', password ? 'Sí' : 'No'); 

      // Verificar que correo no sea undefined
      if (!correo) {
        return res.status(400).json({
          error: 'Correo requerido',
          message: 'El correo es obligatorio'
        });
      }

  
      const usuario = await Usuario.findOne({ where: { correo } });
      
      console.log('👤 Usuario encontrado:', usuario ? 'Sí' : 'No');
      
      if (!usuario) {
        return res.status(401).json({
          error: 'Credenciales inválidas',
          message: 'Correo o contraseña incorrectos'
        });
      }

      // Verificar contraseña usando el método del modelo
      const passwordValida = await usuario.validatePassword(password);
      if (!passwordValida) {
        return res.status(401).json({
          error: 'Credenciales inválidas',
          message: 'Correo o contraseña incorrectos'
        });
      }

      // Generar token JWT
      const token = jwt.sign(
        { 
          id: usuario.id,
          correo: usuario.correo,
          rol: usuario.rol
        },
        process.env.JWT_SECRET || 'tu_jwt_secret_aqui',
        { expiresIn: '24h' }
      );

      res.json({
        message: 'Login exitoso',
        usuario: {
          id: usuario.id,
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          email: usuario.correo,
          fono: usuario.fono,
          rol: usuario.rol,
          especialidad: usuario.especialidad
        },
        token
      });

    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        message: 'No se pudo procesar el login'
      });
    }
  }

  /**
   * Obtener perfil del usuario
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async getProfile(req, res) {
    try {
      const usuario = await Usuario.findByPk(req.usuario.id, {
        attributes: { exclude: ['password'] }
      });

      if (!usuario) {
        return res.status(404).json({
          error: 'Usuario no encontrado',
          message: 'El usuario no existe'
        });
      }

      res.json({
        usuario: {
          id: usuario.id,
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          email: usuario.correo,
          fono: usuario.fono,
          rol: usuario.rol,
          especialidad: usuario.especialidad
        }
      });

    } catch (error) {
      console.error('Error obteniendo perfil:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        message: 'No se pudo obtener el perfil'
      });
    }
  }

  /**
   * Actualizar perfil del usuario
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async updateProfile(req, res) {
    try {
      const { nombre, apellido, fono, especialidad } = req.body;
      const usuario = await Usuario.findByPk(req.usuario.id);

      if (!usuario) {
        return res.status(404).json({
          error: 'Usuario no encontrado',
          message: 'El usuario no existe'
        });
      }

      // Actualizar datos
      await usuario.update({
        nombre: nombre || usuario.nombre,
        apellido: apellido || usuario.apellido,
        fono: fono || usuario.fono,
        especialidad: usuario.rol === 'medico' ? (especialidad || usuario.especialidad) : null
      });

      res.json({
        message: 'Perfil actualizado exitosamente',
        usuario: {
          id: usuario.id,
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          email: usuario.correo,
          fono: usuario.fono,
          rol: usuario.rol,
          especialidad: usuario.especialidad
        }
      });

    } catch (error) {
      console.error('Error actualizando perfil:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        message: 'No se pudo actualizar el perfil'
      });
    }
  }

  /**
   * Logout del usuario
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async logout(req, res) {
    try {
      // En una implementación real, se podría invalidar el token
      // Por ahora, se confirma el logout
      res.json({
        message: 'Logout exitoso'
      });

    } catch (error) {
      console.error('Error en logout:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        message: 'No se pudo procesar el logout'
      });
    }
  }
}

module.exports = AuthController;