import conmysql from '../db.js';

export const getProductos = async (req, res) => {
    try {
        const [result] = await conmysql.query('SELECT * FROM productos');
        res.json(result);
    } catch (error) {
        return res.status(500).json({ message: 'Error al obtener productos' });
    }
};

export const getProductoById = async (req, res) => {
    try {
        const [result] = await conmysql.query(
            'SELECT * FROM productos WHERE id = ?', [req.params.id]
        );
        if (result.length === 0) {
            return res.json({ cantidad: 0, message: 'Producto no encontrado' });
        }
        res.json({ cantidad: result.length, data: result[0] });
    } catch (error) {
        return res.status(500).json({ message: 'Error al obtener producto' });
    }
};

export const postProducto = async (req, res) => {
    try {
        const { nombre, descripcion, precio, stock } = req.body;
        const [result] = await conmysql.query(
            'INSERT INTO productos (nombre, descripcion, precio, stock) VALUES (?, ?, ?, ?)',
            [nombre, descripcion, precio, stock]
        );
        res.status(201).json({ message: 'Producto creado', id: result.insertId });
    } catch (error) {
        return res.status(500).json({ message: 'Error al crear producto' });
    }
};

export const putProducto = async (req, res) => {
    try {
        const { nombre, descripcion, precio, stock } = req.body;
        const [result] = await conmysql.query(
            'UPDATE productos SET nombre=?, descripcion=?, precio=?, stock=? WHERE id=?',
            [nombre, descripcion, precio, stock, req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        res.json({ message: 'Producto actualizado correctamente' });
    } catch (error) {
        return res.status(500).json({ message: 'Error al actualizar producto' });
    }
};

export const patchProducto = async (req, res) => {
    try {
        const [result] = await conmysql.query(
            'UPDATE productos SET ? WHERE id=?',
            [req.body, req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        res.json({ message: 'Producto actualizado parcialmente' });
    } catch (error) {
        return res.status(500).json({ message: 'Error al actualizar producto' });
    }
};

export const deleteProducto = async (req, res) => {
    try {
        const [result] = await conmysql.query(
            'DELETE FROM productos WHERE id=?', [req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        res.json({ message: 'Producto eliminado correctamente' });
    } catch (error) {
        return res.status(500).json({ message: 'Error al eliminar producto' });
    }
};