import { Router } from 'express';
import { verificarToken } from '../middlewares/auth.js';
import {
    getClientes,
    getClienteById,
    postCliente,
    putCliente,
    patchCliente,
    deleteCliente
} from '../controladores/clientesCtrl.js';

const router = Router();

router.get('/clientes', verificarToken, getClientes);
router.get('/clientes/:id', verificarToken, getClienteById);
router.post('/clientes', verificarToken, postCliente);
router.put('/clientes/:id', verificarToken, putCliente);
router.patch('/clientes/:id', verificarToken, patchCliente);
router.delete('/clientes/:id', verificarToken, deleteCliente);

export default router;
