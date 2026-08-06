const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/api', (req, res) => {
    res.json({ message: "Sistem POS Retail Pro API berjalan di Vercel!" });
});

// Penting untuk Vercel: Jangan gunakan app.listen() jika di-deploy sebagai serverless function.
// Cukup export app-nya.
module.exports = app;
