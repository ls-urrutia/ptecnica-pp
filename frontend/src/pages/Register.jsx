import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';

const Register = () => {
  const [formData, setFormData] = useState({
    correo: '',
    password: '',
    nombre: '',
    apellido: '',
    fono: '',
    rol: 'paciente',
    especialidad: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await register(formData);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography component="h1" variant="h4" align="center" gutterBottom>
            Registrarse
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="correo"
              label="Correo Electrónico"
              name="correo"
              autoComplete="email"
              autoFocus
              value={formData.correo}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Contraseña"
              type="password"
              id="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="nombre"
              label="Nombre"
              id="nombre"
              value={formData.nombre}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="apellido"
              label="Apellido"
              id="apellido"
              value={formData.apellido}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              fullWidth
              name="fono"
              label="Teléfono"
              id="fono"
              value={formData.fono}
              onChange={handleChange}
            />
            <FormControl fullWidth margin="normal" required>
              <InputLabel id="rol-label">Rol</InputLabel>
              <Select
                labelId="rol-label"
                id="rol"
                name="rol"
                value={formData.rol}
                label="Rol"
                onChange={handleChange}
              >
                <MenuItem value="paciente">Paciente</MenuItem>
                <MenuItem value="medico">Médico</MenuItem>
              </Select>
            </FormControl>
            {formData.rol === 'medico' && (
              <TextField
                margin="normal"
                required
                fullWidth
                name="especialidad"
                label="Especialidad"
                id="especialidad"
                value={formData.especialidad}
                onChange={handleChange}
              />
            )}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Registrarse'}
            </Button>
            <Box textAlign="center">
              <Link to="/login">
                ¿Ya tienes cuenta? Inicia sesión
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;