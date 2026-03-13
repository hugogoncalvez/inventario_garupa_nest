import React from 'react';
import { 
    TextField, Button, MenuItem, FormControlLabel, Checkbox, 
    FormGroup, Grid2 as Grid, Typography, Box, Stack, Divider 
} from '@mui/material';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const CartuchoForm = ({
    cartuchoData,
    onDataChange,
    onSubmit,
    error,
    insumosGranel,
    isEditMode = false,
    onNavigateBack
}) => {

    const {
        modelo = '',
        sku = '',
        color = '',
        tipo = 'Tinta',
        stockMinimoUnidades = 0,
        esRecargable = false,
        selectedInsumoGranelId = '',
        stockUnidades = 0
    } = cartuchoData;

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        const finalValue = type === 'checkbox' ? checked : value;
        onDataChange(name, finalValue);

        if (name === 'esRecargable' && !checked) {
            onDataChange('selectedInsumoGranelId', '');
        }
    };
    
    return (
        <Box component="form" noValidate onSubmit={onSubmit}>
            <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                        name="modelo"
                        required
                        fullWidth
                        label="Modelo"
                        value={modelo}
                        onChange={handleInputChange}
                        error={!!error && !modelo.trim()}
                        size="small"
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                        name="sku"
                        fullWidth
                        label="SKU / Código Único"
                        value={sku || ''}
                        onChange={handleInputChange}
                        size="small"
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                        name="color"
                        required
                        fullWidth
                        label="Color"
                        value={color}
                        onChange={handleInputChange}
                        error={!!error && !color.trim()}
                        size="small"
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                        select
                        name="tipo"
                        required
                        fullWidth
                        label="Tipo de Insumo"
                        value={tipo}
                        onChange={handleInputChange}
                        size="small"
                    >
                        <MenuItem value="Tinta">Tinta</MenuItem>
                        <MenuItem value="Toner">Toner</MenuItem>
                        <MenuItem value="Drum">Drum</MenuItem>
                    </TextField>
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex', alignItems: 'center' }}>
                    <FormGroup>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={esRecargable}
                                    onChange={handleInputChange}
                                    name="esRecargable"
                                    color="primary"
                                />
                            }
                            label={<Typography variant="body2" fontWeight="600">Este insumo es recargable</Typography>}
                        />
                    </FormGroup>
                </Grid>

                {esRecargable && (
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            select
                            name="selectedInsumoGranelId"
                            required
                            fullWidth
                            label="Insumo a Granel Asociado"
                            value={selectedInsumoGranelId || ''}
                            onChange={handleInputChange}
                            size="small"
                            helperText="Indique qué polvo/tinta usa para recargar"
                        >
                            <MenuItem value=""><em>Ninguno</em></MenuItem>
                            {insumosGranel.map((insumo) => (
                                <MenuItem key={insumo.id} value={insumo.id}>
                                    {`${insumo.nombre} (${insumo.unidad_medida})`}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                )}

                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                        name="stockMinimoUnidades"
                        label="Alerta Stock Mínimo"
                        type="number"
                        fullWidth
                        value={stockMinimoUnidades}
                        onChange={handleInputChange}
                        slotProps={{ input: { min: 0 } }}
                        size="small"
                    />
                </Grid>

                {isEditMode && (
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            name="stockUnidades"
                            label="Stock Actual (Informativo)"
                            type="number"
                            fullWidth
                            value={stockUnidades}
                            disabled
                            size="small"
                            sx={{ bgcolor: 'var(--mui-palette-action-hover)' }}
                        />
                    </Grid>
                )}
                
                {error && (
                    <Grid size={{ xs: 12 }}>
                        <Typography color="error" variant="caption" sx={{ fontWeight: 600 }}>
                            ⚠️ {error}
                        </Typography>
                    </Grid>
                )}

                <Grid size={{ xs: 12 }}>
                    <Divider sx={{ my: 2 }} />
                    <Stack direction="row" spacing={2} justifyContent="flex-end">
                        <Button
                            variant="outlined"
                            color="error"
                            onClick={onNavigateBack}
                            startIcon={<ArrowBackIcon />}
                            sx={{ borderRadius: 2 }}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            size="large"
                            startIcon={<SaveOutlinedIcon />}
                            sx={{ borderRadius: 2, px: 4, fontWeight: 700 }}
                        >
                            {isEditMode ? 'Actualizar Registro' : 'Guardar Nuevo Insumo'}
                        </Button>
                    </Stack>
                </Grid>
            </Grid>
        </Box>
    );
};

export default CartuchoForm;
