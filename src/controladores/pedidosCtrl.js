import conmysql from '../db.js';

export const getPedidos = async ()=>{
    try {
        // Consulta principal: une pedidos con clientes y usuarios
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
            ORDER BY p.ped_fecha DESC
        `);

        // Obtener los detalles de todos los pedidos
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
        `);

        // Unir los detalles a cada pedido
        const pedidosConDetalles = pedidos.map(pedido => {
            const detallesPedido = detalles.filter(d => d.ped_id === pedido.ped_id);
            return { ...pedido, detalles: detallesPedido };
        });

        res.json(pedidosConDetalles);
    } catch (error) {
        console.error('Error al obtener los pedidos:', error);
        return res.status(500).json({ message: 'Error al obtener los pedidos.' });
    }
};


export const getPedidosxId = async ()=>{
     try {
        const { id } = req.params;

        // Validar que venga el ID
        if (!id) {
            return res.status(400).json({ message: 'El ID del pedido es obligatorio.' });
        }

        // Consulta principal: datos del pedido y cliente
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

        // Obtener detalles del pedido
        const [detalles] = await conmysql.query(`
            SELECT 
                d.det_id,
                d.ped_id,
                d.id_producto,
                pr.nombre,
                pr.prod_imagen,
                d.det_cantidad,
                d.det_precio
            FROM detalles_pedidos d
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


export const postPedido = async ()=>{


}

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
        // Validaciones
        if (!detalle || detalle.length === 0) {
            throw new Error("El pedido no tiene productos.");
        }
        let idCliente = Number(id_cliente);
        // Cliente nuevo
        if (idCliente === 0) {

            const [cliente] = await conexion.query(
                `INSERT INTO clientes
                (
                    identificacion,
                    nombre,
                    telefono,
                    correo,
                    direccion,
                    pais,
                    ciudad
                )
                VALUES (?,?,?,?,?,?,?)`,
                [
                    identificacion,
                    nombre,
                    telefono,
                    correo,
                    direccion,
                    pais,
                    ciudad
                ]
            );

            idCliente = cliente.insertId;
        }
        // Pedido
        const [pedido] = await conexion.query(
            `INSERT INTO pedidos
            (
                id_cliente,
                ped_fecha,
                id_usuario,
                ped_estado
            )
            VALUES (?,?,?,?)`,
            [
                idCliente,
                ped_fecha,
                id_usuario,
                ped_estado
            ]
        );
        const ped_id = pedido.insertId;
        // Detalle
        for (const item of detalle) {
            if (Number(item.det_cantidad) <= 0) {
                throw new Error(`Cantidad inválida del producto ${item.id_producto}`);
            }
            if (Number(item.det_precio) <= 0) {
                throw new Error(`Precio inválido del producto ${item.id_producto}`);
            }
            // Verificar existencia del producto
            const [producto] = await conexion.query(
                "SELECT id FROM productos WHERE id=?",
                [item.id_producto]
            );
            if (producto.length === 0) {
                throw new Error(`El producto ${item.id_producto} no existe.`);
            }
            await conexion.query(
                `INSERT INTO detalle_pedidos
                (
                    id_producto,
                    ped_id,
                    det_cantidad,
                    det_precio
                )
                VALUES (?,?,?,?)`,
                [
                    item.id_producto,
                    ped_id,
                    item.det_cantidad,
                    item.det_precio
                ]
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