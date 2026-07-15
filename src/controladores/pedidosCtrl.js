import conmysql from '../db.js';

// Buscar cliente por cédula (Para autocompletado en pasarela)
export const buscarClientePorCedula = async (req, res) => {
    try {
        const { identificacion } = req.params;
        const [clientes] = await conmysql.query(
            "SELECT * FROM clientes WHERE identificacion = ?",
            [identificacion]
        );
        if (clientes.length === 0) {
            return res.status(404).json({ ok: false, message: 'Cliente no registrado' });
        }
        res.json({ ok: true, data: clientes[0] });
    } catch (error) {
        console.error('Error al buscar cliente:', error);
        return res.status(500).json({ ok: false, message: 'Error interno del servidor' });
    }
};

export const getPedidos = async (req, res) => {
    try {
        // 1. Obtenemos los pedidos con TODOS los datos del cliente asociado
        const [pedidos] = await conmysql.query(`
            SELECT 
                p.ped_id,
                p.id_cliente,
                p.ped_fecha,
                p.id_usuario,
                p.ped_estado,
                c.identificacion,
                c.nombre,
                c.telefono,
                c.correo,
                c.direccion,
                c.ciudad,
                c.pais
            FROM pedidos p
            LEFT JOIN clientes c ON p.id_cliente = c.id
            ORDER BY p.ped_id DESC
        `);

        // 2. Obtenemos todos los detalles desde la tabla real 'detalle_pedidos'
        const [detalles] = await conmysql.query(`
            SELECT 
                d.det_id,
                d.ped_id,
                d.id_producto,
                pr.nombre AS nombre_producto,
                pr.prod_imagen,
                d.det_cantidad,
                d.det_precio
            FROM detalle_pedidos d
            LEFT JOIN productos pr ON d.id_producto = pr.id
        `);

        // 3. Mapeamos y agrupamos los detalles dentro de su respectivo pedido
        const pedidosConDetalles = pedidos.map(pedido => {
            const detallesPedido = detalles.filter(d => d.ped_id === pedido.ped_id);
            return { 
                ...pedido, 
                detalles: detallesPedido 
            };
        });

        // 4. CORRECCIÓN CLAVE: Enviamos el formato exacto que tu Frontend Angular espera procesar
        res.json({
            ok: true,
            data: pedidosConDetalles
        });

    } catch (error) {
        console.error('Error al obtener los pedidos:', error);
        return res.status(500).json({ 
            ok: false, 
            message: 'Error al obtener los pedidos.' 
        });
    }
};

export const getPedidosxId = async (req, res) => { // Corregido: Se agregaron (req, res)
     try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: 'El ID del pedido es obligatorio.' });
        }

        const [pedidos] = await conmysql.query(`
            SELECT 
                p.ped_id,
                p.id_cliente,
                c.nombre,
                p.ped_fecha,
                p.id_usuario,
                p.ped_estado
            FROM pedidos p
            LEFT JOIN clientes c ON p.id_cliente = c.id
            WHERE p.ped_id = ?
        `, [id]);

        if (pedidos.length === 0) {
            return res.status(404).json({ message: 'Pedido no encontrado.' });
        }

        const pedido = pedidos[0];

        // Corregido: 'detalles_pedidos' cambiado a 'detalle_pedidos'
        const [detalles] = await conmysql.query(`
            SELECT 
                d.det_id,
                d.ped_id,
                d.id_producto,
                pr.nombre,
                pr.prod_imagen,
                d.det_cantidad,
                d.det_precio
            FROM detalle_pedidos d
            LEFT JOIN productos pr ON d.id_producto = pr.id
            WHERE d.ped_id = ?
        `, [id]);

        pedido.detalles = detalles;
        res.json(pedido);

    } catch (error) {
        console.error('Error al obtener el pedido por ID:', error);
        return res.status(500).json({ message: 'Error al obtener el pedido.' });
    }
};

export const postPedido = async (req, res) => {
    // Definición opcional en caso de que lo necesites para otros flujos
};

export const guardarPedido = async (req, res) => {
    const conexion = await conmysql.getConnection();

    try {
        await conexion.beginTransaction();
        const {
            id_cliente,
            identificacion,
            nombre,
            telefono,
            correo,
            direccion,
            pais,
            ciudad,
            ped_fecha,
            id_usuario,
            ped_estado,
            detalle
        } = req.body;

        if (!detalle || detalle.length === 0) {
            throw new Error("El pedido no tiene productos.");
        }
        let idCliente = Number(id_cliente);

        if (idCliente === 0) {
            const [cliente] = await conexion.query(
                `INSERT INTO clientes
                (identificacion, nombre, telefono, correo, direccion, pais, ciudad)
                VALUES (?,?,?,?,?,?,?)`,
                [identificacion, nombre, telefono, correo, direccion, pais, ciudad]
            );
            idCliente = cliente.insertId;
        }

        const [pedido] = await conexion.query(
            `INSERT INTO pedidos (id_cliente, ped_fecha, id_usuario, ped_estado)
            VALUES (?,?,?,?)`,
            [idCliente, ped_fecha, id_usuario, ped_estado]
        );
        const ped_id = pedido.insertId;

        for (const item of detalle) {
            if (Number(item.det_cantidad) <= 0) {
                throw new Error(`Cantidad inválida del producto ${item.id_producto}`);
            }
            if (Number(item.det_precio) <= 0) {
                throw new Error(`Precio inválido del producto ${item.id_producto}`);
            }

            const [producto] = await conexion.query(
                "SELECT id FROM productos WHERE id=?",
                [item.id_producto]
            );
            if (producto.length === 0) {
                throw new Error(`El producto ${item.id_producto} no existe.`);
            }

            await conexion.query(
                `INSERT INTO detalle_pedidos (id_producto, ped_id, det_cantidad, det_precio)
                VALUES (?,?,?,?)`,
                [item.id_producto, ped_id, item.det_cantidad, item.det_precio]
            );
        }

        await conexion.commit();
        res.status(201).json({
            ok: true,
            mensaje: "Pedido registrado correctamente.",
            ped_id,
            id_cliente: idCliente
        });

    } catch (error) {
        await conexion.rollback();
        console.error(error);
        res.status(500).json({
            ok: false,
            mensaje: error.message
        });
    } finally {
        conexion.release();
    }

};