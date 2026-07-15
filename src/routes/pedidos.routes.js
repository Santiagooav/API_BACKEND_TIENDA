import { Router } from "express";
import { 
    getPedidos, 
    getPedidosxId, 
    guardarPedido, 
    buscarClientePorCedula 
} from '../controladores/pedidosCtrl.js';

const router = Router();

router.get('/pedidos', getPedidos);
router.get('/pedidos/:id', getPedidosxId);
router.get('/clientes/buscar/:identificacion', buscarClientePorCedula); // Nueva ruta para autollenado
router.post('/pedidos', guardarPedido);


export default router;