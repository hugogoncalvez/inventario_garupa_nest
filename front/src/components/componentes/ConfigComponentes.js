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
import DevicesIcon from '@mui/icons-material/Devices';
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

export const ConfigComponentes = () => {
    const [tipos, setTipos] = useState([]);
    const [form, setForm] = useState({ id: '', tipo: '' });
    const [isUpdate, setIsUpdate] = useState(false);
    const [errors, setErrors] = useState({});
    const [openConfirm, setOpenConfirm] = useState(false);
    const [idToDelete, setIdToDelete] = useState('');
    
    const [filter, setFilter] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const getTipos = useCallback(async () => {
        try {
            const res = await api.get(`${URI}/tipos`);
            setTipos(res.data);
        } catch (error) {
            console.error("Error al obtener los tipos:", error);
        }
    }, []);

    useEffect(() => {
        getTipos();
    }, [getTipos]);

    const filteredTipos = useMemo(() => {
        return tipos.filter(t => 
            (filter === '' || (t.tipo && t.tipo.toLowerCase().includes(filter.toLowerCase())))
        );
    }, [tipos, filter]);

    const validate = () => {
        const newErrors = {};
        if (!form.tipo.trim()) newErrors.tipo = "Requerido";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            if (isUpdate) {
                await api.put(`${URI}/tipos/${form.id}`, form);
            } else {
                await api.post(`${URI}/tipos/create`, form);
            }
            clearForm();
            getTipos();
        } catch (error) {
            console.error("Error al guardar:", error);
        }
    };

    const clearForm = () => {
        setForm({ id: '', tipo: '' });
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
                Tipos de Equipamiento
            </Typography>

            <ConfirmDialog open={openConfirm} onClose={(v) => {
                setOpenConfirm(false);
                v && api.delete(`${URI}/tipos/${idToDelete}`).then(getTipos);
            }} />

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card sx={{ borderRadius: 3, border: '1px solid var(--mui-palette-divider)' }}>
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={2} gap={1}>
                                <DevicesIcon color="primary" />
                                <Typography variant="h6" fontWeight="700">
                                    {isUpdate ? 'Editar Tipo' : 'Nuevo Tipo'}
                                </Typography>
                            </Box>
                            <Divider sx={{ mb: 3 }} />
                            <Box component="form" onSubmit={handleSubmit}>
                                <Stack spacing={2.5}>
                                    <TextField 
                                        label="Nombre del Componente" 
                                        required 
                                        value={form.tipo} 
                                        onChange={(e) => setForm({...form, tipo: e.target.value})}
                                        error={!!errors.tipo}
                                        helperText={errors.tipo}
                                        fullWidth 
                                        size="small" 
                                    />
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
                                <Typography variant="subtitle2" fontWeight="700">Filtrar Listado</Typography>
                            </Box>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, sm: 10 }}>
                                    <TextField label="Buscar por nombre..." value={filter} onChange={(e) => setFilter(e.target.value)} fullWidth size="small" />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 2 }}>
                                    <Button variant="outlined" color="secondary" startIcon={<ClearAllIcon />} onClick={() => setFilter('')} fullWidth sx={{ borderRadius: 2 }}>
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
                                        <StyledTableCell>Descripción del Tipo</StyledTableCell>
                                        <StyledTableCell align='center'>Acciones</StyledTableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredTipos.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                                        <StyledTableRow key={row.id} hover>
                                            <StyledTableCell sx={{ fontWeight: 700 }}>{row.tipo}</StyledTableCell>
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
                            count={filteredTipos.length}
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
