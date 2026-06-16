import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import conmysql from '../db.js';
import dotenv from 'dotenv';
dotenv.config();

export const registrar = async (req, res) => {
    try {
        const { nombre, email, password } = req.body;

        const [existe] = await conmysql.query(
            'SELECT * FROM usuarios WHERE email = ?', [email]
        );
        if (existe.length > 0) {
            return res.status(400).json({ message: 'El email ya está registrado' });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        await conmysql.query(
            'INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)',
            [nombre, email, passwordHash]
        );

        return res.status(201).json({ message: 'Usuario registrado correctamente' });
    } catch (error) {
        return res.status(500).json({ message: 'Error al registrar usuario', error });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const [result] = await conmysql.query(
            'SELECT * FROM usuarios WHERE email = ?', [email]
        );
        if (result.length === 0) {
            return res.status(401).json({ message: 'Credenciales incorrectas' });
        }

        const usuario = result[0];
        const passwordValida = await bcrypt.compare(password, usuario.password);

        if (!passwordValida) {
            return res.status(401).json({ message: 'Credenciales incorrectas' });
        }

        const token = jwt.sign(
            { id: usuario.id, email: usuario.email },
            process.env.JWT_SECRET,
            { expiresIn: '2h' }
        );

        return res.json({
            message: 'Login exitoso',
            token,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email
            }
        });
    } catch (error) {
        return res.status(500).json({ message: 'Error en el login', error });
    }
};