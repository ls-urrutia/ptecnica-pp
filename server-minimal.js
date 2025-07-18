const express = require('express');
const app = express();

app.use(express.json());

// Ruta simple de prueba
app.get('/api/test', (req, res) => {
  res.json({ message: 'Servidor funcionando' });
});

// Ruta específica para pagos
app.post('/api/pagos', (req, res) => {
  res.json({ message: 'Ruta de pagos funcionando' });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor minimalista ejecutándose en puerto ${PORT}`);
});