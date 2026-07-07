const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const servicesRouter = require('./routes/services');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/services', servicesRouter);

// Sert les fichiers statiques du frontend
app.use(express.static(path.join(__dirname, '../frontend')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});