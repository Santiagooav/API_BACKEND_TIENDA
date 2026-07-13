import { Router } from "express";
import {postPedido, getPedidos, getPedidosxId, guardarPedido} from '../controladores/pedidosCtrl.js';
const router=Router();

router.get('/pedidos',getPedidos)
router.get('/pedidos/:id',getPedidosxId)
router.post('/pedidos',guardarPedido)

export default router



