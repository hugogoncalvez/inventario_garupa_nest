import api, { URI } from '../../config.js';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { styled } from '@mui/material/styles';
import Grid from "@mui/material/Grid";
import {
    Typography, Table, TableBody, TableCell, tableCellClasses, TableContainer,
    TableHead, TableRow, Paper, Box, IconButton, Button, Tooltip,    TextField, MenuItem, Container, Card, CardContent, 
    Stack, TablePagination, Divider, Chip 
} from '@mui/material';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import PrintIcon from '@mui/icons-material/Print';
import ConfirmDialog from '../dialogs/ShowConfirm';

// Estilos optimizados
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

export const GestionImpresoras = () => {
    const [impresoras, setImpresoras] = useState([]);
    const [areas, setAreas] = useState([]);
    const [form, setForm] = useState({ id: '', modelo: '', marca: '', area_id: '' });
    const [isUpdate, setIsUpdate] = useState(false);
    const [errors, setErrors] = useState({});
    const [openConfirm, setOpenConfirm] = useState(false);
    const [idToDelete, setIdToDelete] = useState('');
    
    const [filters, setFilters] = useState({ modelo: '', marca: '', areaName: '' });
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const loadData = useCallback(async () => {
        try {
            const [resImp, resAreas] = await Promise.all([
                api.get(`${URI}/tintas/impresoras`),
                api.get(`${URI}/areas`)
            ]);
            setImpresoras(resImp.data);
            setAreas(resAreas.data);
        } catch (error) {
            console.error("Error cargando datos:", error);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const getImpresoras = async () => {
        const res = await api.get(`${URI}/tintas/impresoras`);
        setImpresoras(res.data);
    };

    const filteredImpresoras = useMemo(() => {
        return impresoras.filter(imp => 
            (filters.modelo === '' || imp.modelo.toLowerCase().includes(filters.modelo.toLowerCase())) &&
            (filters.marca === '' || (imp.marca && imp.marca.toLowerCase().includes(filters.marca.toLowerCase()))) &&
            (filters.areaName === '' || (imp.areas && imp.areas.area.toLowerCase().includes(filters.areaName.toLowerCase())))
        );
    }, [impresoras, filters]);

    const validate = () => {
        const newErrors = {};
        if (!form.modelo.trim()) newErrors.modelo = "Requerido";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            if (isUpdate) {
                await api.put(`${URI}/tintas/impresoras/${form.id}`, form);
            } else {
                await api.post(`${URI}/tintas/impresoras`, form);
            }
            clearForm();
            getImpresoras();
        } catch (error) {
            console.error("Error al guardar:", error);
        }
    };

    const clearForm = () => {
        setForm({ id: '', modelo: '', marca: '', area_id: '' });
        setIsUpdate(false);
        setErrors({});
    };

    const handleEditClick = (row) => {
        setForm({
            id: row.id,
            modelo: row.modelo,
            marca: row.marca || '',
            area_id: row.area_id || ''
        });
        setIsUpdate(true);
        setErrors({});
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 9, mb: 4 }}>
            <Typography variant="h4" fontWeight="800" color="primary" mb={4}>
                Gestión de Impresoras
            </Typography>

            <ConfirmDialog open={openConfirm} onClose={(v) => {
                setOpenConfirm(false);
                v && api.delete(`${URI}/tintas/impresoras/${idToDelete}`).then(getImpresoras);
            }} />

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card sx={{ borderRadius: 3, border: '1px solid var(--mui-palette-divider)' }}>
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={2} gap={1}>
                                <PrintIcon color="primary" />
                                <Typography variant="h6" fontWeight="700">
                                    {isUpdate ? 'Editar Equipo' : 'Nueva Impresora'}
                                </Typography>
                            </Box>
                            <Divider sx={{ mb: 3 }} />
                            <Box component="form" onSubmit={handleSubmit}>
                                <Stack spacing={2.5}>
                                    <TextField 
                                        label="Modelo" 
                                        required 
                                        value={form.modelo} 
                                        onChange={(e) => setForm({...form, modelo: e.target.value})}
                                        error={!!errors.modelo}
                                        helperText={errors.modelo}
                                        fullWidth 
                                        size="small" 
                                    />
                                    <TextField 
                                        label="Marca" 
                                        value={form.marca} 
                                        onChange={(e) => setForm({...form, marca: e.target.value})}
                                        fullWidth 
                                        size="small" 
                                    />
                                    <TextField
                                        select
                                        label="Área Asignada"
                                        value={form.area_id}
                                        onChange={(e) => setForm({...form, area_id: e.target.value})}
                                        fullWidth
                                        size="small"
                                    >
                                        <MenuItem value=""><em>Ninguna (Depósito)</em></MenuItem>
                                        {areas.map((a) => (
                                            <MenuItem key={a.id} value={a.id}>{a.area}</MenuItem>
                                        ))}
                                    </TextField>
                                    <Button type="submit" variant="contained" fullWidth startIcon={<SaveOutlinedIcon />} sx={{ py: 1.2, borderRadius: 2 }}>
                                        {isUpdate ? 'Actualizar' : 'Guardar'}
                                    </Button>
                                    <Button variant="outlined" color="secondary" fullWidth onClick={clearForm} sx={{ borderRadius: 2 }}>
                                        {isUpdate ? 'Cancelar' : 'Limpiar'}
                                    </Button>
                                </Stack>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 8 }}>
                    <Card sx={{ mb: 3, borderRadius: 3, border: '1px solid var(--mui-palette-divider)' }}>
                        <CardContent sx={{ p: 2 }}>
                            <Box display="flex" alignItems="center" mb={2} gap={1}>
                                <FilterAltIcon color="primary" fontSize="small" />
                                <Typography variant="subtitle2" fontWeight="700">Filtros de Búsqueda</Typography>
                            </Box>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, sm: 4 }}>
                                    <TextField label="Modelo" value={filters.modelo} onChange={(e) => setFilters({...filters, modelo: e.target.value})} fullWidth size="small" />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 4 }}>
                                    <TextField label="Marca" value={filters.marca} onChange={(e) => setFilters({...filters, marca: e.target.value})} fullWidth size="small" />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 4 }}>
                                    <TextField select label="Área" value={filters.areaName} onChange={(e) => setFilters({...filters, areaName: e.target.value})} fullWidth size="small">
                                        <MenuItem value=""><em>Todas</em></MenuItem>
                                        {areas.map((a) => (
                                            <MenuItem key={a.id} value={a.area}>{a.area}</MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>

                    <Paper sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid var(--mui-palette-divider)' }}>
                        <TableContainer sx={{ maxHeight: '60vh' }}>
                            <Table stickyHeader size="small">
                                <TableHead>
                                    <TableRow>
                                        <StyledTableCell>Modelo de Impresora</StyledTableCell>
                                        <StyledTableCell align='center'>Marca</StyledTableCell>
                                        <StyledTableCell align='center'>Área Asignada</StyledTableCell>
                                        <StyledTableCell align='center'>Acciones</StyledTableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredImpresoras.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                                        <StyledTableRow key={row.id} hover>
                                            <StyledTableCell sx={{ fontWeight: 700 }}>{row.modelo}</StyledTableCell>
                                            <StyledTableCell align='center'>{row.marca || '---'}</StyledTableCell>
                                            <StyledTableCell align='center'>
                                                <Chip 
                                                    label={row.areas ? row.areas.area : 'N/A'} 
                                                    size="small"
                                                    variant="outlined"
                                                    color={row.areas ? "primary" : "default"}
                                                    sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                                                />
                                            </StyledTableCell>
                                            <StyledTableCell align='center'>
                                                <Stack direction="row" spacing={0.5} justifyContent="center">
                                                    <Tooltip title="Editar"><IconButton size="small" color="primary" onClick={() => handleEditClick(row)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                                                    <Tooltip title="Eliminar"><IconButton size="small" color="error" onClick={() => { setIdToDelete(row.id); setOpenConfirm(true); }}><DeleteForeverIcon fontSize="small" /></IconButton></Tooltip>
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
                            count={filteredImpresoras.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={(e, p) => setPage(p)}
                            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                            labelRowsPerPage="Filas"
                        />
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};
