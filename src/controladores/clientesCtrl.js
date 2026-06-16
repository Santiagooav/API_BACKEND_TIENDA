import conmysql from '../db.js';

export const getClientes = async (req, res) => {
    try {
        const [result] = await conmysql.query('SELECT * FROM clientes');
        res.json(result);
    } catch (error) {
        return res.status(500).json({ message: 'Error al obtener clientes' });
    }
};

export const getClienteById = async (req, res) => {
    try {
        const [result] = await conmysql.query(
            'SELECT * FROM clientes WHERE id = ?', [req.params.id]
        );
        if (result.length === 0) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }
        res.json({ cantidad: result.length, data: result[0] });
    } catch (error) {
        return res.status(500).json({ message: 'Error al obtener cliente' });
    }
};

export const postCliente = async (req, res) => {
    try {
        // 1. Desestructuramos los campos exactos que envía el frontend
        const { identificacion, nombre, telefono, correo, direccion, pais, ciudad } = req.body;
        
        // 2. Insertamos todos los campos requeridos en la tabla de MySQL
        const [result] = await conmysql.query(
            'INSERT INTO clientes (identificacion, nombre, telefono, correo, direccion, pais, ciudad) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [identificacion, nombre, telefono, correo, direccion, pais, ciudad]
        );
        res.status(201).json({ message: 'Cliente registrado', id: result.insertId });
    } catch (error) {
        console.error(error); // Te ayudará a ver detalles en la terminal si persiste otro problema
        return res.status(500).json({ message: 'Error al registrar cliente' });
    }
};

export const putCliente = async (req, res) => {
    try {
        // 1. Desestructuramos los campos exactos para la actualización completa
        const { identificacion, nombre, telefono, correo, direccion, pais, ciudad } = req.body;
        
        // 2. Ejecutamos el UPDATE con todas las columnas correspondientes
        const [result] = await conmysql.query(
            'UPDATE clientes SET identificacion = ?, nombre = ?, telefono = ?, correo = ?, direccion = ?, pais = ?, ciudad = ? WHERE id = ?',
            [identificacion, nombre, telefono, correo, direccion, pais, ciudad, req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }
        res.json({ message: 'Cliente actualizado correctamente' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al actualizar cliente' });
    }
};

export const patchCliente = async (req, res) => {
    try {
        const [result] = await conmysql.query(
            'UPDATE clientes SET ? WHERE id = ?',
            [req.body, req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }
        res.json({ message: 'Cliente actualizado parcialmente' });
    } catch (error) {
        return res.status(500).json({ message: 'Error al actualizar cliente' });
    }
};

export const deleteCliente = async (req, res) => {
    try {
        const [result] = await conmysql.query(
            'DELETE FROM clientes WHERE id = ?', [req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }
        res.json({ message: 'Cliente eliminado correctamente' });
    } catch (error) {
        return res.status(500).json({ message: 'Error al eliminar cliente' });
    }
};