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
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { citaServicio } from '../services/api';

const CitasMedico = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Estados
  const [citas, setCitas] = useState([]);
  const [fecha, setFecha] = useState(dayjs());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);

  // Cargar citas al montar el componente y cuando cambia la fecha
  useEffect(() => {
    cargarCitasDelDia();
  }, [fecha]);

  const cargarCitasDelDia = async () => {
    try {
      setLoading(true);
      const response = await citaServicio.getCitasHoyMedico(fecha.format('YYYY-MM-DD'));
      setCitas(response.data.citas);
    } catch (error) {
      setError('Error al cargar las citas');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleConfirmarCita = async (cita, accion) => {
    try {
      await citaServicio.citaConfirmar(cita.id, accion);
      
      // Mostrar mensaje de éxito
      const mensaje = accion === 'confirmar' ? 'Cita confirmada exitosamente' : 'Cita rechazada exitosamente';
      setSuccess(mensaje);
      
      // Limpiar mensaje de error previo
      setError('');
      
      // Recargar citas
      await cargarCitasDelDia();
      
    } catch (error) {
      console.error('Error al procesar cita:', error);
      setError('Error al procesar la cita');
      setSuccess(''); // Limpiar mensaje de éxito previo
    }
  };

  const handleOpenDialog = (cita) => {
    setCitaSeleccionada(cita);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCitaSeleccionada(null);
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
            Gestión de Citas - Dr. {user?.nombre} {user?.apellido}
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            {user?.especialidad}
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
            Citas del Día
          </Typography>
          <DatePicker
            label="Seleccionar fecha"
            value={fecha}
            onChange={(date) => setFecha(date)}
            renderInput={(params) => <TextField {...params} />}
          />
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

        {/* Resumen del día */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="primary">
                  Total Citas
                </Typography>
                <Typography variant="h4">
                  {citas.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="warning.main">
                  Pendientes
                </Typography>
                <Typography variant="h4">
                  {citas.filter(c => c.estado === 'pendiente').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="info.main">
                  Pagadas  {}
                </Typography>
                <Typography variant="h4">
                  {citas.filter(c => c.estado === 'pagado').length}  {}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="success.main">
                  Confirmadas
                </Typography>
                <Typography variant="h4">
                  {citas.filter(c => c.estado === 'confirmado').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabla de citas */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Hora</TableCell>
                <TableCell>Paciente</TableCell>
                <TableCell>Teléfono</TableCell>
                <TableCell>Motivo</TableCell>
                <TableCell>Monto</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : citas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No tienes citas programadas para esta fecha
                  </TableCell>
                </TableRow>
              ) : (
                citas.map((cita) => (
                  <TableRow key={cita.id}>
                    <TableCell>{cita.hora}</TableCell>
                    <TableCell>{cita.paciente.nombre} {cita.paciente.apellido}</TableCell>
                    <TableCell>{cita.paciente.fono}</TableCell>
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
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {cita.estado === 'pagado' && (  
                          <>
                            <Button 
                              variant="contained" 
                              color="success"
                              size="small"
                              onClick={() => handleConfirmarCita(cita, 'confirmar')}
                            >
                              Confirmar
                            </Button>
                            <Button 
                              variant="outlined" 
                              color="error"
                              size="small"
                              onClick={() => handleConfirmarCita(cita, 'rechazar')}
                            >
                              Rechazar
                            </Button>
                          </>
                        )}
                        <Button 
                          variant="outlined" 
                          size="small"
                          onClick={() => handleOpenDialog(cita)}
                        >
                          Detalles
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Dialog para detalles de cita */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>Detalles de la Cita</DialogTitle>
          <DialogContent>
            {citaSeleccionada && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Información del Paciente
                </Typography>
                <Typography><strong>Nombre:</strong> {citaSeleccionada.paciente.nombre} {citaSeleccionada.paciente.apellido}</Typography>
                <Typography><strong>Teléfono:</strong> {citaSeleccionada.paciente.fono}</Typography>
                <Typography><strong>Fecha:</strong> {dayjs(citaSeleccionada.fecha).format('DD/MM/YYYY')}</Typography>
                <Typography><strong>Hora:</strong> {citaSeleccionada.hora}</Typography>
                <Typography><strong>Motivo:</strong> {citaSeleccionada.razon}</Typography>
                <Typography><strong>Monto:</strong> ${citaSeleccionada.monto.toLocaleString()}</Typography>
                <Typography><strong>Estado:</strong> {citaSeleccionada.estado}</Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cerrar</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </LocalizationProvider>
  );
};

export default CitasMedico;