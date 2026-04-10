import api, { URI, showLoading, showSuccess, showError } from '../../config.js';
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { Typography, Container, Paper, Box, Divider, CircularProgress } from '@mui/material';
import EditNoteIcon from '@mui/icons-material/EditNote';
import CartuchoForm from './CartuchoForm';

export const EditCartucho = () => {
    const [cartuchoData, setCartuchoData] = useState({
        modelo: '',
        sku: '',
        color: '',
        tipo: '',
        stockUnidades: 0,
        stockMinimoUnidades: 0,
        esRecargable: false,
        selectedInsumoGranelId: ''
    });
    const [insumosGranel, setInsumosGranel] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();
    const { id } = useParams();

    const fetchInsumosGranel = useCallback(async () => {
        try {
            const res = await api.get(`${URI}/insumos-granel`);
            setInsumosGranel(res.data);
        } catch (err) {
            console.error("Error granel:", err);
        }
    }, []);

    const getCartuchoById = useCallback(async () => {
        try {
            const res = await api.get(`${URI}/tintas/cartuchos/${id}`);
            setCartuchoData({
                modelo: res.data.modelo,
                sku: res.data.sku || '',
                color: res.data.color,
                tipo: res.data.tipo,
                stockUnidades: res.data.stock_unidades,
                stockMinimoUnidades: res.data.stock_minimo_unidades,
                esRecargable: res.data.es_recargable,
                selectedInsumoGranelId: res.data.insumo_granel_id || ''
            });
        } catch (err) {
            setError("Error al cargar el insumo.");
        }
    }, [id]);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await Promise.all([getCartuchoById(), fetchInsumosGranel()]);
            setLoading(false);
        };
        loadData();
    }, [getCartuchoById, fetchInsumosGranel]);

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

        showLoading('Actualizando insumo...');

        try {
            await api.put(`${URI}/tintas/cartuchos/${id}`, {
                modelo: cartuchoData.modelo.trim(),
                sku: cartuchoData.sku.trim() || null,
                color: cartuchoData.color.trim(),
                tipo: cartuchoData.tipo,
                stock_minimo_unidades: parseInt(cartuchoData.stockMinimoUnidades) || 0,
                es_recargable: cartuchoData.esRecargable,
                insumo_granel_id: cartuchoData.esRecargable ? cartuchoData.selectedInsumoGranelId : null
            });
            showSuccess('¡Actualizado!', 'Los cambios se guardaron correctamente.');
            navigate('/tintas/cartuchos');
        } catch (err) {
            showError('Error', err.response?.data?.message || "No se pudo actualizar el insumo.");
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="md" sx={{ mt: 9, mb: 4 }}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid var(--mui-palette-divider)' }}>
                <Box display="flex" alignItems="center" mb={3} gap={2}>
                    <EditNoteIcon color="primary" fontSize="large" />
                    <Typography variant="h4" fontWeight="700" color="primary">
                        Editar Insumo
                    </Typography>
                </Box>
                <Divider sx={{ mb: 4 }} />
                <CartuchoForm
                    cartuchoData={cartuchoData}
                    onDataChange={handleDataChange}
                    onSubmit={handleSubmit}
                    error={error}
                    insumosGranel={insumosGranel}
                    isEditMode={true}
                    onNavigateBack={() => navigate('/tintas/cartuchos')}
                />
            </Paper>
        </Container>
    );
};
