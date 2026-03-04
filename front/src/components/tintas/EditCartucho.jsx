import React, { useState, useEffect, useCallback } from 'react';
import { URI } from '../../config';
import axios from 'axios';
import { useNavigate, useParams } from "react-router-dom";
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import CartuchoForm from './CartuchoForm'; // Importar el componente de formulario reutilizable


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
            const res = await axios.get(`${URI}/insumos-granel`);
            setInsumosGranel(res.data);
        } catch (err) {
            console.error("Error al obtener insumos a granel:", err);
            setError(prev => `${prev} Error al cargar los insumos a granel.`);
        }
    }, []);

    const getCartuchoById = useCallback(async () => {
        try {
            const res = await axios.get(`${URI}/tintas/cartuchos/${id}`);
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
            console.error("Error al obtener insumo por ID:", err.response ? err.response.data : err);
            setError(err.response?.data?.message || "Error al cargar el insumo.");
        }
    }, [id]);

    // useEffect para cargar todos los datos necesarios al montar el componente
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setError('');
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
        setError('');

        const { modelo, color, esRecargable, selectedInsumoGranelId } = cartuchoData;

        if (!modelo.trim() || !color.trim()) {
            setError('El modelo y el color son campos obligatorios.');
            return;
        }

        if (esRecargable && !selectedInsumoGranelId) {
            setError('Debe seleccionar un insumo a granel si el cartucho es recargable.');
            return;
        }

        try {
            await axios.put(`${URI}/tintas/cartuchos/${id}`, {
                modelo: cartuchoData.modelo.trim(),
                sku: cartuchoData.sku.trim(),
                color: cartuchoData.color.trim(),
                tipo: cartuchoData.tipo,
                stock_minimo_unidades: parseInt(cartuchoData.stockMinimoUnidades),
                es_recargable: cartuchoData.esRecargable,
                insumo_granel_id: cartuchoData.esRecargable ? cartuchoData.selectedInsumoGranelId : null
            });
            navigate('/tintas/cartuchos');
        } catch (err) {
            console.error("Error al actualizar insumo:", err.response ? err.response.data : err);
            setError(err.response?.data?.message || "Error al actualizar el insumo.");
        }
    };

    if (loading) {
        return <Typography sx={{ mt: 12, textAlign: 'center' }}>Cargando datos del insumo...</Typography>;
    }

    return (
        <Container component="main" maxWidth="md" sx={{ mt: 10 }}>
            <Typography component="h1" variant="h5" sx={{ mb: 4, textAlign: 'center' }}>
                Editar Insumo
            </Typography>
            <CartuchoForm
                cartuchoData={cartuchoData}
                onDataChange={handleDataChange}
                onSubmit={handleSubmit}
                error={error}
                insumosGranel={insumosGranel}
                isEditMode={true}
                onNavigateBack={() => navigate('/tintas/cartuchos')}
            />
        </Container>
    );
};