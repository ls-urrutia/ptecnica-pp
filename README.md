# Sistema de Citas Médicas - API RESTful

## Descripción del Proyecto

Sistema completo de gestión de citas médicas desarrollado como API RESTful con frontend React, backend Node.js y postgreSQL. Permite a pacientes agendar citas, realizar pagos y a médicos gestionar su agenda diaria.

### Características Principales

- **Gestión de Citas**: Crear, consultar y gestionar citas médicas
- **Sistema de Pagos**: Pasarela de pago sandbox para confirmar citas
- **Roles de Usuario**: Paciente y Médico con permisos específicos
- **Autenticación JWT**: Sistema seguro de autenticación
- **Validaciones**: Horarios permitidos, disponibilidad y estado de pagos
- **Frontend React**: Interfaz de usuario intuitiva y responsive

## Arquitectura del Sistema

```
ptecnica-pp/
├── src/                          # Backend API
│   ├── controllers/              # Controladores (POO)
│   │   ├── authController.js     # Autenticación
│   │   ├── citaController.js     # Gestión de citas
│   │   └── pagoController.js     # Procesamiento de pagos
│   ├── models/                   # Modelos de datos (Sequelize)
│   │   ├── Usuario.js            # Modelo de usuarios
│   │   ├── Cita.js               # Modelo de citas
│   │   └── Pago.js               # Modelo de pagos
│   ├── routes/                   # Rutas API
│   │   ├── authRoutes.js         # Rutas de autenticación
│   │   ├── citaRoutes.js         # Rutas de citas
│   │   └── pagoRoutes.js         # Rutas de pagos
│   ├── middleware/               # Middlewares
│   │   └── auth.js               # Verificación JWT
│   ├── config/                   # Configuración
│   │   ├── database.js           # Configuración BD
│   │   └── seeds.js              # Datos de prueba
│   └── app.js                    # Configuración principal
├── frontend/                     # Frontend React
│   ├── src/
│   │   ├── components/           # Componentes React
│   │   ├── services/             # Servicios API
│   │   ├── contexts/             # Contextos React
│   │   └── utils/                # Utilidades
│   └── public/
└── database/                     # Scripts de BD
    ├── create-tables.sql         # Script de creación
    └── seed-data.sql             # Datos iniciales
```

## 🚀 Tecnologías Utilizadas

### Backend

- **Node.js** - Entorno de ejecución
- **Express.js** - Framework web
- **Sequelize** - ORM para base de datos
- **PostgreSQL** - Base de datos
- **JWT** - Autenticación
- **bcrypt** - Encriptación de contraseñas
- **helmet** - Seguridad HTTP
- **cors** - Manejo de CORS

### Frontend

- **React** - Biblioteca UI
- **Material-UI** - Componentes de interfaz
- **Axios** - Cliente HTTP
- **React Router** - Navegación

## Instalación y Configuración

### Prerrequisitos

- Node.js (v14 o superior)
- PostgreSQL (v12 o superior)
- npm o yarn

### 1. Clonar el repositorio

```bash
git clone https://github.com/ls-urrutia/ptecnica-pp.git
cd ptecnica-pp
```

### 2. Configurar la base de datos

#### Opción A: Configuración Automatizada con Node.js (De esta forma lo hice yo por ser Node.js)

El proyecto incluye **configuración automatizada** de la base de datos usando **Sequelize ORM** y **Node.js**. Solo necesitas:

1. **Crear la base de datos y usuario en PostgreSQL:**

   ```sql
   -- Conectar a PostgreSQL como superusuario
   psql -U postgres

   -- Crear la base de datos
   CREATE DATABASE api_pp_prueba;

   -- Crear el usuario
   CREATE USER admin_user WITH PASSWORD 'pruebatecnica';

   -- Otorgar permisos a nivel de base de datos
   GRANT ALL PRIVILEGES ON DATABASE api_pp_prueba TO admin_user;

   -- Conectar a la base de datos creada
   \c api_pp_prueba

   -- Otorgar permisos en el esquema public
   GRANT CREATE ON SCHEMA public TO admin_user;
   GRANT USAGE ON SCHEMA public TO admin_user;
   GRANT ALL ON SCHEMA public TO admin_user;

   -- Salir de PostgreSQL
   \q
   ```

