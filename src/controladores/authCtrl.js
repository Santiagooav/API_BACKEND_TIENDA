import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import conmysql from '../db.js';
import dotenv from 'dotenv';
dotenv.config();

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Buscamos al usuario por su email
        const [rows] = await conmysql.query('SELECT * FROM usuarios WHERE email = ?', [email]);
        
        if (rows.length === 0) {
            return res.status(401).json({ message: 'Correo o contraseña incorrectos' });
        }

        const usuario = rows[0];

        // 2. Comparamos la contraseña encriptada con bcrypt
        const match = await bcrypt.compare(password, usuario.password);
        if (!match) {
            return res.status(401).json({ message: 'Correo o contraseña incorrectos' });
        }

        // 3. Clave secreta (usa la variable de Railway, o una por defecto para que NO rompa con 500)
        const secretKey = process.env.JWT_SECRET || 'clave_secreta_de_emergencia_123';

        // 4. Generamos el token JWT
        const token = jwt.sign(
            { id: usuario.id, email: usuario.email }, 
            secretKey, 
            { expiresIn: '8h' }
        );

        // 5. Enviamos la respuesta exacta que tu frontend de Ionic espera
        return res.json({
            token,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email
            }
        });

    } catch (error) {
        console.error("Error en login:", error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};