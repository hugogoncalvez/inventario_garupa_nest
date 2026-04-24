import api, { URI } from '../../config.js';
import React, { useState, useEffect } from 'react';
import { 
    Container, Typography, Box, Button, Paper, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, Chip, IconButton, Collapse, TextField,
    Dialog, DialogTitle, DialogContent, DialogActions, Divider, Stack
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AssignmentIcon from '@mui/icons-material/Assignment';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import useAuth from '../../hooks/useAuth';
import ModalCrearPedido from './ModalCrearPedido';

function Row(props) {
    const { row, onRecibir, onCancelar } = props;
    const [open, setOpen] = useState(false);
    const { auth } = useAuth();

    const getEstadoColor = (estado) => {
        switch (estado) {
            case 'PENDIENTE': return 'warning';
            case 'PARCIAL': return 'info';
            case 'RECIBIDO': return 'success';
            case 'CANCELADO': return 'error';
            default: return 'default';
        }
    };

    const copyToWhatsApp = () => {
        let text = `📦 *PEDIDO #${row.id} - SEGUIMIENTO*\n`;
        text += `📅 Fecha: ${new Date(row.fecha).toLocaleDateString()}\n`;
        text += `📊 Estado: ${row.estado}\n\n`;
        
        row.items.forEach(item => {
            const pendiente = item.cantidad_pedida - item.cantidad_recibida;
            text += `• ${item.cartuchos.modelo}: Pedido ${item.cantidad_pedida} | Recibido ${item.cantidad_recibida}`;
            if (pendiente > 0 && row.estado !== 'RECIBIDO') {
                text += ` | *PENDIENTE: ${pendiente}*`;
            }
            text += `\n`;
        });

        navigator.clipboard.writeText(text);
        alert("Resumen de pedido copiado.");
    };

    return (
        <React.Fragment>
            <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                <TableCell>
                    <IconButton size="small" onClick={() => setOpen(!open)}>
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
                <TableCell component="th" scope="row" sx={{ fontWeight: 700 }}>
                    #{row.id}
                </TableCell>
                <TableCell>{new Date(row.fecha).toLocaleDateString()}</TableCell>
                <TableCell>
                    <Chip label={row.estado} color={getEstadoColor(row.estado)} size="small" sx={{ fontWeight: 800 }} />
                </TableCell>
                <TableCell>{row.usuarios.nombre} {row.usuarios.apellido}</TableCell>
                <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <IconButton size="small" onClick={copyToWhatsApp} title="Copiar para WhatsApp">
                            <ContentCopyIcon fontSize="small" color="action" />
                        </IconButton>
                        {(row.estado === 'PENDIENTE' || row.estado === 'PARCIAL') && (
                            <>
                                <Button 
                                    size="small" 
                                    variant="contained" 
                                    color="success" 
                                    startIcon={<CheckCircleIcon />}
                                    onClick={() => onRecibir(row)}
                                >
                                    Recibir
                                </Button>
                                <IconButton size="small" onClick={() => onCancelar(row.id)} title="Cancelar Pedido">
                                    <CancelIcon fontSize="small" color="error" />
                                </IconButton>
                            </>
                        )}
                    </Stack>
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 2 }}>
                            <Typography variant="subtitle2" gutterBottom component="div" fontWeight={700} color="text.secondary">
                                Detalle de Insumos
                            </Typography>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 600 }}>Producto</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 600 }}>Pedido</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 600 }}>Recibido</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 600 }}>Pendiente</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {row.items.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>{item.cartuchos.modelo} ({item.cartuchos.color})</TableCell>
                                            <TableCell align="right">{item.cantidad_pedida}</TableCell>
                                            <TableCell align="right">{item.cantidad_recibida}</TableCell>
                                            <TableCell align="right" sx={{ color: (item.cantidad_pedida - item.cantidad_recibida) > 0 ? 'error.main' : 'success.main', fontWeight: 700 }}>
                                                {item.cantidad_pedida - item.cantidad_recibida}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            {row.observaciones && (
                                <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic', color: 'text.secondary' }}>
                                    Nota: {row.observaciones}
                                </Typography>
                            )}
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </React.Fragment>
    );
}

