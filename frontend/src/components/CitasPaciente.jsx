import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Box,
  AppBar,
  Toolbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { citaServicio } from '../services/api';

const CitasPaciente = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Estados
  const [citas, setCitas] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Formulario nueva cita
  const [nuevaCita, setNuevaCita] = useState({
    idMedico: '',
    citaFecha: null,
    citaHora: null,
    razon: '',
    monto: 50000
  });

  // Cargar datos al montar el componente
  useEffect(() => {
    cargarCitas();
    cargarMedicos();
  }, []);

  const cargarCitas = async () => {
    try {
      setLoading(true);
      const response = await citaServicio.getCitasPaciente();
      setCitas(response.data.citas);
    } catch (error) {
      setError('Error al cargar las citas');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarMedicos = async () => {
    try {
      const response = await citaServicio.getMedicos();
      setMedicos(response.data.medicos);
    } catch (error) {
      setError('Error al cargar los médicos');
      console.error('Error:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
    setError('');
    setSuccess('');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNuevaCita({
      idMedico: '',
      citaFecha: null,
      citaHora: null,
      razon: '',
      monto: 50000
    });
  };

  const handleSubmitCita = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validaciones
    if (!nuevaCita.idMedico || !nuevaCita.citaFecha || !nuevaCita.citaHora || !nuevaCita.razon) {
      setError('Todos los campos son obligatorios');
      return;
    }

    // Validar horario de atención
    const hora = nuevaCita.citaHora.hour();
    if (!((hora >= 7 && hora < 12) || (hora >= 14 && hora < 18))) {
      setError('El horario debe estar entre 7:00-12:00 o 14:00-18:00');
      return;
    }

    // Validar fecha futura
    if (nuevaCita.citaFecha.isBefore(dayjs(), 'day')) {
      setError('La fecha debe ser futura');
      return;
    }

    try {
      setLoading(true);
      
      const citaData = {
        idMedico: parseInt(nuevaCita.idMedico),
        citaFecha: nuevaCita.citaFecha.format('YYYY-MM-DD'),
        citaHora: nuevaCita.citaHora.format('HH:mm:ss'),
        razon: nuevaCita.razon.trim(),
        monto: parseFloat(nuevaCita.monto)
      };

      console.log('Datos de la cita:', citaData); // Para debugging

      const response = await citaServicio.create(citaData);
      
      setSuccess('Cita creada exitosamente');
      setTimeout(() => {
        handleCloseDialog();
        cargarCitas(); // Recargar las citas
      }, 1500);
      
    } catch (error) {
      console.error('Error completo:', error);
      console.error('Respuesta del servidor:', error.response?.data);
      
      // Mostrar error más específico
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Error al crear la cita';
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'pendiente': return 'warning';
      case 'pagado': return 'info';     
      case 'confirmado': return 'success';
      case 'cancelado': return 'error';
      default: return 'default';
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Mis Citas Médicas
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            {user?.nombre} {user?.apellido}
          </Typography>
          <Button color="inherit" onClick={() => navigate('/dashboard')}>
            Dashboard
          </Button>
          <Button color="inherit" onClick={handleLogout}>
            Cerrar Sesión
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" gutterBottom>
            Gestión de Citas
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleOpenDialog}
          >
            Nueva Cita
          </Button>
        </Box>

        {/* Alertas */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        {/* Tabla de citas */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Fecha</TableCell>
                <TableCell>Hora</TableCell>
                <TableCell>Médico</TableCell>
                <TableCell>Especialidad</TableCell>
                <TableCell>Motivo</TableCell>
                <TableCell>Monto</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : citas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No tienes citas programadas
                  </TableCell>
                </TableRow>
              ) : (
                citas.map((cita) => (
                  <TableRow key={cita.id}>
                    <TableCell>{dayjs(cita.fecha).format('DD/MM/YYYY')}</TableCell>
                    <TableCell>{cita.hora}</TableCell>
                    <TableCell>{cita.medico.nombre} {cita.medico.apellido}</TableCell>
                    <TableCell>{cita.medico.especialidad}</TableCell>
                    <TableCell>{cita.razon}</TableCell>
                    <TableCell>${cita.monto.toLocaleString()}</TableCell>
                    <TableCell>
                      <Chip 
                        label={cita.estado} 
                        color={getEstadoColor(cita.estado)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {cita.estado === 'pendiente' && (
                        <Button 
                          variant="contained" 
                          color="secondary"
                          size="small"
                          onClick={() => navigate(`/pagos?citaId=${cita.id}`)}
                        >
                          Pagar
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Dialog para nueva cita */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>Solicitar Nueva Cita</DialogTitle>
          <DialogContent>
            {/* Mostrar errores en la parte superior del modal */}
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            <Box component="form" onSubmit={handleSubmitCita} sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Médico</InputLabel>
                    <Select
                      value={nuevaCita.idMedico}
                      onChange={(e) => setNuevaCita({...nuevaCita, idMedico: e.target.value})}
                      required
                    >
                      {medicos.map((medico) => (
                        <MenuItem key={medico.id} value={medico.id}>
                          Dr. {medico.nombre} {medico.apellido} - {medico.especialidad}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="Fecha de la cita"
                    value={nuevaCita.citaFecha}
                    onChange={(date) => setNuevaCita({...nuevaCita, citaFecha: date})}
                    minDate={dayjs().add(1, 'day')}
                    renderInput={(params) => <TextField {...params} fullWidth required />}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TimePicker
                    label="Hora de la cita"
                    value={nuevaCita.citaHora}
                    onChange={(time) => setNuevaCita({...nuevaCita, citaHora: time})}
                    renderInput={(params) => <TextField {...params} fullWidth required />}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Monto"
                    type="number"
                    value={nuevaCita.monto}
                    onChange={(e) => setNuevaCita({...nuevaCita, monto: parseFloat(e.target.value)})}
                    InputProps={{
                      startAdornment: <Typography>$</Typography>
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Motivo de la consulta"
                    multiline
                    rows={3}
                    value={nuevaCita.razon}
                    onChange={(e) => setNuevaCita({...nuevaCita, razon: e.target.value})}
                    required
                  />
                </Grid>

                {/* Información sobre horarios */}
                <Grid item xs={12}>
                  <Alert severity="info" sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      <strong>Horarios de atención:</strong> 7:00 AM - 12:00 PM y 2:00 PM - 6:00 PM
                    </Typography>
                  </Alert>
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} disabled={loading}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmitCita} 
              variant="contained"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Crear Cita'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </LocalizationProvider>
  );
};

export default CitasPaciente;