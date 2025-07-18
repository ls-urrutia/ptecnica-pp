import { 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Button,
  Box,
  AppBar,
  Toolbar
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout, isPatient, isDoctor } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Sistema de Citas Médicas
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            {user?.nombre} {user?.apellido} ({user?.rol})
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            Cerrar Sesión
          </Button>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Bienvenido, {user?.nombre}
        </Typography>
        
        <Grid container spacing={3}>
          {isPatient && (
            <>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h5" component="h2" gutterBottom>
                      Mis Citas
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Ver y gestionar mis citas médicas
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Button 
                        component={Link} 
                        to="/citas" 
                        variant="contained"
                      >
                        Ver Citas
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h5" component="h2" gutterBottom>
                      Pagos
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Gestionar pagos de mis citas
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Button 
                        component={Link} 
                        to="/pagos" 
                        variant="contained"
                      >
                        Ver Pagos
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </>
          )}
          
          {isDoctor && (
            <>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h5" component="h2" gutterBottom>
                      Citas del Día
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Ver y confirmar citas de hoy
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Button 
                        component={Link} 
                        to="/citas" 
                        variant="contained"
                      >
                        Ver Citas Hoy
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h5" component="h2" gutterBottom>
                      Mi Especialidad
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {user?.especialidad}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </>
          )}
        </Grid>
      </Container>
    </>
  );
};

export default Dashboard;