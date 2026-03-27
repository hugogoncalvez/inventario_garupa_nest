import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container, Grid, Paper, Typography, Box, Card, CardContent,
    CircularProgress, useTheme, Divider, Stack, CardActionArea
} from '@mui/material';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, LabelList
} from 'recharts';
import api, { URI } from '../config.js';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import AssignmentIcon from '@mui/icons-material/Assignment';
import InventoryIcon from '@mui/icons-material/Inventory';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1'];

const KpiCard = ({ title, value, icon, color, onClick }) => (
    <Card
        sx={{
            height: '100%',
            borderRadius: 4,
            borderLeft: `6px solid ${color}`,
            boxShadow: 'var(--mui-shadows-2)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: 'var(--mui-shadows-10)',
            }
        }}
    >
        <CardActionArea onClick={onClick} sx={{ height: '100%', p: 1 }}>
            <CardContent>
                <Typography color="text.secondary" variant="overline" fontWeight="700" sx={{ letterSpacing: 1.2, mb: 1, display: 'block' }}>
                    {title}
                </Typography>
                <Box display="flex" justifyContent="space-between" alignItems="flex-end">
                    <Typography variant="h3" fontWeight="900" sx={{ lineHeight: 1 }}>
                        {value}
                    </Typography>
                    <Box sx={{
                        p: 1.5,
                        borderRadius: 3,
                        bgcolor: `${color}15`,
                        color: color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: -0.5
                    }}>
                        {React.cloneElement(icon, { sx: { fontSize: 48 } })}
                    </Box>
                </Box>
                <Box display="flex" alignItems="center" mt={3} sx={{ opacity: 0.7 }}>
                    <Typography variant="caption" fontWeight="700" sx={{ mr: 0.5, textTransform: 'uppercase' }}>
                        Ver detalles
                    </Typography>
                    <ArrowForwardIosIcon sx={{ fontSize: 10, fontWeight: 800 }} />
                </Box>
            </CardContent>
        </CardActionArea>
    </Card>
);

const Dashboard = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get(`${URI}/dashboard/stats`);
                setData(res.data);
            } catch (error) {
                console.error("Error al cargar estadísticas:", error);
            } finally {
                setLoading(false);
                // Pequeño delay para asegurar que el DOM de MUI esté estable
                setTimeout(() => setIsMounted(true), 150);
            }
        };
        fetchStats();

        // Wake-up Ping silencioso al bot de WhatsApp
        fetch('https://inventario-whatsapp-bot.onrender.com/health').catch(() => null);
    }, []);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
                <CircularProgress size={60} thickness={4} />
            </Box>
        );
    }

    if (!data) return <Typography>Error al cargar datos del dashboard.</Typography>;

    return (
        <Container maxWidth="xl" sx={{ mt: 6, mb: 4 }}>
            <Typography variant="h4" fontWeight="800" color="primary" mb={4}>
                Panel de Control
            </Typography>

            {/* KPIs */}
            <Grid container spacing={3} mb={4} justifyContent="center">
                <Grid item xs={12} sm={6} md={3}>
                    <KpiCard
                        title="Stock Crítico"
                        value={data.kpis.stockCritico}
                        icon={<ErrorOutlineIcon />}
                        color={theme.palette.error.main}
                        onClick={() => navigate('/tintas/cartuchos', { state: { filtroStock: 'Bajo' } })}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <KpiCard
                        title="Órdenes Activas"
                        value={data.kpis.ordenesActivas}
                        icon={<AssignmentIcon />}
                        color={theme.palette.warning.main}
                        onClick={() => navigate('/ordenes', { state: { filtroEstado: 'Activas' } })}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <KpiCard
                        title="Insumos Totales"
                        value={data.kpis.totalInsumos}
                        icon={<InventoryIcon />}
                        color={theme.palette.primary.main}
                        onClick={() => navigate('/tintas/cartuchos')}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <KpiCard
                        title="Entregas del Mes"
                        value={data.kpis.consumoMensual}
                        icon={<ShowChartIcon />}
                        color={theme.palette.success.main}
                        onClick={() => navigate('/tintas/reportes')}
                    />
                </Grid>
            </Grid>

            {/* Gráficos */}
            <Grid container spacing={3} justifyContent="center">
                {/* Top Insumos */}
                <Grid item xs={12} md={7}>
                    <Paper sx={{ p: 3, borderRadius: 3, height: { xs: 350, md: 420 }, display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="h6" fontWeight="700" mb={3}>
                            🏆 Top 5 Insumos más Usados (Total Entregas)
                        </Typography>
                        <Box sx={{ height: { xs: 270, md: 340 } }}>
                            {isMounted && (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data.topInsumos} layout="vertical" margin={{ left: 40, right: 40 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                        <XAxis type="number" hide />
                                        <YAxis
                                            dataKey="name"
                                            type="category"
                                            width={120}
                                            tick={{ fontSize: 12, fontWeight: 600 }}
                                        />
                                        <Tooltip
                                            contentStyle={{ borderRadius: 8, border: 'none', boxShadow: 'var(--mui-shadows-4)' }}
                                        />
                                        <Bar dataKey="total" radius={[0, 4, 4, 0]}>
                                            {data.topInsumos.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                            <LabelList dataKey="total" position="right" style={{ fontSize: 12, fontWeight: 700 }} />
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </Box>
                    </Paper>
                </Grid>

                {/* Estado de Órdenes */}
                <Grid item xs={12} md={5}>
                    <Paper sx={{ p: 3, borderRadius: 3, height: { xs: 350, md: 420 }, display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="h6" fontWeight="700" mb={1}>
                            📊 Estado de Órdenes Técnicas
                        </Typography>
                        <Box sx={{ height: { xs: 270, md: 340 } }}>
                            {isMounted && (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={data.orderStats}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {data.orderStats.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend verticalAlign="bottom" height={36} />
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                        </Box>
                    </Paper>
                </Grid>

                {/* Consumo por Área */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 3, borderRadius: 3, height: { xs: 350, md: 420 }, display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="h6" fontWeight="700" mb={2}>
                            🏢 Áreas con Mayor Consumo de Insumos
                        </Typography>
                        <Box sx={{ height: { xs: 270, md: 340 } }}>
                            {isMounted && (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data.consumoPorArea} margin={{ bottom: 30, left: 10, right: 10 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis
                                            dataKey="name"
                                            tick={{ fontSize: 11, fontWeight: 700 }}
                                            interval={0}
                                            angle={-10}
                                            textAnchor="end"
                                        />
                                        <YAxis />
                                        <Tooltip
                                            cursor={{ fill: 'transparent' }}
                                            contentStyle={{ borderRadius: 8, border: 'none', boxShadow: 'var(--mui-shadows-4)' }}
                                        />
                                        <Bar dataKey="value" name="Entregas" radius={[4, 4, 0, 0]}>
                                            {data.consumoPorArea.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                            <LabelList dataKey="value" position="top" style={{ fontSize: 12, fontWeight: 800 }} />
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Dashboard;
