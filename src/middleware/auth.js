const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');

/**
 * Middleware para verificar token JWT
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
const verificarToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        error: 'Acceso denegado',
        message: 'No se proporcionó token de autenticación'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu_jwt_secret_aqui');
    
    // Verificar que el usuario existe 
    const usuario = await Usuario.findOne({ 
      where: { 
        id: decoded.id,
        correo: decoded.correo 
      }
    });
    
    if (!usuario) {
      return res.status(401).json({
        error: 'Token inválido',
        message: 'El usuario no existe'
      });
    }

    req.usuario = {
      id: usuario.id,
      correo: usuario.correo, 
      rol: usuario.rol
    };

    next();
  } catch (error) {
    console.error('Error verificando token:', error);
    return res.status(401).json({
      error: 'Token inválido',
      message: 'Token expirado o inválido'
    });
  }
};

/**
 * Middleware para verificar rol de usuario
 * @param {Array} rolesPermitidos - Roles que tienen acceso
 * @returns {Function} Middleware function
 */
const verificarRol = (rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({
        error: 'Acceso denegado',
        message: 'Usuario no autenticado'
      });
    }

    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'No tienes permisos para acceder a este recurso'
      });
    }

    next();
  };
};

module.exports = {
  verificarToken,
  verificarRol
};