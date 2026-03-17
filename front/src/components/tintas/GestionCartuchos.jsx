import api, { URI } from '../../config.js';
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from 'react';
import { styled } from '@mui/material/styles';
import Grid from "@mui/material/Grid";
import {
    Typography, Table, TableBody, TableCell, tableCellClasses, TableContainer,
    TableHead, TableRow, Paper, Box, IconButton, Button, Tooltip,    TextField, MenuItem, Select, FormControl, InputLabel, 
    Container, Card, CardContent, Stack, Chip, TablePagination 
} from '@mui/material';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import SendIcon from '@mui/icons-material/Send';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import RecyclingIcon from '@mui/icons-material/Recycling';
import InventoryIcon from '@mui/icons-material/Inventory';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import Swal from 'sweetalert2';

import ModalRegistrarEntrega from './ModalRegistrarEntrega';
import ModalRegistrarCompra from './ModalRegistrarCompra';
import ModalRegistrarRecarga from './ModalRegistrarRecarga';
import useAuth from '../../hooks/useAuth';
import ReporteInventarioInsumos from '../../pdf/ReporteInventarioInsumos';

// Estilos de la tabla optimizados para MUI v7
const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: 'var(--mui-palette-primary-main)',
        color: 'var(--mui-palette-common-white)',
        fontSize: 14,
        fontWeight: 600,
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 13,
    },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
        backgroundColor: 'var(--mui-palette-action-hover)',
    },
    '&:last-child td, &:last-child th': {
        border: 0,
    },
}));