2. **Configurar variables de entorno:**

   Crear archivo `.env` en la raíz del proyecto:

   ```env
   # Base de datos PostgreSQL
   DB_NAME=api_pp_prueba
   DB_USER=admin_user
   DB_PASSWORD=pruebatecnica
   DB_HOST=localhost
   DB_PORT=5432

   # JWT - IMPORTANTE: Cambia esta clave en producción
   JWT_SECRET=mi_clave_jwt_super_secreta_y_segura_2025_ptecnica_pp

   # Servidor
   PORT=3000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3001
   ```

3. **Ejecutar el servidor** - Las tablas se crearán automáticamente:

   ```bash
   npm install
   npm run dev
   ```

✅ **Ventajas de la configuración automatizada:**

- Las tablas se crean automáticamente con `sequelize.sync()`
- Los datos de prueba se insertan automáticamente
- No necesitas ejecutar scripts SQL manualmente
- Sincronización automática de cambios en los modelos

#### Opción B: Scripts SQL Manuales (Requerimiento técnico)

Por los **requerimientos de entrega**, también se proporcionan los scripts SQL tradicionales:

**Crear archivo `database/create-tables.sql`:**

```sql
-- Script de creación de tablas para Sistema de Citas Médicas
-- Base de datos: api_pp_prueba
-- Usuario: admin_user
-- NOTA: Este script es para cumplir con los requerimientos,
-- pero el proyecto usa Sequelize para automatizar la creación

-- Crear tabla usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    correo VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    fono VARCHAR(20),
    rol VARCHAR(10) CHECK (rol IN ('paciente', 'medico')) NOT NULL DEFAULT 'paciente',
    especialidad VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla citas
CREATE TABLE IF NOT EXISTS citas (
    id SERIAL PRIMARY KEY,
    id_paciente INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    id_medico INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    cita_fecha DATE NOT NULL,
    cita_hora TIME NOT NULL,
    razon TEXT NOT NULL,
    monto DECIMAL(10,2) NOT NULL DEFAULT 50000,
    estado VARCHAR(20) CHECK (estado IN ('pendiente', 'pagado', 'confirmado', 'cancelado', 'completado')) NOT NULL DEFAULT 'pendiente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(id_medico, cita_fecha, cita_hora)
);

-- Crear tabla pagos
CREATE TABLE IF NOT EXISTS pagos (
    id SERIAL PRIMARY KEY,
    cita_id INTEGER NOT NULL REFERENCES citas(id) ON DELETE CASCADE,
    monto DECIMAL(10,2) NOT NULL,
    pago_metodo VARCHAR(30) CHECK (pago_metodo IN ('tarjeta_credito', 'tarjeta_debito', 'transferencia_bancaria')) NOT NULL,
    pago_estado VARCHAR(20) CHECK (pago_estado IN ('pendiente', 'completado', 'fallido', 'cancelado')) NOT NULL DEFAULT 'pendiente',
    transaccion_id VARCHAR(50) UNIQUE NOT NULL,
    fecha_pagado TIMESTAMP NOT NULL,
    detalles_respuesta TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_usuarios_correo ON usuarios(correo);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol);
CREATE INDEX IF NOT EXISTS idx_citas_paciente ON citas(id_paciente);
CREATE INDEX IF NOT EXISTS idx_citas_medico ON citas(id_medico);
CREATE INDEX IF NOT EXISTS idx_citas_fecha ON citas(cita_fecha);
CREATE INDEX IF NOT EXISTS idx_citas_estado ON citas(estado);
CREATE INDEX IF NOT EXISTS idx_pagos_cita ON pagos(cita_id);
CREATE INDEX IF NOT EXISTS idx_pagos_transaccion ON pagos(transaccion_id);

-- Crear función para actualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear triggers para actualizar timestamp automáticamente
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_citas_updated_at BEFORE UPDATE ON citas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pagos_updated_at BEFORE UPDATE ON pagos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Mensaje de confirmación
SELECT 'Tablas creadas exitosamente' AS mensaje;
```

