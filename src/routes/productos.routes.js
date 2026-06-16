import { Router } from 'express';
import { verificarToken } from '../middlewares/auth.js';
import {
    getProductos,
    getProductoById,
    postProducto,
    putProducto,
    patchProducto,
    deleteProducto
} from '../controladores/productosCtrl.js';

const router = Router();

router.get('/productos', verificarToken, getProductos);
router.get('/productos/:id', verificarToken, getProductoById);
router.post('/productos', verificarToken, postProducto);
router.put('/productos/:id', verificarToken, putProducto);
router.patch('/productos/:id', verificarToken, patchProducto);
router.delete('/productos/:id', verificarToken, deleteProducto);

export default router;