export default function GestionPedidos() {
    const { auth } = useAuth();
    const [pedidos, setPedidos] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [recibirDialogOpen, setRecibirDialogOpen] = useState(false);
    const [selectedPedido, setSelectedPedido] = useState(null);
    const [recepcionData, setRecepcionData] = useState({}); // { item_id: cantidad }
    const [loading, setLoading] = useState(false);

    const fetchPedidos = async () => {
        try {
            const res = await api.get(`${URI}/pedidos`);
            setPedidos(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => { fetchPedidos(); }, []);

    const handleOpenRecibir = (pedido) => {
        setSelectedPedido(pedido);
        const initialData = {};
        pedido.items.forEach(item => {
            const pendiente = item.cantidad_pedida - item.cantidad_recibida;
            initialData[item.id] = pendiente > 0 ? pendiente : 0;
        });
        setRecepcionData(initialData);
        setRecibirDialogOpen(true);
    };

    const handleRecepcionChange = (itemId, val) => {
        setRecepcionData(prev => ({ ...prev, [itemId]: parseInt(val) || 0 }));
    };

    const submitRecepcion = async () => {
        setLoading(true);
        try {
            const items_recibidos = Object.keys(recepcionData).map(id => ({
                item_id: id,
                cantidad: recepcionData[id]
            })).filter(i => i.cantidad > 0);

            if (items_recibidos.length === 0) {
                alert("Ingrese al menos una cantidad para recibir.");
                setLoading(false);
                return;
            }

            await api.post(`${URI}/pedidos/${selectedPedido.id}/recibir`, {
                usuario_id: auth.id,
                items_recibidos
            });

            setRecibirDialogOpen(false);
            fetchPedidos();
        } catch (err) {
            alert("Error al procesar la recepción.");
        } finally {
            setLoading(false);
        }
    };

    const handleCancelar = async (id) => {
        if (!window.confirm("¿Seguro que deseas cancelar este pedido?")) return;
        try {
            await api.put(`${URI}/pedidos/${id}/cancelar`);
            fetchPedidos();
        } catch (err) {
            alert("Error al cancelar.");
        }
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 10, mb: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" fontWeight="bold" color="secondary" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <LocalShippingIcon fontSize="large" /> Gestión de Pedidos
                </Typography>
                <Button 
                    variant="contained" 
                    color="secondary" 
                    startIcon={<AssignmentIcon />} 
                    onClick={() => setModalOpen(true)}
                    sx={{ px: 4, borderRadius: 2, fontWeight: 700 }}
                >
                    Nuevo Pedido
                </Button>
            </Box>

            <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 3 }}>
                <Table aria-label="collapsible table">
                    <TableHead>
                        <TableRow sx={{ bgcolor: 'secondary.main' }}>
                            <TableCell />
                            <TableCell sx={{ color: '#fff', fontWeight: 700 }}>ID</TableCell>
                            <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Fecha</TableCell>
                            <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Estado</TableCell>
                            <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Solicitante</TableCell>
                            <TableCell align="right" sx={{ color: '#fff', fontWeight: 700 }}>Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {pedidos.length === 0 ? (
                            <TableRow><TableCell colSpan={6} align="center" sx={{ py: 5, color: 'text.secondary' }}>No hay pedidos registrados</TableCell></TableRow>
                        ) : (
                            pedidos.map((pedido) => (
                                <Row key={pedido.id} row={pedido} onRecibir={handleOpenRecibir} onCancelar={handleCancelar} />
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <ModalCrearPedido 
                open={modalOpen} 
                onClose={() => setModalOpen(false)} 
                onPedidoExitoso={fetchPedidos} 
            />

            {/* Diálogo de Recepción */}
            <Dialog open={recibirDialogOpen} onClose={() => !loading && setRecibirDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 700, color: 'success.main' }}>Confirmar Recepción de Insumos</DialogTitle>
                <Divider />
                <DialogContent>
                    <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                        Indique las cantidades que está recibiendo hoy para el pedido #{selectedPedido?.id}.
                    </Typography>
                    <Stack spacing={2}>
                        {selectedPedido?.items.map(item => {
                            const pendiente = item.cantidad_pedida - item.cantidad_recibida;
                            if (pendiente <= 0) return null;
                            return (
                                <Box key={item.id} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                                    <Typography variant="subtitle2" fontWeight={700}>{item.cartuchos.modelo}</Typography>
                                    <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                                        <Typography variant="caption">Pendiente: {pendiente}</Typography>
                                        <TextField 
                                            size="small" 
                                            type="number" 
                                            label="Recibido ahora"
                                            value={recepcionData[item.id] || 0}
                                            onChange={(e) => handleRecepcionChange(item.id, e.target.value)}
                                            slotProps={{ input: { min: 0, max: pendiente } }}
                                            sx={{ width: 120 }}
                                        />
                                    </Box>
                                </Box>
                            );
                        })}
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setRecibirDialogOpen(false)} disabled={loading}>Cancelar</Button>
                    <Button 
                        onClick={submitRecepcion} 
                        variant="contained" 
                        color="success" 
                        disabled={loading}
                        sx={{ fontWeight: 700 }}
                    >
                        {loading ? 'Procesando...' : 'Confirmar Ingreso a Stock'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