**Crear archivo `database/seed-data.sql`:**

```sql
-- Datos de prueba para Sistema de Citas Médicas
-- NOTA: Este script es para cumplir con los requerimientos,
-- pero el proyecto usa Sequelize seeds para automatizar la inserción

-- Limpiar datos existentes (opcional)
TRUNCATE TABLE pagos, citas, usuarios RESTART IDENTITY CASCADE;

-- Insertar usuarios de prueba
INSERT INTO usuarios (nombre, apellido, correo, password, fono, rol, especialidad) VALUES
-- Pacientes (password: 123456 hasheado con bcrypt)
('Juan', 'Pérez', 'paciente@test.com', '$2b$10$rOYNmTTpPJoGKQbOzHqYneZeNsHRrjvHnZhIyHK7zBqnIkqtqfR3a', '912345678', 'paciente', NULL),
('María', 'González', 'maria@test.com', '$2b$10$rOYNmTTpPJoGKQbOzHqYneZeNsHRrjvHnZhIyHK7zBqnIkqtqfR3a', '987654321', 'paciente', NULL),
('Carlos', 'Rodríguez', 'carlos@test.com', '$2b$10$rOYNmTTpPJoGKQbOzHqYneZeNsHRrjvHnZhIyHK7zBqnIkqtqfR3a', '956789123', 'paciente', NULL),

-- Médicos (password: 123456 hasheado con bcrypt)
('Dr. Ana', 'López', 'medico@test.com', '$2b$10$rOYNmTTpPJoGKQbOzHqYneZeNsHRrjvHnZhIyHK7zBqnIkqtqfR3a', '934567890', 'medico', 'Cardiología'),
('Dr. Luis', 'Martínez', 'luis@test.com', '$2b$10$rOYNmTTpPJoGKQbOzHqYneZeNsHRrjvHnZhIyHK7zBqnIkqtqfR3a', '923456789', 'medico', 'Pediatría'),
('Dra. Carmen', 'Silva', 'carmen@test.com', '$2b$10$rOYNmTTpPJoGKQbOzHqYneZeNsHRrjvHnZhIyHK7zBqnIkqtqfR3a', '945678901', 'medico', 'Ginecología');

-- Insertar citas de ejemplo
INSERT INTO citas (id_paciente, id_medico, cita_fecha, cita_hora, razon, monto, estado) VALUES
(1, 4, '2025-07-20', '09:00', 'Consulta general', 50000, 'pendiente'),
(2, 5, '2025-07-20', '10:30', 'Control niño sano', 45000, 'pendiente'),
(3, 6, '2025-07-21', '15:00', 'Control ginecológico', 60000, 'pagado'),
(1, 4, '2025-07-22', '08:30', 'Seguimiento cardiológico', 55000, 'confirmado');

-- Insertar pagos de ejemplo
INSERT INTO pagos (cita_id, monto, pago_metodo, pago_estado, transaccion_id, fecha_pagado, detalles_respuesta) VALUES
(3, 60000, 'tarjeta_credito', 'completado', 'TXN-2025-001', '2025-07-18 14:30:00', '{"autorizacion": "AUTH123", "comision": 1740}'),
(4, 55000, 'tarjeta_debito', 'completado', 'TXN-2025-002', '2025-07-18 16:45:00', '{"autorizacion": "AUTH456", "comision": 1595}');

-- Mensaje de confirmación
SELECT 'Datos de prueba insertados exitosamente' AS mensaje;
```

**Ejecutar scripts SQL manualmente (si es necesario):**

```bash
# Ejecutar script de creación de tablas
psql -U admin_user -d api_pp_prueba -f database/create-tables.sql

# Insertar datos de prueba (opcional)
psql -U admin_user -d api_pp_prueba -f database/seed-data.sql
```

