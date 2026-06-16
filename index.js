import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import app from './src/app.js';

const PORT = process.env.PORT || 3306;

app.use(cors());

app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});