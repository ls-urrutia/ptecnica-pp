import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import PagosPaciente from '../components/PagosPaciente';

const Pagos = () => {
  const { user } = useAuth();

  if (user?.rol === 'paciente') {
    return <PagosPaciente />;
  } else {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Pagos
          </Typography>
          <Typography variant="body1">
            Solo los pacientes pueden acceder a esta sección
          </Typography>
        </Box>
      </Container>
    );
  }
};

export default Pagos;