#### Verificar configuración de la base de datos

```bash
# Probar conexión
psql -U admin_user -d api_pp_prueba -c "SELECT 'Conexión exitosa' AS status;"

# Verificar tablas creadas
psql -U admin_user -d api_pp_prueba -c "\dt"

# Verificar datos de prueba
psql -U admin_user -d api_pp_prueba -c "SELECT COUNT(*) FROM usuarios;"
```

### 3. Configurar variables de entorno

Crear archivo `.env` en la raíz del proyecto:

```env
# Base de datos PostgreSQL
DB_NAME=api_pp_prueba
DB_USER=admin_user
DB_PASSWORD=pruebatecnica
DB_HOST=localhost
DB_PORT=5432

# JWT
JWT_SECRET=clave_jwt_secreta

# Servidor
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:3001
```

### 4. Instalar dependencias

```bash
# Instalar dependencias del backend
npm install

# Instalar dependencias del frontend
cd frontend
npm install
cd ..
```

### 5. Iniciar el proyecto

```bash
# Opción 1: Iniciar backend y frontend simultáneamente
npm run dev:all

# Opción 2: Iniciar por separado
# Terminal 1 - Backend
npm run dev

# Terminal 2 - Frontend
npm run frontend
```

**Listo** Las tablas se crearán automáticamente con Sequelize y los datos de prueba se insertarán al iniciar el servidor por primera vez.

## Arquitectura de Base de Datos

### Configuración Automatizada con Sequelize

El proyecto utiliza **Sequelize ORM** para:

- **Sincronización automática** de modelos con la base de datos
- **Creación automática** de tablas con `sequelize.sync()`
- **Gestión de relaciones** entre modelos
- **Validaciones a nivel de modelo**
- **Migraciones automatizadas**
- **Seeds automáticos** para datos de prueba

### Configuración en `src/config/database.js`:

```javascript
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME || "api_pp_prueba",
  process.env.DB_USER || "admin_user",
  process.env.DB_PASSWORD || "pruebatecnica",
  {
    host: process.env.DB_HOST || "localhost",
    dialect: "postgres",
    logging: false,
  }
);

module.exports = sequelize;
```

### Inicialización automática en `src/app.js`:

```javascript
// Inicializar la base de datos automáticamente
async function initDB() {
  try {
    await sequelize.authenticate();
    console.log("Conexión a la base de datos establecida");

    // Crear tablas automáticamente
    await sequelize.sync({ alter: true });
    console.log("Modelos sincronizados");

    // Insertar datos de prueba automáticamente
    await seedUsers();
  } catch (error) {
    console.error("Error iniciando base de datos:", error);
  }
}

// Ejecutar inicialización
initDB();
```

> **Nota:** Los scripts SQL se proporcionan para cumplir con los requerimientos de entrega, pero el proyecto está diseñado para funcionar completamente con la configuración automatizada de Node.js y Sequelize.

## Criterios de Evaluación Técnica

### Calidad y Arquitectura del Código

El proyecto implementa una **arquitectura en capas** siguiendo las mejores prácticas:

- **Separación de responsabilidades**: Controladores, modelos, rutas y middleware
- **Programación Orientada a Objetos**: Uso de clases y métodos estáticos
- **Modularidad**: Código dividido en módulos reutilizables
- **Escalabilidad**: Estructura preparada para crecimiento

### Estructura del Proyecto

```
ptecnica-pp/
├── src/
│   ├── controllers/       # Lógica de negocio (POO)
│   ├── models/           # Modelos de datos (Sequelize)
│   ├── routes/           # Definición de rutas
│   ├── middleware/       # Middlewares personalizados
│   ├── config/           # Configuración y seeds
│   └── app.js            # Configuración principal
├── frontend/             # Interfaz de usuario React
├── database/             # Scripts SQL
├── tests/                # Pruebas unitarias
└── docs/                 # Documentación adicional
```

### 🎯 Patrones de Diseño Implementados

