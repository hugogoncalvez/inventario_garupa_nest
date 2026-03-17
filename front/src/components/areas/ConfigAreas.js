import api, { URI } from '../../config.js';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { styled } from '@mui/material/styles';
import Grid from "@mui/material/Grid";
import {
    Typography, Table, TableBody, TableCell, tableCellClasses, TableContainer,
    TableHead, TableRow, Paper, Box, IconButton, Button, Tooltip,    TextField, Container, Card, CardContent, 
    Stack, TablePagination, Divider 
} from '@mui/material';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import AddLocationAltIcon from '@mui/icons-material/AddLocationAlt';
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

export const ConfigAreas = () => {
    const [areas, setAreas] = useState([]);
    const [form, setForm] = useState({ id: '', area: '', responsable: '' });
    const [isUpdate, setIsUpdate] = useState(false);
    const [errors, setErrors] = useState({});
    const [openConfirm, setOpenConfirm] = useState(false);
    const [idToDelete, setIdToDelete] = useState('');
    
    const [filters, setFilters] = useState({ area: '', responsable: '' });
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const getAreas = useCallback(async () => {
        try {
            const res = await api.get(`${URI}/areas`);
            setAreas(res.data);
        } catch (error) {
            console.error("Error al obtener las áreas:", error);
        }
    }, []);

    useEffect(() => {
        getAreas();
    }, [getAreas]);

    const filteredAreas = useMemo(() => {
        return areas.filter(a => 
            (filters.area === '' || (a.area && a.area.toLowerCase().includes(filters.area.toLowerCase()))) &&
            (filters.responsable === '' || (a.responsable && a.responsable.toLowerCase().includes(filters.responsable.toLowerCase())))
        );
    }, [areas, filters]);

    const validate = () => {
        const newErrors = {};
        if (!form.area.trim()) newErrors.area = "Requerido";
        if (!form.responsable.trim()) newErrors.responsable = "Requerido";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            if (isUpdate) {
                await api.put(`${URI}/areas/${form.id}`, form);
            } else {
                await api.post(`${URI}/areas/create`, form);
            }
            clearForm();
            getAreas();
        } catch (error) {
            console.error("Error al guardar:", error);
        }
    };

    const clearForm = () => {
        setForm({ id: '', area: '', responsable: '' });
        setIsUpdate(false);
        setErrors({});
    };

    const handleEditClick = (row) => {
        setForm(row);
        setIsUpdate(true);
        setErrors({});
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 9, mb: 4 }}>
            <Typography variant="h4" fontWeight="800" color="primary" mb={4}>
                Áreas Municipales
            </Typography>

            <ConfirmDialog open={openConfirm} onClose={(v) => {
                setOpenConfirm(false);
                v && api.delete(`${URI}/areas/${idToDelete}`).then(getAreas);
            }} />

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card sx={{ borderRadius: 3, border: '1px solid var(--mui-palette-divider)' }}>
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={2} gap={1}>
                                <AddLocationAltIcon color="primary" />
                                <Typography variant="h6" fontWeight="700">
                                    {isUpdate ? 'Editar Área' : 'Nueva Área'}
                                </Typography>
                            </Box>
                            <Divider sx={{ mb: 3 }} />
                            <Box component="form" onSubmit={handleSubmit}>
                                <Stack spacing={2.5}>
                                    <TextField 
                                        label="Nombre de la Oficina" 
                                        required 
                                        value={form.area} 
                                        onChange={(e) => setForm({...form, area: e.target.value})}
                                        error={!!errors.area}
                                        helperText={errors.area}
                                        fullWidth 
                                        size="small" 
                                    />
                                    <TextField 
                                        label="Responsable a Cargo" 
                                        required 
                                        value={form.responsable} 
                                        onChange={(e) => setForm({...form, responsable: e.target.value})}
                                        error={!!errors.responsable}
                                        helperText={errors.responsable}
                                        fullWidth 
                                        size="small" 
                                    />
                                    <Button type="submit" variant="contained" fullWidth startIcon={<SaveOutlinedIcon />} sx={{ py: 1.2, borderRadius: 2 }}>
                                        {isUpdate ? 'Actualizar Área' : 'Guardar Área'}
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
                                <Grid size={{ xs: 12, sm: 5 }}>
                                    <TextField label="Buscar Oficina" value={filters.area} onChange={(e) => setFilters({...filters, area: e.target.value})} fullWidth size="small" />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 5 }}>
                                    <TextField label="Buscar Responsable" value={filters.responsable} onChange={(e) => setFilters({...filters, responsable: e.target.value})} fullWidth size="small" />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 2 }}>
                                    <Button variant="outlined" color="secondary" startIcon={<ClearAllIcon />} onClick={() => setFilters({area: '', responsable: ''})} fullWidth sx={{ borderRadius: 2 }}>
                                        Reset
                                    </Button>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>

                    <Paper sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid var(--mui-palette-divider)' }}>
                        <TableContainer sx={{ maxHeight: '60vh' }}>
                            <Table stickyHeader size="small">
                                <TableHead>
                                    <TableRow>
                                        <StyledTableCell>Área / Oficina</StyledTableCell>
                                        <StyledTableCell>Responsable</StyledTableCell>
                                        <StyledTableCell align='center'>Acciones</StyledTableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredAreas.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                                        <StyledTableRow key={row.id} hover>
                                            <StyledTableCell sx={{ fontWeight: 700 }}>{row.area}</StyledTableCell>
                                            <StyledTableCell>{row.responsable}</StyledTableCell>
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
                            count={filteredAreas.length}
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
