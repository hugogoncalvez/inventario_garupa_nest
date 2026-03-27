import api, { URI } from '../../config.js';
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from 'react';
import { styled } from '@mui/material/styles';
import {
    Typography, Table, TableBody, TableCell, tableCellClasses, TableContainer,
    TableHead, TableRow, Paper, Box, IconButton, Button, Tooltip, TextField, 
    MenuItem, FormControl, InputLabel, Select, Container, Card, CardContent, 
    Stack, Chip, TablePagination, Dialog, DialogTitle, DialogContent, DialogActions, Grid, Divider
} from '@mui/material';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import InventoryIcon from '@mui/icons-material/Inventory';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import SettingsInputComponentIcon from '@mui/icons-material/SettingsInputComponent';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import CancelIcon from '@mui/icons-material/Cancel';
import Swal from 'sweetalert2';

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

const GestionRepuestos = () => {
    const [repuestos, setRepuestos] = useState([]);
    const [tipos, setTipos] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Filtros
    const [filtroModelo, setFiltroModelo] = useState('');
    const [filtroTipo, setFiltroTipo] = useState('Todos');
    const [filtroStock, setFiltroStock] = useState('Todos');

    // Paginación
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Modal de Creación/Edición
    const [openModal, setOpenModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentRepuesto, setCurrentRepuesto] = useState({
        modelo: '', marca: '', descripcion: '', tipo_id: '', stock_actual: 0, stock_minimo: 0
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [resRep, resTipos] = await Promise.all([
                api.get(`${URI}/repuestos`),
                api.get(`${URI}/tipos`)
            ]);
            setRepuestos(resRep.data);
            setTipos(resTipos.data);
        } catch (error) {
            console.error("Error al cargar repuestos:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            if (editMode) {
                await api.put(`${URI}/repuestos/${currentRepuesto.id}`, currentRepuesto);
                Swal.fire('¡Actualizado!', 'Repuesto actualizado correctamente.', 'success');
            } else {
                await api.post(`${URI}/repuestos`, currentRepuesto);
                Swal.fire('¡Guardado!', 'Nuevo repuesto añadido al stock.', 'success');
            }
            setOpenModal(false);
            loadData();
        } catch (error) {
            Swal.fire('Error', 'No se pudo guardar el repuesto.', 'error');
        }
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: "Se eliminará el registro del stock.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                await api.delete(`${URI}/repuestos/${id}`);
                loadData();
                Swal.fire('Eliminado', 'Registro borrado.', 'success');
            }
        });
    };

    const handleAjusteStock = async (repuesto) => {
        const { value: nuevaCantidad } = await Swal.fire({
            title: `Ajustar stock: ${repuesto.modelo}`,
            input: 'number',
            inputValue: repuesto.stock_actual,
            showCancelButton: true,
            confirmButtonText: 'Ajustar',
        });

        if (nuevaCantidad !== undefined) {
            await api.post(`${URI}/repuestos/ajuste`, { id: repuesto.id, nueva_cantidad: parseInt(nuevaCantidad) });
            loadData();
            Swal.fire('Ajustado', 'Stock corregido.', 'success');
        }
    };

    const filteredRepuestos = useMemo(() => {
        return repuestos.filter(r => {
            const matchesModelo = r.modelo.toLowerCase().includes(filtroModelo.toLowerCase()) || 
                                  (r.marca && r.marca.toLowerCase().includes(filtroModelo.toLowerCase()));
            const matchesTipo = filtroTipo === 'Todos' || r.tipo_rel?.tipo === filtroTipo;
            
            let matchesStock = true;
            if (filtroStock === 'Bajo') matchesStock = r.stock_actual <= r.stock_minimo;
            else if (filtroStock === 'Normal') matchesStock = r.stock_actual > r.stock_minimo;

            return matchesModelo && matchesTipo && matchesStock;
        });
    }, [repuestos, filtroModelo, filtroTipo, filtroStock]);

    return (
        <Container maxWidth="xl" sx={{ mt: 9, mb: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" fontWeight="800" color="primary">
                    Gestión de Repuestos
                </Typography>
                <Button 
                    variant="contained" 
                    startIcon={<AddCircleOutlineIcon />}
                    onClick={() => {
                        setEditMode(false);
                        setCurrentRepuesto({ modelo: '', marca: '', descripcion: '', tipo_id: '', stock_actual: 0, stock_minimo: 0 });
                        setOpenModal(true);
                    }}
                >
                    Nuevo Repuesto
                </Button>
            </Box>

            <Card sx={{ mb: 4, borderRadius: 3, border: '1px solid var(--mui-palette-divider)' }}>
                <CardContent sx={{ p: 2 }}>
                    <Stack direction="row" spacing={2} flexWrap="wrap" gap={2}>
                        <TextField 
                            label="Buscar por Modelo/Marca" 
                            size="small" 
                            sx={{ flexGrow: 1 }}
                            value={filtroModelo}
                            onChange={(e) => setFiltroModelo(e.target.value)}
                        />
                        <FormControl size="small" sx={{ minWidth: 200 }}>
                            <InputLabel>Tipo de Componente</InputLabel>
                            <Select value={filtroTipo} label="Tipo de Componente" onChange={(e) => setFiltroTipo(e.target.value)}>
                                <MenuItem value="Todos">Todos</MenuItem>
                                {tipos.map(t => <MenuItem key={t.id} value={t.tipo}>{t.tipo}</MenuItem>)}
                            </Select>
                        </FormControl>
                        <FormControl size="small" sx={{ minWidth: 150 }}>
                            <InputLabel>Stock</InputLabel>
                            <Select value={filtroStock} label="Stock" onChange={(e) => setFiltroStock(e.target.value)}>
                                <MenuItem value="Todos">Todos</MenuItem>
                                <MenuItem value="Bajo">Bajo Stock 🔴</MenuItem>
                                <MenuItem value="Normal">Stock Normal 🟢</MenuItem>
                            </Select>
                        </FormControl>
                        <Button variant="outlined" startIcon={<ClearAllIcon />} onClick={() => { setFiltroModelo(''); setFiltroTipo('Todos'); setFiltroStock('Todos'); }}>
                            Limpiar
                        </Button>
                    </Stack>
                </CardContent>
            </Card>

            <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <StyledTableCell>Tipo</StyledTableCell>
                                <StyledTableCell>Marca / Modelo</StyledTableCell>
                                <StyledTableCell>Descripción</StyledTableCell>
                                <StyledTableCell align="center">Stock Actual</StyledTableCell>
                                <StyledTableCell align="center">Stock Mínimo</StyledTableCell>
                                <StyledTableCell align="center">Acciones</StyledTableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredRepuestos.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((r) => (
                                <StyledTableRow key={r.id}>
                                    <StyledTableCell>
                                        <Chip label={r.tipo_rel?.tipo} size="small" color="primary" variant="outlined" />
                                    </StyledTableCell>
                                    <StyledTableCell>
                                        <Typography variant="body2" fontWeight="700">{r.marca}</Typography>
                                        <Typography variant="caption" color="text.secondary">{r.modelo}</Typography>
                                    </StyledTableCell>
                                    <StyledTableCell>{r.descripcion}</StyledTableCell>
                                    <StyledTableCell align="center">
                                        <Chip 
                                            label={r.stock_actual} 
                                            color={r.stock_actual <= r.stock_minimo ? "error" : "success"}
                                            size="small"
                                            sx={{ fontWeight: 'bold', minWidth: 40 }}
                                        />
                                    </StyledTableCell>
                                    <StyledTableCell align="center">{r.stock_minimo}</StyledTableCell>
                                    <StyledTableCell align="center">
                                        <Stack direction="row" spacing={1} justifyContent="center">
                                            <Tooltip title="Editar"><IconButton size="small" onClick={() => { setEditMode(true); setCurrentRepuesto(r); setOpenModal(true); }} color="success"><EditIcon fontSize="small"/></IconButton></Tooltip>
                                            <Tooltip title="Ajustar Stock"><IconButton size="small" onClick={() => handleAjusteStock(r)} color="info"><InventoryIcon fontSize="small"/></IconButton></Tooltip>
                                            <Tooltip title="Eliminar"><IconButton size="small" onClick={() => handleDelete(r.id)} color="error"><DeleteForeverIcon fontSize="small"/></IconButton></Tooltip>
                                        </Stack>
                                    </StyledTableCell>
                                </StyledTableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    component="div"
                    count={filteredRepuestos.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={(e, p) => setPage(p)}
                    onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
                />
            </Paper>

            {/* Modal Creación/Edición Rediseñado con Estilo de Órdenes */}
            <Dialog 
                open={openModal} 
                onClose={() => setOpenModal(false)} 
                fullWidth 
                maxWidth="sm"
                PaperProps={{
                    sx: { borderRadius: 3 }
                }}
            >
                <DialogTitle sx={{ p: 3, pb: 2 }}>
                    <Box display="flex" alignItems="center" gap={2}>
                        <SettingsInputComponentIcon color="primary" sx={{ fontSize: 40 }} />
                        <Typography variant="h4" fontWeight="700" color="primary">
                            {editMode ? 'Editar Repuesto' : 'Nuevo Repuesto'}
                        </Typography>
                    </Box>
                </DialogTitle>
                
                <Divider sx={{ mx: 3 }} />

                <DialogContent sx={{ p: 3, mt: 1 }}>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControl fullWidth>
                                <InputLabel>Tipo de Componente</InputLabel>
                                <Select 
                                    value={currentRepuesto.tipo_id} 
                                    label="Tipo de Componente" 
                                    onChange={(e) => setCurrentRepuesto({...currentRepuesto, tipo_id: e.target.value})}
                                >
                                    {tipos.map(t => <MenuItem key={t.id} value={t.id}>{t.tipo}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField 
                                label="Marca" 
                                fullWidth 
                                value={currentRepuesto.marca} 
                                onChange={(e) => setCurrentRepuesto({...currentRepuesto, marca: e.target.value})} 
                            />
                        </Grid>
                        
                        <Grid size={{ xs: 12 }}>
                            <TextField 
                                label="Modelo del Repuesto" 
                                fullWidth 
                                value={currentRepuesto.modelo} 
                                onChange={(e) => setCurrentRepuesto({...currentRepuesto, modelo: e.target.value})} 
                            />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <TextField 
                                label="Descripción / Observaciones Técnicas" 
                                fullWidth 
                                multiline 
                                rows={3} 
                                value={currentRepuesto.descripcion} 
                                onChange={(e) => setCurrentRepuesto({...currentRepuesto, descripcion: e.target.value})} 
                                helperText="Detalles adicionales del componente"
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField 
                                label="Stock Actual" 
                                type="number" 
                                fullWidth 
                                value={currentRepuesto.stock_actual} 
                                onChange={(e) => setCurrentRepuesto({...currentRepuesto, stock_actual: e.target.value})} 
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField 
                                label="Stock Mínimo" 
                                type="number" 
                                fullWidth 
                                value={currentRepuesto.stock_minimo} 
                                onChange={(e) => setCurrentRepuesto({...currentRepuesto, stock_minimo: e.target.value})} 
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                
                <DialogActions sx={{ p: 3, pt: 1 }}>
                    <Stack direction="row" spacing={2} width="100%" justifyContent="flex-end">
                        <Button 
                            variant="outlined" 
                            color="error" 
                            size="large"
                            onClick={() => setOpenModal(false)}
                            startIcon={<CancelIcon />}
                            sx={{ borderRadius: 2 }}
                        >
                            Cancelar
                        </Button>
                        <Button 
                            onClick={handleSave} 
                            variant="contained" 
                            size="large"
                            color="primary"
                            startIcon={<SaveOutlinedIcon />}
                            sx={{ borderRadius: 2 }}
                        >
                            {editMode ? 'Actualizar Repuesto' : 'Guardar Repuesto'}
                        </Button>
                    </Stack>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default GestionRepuestos;