#### 1. **Patrón MVC (Model-View-Controller)**

```javascript
// Controlador: Maneja la lógica de negocio
class AuthController {
  static async login(req, res) {
    // Lógica de autenticación
  }
}

// Modelo: Maneja los datos
const Usuario = sequelize.define("Usuario", {
  // Definición del modelo
});

// Rutas: Conecta las vistas con los controladores
router.post("/login", AuthController.login);
```

## Cumplimiento de Objetivos Técnicos

### Objetivos Principales Implementados

#### **1. API RESTful con Programación Orientada a Objetos**

```javascript
// Uso de clases para controladores
class CitaController {
  static async crearCita(req, res) {
    /* ... */
  }
  static async obtenerCitasPaciente(req, res) {
    /* ... */
  }
  static async confirmarCita(req, res) {
    /* ... */
  }
}

class PagoController {
  static async procesarPago(req, res) {
    /* ... */
  }
  static async obtenerEstadoPago(req, res) {
    /* ... */
  }
}
```

#### **2. Endpoints Implementados**

| Funcionalidad            | Endpoint                                 | Método | Rol      | Estado       |
| ------------------------ | ---------------------------------------- | ------ | -------- | ------------ |
| **Pedir cita médica**    | `POST /api/citas`                        | POST   | Paciente | Implementado |
| **Pagar cita**           | `POST /api/pagos`                        | POST   | Paciente | Implementado |
| **Confirmar cita**       | `PUT /api/citas/:id/confirmar`           | PUT    | Médico   | Implementado |
| **Listar citas del día** | `GET /api/citas/medico?fecha=YYYY-MM-DD` | GET    | Médico   | Implementado |
| **Agenda del paciente**  | `GET /api/citas/paciente`                | GET    | Paciente | Implementado |

#### **3. Pasarela de Pago Sandbox**

```javascript
// Simulación de pasarela de pago
class PagoProcessor {
  static async procesarPagoSandbox(pagoData) {
    // Simular procesamiento de pago
    const transaccionId = `TXN-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    return {
      estado: "completado",
      transaccionId,
      autorizacion: `AUTH-${Math.random().toString(36).substr(2, 6)}`,
      comision: Math.floor(pagoData.monto * 0.029), // 2.9% comisión
    };
  }
}
```

### Parámetros de Endpoints

#### **POST /api/citas - Crear Cita**

```json
{
  "idMedico": 1,
  "citaFecha": "2025-07-20",
  "citaHora": "09:00",
  "razon": "Consulta general",
  "monto": 50000
}
```

#### **POST /api/pagos - Pagar Cita**

```json
{
  "citaId": 1,
  "monto": 50000,
  "pagoMetodo": "tarjeta_credito",
  "numeroTarjeta": "4111111111111111",
  "cvv": "123",
  "fechaVencimiento": "12/25"
}
```

#### **PUT /api/citas/:id/confirmar - Confirmar Cita**

```json
{
  "accion": "confirmar" // o "rechazar"
}
```

#### **GET /api/citas/medico - Citas del Médico**

```
Query Parameters:
- fecha: YYYY-MM-DD (opcional, por defecto hoy)
- estado: pendiente|pagado|confirmado (opcional)
```

### Roles y Permisos Implementados

#### **Paciente**

- Crear citas médicas (`POST /api/citas`)
- Pagar citas (`POST /api/pagos`)
- Ver sus citas (`GET /api/citas/paciente`)
- Cancelar sus citas (`DELETE /api/citas/:id`)

#### **Médico**

- Ver citas asignadas (`GET /api/citas/medico`)
- Confirmar/rechazar citas (`PUT /api/citas/:id/confirmar`)
- Gestionar agenda diaria
- Cancelar citas (`DELETE /api/citas/:id`)

```javascript
// Middleware de verificación de roles
const verificarRol = (rolesPermitidos) => {
  return (req, res, next) => {
    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({
        error: "Acceso denegado",
        message: "No tienes permisos para acceder a este recurso",
      });
    }
    next();
  };
};
```

### Validaciones Implementadas

#### **1. Horarios Permitidos (7:00-12:00 y 14:00-18:00)**

```javascript
const validarHorario = (hora) => {
  const horaNum = parseInt(hora.split(":")[0]);
  const esHorarioPermitido =
    (horaNum >= 7 && horaNum <= 12) || (horaNum >= 14 && horaNum <= 18);

  if (!esHorarioPermitido) {
    throw new Error(
      "Horario no permitido. Horarios de atención: 7:00-12:00 y 14:00-18:00"
    );
  }
};
```

#### **2. Horario No Ocupado**

```javascript
const verificarDisponibilidad = async (idMedico, fecha, hora) => {
  const citaExistente = await Cita.findOne({
    where: {
      idMedico,
      citaFecha: fecha,
      citaHora: hora,
      estado: { [Op.in]: ["pendiente", "pagado", "confirmado"] },
    },
  });

  if (citaExistente) {
    throw new Error("Ya existe una cita en este horario");
  }
};
```

#### **3. Cita Pagada para Confirmar**

```javascript
const verificarPago = async (citaId, idMedico) => {
  const cita = await Cita.findOne({
    where: {
      id: citaId,
      idMedico,
      estado: "pagado", // Solo se pueden confirmar citas pagadas
    },
  });

  if (!cita) {
    throw new Error("La cita no existe o no está pagada");
  }
};
```

#### **4. Validaciones Adicionales**

- **Fecha futura**: No se pueden crear citas en fechas pasadas
- **Médico existe**: Verificar que el médico seleccionado existe
- **Monto válido**: Validar que el monto sea positivo
- **Formato de fecha/hora**: Validar formatos correctos
- **Límite de citas**: Un paciente no puede tener más de 3 citas pendientes

```javascript
// Validación de fecha futura
const validarFechaFutura = (fecha) => {
  const fechaCita = new Date(fecha);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  if (fechaCita < hoy) {
    throw new Error("No se pueden crear citas en fechas pasadas");
  }
};

