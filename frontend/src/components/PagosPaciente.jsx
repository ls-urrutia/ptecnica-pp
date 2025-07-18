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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { citaServicio, pagoServicio } from '../services/api';

const PagosPaciente = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const citaIdParam = searchParams.get('citaId');
  
  // Estados
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);
  const [metodoPago, setMetodoPago] = useState('');
  const [procesandoPago, setProcesandoPago] = useState(false);

  // Cargar citas al montar el componente
  useEffect(() => {
    cargarCitas();
  }, []);

  // Abrir dialog automáticamente si viene citaId en la URL
  useEffect(() => {
    if (citaIdParam && citas.length > 0) {
      const cita = citas.find(c => c.id === parseInt(citaIdParam));
      if (cita && cita.estado === 'pendiente') {
        setCitaSeleccionada(cita);
        setOpenDialog(true);
      }
    }
  }, [citaIdParam, citas]);

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

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleOpenDialog = (cita) => {
    setCitaSeleccionada(cita);
    setOpenDialog(true);
    setMetodoPago('');
    setError('');
    setSuccess('');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCitaSeleccionada(null);
    setMetodoPago('');
    navigate('/pagos'); // Limpiar URL
  };

  const handleProcesarPago = async () => {
    if (!metodoPago) {
      setError('Selecciona un método de pago');
      return;
    }

    try {
      setProcesandoPago(true);
      setError('');
      
      const pagoData = {
        citaId: citaSeleccionada.id,
        pagoMetodo: metodoPago,
        monto: citaSeleccionada.monto
      };

      // Mostrar mensaje de procesamiento
      setSuccess('Procesando pago... Por favor espera');

      const response = await pagoServicio.processPayment(pagoData);
      
      if (response.data.exitoso) {
        const detallesRespuesta = response.data.pago.detallesRespuesta ? 
          JSON.parse(response.data.pago.detallesRespuesta) : {};
        
        setSuccess(`¡Pago procesado exitosamente!
        Transacción ID: ${response.data.transaccionId}
        Autorización: ${detallesRespuesta.autorizacion || 'N/A'}
        Comisión: $${detallesRespuesta.comision || 0}`);
                
        cargarCitas(); // Recargar las citas
        
        // Cerrar dialog después de 3 segundos
        setTimeout(() => {
          handleCloseDialog();
        }, 3000);
      } else {
        setError(`Error en el pago: ${response.data.mensaje}`);
      }
      
    } catch (error) {
      console.error('Error procesando pago:', error);
      setError(error.response?.data?.message || 'Error al procesar el pago');
    } finally {
      setProcesandoPago(false);
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

  // Filtrar citas que requieren pago
  const citasPendientes = citas.filter(c => c.estado === 'pendiente');
  const citasPagadas = citas.filter(c => ['pagado', 'confirmado'].includes(c.estado));
  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Gestión de Pagos
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
        <Typography variant="h4" gutterBottom>
          Gestión de Pagos
        </Typography>

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

        {/* Mostrar loading si está cargando */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Resumen */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="warning.main">
                  Citas Pendientes de Pago
                </Typography>
                <Typography variant="h4">
                  {citasPendientes.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="success.main">
                  Citas Pagadas
                </Typography>
                <Typography variant="h4">
                  {citasPagadas.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="info.main">
                  Total a Pagar
                </Typography>
                <Typography variant="h4">
                  ${citasPendientes.reduce((total, cita) => total + Number(cita.monto), 0).toLocaleString('es-CL', { minimumFractionDigits: 0 })}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Citas pendientes de pago */}
        <Typography variant="h5" gutterBottom>
          Citas Pendientes de Pago
        </Typography>
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {citasPendientes.length === 0 ? (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="body1" color="textSecondary">
                    No tienes citas pendientes de pago
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ) : (
            citasPendientes.map((cita) => (
              <Grid item xs={12} md={6} key={cita.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Dr. {cita.medico.nombre} {cita.medico.apellido}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {cita.medico.especialidad}
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 1 }}>
                      <strong>Fecha:</strong> {new Date(cita.fecha).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Hora:</strong> {cita.hora}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Motivo:</strong> {cita.razon}
                    </Typography>
                    <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
                      Monto: ${Number(cita.monto).toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Button 
                        variant="contained" 
                        color="primary"
                        fullWidth
                        onClick={() => handleOpenDialog(cita)}
                      >
                        Pagar Ahora
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>

        {/* Historial de pagos */}
        <Typography variant="h5" gutterBottom>
          Historial de Pagos
        </Typography>
        <Grid container spacing={2}>
          {citasPagadas.length === 0 ? (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="body1" color="textSecondary">
                    No tienes historial de pagos
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ) : (
            citasPagadas.map((cita) => (
              <Grid item xs={12} md={6} key={cita.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h6">
                        Dr. {cita.medico.nombre} {cita.medico.apellido}
                      </Typography>
                      <Chip 
                        label={cita.estado} 
                        color={getEstadoColor(cita.estado)}
                        size="small"
                      />
                    </Box>
                    <Typography variant="body2" color="textSecondary">
                      {cita.medico.especialidad}
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 1 }}>
                      <strong>Fecha:</strong> {new Date(cita.fecha).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Monto:</strong> ${Number(cita.monto).toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>

        {/* Dialog para procesar pago */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Typography variant="h5" component="h2">
              Procesar Pago
            </Typography>
          </DialogTitle>
          <DialogContent>
            {citaSeleccionada && (
              <Box sx={{ mt: 1 }}>
                {/* Detalles de la cita */}
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="primary">
                      Detalles de la Cita
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="textSecondary">
                          Médico
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          Dr. {citaSeleccionada.medico.nombre} {citaSeleccionada.medico.apellido}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="textSecondary">
                          Especialidad
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          {citaSeleccionada.medico.especialidad}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="textSecondary">
                          Fecha
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          {new Date(citaSeleccionada.fecha).toLocaleDateString('es-CL')}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="textSecondary">
                          Hora
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          {citaSeleccionada.hora}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body2" color="textSecondary">
                          Motivo
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          {citaSeleccionada.razon}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                {/* Monto a pagar */}
                <Box sx={{ mb: 3, p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
                  <Typography variant="h6" color="primary.contrastText" align="center">
                    Monto a Pagar: ${Number(citaSeleccionada.monto).toLocaleString('es-CL', { 
                      minimumFractionDigits: 0, 
                      maximumFractionDigits: 0 
                    })}
                  </Typography>
                </Box>

                {/* Método de pago */}
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Método de Pago</InputLabel>
                  <Select
                    value={metodoPago}
                    onChange={(e) => setMetodoPago(e.target.value)}
                    label="Método de Pago"
                    required
                  >
                    <MenuItem value="tarjeta_credito">
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        Tarjeta de Crédito
                      </Box>
                    </MenuItem>
                    <MenuItem value="tarjeta_debito">
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        Tarjeta de Débito
                      </Box>
                    </MenuItem>
                    <MenuItem value="transferencia_bancaria">
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        Transferencia Bancaria
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>

                {/* Nota sobre sandbox */}
                {metodoPago && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      <strong>Modo Sandbox:</strong> Este es un entorno de prueba. 
                      El pago se procesará de forma simulada sin cargos reales.
                    </Typography>
                  </Alert>
                )}

                {/* Alertas de estado */}
                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}
                
                {success && (
                  <Alert severity="success" sx={{ mb: 2 }}>
                    <Typography variant="body2" component="div">
                      {success.split('\n').map((line, index) => (
                        <div key={index}>{line}</div>
                      ))}
                    </Typography>
                  </Alert>
                )}
              </Box>
            )}
          </DialogContent>
          
          <DialogActions sx={{ p: 2 }}>
            <Button 
              onClick={handleCloseDialog} 
              disabled={procesandoPago}
              variant="outlined"
            >
              Cancelar
            </Button>
            <Button 
              variant="contained" 
              color="primary"
              onClick={handleProcesarPago}
              disabled={procesandoPago || !metodoPago}
              sx={{ minWidth: 140 }}
            >
              {procesandoPago ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={20} color="inherit" />
                  <span>Procesando...</span>
                </Box>
              ) : (
                'Procesar Pago'
              )}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default PagosPaciente;