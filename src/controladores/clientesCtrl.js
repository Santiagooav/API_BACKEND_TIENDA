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
        const { nombre, email, telefono, direccion } = req.body;
        const [result] = await conmysql.query(
            'INSERT INTO clientes (nombre, email, telefono, direccion) VALUES (?, ?, ?, ?)',
            [nombre, email, telefono, direccion]
        );
        res.status(201).json({ message: 'Cliente registrado', id: result.insertId });
    } catch (error) {
        return res.status(500).json({ message: 'Error al registrar cliente' });
    }
};

export const putCliente = async (req, res) => {
    try {
        const { nombre, email, telefono, direccion } = req.body;
        const [result] = await conmysql.query(
            'UPDATE clientes SET nombre = ?, email = ?, telefono = ?, direccion = ? WHERE id = ?',
            [nombre, email, telefono, direccion, req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }
        res.json({ message: 'Cliente actualizado correctamente' });
    } catch (error) {
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
