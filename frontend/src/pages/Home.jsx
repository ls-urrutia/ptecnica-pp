import { Container, Typography, Button, Box, Paper } from '@mui/material';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 8, textAlign: 'center' }}>
        <Paper elevation={3} sx={{ p: 6 }}>
          <Typography variant="h2" component="h1" gutterBottom color="primary">
            Sistema de Citas Médicas
          </Typography>
          <Typography variant="h5" component="h2" gutterBottom color="textSecondary">
            Gestiona tus citas médicas de manera fácil y segura
          </Typography>
          <Box sx={{ mt: 4 }}>
            <Button 
              component={Link} 
              to="/login" 
              variant="contained" 
              size="large" 
              sx={{ mr: 2 }}
            >
              Iniciar Sesión
            </Button>
            <Button 
              component={Link} 
              to="/register" 
              variant="outlined" 
              size="large"
            >
              Registrarse
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Home;