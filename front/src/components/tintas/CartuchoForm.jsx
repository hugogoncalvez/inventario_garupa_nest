import React from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import MenuItem from '@mui/material/MenuItem';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import FormGroup from '@mui/material/FormGroup';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const CartuchoForm = ({
    cartuchoData,
    onDataChange,
    onSubmit,
    error,
    insumosGranel,
    isEditMode = false,
    onNavigateBack // Prop para el botón de volver en modo edición
}) => {

    const {
        modelo = '',
        sku = '',
        color = '',
        tipo = 'Tinta',
        stockMinimoUnidades = 0,
        esRecargable = false,
        selectedInsumoGranelId = '',
        stockUnidades = 0 // Solo para modo edición
    } = cartuchoData;

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        const finalValue = type === 'checkbox' ? checked : value;
        onDataChange(name, finalValue);

        // Si se desmarca 'esRecargable', limpiar el insumo a granel seleccionado
        if (name === 'esRecargable' && !checked) {
            onDataChange('selectedInsumoGranelId', '');
        }
    };
    
    return (
        <Grid container component="form" noValidate onSubmit={onSubmit} spacing={2} justifyContent="center" sx={{ mt: 2 }}>
            <Grid item xs={12} sm={6} md={4} sx={{ width: 'clamp(250px, 40ch, 500px)', m: 1 }}>
                <TextField
                    name="modelo"
                    required
                    fullWidth
                    id="modelo-input"
                    label="Modelo"
                    value={modelo}
                    onChange={handleInputChange}
                    error={!!error && !modelo.trim()}
                    helperText={(!!error && !modelo.trim()) ? error : 'Ingrese el modelo del insumo'}
                />
            </Grid>
            <Grid item xs={12} sm={6} md={4} sx={{ width: 'clamp(250px, 40ch, 500px)', m: 1 }}>
                <TextField
                    name="sku"
                    fullWidth
                    id="sku-input"
                    label="SKU / Código"
                    value={sku || ''} // Asegurarse de que no sea null
                    onChange={handleInputChange}
                    helperText='Ingrese el SKU o código único (opcional)'
                />
            </Grid>
            <Grid item xs={12} sm={6} md={4} sx={{ width: 'clamp(250px, 40ch, 500px)', m: 1 }}>
                <TextField
                    name="color"
                    required
                    fullWidth
                    id="color-input"
                    label="Color"
                    value={color}
                    onChange={handleInputChange}
                    error={!!error && !color.trim()}
                    helperText={(!!error && !color.trim()) ? error : 'Ingrese el color del insumo'}
                />
            </Grid>
            <Grid item xs={12} sm={6} md={4} sx={{ width: 'clamp(250px, 40ch, 500px)', m: 1 }}>
                <TextField
                    select
                    name="tipo"
                    required
                    fullWidth
                    id="tipo-select"
                    label="Tipo"
                    value={tipo}
                    onChange={handleInputChange}
                    helperText='Seleccione el tipo de insumo'
                >
                    <MenuItem value="Tinta">Tinta</MenuItem>
                    <MenuItem value="Toner">Toner</MenuItem>
                    <MenuItem value="Drum">Drum</MenuItem>
                </TextField>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4} sx={{ width: 'clamp(250px, 40ch, 500px)', m: 1 }}>
                <FormGroup>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={esRecargable}
                                onChange={handleInputChange}
                                name="esRecargable"
                            />
                        }
                        label="Es Recargable"
                    />
                </FormGroup>
            </Grid>

            {esRecargable && (
                <Grid item xs={12} sm={6} md={4} sx={{ width: 'clamp(250px, 40ch, 500px)', m: 1 }}>
                    <TextField
                        select
                        name="selectedInsumoGranelId"
                        required
                        fullWidth
                        id="insumo-granel-select"
                        label="Insumo a Granel Asociado"
                        value={selectedInsumoGranelId || ''} // Asegurarse de que no sea null
                        onChange={handleInputChange}
                        helperText='Seleccione el insumo a granel que utiliza este cartucho recargable'
                    >
                        <MenuItem value="">
                            <em>Ninguno</em>
                        </MenuItem>
                        {insumosGranel.map((insumo) => (
                            <MenuItem key={insumo.id} value={insumo.id}>
                                {`${insumo.nombre} (${insumo.unidad_medida})`}
                            </MenuItem>
                        ))}
                    </TextField>
                </Grid>
            )}

            {isEditMode && (
                 <Grid item xs={12} sm={6} md={4} sx={{ width: 'clamp(250px, 40ch, 500px)', m: 1 }}>
                    <TextField
                        name="stockUnidades"
                        id="stock-unidades-input"
                        label="Stock Actual de Unidades"
                        type="number"
                        fullWidth
                        value={stockUnidades}
                        InputProps={{ readOnly: true }}
                        helperText='Stock actual (no editable desde aquí)'
                        sx={{ '& .MuiInputBase-input.Mui-disabled': { WebkitTextFillColor: 'rgba(0, 0, 0, 0.87)' } }}
                    />
                </Grid>
            )}

            <Grid item xs={12} sm={6} md={4} sx={{ width: 'clamp(250px, 40ch, 500px)', m: 1 }}>
                <TextField
                    name="stockMinimoUnidades"
                    id="stock-minimo-unidades-input"
                    label="Stock Mínimo de Unidades"
                    type="number"
                    fullWidth
                    value={stockMinimoUnidades}
                    onChange={handleInputChange}
                    inputProps={{ min: 0 }}
                    helperText='Nivel mínimo de stock para alertas'
                />
            </Grid>
            
            {error && (
                <Grid item xs={12} sx={{ m: 1, width: '100%', textAlign: 'center' }}>
                    <Typography color="error" variant="body2">
                        {error}
                    </Typography>
                </Grid>
            )}

            <Grid item xs={12} sx={{ m: 1, width: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: isEditMode ? 'space-between' : 'center', mt: 3, width: '100%' }}>
                    {isEditMode && (
                        <Button
                            variant="contained"
                            onClick={onNavigateBack}
                            startIcon={<ArrowBackIcon />}
                        >
                            Volver
                        </Button>
                    )}
                    <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        startIcon={<SaveOutlinedIcon />}
                    >
                        {isEditMode ? 'Actualizar Insumo' : 'Guardar Insumo'}
                    </Button>
                </Box>
            </Grid>
        </Grid>
    );
};

export default CartuchoForm;
