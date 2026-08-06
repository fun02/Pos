const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

// Fungsi untuk membuat akun pertama (Register)
exports.register = async (req, res) => {
    try {
        const { username, email, password, roleName } = req.body;

        // Cek apakah user sudah ada
        const existingUser = await prisma.user.findFirst({
            where: { OR: [{ email }, { username }] }
        });
        if (existingUser) return res.status(400).json({ error: "Email atau Username sudah digunakan!" });

        // Cari atau buat Role
        let role = await prisma.role.findUnique({ where: { name: roleName || 'Admin' } });
        if (!role) {
            role = await prisma.role.create({ data: { name: roleName || 'Admin' } });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Simpan ke database
        const user = await prisma.user.create({
            data: { username, email, passwordHash, roleId: role.id }
        });

        res.status(201).json({ message: "User berhasil dibuat!", userId: user.id });
    } catch (error) {
        res.status(500).json({ error: "Terjadi kesalahan pada server", details: error.message });
    }
};

// Fungsi Login Enterprise
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Cari user berdasarkan email
        const user = await prisma.user.findUnique({ where: { email } });
        
        if (!user) {
            return res.status(401).json({ error: "Email atau password salah!" });
        }

        // Cek apakah akun sedang terkunci
        if (user.isLocked && user.lockedUntil > new Date()) {
            return res.status(403).json({ error: "Akun terkunci sementara karena terlalu banyak percobaan gagal. Coba lagi nanti." });
        }

        // Verifikasi password
        const validPassword = await bcrypt.compare(password, user.passwordHash);
        
        if (!validPassword) {
            // Tambah hitungan gagal
            const failedAttempts = user.failedAttempts + 1;
            let isLocked = false;
            let lockedUntil = null;

            // Kunci akun jika gagal 5 kali (Lockout selama 15 menit)
            if (failedAttempts >= 5) {
                isLocked = true;
                lockedUntil = new Date(Date.now() + 15 * 60 * 1000); 
            }

            await prisma.user.update({
                where: { id: user.id },
                data: { failedAttempts, isLocked, lockedUntil }
            });

            return res.status(401).json({ error: "Email atau password salah!" });
        }

        // Jika login sukses, reset hitungan gagal
        await prisma.user.update({
            where: { id: user.id },
            data: { failedAttempts: 0, isLocked: false, lockedUntil: null }
        });

        // Buat JWT Token
        const token = jwt.sign(
            { id: user.id, roleId: user.roleId },
            process.env.JWT_ACCESS_SECRET,
            { expiresIn: '1d' } // Token berlaku 1 hari
        );

        res.json({
            message: "Login berhasil!",
            token,
            user: { id: user.id, username: user.username, email: user.email }
        });

    } catch (error) {
        res.status(500).json({ error: "Terjadi kesalahan sistem", details: error.message });
    }
};
