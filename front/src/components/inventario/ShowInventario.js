import api, { URI } from '../../config.js';
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from 'react';
import {
    MaterialReactTable,
    useMaterialReactTable,
} from 'material-react-table';
import { MRT_Localization_ES } from 'material-react-table/locales/es';

import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';
import Button from '@mui/material/Button';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import Container from '@mui/material/Container';
import ConfirmDialog from '../dialogs/ShowConfirm'
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';

import ActaEntrega from '../../pdf/ActaEntrega';
import Auditoria from '../../pdf/Auditoria';
import ActaDevolucion from '../../pdf/ActaDevolucion';

const ShowInventario = () => {
    const [open, setOpen] = useState(false);
    const [id, setId] = useState('');
    const [inventario, setInventario] = useState([]);
    const [rowSelection, setRowSelection] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        getInventario();
    }, []);

    const getInventario = async () => {
        try {
            const res = await api.get(`${URI}/inventario/`);
            setInventario(res.data);
        } catch (error) {
            console.error("Error cargando inventario:", error);
        }
    };

    const deleteInv = async () => {
        await api.delete(`${URI}/inventario/${id}`);
        getInventario();
    };

    const handleClickOpen = (id) => {
        setOpen(true);
        setId(id);
    };

    const handleClose = (value) => {
        setOpen(false);
        if (value) deleteInv();
    };

    // Definición de Columnas Inteligentes
    const columns = useMemo(
        () => [
            {
                accessorKey: 'num_inventario',
                header: 'Inv. Nº',
                size: 100,
                Cell: ({ cell }) => <strong>{cell.getValue()}</strong>,
            },
            {
                accessorKey: 'num_pc',
                header: 'PC',
                size: 80,
            },
            {
                accessorKey: 'tipo',
                header: 'Tipo',
                filterVariant: 'multi-select', // Filtro inteligente de selección múltiple
            },
            {
                accessorKey: 'descripcion',
                header: 'Descripción',
            },
            {
                accessorKey: 'marca',
                header: 'Marca',
            },
            {
                accessorKey: 'num_serie',
                header: 'Nº Serie',
            },
            {
                accessorKey: 'area',
                header: 'Área',
                filterVariant: 'multi-select',
            },
            {
                accessorKey: 'usuario',
                header: 'Usuario',
            },
            {
                accessorKey: 'estado',
                header: 'Estado',
                filterVariant: 'select',
                Cell: ({ cell }) => {
                    const est = cell.getValue()?.toLowerCase() || '';
                    let bgcolor = 'grey.500';
                    if (est.includes('nuevo') || est.includes('bueno')) bgcolor = 'success.light';
                    else if (est.includes('utilizado') || est.includes('regular')) bgcolor = 'warning.main';
                    else if (est.includes('baja') || est.includes('malo')) bgcolor = 'error.main';

                    return (
                        <Box sx={{
                            bgcolor,
                            color: 'white',
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 1,
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            display: 'inline-block',
                            minWidth: 80,
                            textAlign: 'center',
                            textTransform: 'capitalize'
                        }}>
                            {cell.getValue()}
                        </Box>
                    );
                },
            },
        ],
        [],
    );

    // Obtener las filas seleccionadas para los PDFs
    const selectedRowsData = useMemo(() => {
        return inventario.filter((_, index) => rowSelection[index]);
    }, [rowSelection, inventario]);

    const table = useMaterialReactTable({
        columns,
        data: inventario,
        enableColumnOrdering: true,
        enableGlobalFilter: true, // Búsqueda inteligente activada
        enableGrouping: true,     // Permite agrupar por columnas
        enableRowSelection: true,  // Selección de filas
        enableRowActions: true,    // Columna de acciones (Editar/Borrar)
        positionActionsColumn: 'last',
        localization: MRT_Localization_ES, // Idioma español
        onRowSelectionChange: setRowSelection,
        state: { rowSelection },
        renderRowActions: ({ row }) => (
            <Stack direction="row" spacing={0.5}>
                <Tooltip title="Editar">
                    <IconButton
                        size="small"
                        color="success"
                        onClick={() => navigate(`/edit/${row.original.id}`)}
                    >
                        <EditIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Eliminar">
                    <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleClickOpen(row.original.id)}
                    >
                        <DeleteForeverIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            </Stack>
        ),
        renderTopToolbarCustomActions: () => (
            <Box sx={{ display: 'flex', gap: '1rem', p: '4px' }}>
                <Button
                    variant="contained"
                    onClick={() => navigate('/inventario/create')}
                    startIcon={<AddCircleOutlineIcon />}
                >
                    Nuevo Item
                </Button>
            </Box>
        ),
        muiTablePaperProps: {
            elevation: 2,
            sx: { borderRadius: '12px', overflow: 'hidden' },
        },
        initialState: {
            density: 'compact', // Vista compacta por defecto
            pagination: { pageSize: 10, pageIndex: 0 },
        },
    });

    return (
        <Container maxWidth="xl" sx={{ mt: 11, mb: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" fontWeight="bold" color="primary">
                    Inventario Inteligente
                </Typography>
            </Box>

            <ConfirmDialog open={open} onClose={handleClose} />

            <MaterialReactTable table={table} />

            <Box mt={3} display="flex" gap={2} flexWrap="wrap">
                <Button
                    variant="contained"
                    color="error"
                    disabled={selectedRowsData.length === 0}
                    onClick={() => ActaEntrega(selectedRowsData)}
                    startIcon={<PictureAsPdfIcon />}
                >
                    Acta Entrega ({selectedRowsData.length})
                </Button>
                <Button
                    variant="contained"
                    color="error"
                    disabled={selectedRowsData.length === 0}
                    onClick={() => ActaDevolucion(selectedRowsData)}
                    startIcon={<PictureAsPdfIcon />}
                >
                    Acta Devolución ({selectedRowsData.length})
                </Button>
                <Button
                    variant="contained"
                    color="error"
                    disabled={inventario.length === 0}
                    onClick={() => Auditoria(table.getFilteredRowModel().rows.map(r => r.original))}
                    startIcon={<PictureAsPdfIcon />}
                >
                    Auditoría (Filtrados)
                </Button>
            </Box>
        </Container>
    );
}

export default ShowInventario;
