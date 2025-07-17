const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

/**
 * Middleware de autenticación JWT
 * Implementa el patrón Chain of Responsibility
 */
class AuthMiddleware {
  /**
   * Verificar token JWT
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware
   */
  static async authenticateToken(req, res, next) {
    try {
      // Obtener token del header Authorization o query parameter
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1] || req.query.token;

      if (!token) {
        return res.status(401).json({
          error: 'Acceso denegado',
          message: 'No se proporcionó un token'
        });
      }

      // Verificar token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Buscar usuario en la base de datos
      const usuario = await Usuario.findByPk(decoded.id);
      if (!usuario || !usuario.isActive) {
        return res.status(401).json({
          error: 'Acceso denegado',
          message: 'Usuario no encontrado o inactivo'
        });
      }

      req.usuario = usuario;
      next();

    } catch (error) {
      return res.status(403).json({
        error: 'Token invalido',
        message: 'El token proporcionado es inválido o ha expirado'
      });
    }
  }

  /**
   * Verificar roles de usuario
   * @param {Array} rolesPermitidos 
   * @returns {Function}
   */
  static authorizeRole(allowedRoles) {
    return (req, res, next) => {
      if (!req.usuario) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Usuario no autenticado'
        });
      }

      if (!allowedRoles.includes(req.usuario.rol)) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Permisos insuficientes'
        });
      }

      next();
    };
  }
}

module.exports = AuthMiddleware;