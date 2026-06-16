import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import productosRoutes from './routes/productos.routes.js';
import clientesRoutes from './routes/clientes.routes.js';

// Configuración de CORS abierta para desarrollo y producción
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.use('/api', authRoutes);
app.use('/api', productosRoutes);
app.use('/api', clientesRoutes);

export default app;