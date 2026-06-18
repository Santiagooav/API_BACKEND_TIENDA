import conmysql from '../db.js';

// 1. Obtener todos los productos
export const getProductos = async (req, res) => {
    try {
        const [result] = await conmysql.query('SELECT * FROM productos');
        res.json(result);
    } catch (error) {
        return res.status(500).json({ message: 'Error al obtener productos', error: error.message });
    }
};

// 2. Obtener producto por ID
export const getProductoById = async (req, res) => {
    try {
        const [result] = await conmysql.query(
            'SELECT * FROM productos WHERE id = ?', [req.params.id]
        );
        if (result.length === 0) {
            return res.status(404).json({ cantidad: 0, message: 'Producto no encontrado' });
        }
        res.json({ cantidad: result.length, data: result[0] });
    } catch (error) {
        return res.status(500).json({ message: 'Error al obtener producto', error: error.message });
    }
};

// 3. Insertar un nuevo producto con imagen
export const postProducto = async (req, res) => {
    try {
        const { nombre, descripcion, precio, stock } = req.body;
        const prod_imagen = req.file ? `/uploads/${req.file.filename}` : null;

        const [result] = await conmysql.query(
            "INSERT INTO productos(nombre, descripcion, precio, stock, prod_imagen) VALUES (?, ?, ?, ?, ?)",
            [nombre, descripcion, Number(precio), Number(stock), prod_imagen]
        );
        res.send({ id: result.insertId, message: 'Producto creado exitosamente' });
    } catch (error) {
        return res.status(500).json({ message: "Error en el servidor", error: error.message });
    }
};

// 4. Actualizar un producto existente (PUT)
export const putProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion, precio, stock } = req.body;
        
        let prod_imagen = req.file ? `/uploads/${req.file.filename}` : null;

        // Si no subieron una imagen nueva, mantenemos la que ya estaba en la base de datos
        if (!req.file) {
            const [rows] = await conmysql.query(
                'SELECT prod_imagen FROM productos WHERE id = ?', [id]
            );
            if (rows && rows.length > 0) {
                prod_imagen = rows[0].prod_imagen;
            } else {
                return res.status(404).json({ message: 'Producto no encontrado' });
            }
        }

        const [result] = await conmysql.query(
            'UPDATE productos SET nombre=?, descripcion=?, precio=?, stock=?, prod_imagen=? WHERE id=?',
            [nombre, descripcion, Number(precio), Number(stock), prod_imagen, id]
        );

        if (result.affectedRows <= 0) return res.status(404).json({
            message: 'Producto no encontrado'
        });

        const [rows] = await conmysql.query('SELECT * FROM productos WHERE id=?', [id]);
        res.json(rows[0]);
        
    } catch (error) {
        return res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
};

// 5. Función PATCH
export const patchProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await conmysql.query('UPDATE productos SET ? WHERE id = ?', [req.body, id]);
        if (result.affectedRows <= 0) return res.status(404).json({ message: 'Producto no encontrado' });
        res.json({ message: 'Producto actualizado parcialmente' });
    } catch (error) {
        return res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
};

// 6. Eliminar un producto
export const deleteProducto = async (req, res) => {
    try {
        const [result] = await conmysql.query('DELETE FROM productos WHERE id = ?', [req.params.id]);
        if (result.affectedRows <= 0) return res.status(404).json({ message: 'Producto no encontrado' });
        res.json({ message: 'Producto eliminado correctamente' });
    } catch (error) {
        return res.status(500).json({ message: 'Error al eliminar producto', error: error.message });
    }
};