import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { url } from '../../../mainurl';
import {
  Box,
  Grid,
  Card,
  Avatar,
  Typography,
  LinearProgress,
  Button,
  Skeleton,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  useTheme,
  ThemeProvider,
  createTheme,
  Paper,
  Stack,
  Chip 
} from '@mui/material';
import {
  LocalAtm,
  Store,
  InsertChart,
  ReceiptLong,
  SupervisorAccount,
  ShowChart,
  PersonAdd,
  Person,
  Cancel,
  Insights,
  EmojiEvents,
  Leaderboard,
  TrendingUp,
  AccountTree,
  BarChart as BarChartIcon,
  MoreVert,
  Refresh,
  AttachMoney,
  
} from '@mui/icons-material';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Legend,
  RadialBarChart,
  RadialBar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { lighten, darken } from '@mui/material/styles';
// import AccountTreeIcon from '@mui/icons-material/AccountTree';

/* A card for high‑level metrics, with a gradient background, icon and optional progress bar */
const MetricCard = ({
  title,
  value,
  subtitle,
  icon,
  color,
  progress,
  progressColor,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  console.log("isDark", isDark);

  // Default color (from prop) or fallback to primary.main
  const baseColor = color || theme.palette.primary.main;

  // In dark mode, override baseColor to a lighter/brighter shade for better contrast
  const adjustedColor = isDark
    ? lighten(baseColor, 0.3) // brighten for dark mode
    : baseColor;

  // Progress bar color fallback
  const adjustedProgressColor = isDark
    ? lighten(progressColor || darken(baseColor, 0.2), 0.3)
    : progressColor || darken(baseColor, 0.2);

  // Gradients for card background
  const gradientStart = lighten(adjustedColor, isDark ? 0.4 : 0.7);
  const gradientEnd = lighten(adjustedColor, isDark ? 0.2 : 0.5);

  return (
    <Card
      sx={{
        p: 2,
        borderRadius: 3,
        background: `linear-gradient(135deg, ${gradientStart}, ${gradientEnd})`,
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        height: '100%',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
          <Typography
            variant="h4"
            sx={{ fontWeight: 700, mt: 0.5, lineHeight: 1.2 }}
          >
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        <Avatar
          sx={{
            bgcolor: darken(adjustedColor, 0.1),
            color: '#fff',
            width: 48,
            height: 48,
          }}
        >
          {icon}
        </Avatar>
      </Box>
      {progress !== undefined && (
        <Box sx={{ mt: 2 }}>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 6,
              borderRadius: 3,
              backgroundColor: lighten(adjustedColor, 0.4),
              '& .MuiLinearProgress-bar': {
                backgroundColor: adjustedProgressColor,
              },
            }}
          />
        </Box>
      )}
    </Card>
  );
};

/* A wrapper for charts/lists: soft gradient background with optional title & icon */
const PanelCard = ({ title, icon, subtitle, children }) => {
  const theme = useTheme();
  return (
    <Card
      sx={{
        p: 2,
        borderRadius: 3,
        background: `linear-gradient(135deg, ${lighten(
          theme.palette.background.paper,
          0.05
        )}, ${lighten(theme.palette.background.paper, 0.1)})`,
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        height: '100%',
      }}
    >
      {(title || icon) && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mb: 2,
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {icon && (
              <Avatar
                sx={{
                  bgcolor: theme.palette.secondary.main,
                  color: '#fff',
                  width: 32,
                  height: 32,
                  mr: 1,
                }}
              >
                {icon}
              </Avatar>
            )}
            <Box>
              {title && (
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {title}
                </Typography>
              )}
              {subtitle && (
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {subtitle}
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      )}
      {children}
    </Card>
  );
};

/* The revamped dashboard */
export default function DashboardNew() {
  const parentTheme = useTheme();
  const currentMode = parentTheme.palette.mode;
  const isDark = parentTheme.palette.mode === 'dark';
  /* Extend the parent theme with softer backgrounds */
  const customTheme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: currentMode,
          background: {
            default: currentMode === 'dark' ? '#0c1625' : '#ffffffff',
            paper: currentMode === 'dark' ? '#112340' : '#FFFFFF',
          },

          primary: {
            light: '#6ec6ff',
            main: '#2196f3',
            dark: '#0069c0',
            contrastText: '#fff',
          },

          secondary: {
            light: '#ff6090',
            main: '#f50057',
            dark: '#ab003c',
            contrastText: '#fff',
          },

          success: {
            light: '#81c784',
            main: '#4caf50',
            dark: '#388e3c',
            contrastText: '#fff',
          },

          warning: {
            light: '#f99d13ff',
            main: '#ffc56eff',
            dark: '#f57c00',
            contrastText: '#fff',
          },

          error: {
            light: '#e57373',
            main: '#f44336',
            dark: '#d32f2f',
            contrastText: '#fff',
          },

          info: {
            light: '#64b5f6',
            main: '#2196f3',
            dark: '#1769aa',
            contrastText: '#fff',
          },
        },
      }),
    [currentMode]
  );


  /* State and data fetching */
  const [authTokens] = useState(() =>
    JSON.parse(localStorage.getItem('authTokens'))
  );
  const tokenStr = authTokens?.access ? String(authTokens.access) : '';
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeChart, setActiveChart] = useState('by_day');
  const [anchorEl, setAnchorEl] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await axios.get(`${url}/auth/dashboard/`, {
        headers: { Authorization: `Bearer ${tokenStr}` },
      });
      setDashboard(res.data);
    } catch (err) {
      setError(true);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  /* Transformations for charts */
  const chartByDay =
    dashboard?.chart_data?.by_day?.map((d) => ({
      name: new Date(d.day).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      count: d.count,
    })) || [];
  const chartByWeek =
    dashboard?.chart_data?.by_week?.map((d) => ({
      name:
        'Wk ' +
        new Date(d.week).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
      count: d.count,
    })) || [];
  const chartByMonth =
    dashboard?.chart_data?.by_month?.map((d) => ({
      name: new Date(d.month).toLocaleDateString('en-US', {
        month: 'short',
        year: '2-digit',
      }),
      count: d.count,
    })) || [];
  const trafficPie = [
    { name: 'Vendors', value: dashboard?.users?.vendors ?? 0 },
    { name: 'Customers', value: dashboard?.users?.customers ?? 0 },
  ];

  /* Progress calculations */
  const subscriptionUsed =
    dashboard?.subscriptions?.total > 0
      ? Math.round(
        100 -
        ((dashboard?.subscriptions?.cancelled ?? 0) /
          (dashboard?.subscriptions?.total || 1)) *
        100
      )
      : 100;
  const orderProgress =
    (dashboard?.orders?.total || 0) > 0
      ? Math.round(
        ((dashboard?.orders?.last_week || 0) /
          (dashboard?.orders?.total || 1)) *
        100
      )
      : 0;
  const vendorProgress =
    (dashboard?.users?.total || 0) > 0
      ? Math.round(
        ((dashboard?.users?.vendors || 0) /
          (dashboard?.users?.total || 1)) *
        100
      )
      : 0;

  /* Additional user stats */
  const totalUsers = dashboard?.users?.total || 0;
  const lastMonthUsers = dashboard?.users?.last_month || 0;
  const activeLastWeekUsers = dashboard?.users?.active_last_week || 0;
  const newVendors = dashboard?.users?.new_vendors_monthly || 0;
  const totalCustomers = dashboard?.users?.customers || 0;
  const usersProgress =
    totalUsers > 0 ? Math.round((lastMonthUsers / totalUsers) * 100) : 0;
  const activeUsersProgress =
    totalUsers > 0
      ? Math.round((activeLastWeekUsers / totalUsers) * 100)
      : 0;
  const newVendorsProgress =
    (dashboard?.users?.vendors || 0) > 0
      ? Math.round(
        (newVendors / (dashboard?.users?.vendors || 1)) * 100
      )
      : 0;
  const customersProgress =
    totalUsers > 0
      ? Math.round((totalCustomers / totalUsers) * 100)
      : 0;

  /* Financial and status charts */
  const revenueChart = [
    {
      name: 'Total',
      Revenue: dashboard?.revenue?.total || 0,
      Commission: dashboard?.commission?.total || 0,
      Subscriptions: dashboard?.subscription_invoice?.total || 0,
    },
    {
      name: 'Last Month',
      Revenue: dashboard?.revenue?.last_month || 0,
      Commission: dashboard?.commission?.last_month || 0,
      Subscriptions: dashboard?.subscription_invoice?.last_month || 0,
    },
    {
      name: 'Last Year',
      Revenue: dashboard?.revenue?.last_year || 0,
      Commission: dashboard?.commission?.last_year || 0,
      Subscriptions: dashboard?.subscription_invoice?.last_year || 0,
    },
  ];
  const statusChart = [
    {
      name: 'Orders',
      Active:
        (dashboard?.orders?.total || 0) -
        (dashboard?.orders?.cancelled || 0),
      Cancelled: dashboard?.orders?.cancelled || 0,
    },
    {
      name: 'Subscriptions',
      Active:
        (dashboard?.subscriptions?.total || 0) -
        (dashboard?.subscriptions?.cancelled || 0),
      Cancelled: dashboard?.subscriptions?.cancelled || 0,
    },
  ];
  const activeValue = (dashboard?.subscriptions?.total || 0) - (dashboard?.subscriptions?.cancelled || 0);
  const cancelledValue = dashboard?.subscriptions?.cancelled || 0;
  /* Loading and error handling */
  if (loading) {
    return (
      <Box
        className="container-fluid py-5"
        sx={{
          background: customTheme.palette.background.default,
          minHeight: '100vh',
        }}
      >
        <Skeleton
          variant="rectangular"
          height={70}
          sx={{ mb: 3, borderRadius: 3 }}
        />
        <Grid container spacing={2}>
          {[...Array(4)].map((_, i) => (
            <Grid item xs={12} md={6} lg={3} key={i}>
              <Skeleton
                variant="rectangular"
                height={120}
                sx={{ borderRadius: 3 }}
              />
            </Grid>
          ))}
        </Grid>
        <Skeleton
          variant="rectangular"
          height={350}
          sx={{ mt: 3, borderRadius: 3 }}
        />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        className="container py-5"
        sx={{ background: customTheme.palette.background.default }}
      >
        <Typography
          variant="h5"
          color="error"
          align="center"
          gutterBottom
        >
          Error loading dashboard data
        </Typography>
        <Box textAlign="center">
          <Button onClick={fetchDashboardData} startIcon={<Refresh />}>
            Retry
          </Button>
        </Box>
      </Box>
    );
  }

  /* The main layout */
  return (
    <ThemeProvider theme={customTheme}>
      <Box
        className="container-fluid py-5"
        sx={{
          minHeight: '100vh',
          background: customTheme.palette.background.default,
        }}
      >
        {/* Header */}
        <Box
          sx={(theme) => ({
            mb: 4,
            p: 3,
            borderRadius: 3,
            background:
              theme.palette.mode === 'dark'
                ? 'linear-gradient(90deg, #002251ff, #9fc9f3ff)' // dark blue gradient for dark mode
                : 'linear-gradient(90deg, #cfeedfff, #198754)', // same static gradient for light mode

            boxShadow: '0 8px 16px rgba(0,0,0,0.05)',
          })}
        >
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Welcome Back!
          </Typography>
          <Typography
            variant="body2"
            sx={{ mt: 0.5, color: 'text.secondary' }}
          >
            Here is your business snapshot with the latest metrics and
            insights.
          </Typography>
        </Box>

        {/* Row 1: Primary metrics */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} lg={3}>
            <MetricCard
              title="Total Revenue"
              value={
                dashboard?.revenue?.total !== undefined
                  ? `USD ${dashboard?.revenue?.total}`
                  : '-'
              }
              subtitle={
                dashboard?.revenue?.last_month !== undefined
                  ? `Last Month: USD ${dashboard?.revenue?.last_month}`
                  : ''
              }
              icon={<LocalAtm />}
              color={isDark ? '#023862ff' : '#90caf9'}
              progress={
                (dashboard?.revenue?.last_month || 0) /
                (dashboard?.revenue?.total || 1) *
                100
              }
              progressColor={customTheme.palette.info.dark}
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <MetricCard
              title="Vendors"
              value={dashboard?.users?.vendors ?? '-'}
              subtitle={
                dashboard?.users?.active_last_week
                  ? `Active Last Week: ${dashboard?.users?.active_last_week}`
                  : ''
              }
              icon={<Store />}

              color={isDark ? '#67300cff' : customTheme.palette.warning.main}
              progress={vendorProgress}
              progressColor={customTheme.palette.warning.dark}
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <MetricCard
              title="Orders"
              value={dashboard?.orders?.total ?? '-'}
              subtitle={
                dashboard?.orders?.last_week
                  ? `Last Week: ${dashboard?.orders?.last_week}`
                  : ''
              }
              icon={<InsertChart />}

              color={isDark ? '#033e22ff' : customTheme.palette.success.main}
              progress={orderProgress}
              progressColor={isDark ? '#55d78bff' : customTheme.palette.success.dark}
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <MetricCard
              title="Subscriptions"
              value={dashboard?.subscriptions?.total ?? '-'}
              subtitle={`Active: ${(dashboard?.subscriptions?.total ?? 0) -
                (dashboard?.subscriptions?.cancelled ?? 0)
                }`}
              icon={<ReceiptLong />}
              color={isDark ? '#b81004c3' : customTheme.palette.error.main}
              progress={subscriptionUsed}
              progressColor={isDark ? '#fd1202ff' : customTheme.palette.error.dark}
            />
          </Grid>
        </Grid>

        {/* Row 2: User stats and distribution */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {/* User statistics */}
          <Grid item xs={12} md={6}>
            <PanelCard
              title="User Statistics"
              icon={<SupervisorAccount />}
            >
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <MetricCard
                    title="Total Users"
                    value={totalUsers}
                    subtitle={`Last Month: ${lastMonthUsers}`}
                    icon={<SupervisorAccount />}
                    color={isDark ? '#023862ff' : customTheme.palette.primary.main}
                    progress={usersProgress}
                    progressColor={customTheme.palette.primary.dark}
                  />
                </Grid>
                <Grid item xs={6}>
                  <MetricCard
                    title="Active Last Week"
                    value={activeLastWeekUsers}
                    subtitle={`${activeUsersProgress}% of all users`}
                    icon={<ShowChart />}
                    color={isDark ? '#b81004c3' : customTheme.palette.error.main}
                    progress={activeUsersProgress}
                    progressColor={customTheme.palette.info.dark}
                  />
                </Grid>
                <Grid item xs={6}>
                  <MetricCard
                    title="New Vendors"
                    value={newVendors}
                    subtitle={`${newVendorsProgress}% of vendors`}
                    icon={<PersonAdd />}
                    color={isDark ? '#67300cff' : customTheme.palette.warning.main}
                    progress={newVendorsProgress}
                    progressColor={customTheme.palette.warning.dark}
                  />
                </Grid>
                <Grid item xs={6}>
                  <MetricCard
                    title="Customers"
                    value={totalCustomers}
                    subtitle={`${customersProgress}% of users`}
                    icon={<Person />}
                    color={isDark ? '#033e22ff' : customTheme.palette.success.main}
                    progress={customersProgress}
                    progressColor={customTheme.palette.success.dark}
                  />
                </Grid>
              </Grid>
            </PanelCard>
          </Grid>

          {/* User distribution pie */}
          <Grid item xs={12} md={6}>
            <PanelCard
              title="User Distribution"
              subtitle="Vendors vs Customers"
              icon={<SupervisorAccount />}
            >
              <Box sx={{ height: 240, position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={trafficPie}
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      innerRadius={40}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {trafficPie.map((entry, idx) => (
                        <Cell
                          key={`cell-${idx}`}
                          fill={
                            idx === 0
                              ? customTheme.palette.primary.main
                              : customTheme.palette.warning.main
                          }
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
                <Box sx={{ mt: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={vendorProgress}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: lighten(
                        customTheme.palette.primary.main,
                        0.7
                      ),
                      '& .MuiLinearProgress-bar': {
                        backgroundColor:
                          customTheme.palette.primary.dark,
                      },
                    }}
                  />
                  <Typography
                    variant="caption"
                    sx={{ color: 'text.secondary', mt: 0.5 }}
                  >
                    <Store fontSize="inherit" /> Vendors:{' '}
                    {dashboard?.users?.vendors} &nbsp;&nbsp;
                    <Person fontSize="inherit" /> Customers:{' '}
                    {dashboard?.users?.customers}
                  </Typography>
                </Box>
              </Box>
            </PanelCard>
          </Grid>
        </Grid>

        {/* Row 3: Order activity and revenue details */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {/* Order activity */}
          <Grid item xs={12} md={7}>
            <PanelCard
              title="Order Activity"
              subtitle={
                activeChart === 'by_day' ? 'Per Day' : 'Per Month'
              }
              icon={<ShowChart />}
            >
              <Box sx={{ position: 'relative' }}>
                {/* Switch chart type */}
                <IconButton
                  onClick={(e) => setAnchorEl(e.currentTarget)}
                  sx={{
                    position: 'absolute',
                    right: 0,
                    top: 0,
                    zIndex: 1,
                    color: customTheme.palette.text.secondary,
                  }}
                >
                  <MoreVert />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={() => setAnchorEl(null)}
                >
                  <MenuItem
                    onClick={() => {
                      setActiveChart('by_day');
                      setAnchorEl(null);
                    }}
                  >
                    By Day
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      setActiveChart('by_month');
                      setAnchorEl(null);
                    }}
                  >
                    By Month
                  </MenuItem>
                </Menu>
              </Box>
              <Box sx={{ height: 280, mt: 2 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={
                      activeChart === 'by_day'
                        ? chartByDay
                        : chartByMonth
                    }
                  >
                    <defs>
                      <linearGradient
                        id="colorOrderArea"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor={customTheme.palette.info.light}
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor={customTheme.palette.info.dark}
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={customTheme.palette.divider}
                    />
                    <XAxis
                      dataKey="name"
                      stroke={customTheme.palette.text.secondary}
                    />
                    <YAxis
                      allowDecimals={false}
                      stroke={customTheme.palette.text.secondary}
                    />
                    <RechartsTooltip />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke={customTheme.palette.info.main}
                      fillOpacity={1}
                      fill="url(#colorOrderArea)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </PanelCard>
          </Grid>

          {/* Revenue and invoice summary */}
          <Grid item xs={12} md={5}>
            <PanelCard title="Commission & Invoices" icon={<AttachMoney />}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <MetricCard
                    title="Total Commission"
                    value={
                      dashboard?.commission?.total !== undefined
                        ? `USD ${dashboard?.commission?.total}`
                        : '-'
                    }
                    subtitle={`This Month: USD ${dashboard?.commission?.last_month ?? '-'
                      }`}
                    icon={<Insights />}
                    color={isDark ? '#033e22ff' : customTheme.palette.success.main}
                    progress={
                      ((dashboard?.commission?.last_month || 0) /
                        (dashboard?.commission?.total || 1)) *
                      100
                    }
                    progressColor={customTheme.palette.success.dark}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <MetricCard
                    title="Subscription Invoice"
                    value={
                      dashboard?.subscription_invoice?.total !==
                        undefined
                        ? `USD ${dashboard?.subscription_invoice?.total}`
                        : '-'
                    }
                    subtitle={`This Month: USD ${dashboard?.subscription_invoice?.last_month ?? '-'
                      }`}
                    icon={<ReceiptLong />}
                    color={isDark ? '#023862ff' : customTheme.palette.grey.main}
                    progress={
                      ((dashboard?.subscription_invoice?.last_month || 0) /
                        (dashboard?.subscription_invoice?.total || 1)) *
                      100
                    }
                    progressColor={customTheme.palette.primary.dark}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <MetricCard
                    title="Cancelled Orders"
                    value={dashboard?.orders?.cancelled ?? 0}
                    icon={<Cancel />}
                    color={isDark ? '#b81004c3' : customTheme.palette.error.main}
                    progress={
                      (dashboard?.orders?.cancelled || 0) /
                      (dashboard?.orders?.total || 1) *
                      100
                    }
                    progressColor={customTheme.palette.error.dark}
                    subtitle={`Total Orders: ${dashboard?.orders?.total ?? 0}`}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <MetricCard
                    title="Cancelled Subs."
                    value={dashboard?.subscriptions?.cancelled ?? 0}
                    icon={<Cancel />}
                    color={isDark ? '#350058ff' : customTheme.palette.secondary.main}
                    progress={
                      (dashboard?.subscriptions?.cancelled || 0) /
                      (dashboard?.subscriptions?.total || 1) *
                      100
                    }
                    progressColor={customTheme.palette.secondary.dark}
                    subtitle={`Total Subs.: ${dashboard?.subscriptions?.total ?? 0}`}
                  />
                </Grid>
              </Grid>
            </PanelCard>
          </Grid>
        </Grid>

        {/* Row 4: Top customers and vendors */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <PanelCard
              title="Top Customers"
              subtitle="By total value"
              icon={<EmojiEvents />}
            >
              {dashboard?.top?.customers?.length > 0 ? (
                <Box>
                  {dashboard.top.customers.map((cust, idx) => (
                    <Box
                      key={cust.customer__id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: 1.5,
                        borderRadius: 2,
                        mb: 1,
                        backgroundColor: idx === 0
                          ? 'rgba(255, 193, 7, 0.15)' // Soft amber highlight for top customer
                          : 'rgba(0, 0, 0, 0.04)',    // Very light grey for others (works in both modes)
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar
                          sx={{
                            bgcolor: idx === 0 ? '#ffc107' : '#1976d2', // Amber for top, blue for others
                            color: '#fff',
                            mr: 2,
                          }}
                        >
                          <Person />
                        </Avatar>
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: idx === 0 ? 700 : 500 }}>
                            {cust.customer__email}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            Total: USD {cust.total}
                          </Typography>
                        </Box>
                      </Box>
                      {idx === 0 && (
                        <Tooltip title="Top Customer">
                          <span>
                            <EmojiEvents sx={{ color: '#ffc107' /* amber gold trophy */ }} />
                          </span>
                        </Tooltip>
                      )}
                    </Box>
                  ))}
                </Box>

              ) : (
                <Typography
                  variant="body2"
                  sx={{ color: 'text.secondary' }}
                >
                  No customer data.
                </Typography>
              )}
            </PanelCard>
          </Grid>
          <Grid item xs={12} md={6}>
            <PanelCard
              title="Top Vendors"
              subtitle="By total value"
              icon={<Leaderboard />}
            >
              {dashboard?.top?.vendors?.length > 0 ? (
                <Box>
                  {dashboard.top.vendors.map((ven, idx) => (
                    <Box
                      key={ven.vendor__id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: 1.5,
                        borderRadius: 2,
                        mb: 1,
                        backgroundColor:
                          idx === 0
                            ? lighten(
                              customTheme.palette.success.light,
                              0.5
                            )
                            : lighten(
                              customTheme.palette.background.paper,
                              0.8
                            ),
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar
                          sx={{
                            bgcolor: customTheme.palette.success.main,
                            color: '#fff',
                            mr: 2,
                          }}
                        >
                          <Store />
                        </Avatar>
                        <Box>
                          <Typography
                            variant="body1"
                            sx={{ fontWeight: idx === 0 ? 600 : 500 }}
                          >
                            {ven.vendor__email}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ color: 'text.secondary' }}
                          >
                            Total: USD {ven.total}
                          </Typography>
                        </Box>
                      </Box>
                      {idx === 0 && (
                        <Tooltip title="Top Vendor">
                          <span>
                            <EmojiEvents
                              sx={{
                                color: customTheme.palette.warning.main,
                              }}
                            />
                          </span>
                        </Tooltip>
                      )}
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography
                  variant="body2"
                  sx={{ color: 'text.secondary' }}
                >
                  No vendor data.
                </Typography>
              )}
            </PanelCard>
          </Grid>
        </Grid>

        {/* Row 5: Weekly orders and subscription status radial chart */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={7}>
            <PanelCard
              title="Orders by Week"
              subtitle="Weekly order counts"
              icon={<BarChartIcon />}
            >
              <Box sx={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartByWeek}>

                    {/* Gradient fill for bars */}
                    <defs>
                      <linearGradient id="orderGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor={isDark ? '#7e57c2' : '#80cbc4'}  // purple vs teal
                          stopOpacity={0.9}
                        />
                        <stop
                          offset="95%"
                          stopColor={isDark ? '#512da8' : '#004d40'}  // dark purple vs dark teal
                          stopOpacity={0.7}
                        />
                      </linearGradient>
                    </defs>

                    <CartesianGrid
                      strokeDasharray="4 4"
                      stroke={isDark ? 'rgba(255,255,255,0.1)' : '#e0e0e0'}
                      vertical={false}
                    />

                    <XAxis
                      dataKey="name"
                      stroke={isDark ? '#bbb' : '#555'}
                      tick={{ fontSize: 14, fontWeight: '600' }}
                      axisLine={{ stroke: isDark ? '#555' : '#ccc' }}
                      tickLine={false}
                      padding={{ left: 10, right: 10 }}
                    />

                    <YAxis
                      stroke={isDark ? '#bbb' : '#555'}
                      tick={{ fontSize: 14, fontWeight: '600' }}
                      axisLine={{ stroke: isDark ? '#555' : '#ccc' }}
                      tickLine={false}
                    />

                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: isDark ? '#311b92' : '#fff',  // deep purple bg in dark mode
                        borderColor: isDark ? '#512da8' : '#ccc',
                        boxShadow: isDark
                          ? '0 0 10px rgba(103, 58, 183, 0.6)'
                          : '0 0 10px rgba(0, 105, 92, 0.3)',
                        borderRadius: 8,
                        color: isDark ? '#d1c4e9' : '#004d40',
                        fontWeight: 600,
                      }}
                      itemStyle={{ color: isDark ? '#b39ddb' : '#00796b' }}
                      cursor={{
                        fill: isDark
                          ? 'rgba(103, 58, 183, 0.15)'
                          : 'rgba(0, 137, 123, 0.1)',
                      }}
                    />

                    <Legend
                      wrapperStyle={{
                        color: isDark ? '#b39ddb' : '#004d40',
                        fontWeight: '700',
                        fontSize: 16,
                        paddingTop: 8,
                        userSelect: 'none',
                      }}
                      iconType="circle"
                      iconSize={14}
                    />

                    <Bar
                      dataKey="count"
                      name="Orders"
                      fill="url(#orderGradient)"
                      radius={[6, 6, 0, 0]}
                      style={{
                        filter: isDark
                          ? 'drop-shadow(0 1px 3px rgba(91, 0, 247, 0.5))'
                          : 'drop-shadow(0 1px 3px rgba(0, 77, 64, 0.4))',
                        transition: 'transform 0.3s ease',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                        e.currentTarget.style.filter = isDark
                          ? 'drop-shadow(0 0 8px rgba(52, 16, 112, 0.9))'
                          : 'drop-shadow(0 0 8px rgba(0, 105, 92, 0.9))';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.filter = isDark
                          ? 'drop-shadow(0 1px 3px rgba(103, 58, 183, 0.5))'
                          : 'drop-shadow(0 1px 3px rgba(0, 77, 64, 0.4))';
                      }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </PanelCard>
          </Grid>
          <Grid item xs={12} md={5}>
    <PanelCard
      title="Subscriptions Status"
      subtitle="Active vs Cancelled"
      icon={<TrendingUp />}
    >
      <Box
        sx={{
          height: 260,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            innerRadius="70%"
            outerRadius="100%"
            data={[
              {
                name: 'Active',
                value: activeValue,
                fill: isDark ? 'url(#activeGradientDark)' : customTheme.palette.info.main,
              },
              {
                name: 'Cancelled',
                value: cancelledValue,
                fill: isDark ? 'url(#cancelledGradientDark)' : customTheme.palette.error.main,
              },
            ]}
            startAngle={90}
            endAngle={-270}
          >
            <defs>
              {/* Active Gradient for Dark Mode - radial gradient with smooth light-blue to deep-blue */}
              <radialGradient id="activeGradientDark" cx="50%" cy="50%" r="75%" fx="50%" fy="50%">
                <stop offset="10%" stopColor="#90caf9" />
                <stop offset="50%" stopColor="#42a5f5" />
                <stop offset="90%" stopColor="#1e88e5" />
              </radialGradient>

              {/* Cancelled Gradient for Dark Mode - radial gradient with soft red to deep crimson */}
              <radialGradient id="cancelledGradientDark" cx="50%" cy="50%" r="75%" fx="50%" fy="50%">
                <stop offset="10%" stopColor="#ef9a9a" />
                <stop offset="50%" stopColor="#e53935" />
                <stop offset="90%" stopColor="#b71c1c" />
              </radialGradient>
            </defs>

            <RadialBar
              dataKey="value"
              minAngle={15}
              background={{ fill: isDark ? '#121212' : '#eee' }}
              clockWise
              cornerRadius={10}
            />

            <Legend
              iconSize={12}
              width={120}
              height={60}
              layout="vertical"
              verticalAlign="middle"
              align="right"
              wrapperStyle={{
                color: isDark ? '#ccc' : '#555',
                fontWeight: '600',
                fontSize: 14,
                userSelect: 'none',
              }}
            />

            <RechartsTooltip
              contentStyle={{
                backgroundColor: isDark ? '#263238' : '#fff',
                borderColor: isDark ? '#455a64' : '#ccc',
                boxShadow: isDark ? '0 0 10px rgba(30, 136, 229, 0.6)' : '0 0 10px rgba(4, 115, 188, 0.3)',
                borderRadius: 8,
                color: isDark ? '#bbdefb' : '#0d47a1',
                fontWeight: 600,
              }}
              itemStyle={{ color: isDark ? '#90caf9' : '#1565c0' }}
              cursor={{ fill: isDark ? 'rgba(30, 136, 229, 0.15)' : 'rgba(4, 115, 188, 0.1)' }}
            />
          </RadialBarChart>
        </ResponsiveContainer>

        <Box
          sx={{
            textAlign: 'center',
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            textShadow: isDark ? '0 0 6px rgba(30, 136, 229, 0.7)' : 'none',
          }}
        >
          <Typography
            variant="h5"
            sx={{
              color: isDark ? customTheme.palette.info.light : customTheme.palette.info.dark,
              fontWeight: 700,
            }}
          >
            {dashboard?.subscriptions?.total ?? '-'}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Subscriptions
          </Typography>
        </Box>
      </Box>
    </PanelCard>
          </Grid>
        </Grid>

        {/* Row 6: Completed categories & financial breakdown */}
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
<Paper
      elevation={4}
      sx={{
        maxWidth: 420,
        p: 3,
        borderRadius: 3,
        bgcolor: 'background.paper',
        boxShadow: 4,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={2} mb={2}>
        <Avatar sx={{ bgcolor: '#d32f2f', width: 48, height: 48 }}>
          <AttachMoney fontSize="large" />
        </Avatar>
        <Box>
          <Typography variant="h6" fontWeight={700}>
            Top Completed Category
          </Typography>
          <Typography variant="body2" color="text.secondary">
            By time period
          </Typography>
        </Box>
      </Stack>

      <Stack spacing={2}>
        {[
          {
            label: 'Last Week',
            value: dashboard?.top_completed_categories?.last_week ?? '-',
            chartData: [
              { value: 4 }, { value: 7 }, { value: 3 }, { value: 6 }, { value: 5 }
            ],
          },
          {
            label: 'Last Month',
            value: dashboard?.top_completed_categories?.last_month ?? '-',
            chartData: [
              { value: 3 }, { value: 6 }, { value: 4 }, { value: 5 }, { value: 7 }
            ],
          },
          {
            label: 'Last Year',
            value: dashboard?.top_completed_categories?.last_year ?? '-',
            chartData: [
              { value: 7 }, { value: 5 }, { value: 6 }, { value: 3 }, { value: 4 }
            ],
          },
        ].map(({ label, value, chartData }) => (
          <Stack
            key={label}
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
            sx={{
              borderRadius: 2,
              p: 1.5,
              bgcolor: 'action.hover',
              cursor: 'default',
              transition: 'background-color 0.3s ease',
              '&:hover': { bgcolor: 'action.selected' },
            }}
          >
            <Box sx={{ minWidth: 90 }}>
              <Typography variant="subtitle1" fontWeight={600}>
                {label}
              </Typography>
              {value === '-' ? (
                <Typography
                  color="text.secondary"
                  fontStyle="italic"
                  fontWeight={500}
                >
                  -
                </Typography>
              ) : (
                <Chip
                  label={value}
                  size="small"
                  color="primary"
                  sx={{ fontWeight: 700 }}
                />
              )}
            </Box>

            <Box sx={{ flexGrow: 1, height: 40, maxWidth: 160 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 8, right: 0, left: 0, bottom: 8 }}
                >
                  <Bar dataKey="value" fill="#1976d2" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Stack>
        ))}
      </Stack>
    </Paper>
          </Grid>
          <Grid item xs={12} md={8}>
            <PanelCard
              title="Financial Breakdown"
              subtitle="Total vs Last Month vs Last Year"
              icon={<BarChartIcon />}
            >
              <Box sx={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueChart}>

                    {/* Gradients */}
                    <defs>
                      {/* Revenue gradient */}
                      <linearGradient
                        id="gradientRevenue"
                        x1="0" y1="0" x2="0" y2="1"
                        // Light mode: light to dark, Dark mode: dark to light
                        {...(isDark
                          ? { stopColorTop: '#1b3a1a', stopOpacityTop: 0.8, stopColorBottom: '#66bb6a', stopOpacityBottom: 0.9 }
                          : { stopColorTop: '#a5d6a7', stopOpacityTop: 0.9, stopColorBottom: '#388e3c', stopOpacityBottom: 0.7 })}
                      >
                        <stop offset="5%" stopColor={isDark ? '#1b3a1a' : '#a5d6a7'} stopOpacity={isDark ? 0.8 : 0.9} />
                        <stop offset="95%" stopColor={isDark ? '#66bb6a' : '#388e3c'} stopOpacity={isDark ? 0.9 : 0.7} />
                      </linearGradient>

                      {/* Commission gradient */}
                      <linearGradient id="gradientCommission" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={isDark ? '#0d3c61' : '#90caf9'} stopOpacity={isDark ? 0.85 : 0.9} />
                        <stop offset="95%" stopColor={isDark ? '#42a5f5' : '#1976d2'} stopOpacity={isDark ? 0.95 : 0.7} />
                      </linearGradient>

                      {/* Subscriptions gradient */}
                      <linearGradient id="gradientSubscriptions" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={isDark ? '#7a4b00' : '#ffcc80'} stopOpacity={isDark ? 0.8 : 0.9} />
                        <stop offset="95%" stopColor={isDark ? '#ffb300' : '#ef6c00'} stopOpacity={isDark ? 0.95 : 0.75} />
                      </linearGradient>
                    </defs>

                    <CartesianGrid
                      strokeDasharray="4 4"
                      stroke={isDark ? 'rgba(255, 255, 255, 0.1)' : '#e0e0e0'}
                      vertical={false}
                    />

                    <XAxis
                      dataKey="name"
                      stroke={isDark ? '#ccc' : '#333'}
                      tick={{ fontSize: 14, fontWeight: 600 }}
                      axisLine={{ stroke: isDark ? '#555' : '#ccc' }}
                      tickLine={false}
                    />
                    <YAxis
                      stroke={isDark ? '#ccc' : '#333'}
                      tick={{ fontSize: 14, fontWeight: 600 }}
                      axisLine={{ stroke: isDark ? '#555' : '#ccc' }}
                      tickLine={false}
                    />

                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: isDark ? '#222' : '#fff',
                        borderColor: isDark ? '#555' : '#ccc',
                        boxShadow: isDark
                          ? '0 0 10px rgba(102, 187, 106, 0.6)'
                          : '0 0 10px rgba(56, 142, 60, 0.3)',
                        borderRadius: 8,
                        color: isDark ? '#ddd' : '#222',
                        fontWeight: '600',
                      }}
                      itemStyle={{ color: isDark ? '#a5d6a7' : '#2e7d32' }}
                      cursor={{ fill: isDark ? 'rgba(102, 187, 106, 0.15)' : 'rgba(56, 142, 60, 0.1)' }}
                    />

                    <Legend
                      wrapperStyle={{
                        color: isDark ? '#aaa' : '#444',
                        fontWeight: '700',
                        fontSize: 15,
                        paddingTop: 10,
                        paddingBottom: 5,
                        userSelect: 'none',
                      }}
                      iconType="circle"
                      iconSize={14}
                    />

                    <Bar
                      dataKey="Revenue"
                      fill="url(#gradientRevenue)"
                      name="Revenue"
                      radius={[6, 6, 0, 0]}
                    />
                    <Bar
                      dataKey="Commission"
                      fill="url(#gradientCommission)"
                      name="Commission"
                      radius={[6, 6, 0, 0]}
                    />
                    <Bar
                      dataKey="Subscriptions"
                      fill="url(#gradientSubscriptions)"
                      name="Subscriptions"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </PanelCard>

          </Grid>
        </Grid>

        {/* Row 7: Combined order & subscription status bar */}
        <Grid container spacing={2} sx={{ mt: 3 }}>
          <Grid item xs={12}>
            <PanelCard
              title="Orders & Subscriptions Status"
              subtitle="Active vs Cancelled"
              icon={<InsertChart />}
            >
              <Box sx={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statusChart}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={customTheme.palette.divider}
                    />
                    <XAxis
                      dataKey="name"
                      stroke={customTheme.palette.text.secondary}
                    />
                    <YAxis
                      stroke={customTheme.palette.text.secondary}
                    />
                    <RechartsTooltip />
                    <Legend />
                    <Bar
                      dataKey="Active"
                      stackId="a"
                      fill={customTheme.palette.success.main}
                      name="Active"
                    />
                    <Bar
                      dataKey="Cancelled"
                      stackId="a"
                      fill={customTheme.palette.error.main}
                      name="Cancelled"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </PanelCard>
          </Grid>
        </Grid>
      </Box>
    </ThemeProvider>
  );
}