// Validación de límite de citas
const validarLimiteCitas = async (idPaciente) => {
  const citasPendientes = await Cita.count({
    where: {
      idPaciente,
      estado: "pendiente",
    },
  });

  if (citasPendientes >= 3) {
    throw new Error("No puedes tener más de 3 citas pendientes");
  }
};
```

### Horarios de Atención Configurados

```javascript
const HORARIOS_ATENCION = {
  manana: {
    inicio: "07:00",
    fin: "12:00",
  },
  tarde: {
    inicio: "14:00",
    fin: "18:00",
  },
};

const validarHorarioAtencion = (hora) => {
  const [horas, minutos] = hora.split(":").map(Number);
  const horaDecimal = horas + minutos / 60;

  const esManana = horaDecimal >= 7 && horaDecimal <= 12;
  const esTarde = horaDecimal >= 14 && horaDecimal <= 18;

  return esManana || esTarde;
};
```

### Estados de Cita Implementados

1. **`pendiente`**: Cita creada, esperando pago
2. **`pagado`**: Cita pagada, esperando confirmación médica
3. **`confirmado`**: Cita confirmada por el médico
4. **`cancelado`**: Cita cancelada por paciente o médico
5. **`completado`**: Cita realizada (estado final)

### Casos de Uso Implementados

#### **Como Paciente:**

1. Me registro en el sistema
2. Busco médicos disponibles
3. Selecciono fecha y hora dentro del horario permitido
4. Creo mi cita (estado: pendiente)
5. Pago la cita con tarjeta u otro metodo (sandbox)
6. Mi cita cambia a estado: pagado
7. Espero confirmación del médico

#### **Como Médico:**

1. Me registro en el sistema
2. Veo mis citas del día
3. Confirmo o rechazo citas pagadas
4. Gestiono mi agenda diaria
5. Marco citas como completadas

> **Resultado**: API RESTful completa con POO, validaciones, sistema de pagos sandbox y gestión de roles.
