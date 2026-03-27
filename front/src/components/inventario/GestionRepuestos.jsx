import api, { URI } from '../../config.js';
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from 'react';
import { styled } from '@mui/material/styles';
import {
    Typography, Table, TableBody, TableCell, tableCellClasses, TableContainer,
    TableHead, TableRow, Paper, Box, IconButton, Button, Tooltip, TextField, 
    MenuItem, FormControl, InputLabel, Select, Container, Card, CardContent, 
    Stack, Chip, TablePagination, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import SettingsInputComponentIcon from '@mui/icons-material/SettingsInputComponent';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import CancelIcon from '@mui/icons-material/Cancel';

// ... (resto de las constantes StyledTableCell y StyledTableRow se mantienen)

const GestionRepuestos = () => {
    // ... (estados previos se mantienen)

    return (
        <Container maxWidth="xl" sx={{ mt: 9, mb: 4 }}>
            {/* ... (Contenido principal de la tabla y filtros se mantiene igual) ... */}

            {/* Modal Creación/Edición Rediseñado */}
            <Dialog 
                open={openModal} 
                onClose={() => setOpenModal(false)} 
                fullWidth 
                maxWidth="sm"
                PaperProps={{
                    sx: { borderRadius: 3, p: 1 }
                }}
            >
                <DialogTitle>
                    <Box display="flex" alignItems="center" gap={2}>
                        <SettingsInputComponentIcon color="primary" sx={{ fontSize: 32 }} />
                        <Typography variant="h5" fontWeight="700" color="primary">
                            {editMode ? 'Editar Repuesto' : 'Nuevo Repuesto'}
                        </Typography>
                    </Box>
                </DialogTitle>
                
                <Divider sx={{ mx: 3, mb: 1 }} />

                <DialogContent>
                    <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
                        <Grid item xs={12}>
                            <FormControl fullWidth size="small">
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
                        <Grid item xs={12} sm={6}>
                            <TextField 
                                label="Marca" 
                                fullWidth 
                                size="small" 
                                value={currentRepuesto.marca} 
                                onChange={(e) => setCurrentRepuesto({...currentRepuesto, marca: e.target.value})} 
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField 
                                label="Modelo" 
                                fullWidth 
                                size="small" 
                                value={currentRepuesto.modelo} 
                                onChange={(e) => setCurrentRepuesto({...currentRepuesto, modelo: e.target.value})} 
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField 
                                label="Descripción" 
                                fullWidth 
                                size="small" 
                                multiline 
                                rows={2} 
                                value={currentRepuesto.descripcion} 
                                onChange={(e) => setCurrentRepuesto({...currentRepuesto, descripcion: e.target.value})} 
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField 
                                label="Stock Actual" 
                                type="number" 
                                fullWidth 
                                size="small" 
                                value={currentRepuesto.stock_actual} 
                                onChange={(e) => setCurrentRepuesto({...currentRepuesto, stock_actual: e.target.value})} 
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField 
                                label="Stock Mínimo" 
                                type="number" 
                                fullWidth 
                                size="small" 
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
                            onClick={() => setOpenModal(false)}
                            startIcon={<CancelIcon />}
                        >
                            Cancelar
                        </Button>
                        <Button 
                            onClick={handleSave} 
                            variant="contained" 
                            color="primary"
                            startIcon={<SaveOutlinedIcon />}
                        >
                            {editMode ? 'Actualizar' : 'Guardar Repuesto'}
                        </Button>
                    </Stack>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default GestionRepuestos;
