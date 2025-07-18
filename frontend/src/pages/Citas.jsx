import { Container, Typography, Box } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import CitasPaciente from '../components/CitasPaciente';
import CitasMedico from '../components/CitasMedico'; 

const Citas = () => {
  const { user } = useAuth();

  // Renderizar componente según el rol del usuario
  if (user?.rol === 'paciente') {
    return <CitasPaciente />;
  } else if (user?.rol === 'medico') {
    return <CitasMedico />;
  }

  return (
    <div>
      <h1>Error: Rol no reconocido</h1>
    </div>
  );
};

export default Citas;