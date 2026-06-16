import express from 'express';
import authRoutes from './routes/auth.routes.js';
import productosRoutes from './routes/productos.routes.js';
import clientesRoutes from './routes/clientes.routes.js';

const app = express();
app.use(express.json());

app.use('/api', authRoutes);
app.use('/api', productosRoutes);
app.use('/api', clientesRoutes);

export default app;