const GestionCartuchos = () => {
    const [cartuchos, setCartuchos] = useState([]);
    const navigate = useNavigate();
    const { auth } = useAuth();

    const [openEntregaModal, setOpenEntregaModal] = useState(false);
    const [openCompraModal, setOpenCompraModal] = useState(false);
    const [openRecargaModal, setOpenRecargaModal] = useState(false);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const [filtroModelo, setFiltroModelo] = useState('');
    const [filtroTipo, setFiltroTipo] = useState('Todos');
    const [filtroRecargable, setFiltroRecargable] = useState('Todos');
    const [filtroStock, setFiltroStock] = useState('Todos');

    useEffect(() => {
        getCartuchos();
    }, []);

    const filteredCartuchos = useMemo(() => {
        return cartuchos.filter(c => {
            const matchesModelo = c.modelo.toLowerCase().includes(filtroModelo.toLowerCase());
            const matchesTipo = filtroTipo === 'Todos' || c.tipo === filtroTipo;
            const matchesRecargable = filtroRecargable === 'Todos' || c.es_recargable === (filtroRecargable === 'Sí');
            
            let matchesStock = true;
            if (filtroStock !== 'Todos') {
                const stock = c.stock_unidades;
                const min = c.stock_minimo_unidades;
                const umbralMedio = min === 0 ? 5 : min * 2;
                if (filtroStock === 'Bajo') matchesStock = stock <= min;
                else if (filtroStock === 'Medio') matchesStock = stock > min && stock <= umbralMedio;
                else if (filtroStock === 'Alto') matchesStock = stock > umbralMedio;
            }
            
            return matchesModelo && matchesTipo && matchesRecargable && matchesStock;
        });
    }, [cartuchos, filtroModelo, filtroTipo, filtroRecargable, filtroStock]);

    const getCartuchos = async () => {
        try {
            const res = await api.get(`${URI}/tintas/cartuchos`, { params: { includeInsumoGranel: 'true' } });
            setCartuchos(res.data);
        } catch (error) {
            console.error("Error al obtener los cartuchos:", error);
        }
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: "¡No podrás revertir esta acción!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: 'var(--mui-palette-primary-main)',
            cancelButtonColor: 'var(--mui-palette-error-main)',
            confirmButtonText: 'Sí, ¡bórralo!',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                await api.delete(`${URI}/tintas/cartuchos/${id}`, { data: { usuario_id: auth.id } });
                getCartuchos();
                Swal.fire('¡Eliminado!', 'El insumo ha sido eliminado.', 'success');
            }
        });
    };

    const handleAdjustStockUnidades = async (cartucho) => {
        const { value: nuevaCantidad } = await Swal.fire({
            title: `Ajustar stock: ${cartucho.modelo}`,
            input: 'number',
            inputValue: cartucho.stock_unidades,
            showCancelButton: true,
            confirmButtonText: 'Ajustar',
            cancelButtonText: 'Cancelar'
        });

        if (nuevaCantidad !== undefined && nuevaCantidad !== null) {
            try {
                await api.post(`${URI}/tintas/movimientos/ajuste`, {
                    cartucho_id: cartucho.id,
                    nueva_cantidad: parseInt(nuevaCantidad),
                    usuario_id: auth.id
                });
                getCartuchos();
                Swal.fire('¡Ajustado!', 'Stock corregido.', 'success');
            } catch (err) {
                Swal.fire('Error', 'No se pudo ajustar el stock.', 'error');
            }
        }
    };

    const handleClearFilters = () => {
        setFiltroModelo('');
        setFiltroTipo('Todos');
        setFiltroRecargable('Todos');
        setFiltroStock('Todos');
    };

    const handleSendStockSummary = async () => {
        try {
            await api.post(`${URI}/tintas/whatsapp/resumen-stock`);
            Swal.fire({
                title: '¡Enviado!',
                text: 'El resumen de stock se ha enviado al grupo de WhatsApp.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });
        } catch (error) {
            Swal.fire('Error', 'No se pudo enviar el resumen por WhatsApp.', 'error');
        }
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 9, mb: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
                <Typography variant="h4" fontWeight="800" color="primary">
                    Gestión de Insumos
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                    <Button variant="contained" size="small" onClick={() => navigate('/tintas/cartuchos/create')} startIcon={<AddCircleOutlineIcon />}>Nuevo</Button>
                    <Button variant="contained" size="small" color="success" onClick={() => setOpenCompraModal(true)} startIcon={<ShoppingCartIcon />}>Compra</Button>
                    <Button variant="contained" size="small" color="info" onClick={() => setOpenEntregaModal(true)} startIcon={<SendIcon />}>Entrega</Button>
                    <Button variant="contained" size="small" color="warning" onClick={() => setOpenRecargaModal(true)} startIcon={<RecyclingIcon />}>Recarga</Button>
                    <Button variant="contained" size="small" color="success" onClick={handleSendStockSummary} startIcon={<WhatsAppIcon />} sx={{ bgcolor: '#25D366', '&:hover': { bgcolor: '#128C7E' } }}>WhatsApp</Button>
                    <Button variant="contained" size="small" color="error" onClick={() => ReporteInventarioInsumos(filteredCartuchos)} startIcon={<PictureAsPdfIcon />}>PDF</Button>
                </Stack>
            </Box>

            <Card sx={{ mb: 4, borderRadius: 3, border: '1px solid var(--mui-palette-divider)' }}>
                <CardContent sx={{ p: 2 }}>
                    <Box display="flex" alignItems="center" mb={2} gap={1}>
                        <FilterAltIcon color="primary" fontSize="small" />
                        <Typography variant="subtitle2" fontWeight="700" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>Filtros de Búsqueda</Typography>
                    </Box>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <TextField label="Modelo" variant="outlined" size="small" value={filtroModelo} onChange={(e) => setFiltroModelo(e.target.value)} fullWidth />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                            <FormControl size="small" fullWidth>
                                <InputLabel>Tipo</InputLabel>
                                <Select value={filtroTipo} label="Tipo" onChange={(e) => setFiltroTipo(e.target.value)}>
                                    <MenuItem value="Todos">Todos</MenuItem>
                                    <MenuItem value="Tinta">Tinta</MenuItem>
                                    <MenuItem value="Toner">Toner</MenuItem>
                                    <MenuItem value="Drum">Drum</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                            <FormControl size="small" fullWidth>
                                <InputLabel>Estado Stock</InputLabel>
                                <Select value={filtroStock} label="Estado Stock" onChange={(e) => setFiltroStock(e.target.value)}>
                                    <MenuItem value="Todos">Todos</MenuItem>
                                    <MenuItem value="Bajo">Bajo (🔴)</MenuItem>
                                    <MenuItem value="Medio">Medio (🟡)</MenuItem>
                                    <MenuItem value="Alto">Alto (🟢)</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                            <FormControl size="small" fullWidth>
                                <InputLabel>Recargable</InputLabel>
                                <Select value={filtroRecargable} label="Recargable" onChange={(e) => setFiltroRecargable(e.target.value)}>
                                    <MenuItem value="Todos">Todos</MenuItem>
                                    <MenuItem value="Sí">Sí</MenuItem>
                                    <MenuItem value="No">No</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }} display="flex" justifyContent="flex-end">
                            <Button variant="outlined" color="secondary" startIcon={<ClearAllIcon />} onClick={handleClearFilters} fullWidth sx={{ borderRadius: 2 }}>
                                Limpiar
                            </Button>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            <ModalRegistrarEntrega open={openEntregaModal} onClose={() => setOpenEntregaModal(false)} onEntregaExitosa={getCartuchos} />
            <ModalRegistrarCompra open={openCompraModal} onClose={() => setOpenCompraModal(false)} onCompraExitosa={getCartuchos} />
            <ModalRegistrarRecarga open={openRecargaModal} onClose={() => setOpenRecargaModal(false)} onRecargaExitosa={getCartuchos} />

            <Paper sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid var(--mui-palette-divider)' }}>
                <TableContainer sx={{ maxHeight: '60vh' }}>
                    <Table stickyHeader size="small">
                        <TableHead>
                            <TableRow>
                                <StyledTableCell>Modelo</StyledTableCell>
                                <StyledTableCell align='center'>Color</StyledTableCell>
                                <StyledTableCell align='center'>Tipo</StyledTableCell>
                                <StyledTableCell align='center'>Stock</StyledTableCell>
                                <StyledTableCell align='center'>Mínimo</StyledTableCell>
                                <StyledTableCell align='center'>Acciones</StyledTableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredCartuchos.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((cartucho) => (
                                <StyledTableRow key={cartucho.id} hover>
                                    <StyledTableCell sx={{ fontWeight: 700 }}>{cartucho.modelo}</StyledTableCell>
                                    <StyledTableCell align='center'>
                                        <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                                            <Box sx={{ 
                                                width: 12, height: 12, borderRadius: '50%', 
                                                background: (() => {
                                                    const c = cartucho.color?.toLowerCase() || '';
                                                    if (c.includes('tricolor')) return 'conic-gradient(#00ffff, #ff00ff, #ffff00)';
                                                    if (c.includes('negro') || c.includes('black')) return '#000';
                                                    if (c.includes('cian')) return '#00ffff';
                                                    if (c.includes('magenta')) return '#ff00ff';
                                                    if (c.includes('amarillo')) return '#ffff00';
                                                    return '#ccc';
                                                })(),
                                                border: '1px solid var(--mui-palette-divider)'
                                            }} />
                                            <Typography variant="body2">{cartucho.color}</Typography>
                                        </Stack>
                                    </StyledTableCell>
                                    <StyledTableCell align='center'>{cartucho.tipo}</StyledTableCell>
                                    <StyledTableCell align='center'>
                                        <Chip 
                                            label={cartucho.stock_unidades} 
                                            size="small"
                                            sx={{ 
                                                fontWeight: 800, minWidth: 40,
                                                bgcolor: (() => {
                                                    const s = cartucho.stock_unidades;
                                                    const m = cartucho.stock_minimo_unidades;
                                                    if (s <= m) return 'var(--mui-palette-error-main)';
                                                    if (s <= (m === 0 ? 5 : m * 2)) return 'var(--mui-palette-warning-main)';
                                                    return 'var(--mui-palette-success-main)';
                                                })(),
                                                color: '#fff'
                                            }} 
                                        />
                                    </StyledTableCell>
                                    <StyledTableCell align='center' sx={{ opacity: 0.7 }}>{cartucho.stock_minimo_unidades}</StyledTableCell>
                                    <StyledTableCell align='center'>
                                        <Stack direction="row" spacing={0.5} justifyContent="center">
                                            <Tooltip title="Editar"><IconButton size="small" color="success" onClick={() => navigate(`/tintas/cartuchos/edit/${cartucho.id}`)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                                            <Tooltip title="Eliminar"><IconButton size="small" color="error" onClick={() => handleDelete(cartucho.id)}><DeleteForeverIcon fontSize="small" /></IconButton></Tooltip>
                                            <Tooltip title="Ajustar Stock"><IconButton size="small" color="info" onClick={() => handleAdjustStockUnidades(cartucho)}><InventoryIcon fontSize="small" /></IconButton></Tooltip>
                                        </Stack>
                                    </StyledTableCell>
                                </StyledTableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[10, 25, 50]}
                    component="div"
                    count={filteredCartuchos.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={(e, newPage) => setPage(newPage)}
                    onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                    labelRowsPerPage="Filas"
                />
            </Paper>
        </Container>
    );
};

export default GestionCartuchos;
