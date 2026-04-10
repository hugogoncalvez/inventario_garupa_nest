import api, { URI, showLoading, showSuccess, showError } from '../../config.js';
import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { Typography, Container, Paper, Box, Divider } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CartuchoForm from './CartuchoForm';

export const CreateCartucho = () => {
    const [cartuchoData, setCartuchoData] = useState({
        modelo: '',
        sku: '',
        color: '',
        tipo: 'Tinta',
        stockMinimoUnidades: 0,
        esRecargable: false,
        selectedInsumoGranelId: ''
    });
    const [insumosGranel, setInsumosGranel] = useState([]);
    const [error, setError] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        const fetchInsumosGranel = async () => {
            try {
                const res = await api.get(`${URI}/insumos-granel`);
                setInsumosGranel(res.data);
            } catch (err) {
                console.error("Error al cargar los insumos a granel.");
            }
        };
        fetchInsumosGranel();
    }, []);

    const handleDataChange = (name, value) => {
        setCartuchoData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const { modelo, color, esRecargable, selectedInsumoGranelId } = cartuchoData;

        if (!modelo.trim() || !color.trim()) {
            showError('Datos incompletos', 'El modelo y el color son obligatorios.');
            return;
        }

        if (esRecargable && !selectedInsumoGranelId) {
            showError('Insumo faltante', 'Seleccione un insumo a granel para la recarga.');
            return;
        }

        showLoading('Registrando nuevo insumo...');

        try {
            await api.post(`${URI}/tintas/cartuchos`, {
                modelo: cartuchoData.modelo.trim(),
                sku: cartuchoData.sku.trim() || null,
                color: cartuchoData.color.trim(),
                tipo: cartuchoData.tipo,
                stock_unidades: 0,
                stock_minimo_unidades: parseInt(cartuchoData.stockMinimoUnidades) || 0,
                es_recargable: cartuchoData.esRecargable,
                insumo_granel_id: cartuchoData.esRecargable ? cartuchoData.selectedInsumoGranelId : null
            });
            showSuccess('¡Creado!', 'El insumo se registró correctamente.');
            navigate('/tintas/cartuchos');
        } catch (err) {
            showError('Error', err.response?.data?.message || "No se pudo registrar el insumo.");
        }
    };

    return (
        <Container maxWidth="md" sx={{ mt: 9, mb: 4 }}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid var(--mui-palette-divider)' }}>
                <Box display="flex" alignItems="center" mb={3} gap={2}>
                    <AddCircleOutlineIcon color="primary" fontSize="large" />
                    <Typography variant="h4" fontWeight="700" color="primary">
                        Nuevo Insumo / Cartucho
                    </Typography>
                </Box>
                <Divider sx={{ mb: 4 }} />
                <CartuchoForm
                    cartuchoData={cartuchoData}
                    onDataChange={handleDataChange}
                    onSubmit={handleSubmit}
                    error={error}
                    insumosGranel={insumosGranel}
                    isEditMode={false}
                    onNavigateBack={() => navigate('/tintas/cartuchos')}
                />
            </Paper>
        </Container>
    );
};
