const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// Impor rute yang baru dibuat
const authRoutes = require('../routes/auth.routes');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: "Sistem POS Retail Pro Enterprise API aktif!" });
});

app.get('/api', (req, res) => {
    res.json({ message: "API POS Retail Pro berjalan di Vercel!" });
});

// Daftarkan rute autentikasi
app.use('/api/auth', authRoutes);

// Penting untuk Vercel: Jangan gunakan app.listen() jika di-deploy sebagai serverless function.
// Cukup export app-nya.
module.exports = app;
