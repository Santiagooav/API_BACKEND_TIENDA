import { Router } from 'express';
import { verificarToken } from '../middlewares/auth.js';
import upload from '../middlewares/upload.js';
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

// Rutas actualizadas para procesar archivos de imágenes
router.post('/productos', verificarToken, upload.single('prod_imagen'), postProducto);
router.put('/productos/:id', verificarToken, upload.single('prod_imagen'), putProducto);

router.patch('/productos/:id', verificarToken, patchProducto);
router.delete('/productos/:id', verificarToken, deleteProducto);

export default router;