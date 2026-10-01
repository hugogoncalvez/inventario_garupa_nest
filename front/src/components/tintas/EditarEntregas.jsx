import api, { URI, showSuccess, showError } from '../../config.js';
import { useState, useEffect } from 'react';
import {
    Typography, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, Box, IconButton, Button, Tooltip,
    Container, TextField, MenuItem, Dialog, DialogActions,
    DialogContent, DialogTitle, CircularProgress
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import useAuth from '../../hooks/useAuth';

export const ADMIN_EMAIL = 'hugogoncalvez@gmail.com';

export const EditarEntregas = () => {
    const { auth } = useAuth();
    const isAdmin = (auth?.usuario || '').toLowerCase() === ADMIN_EMAIL;

    const [entregas, setEntregas] = useState([]);
    const [impresoras, setImpresoras] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editRow, setEditRow] = useState(null);
    const [form, setForm] = useState({ cantidad: 1, fecha: '', impresora_id: '' });

    const getEntregas = async () => {
        setLoading(true);
        try {
            const [resEnt, resImp] = await Promise.all([
                api.get(`${URI}/tintas/movimientos/entregas`, { params: { limite: 100 } }),
                api.get(`${URI}/tintas/impresoras`)
            ]);
            setEntregas(resEnt.data);
            setImpresoras(resImp.data);
        } catch (error) {
            console.error('Error al cargar entregas:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAdmin) getEntregas();
        else setLoading(false);
    }, [isAdmin]);

    if (!isAdmin) {
        return (
            <Container maxWidth="sm" sx={{ mt: 12 }}>
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h6" fontWeight={700}>Sin acceso</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Esta sección es solo para el administrador.
                    </Typography>
                </Paper>
            </Container>
        );
    }

    const openEdit = (row) => {
        setEditRow(row);
        setForm({
            cantidad: row.cantidad,
            fecha: row.fecha ? new Date(row.fecha).toISOString().slice(0, 16) : '',
            impresora_id: row.impresora_id || ''
        });
    };

    const handleSave = async () => {
        const cantidad = Number(form.cantidad);
        if (!Number.isInteger(cantidad) || cantidad <= 0) {
            showError('Dato inválido', 'La cantidad debe ser un entero mayor a 0.');
            return;
        }
        setSaving(true);
        try {
            await api.put(`${URI}/tintas/movimientos/${editRow.id}`, {
                cantidad,
                fecha: form.fecha ? new Date(form.fecha) : undefined,
                impresora_id: form.impresora_id === '' ? null : Number(form.impresora_id)
            });
            setEditRow(null);
            await getEntregas();
            showSuccess('Entrega actualizada', 'El movimiento se corrigió y el stock se reajustó.');
        } catch (error) {
            const msg = error.response?.data?.message || 'No se pudo actualizar la entrega.';
            showError('No se pudo guardar', Array.isArray(msg) ? msg.join('\n') : msg);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 9, mb: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" fontWeight="bold" color="primary">
                    Editar Entregas de Insumos
                </Typography>
                <Button variant="outlined" onClick={getEntregas}>Recargar</Button>
            </Box>
            <Typography variant="body2" color="text.secondary" mb={2}>
                Solo visible para {ADMIN_EMAIL}. Al cambiar la cantidad se reajusta el stock automáticamente.
            </Typography>

            <TableContainer component={Paper}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 700 }}>Fecha</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Insumo</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 700 }}>Cantidad</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Impresora / Área</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Registrado por</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 700 }}>Editar</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                    <CircularProgress size={24} />
                                </TableCell>
                            </TableRow>
                        ) : entregas.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                                    No hay entregas registradas.
                                </TableCell>
                            </TableRow>
                        ) : entregas.map((row) => (
                            <TableRow key={row.id} hover>
                                <TableCell>
                                    {new Date(row.fecha).toLocaleDateString()} {new Date(row.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </TableCell>
                                <TableCell>{row.cartuchos?.modelo} ({row.cartuchos?.color} / {row.cartuchos?.tipo})</TableCell>
                                <TableCell align="center"><strong>{row.cantidad}</strong></TableCell>
                                <TableCell>
                                    {row.impresoras ? `${row.impresoras.modelo} — ${row.impresoras.areas?.area || 'Sin área'}` : '—'}
                                </TableCell>
                                <TableCell>
                                    {`${row.usuarios?.nombre || ''} ${row.usuarios?.apellido || ''}`.trim() || row.usuarios?.usuario || '—'}
                                </TableCell>
                                <TableCell align="center">
                                    <Tooltip title="Editar entrega">
                                        <IconButton size="small" color="primary" onClick={() => openEdit(row)}>
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={!!editRow} onClose={() => setEditRow(null)} maxWidth="xs" fullWidth>
                <DialogTitle>Editar entrega #{editRow?.id}</DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
                    <TextField
                        label="Cantidad"
                        type="number"
                        value={form.cantidad}
                        onChange={(e) => setForm((p) => ({ ...p, cantidad: e.target.value }))}
                        fullWidth
                        inputProps={{ min: 1, step: 1 }}
                        sx={{ mt: 1 }}
                    />
                    <TextField
                        label="Fecha"
                        type="datetime-local"
                        value={form.fecha}
                        onChange={(e) => setForm((p) => ({ ...p, fecha: e.target.value }))}
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                        select
                        label="Impresora destino"
                        value={form.impresora_id}
                        onChange={(e) => setForm((p) => ({ ...p, impresora_id: e.target.value }))}
                        fullWidth
                    >
                        <MenuItem value=""><em>Sin impresora</em></MenuItem>
                        {impresoras.map((imp) => (
                            <MenuItem key={imp.id} value={imp.id}>
                                {imp.modelo} — {imp.areas?.area || 'Sin área'}
                            </MenuItem>
                        ))}
                    </TextField>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditRow(null)} disabled={saving}>Cancelar</Button>
                    <Button variant="contained" onClick={handleSave} disabled={saving}>
                        {saving ? 'Guardando...' : 'Guardar'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default EditarEntregas;
