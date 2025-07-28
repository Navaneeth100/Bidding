import React, { useState, useEffect } from "react";
import axios from "axios";
import { url } from "../../../mainurl";

import {
  Box,
  Typography,
  Avatar,
  Button,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
  Chip,
  LinearProgress,
  Tooltip,
  Badge,
  useTheme,
  Skeleton,
  Menu,
  MenuItem,
} from "@mui/material";
import { darken } from "@mui/material/styles";
import {
  TrendingUp,
  AttachMoney,
  BarChart as BarChartIcon,
  MoreVert,
  ArrowDownward,
  ArrowUpward,
  Refresh,
  Download,
  Star,
  Cancel,
  SupervisorAccount,
  ReceiptLong,
  Person,
  Store,
  LocalAtm,
  Insights,
  ShowChart,
  InsertChart,
  EmojiEvents,
  Leaderboard,
  Dashboard as DashboardIcon,
  AccountTree,
  PersonAdd,
} from "@mui/icons-material";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
  RadialBarChart,
  RadialBar,
} from "recharts";
import 'bootstrap/dist/css/bootstrap.min.css';

/*
 * This component extends the original dashboard by adding several new
 * statistic cards and comparative charts.  New metrics include total
 * users, active users last week, new vendors this month and total
 * customers.  Additional charts visualize the breakdown of revenue vs
 * commission vs subscription invoices across different time periods,
 * and compare active versus cancelled orders and subscriptions.  The
 * overall aesthetic is kept consistent with the existing cards and
 * GlassCard styling while leveraging Material‑UI and Recharts for a
 * responsive, modern interface.  See the README for more details on
 * data shape expected from the API.
 */

// GlassCard with forwardRef
const GlassCard = React.forwardRef(function GlassCard(
  { children, color, hover = true, highlight, sx = {}, ...props },
  ref
) {
  const theme = useTheme();
  const glassBorder = `1.5px solid ${theme.palette.primary.light}44`;
  const bg = color || theme.palette.background.paper;

  return (
    <Card
      {...props}
      ref={ref}
      sx={{
        background: bg,
        border: glassBorder,
        boxShadow: theme.shadows[1],
        borderRadius: 5,
        transition: "all 0.2s cubic-bezier(.4,2,.7,1)",
        ...(hover && {
          "&:hover": {
            boxShadow: theme.shadows[6],
            transform: "translateY(-4px) scale(1.022)",
            borderColor: highlight ? theme.palette.warning.main : undefined,
            background: color
              ? darken(color, 0.05)
              : theme.palette.action.hover,
          },
        }),
        ...sx,
      }}
      elevation={0}
    >
      {children}
    </Card>
  );
});

// StatCard
const StatCard = ({
  title,
  value,
  subtitle,
  icon,
  color,
  trend,
  progress,
  tooltip,
  badge,
  highlight,
  avatarBgColor,  // NEW: Accept avatar background color
  iconColor,      // NEW: Accept icon color
}) => {
  const theme = useTheme();
  const glassBorder = `1.5px solid ${theme.palette.primary.light}44`;
  return (
    <Tooltip title={tooltip || ""} arrow>
      <span>
        <GlassCard
          color={color}
          highlight={highlight}
          sx={{
            p: 0,
            border: highlight ? `2px solid ${theme.palette.warning.main}` : glassBorder,
            position: "relative",
            overflow: "visible",
          }}
        >
          <CardContent sx={{ pb: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
              <Avatar
                sx={{
                  bgcolor: avatarBgColor || theme.palette.primary.light,
                  color: iconColor || theme.palette.warning.main,
                  mr: 2,
                  width: 50,
                  height: 50,
                  boxShadow: 2,
                  fontSize: 32,
                  border: highlight ? `2.5px solid ${theme.palette.warning.main}` : "none",
                }}
              >
                {icon}
              </Avatar>
              <Box>
                <Typography variant="subtitle2" sx={{ color: theme.palette.text.secondary, fontWeight: 700 }}>
                  {title}
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: "bold", color: theme.palette.text.primary, lineHeight: 1.2 }}>
                  {badge ? (
                    <Badge badgeContent={badge} color="error" sx={{ mr: 1 }}>
                      {value}
                    </Badge>
                  ) : (
                    value
                  )}
                  {trend &&
                    (trend > 0 ? (
                      <ArrowUpward fontSize="inherit" sx={{ color: theme.palette.success.main }} />
                    ) : trend < 0 ? (
                      <ArrowDownward fontSize="inherit" sx={{ color: theme.palette.error.main }} />
                    ) : null)}
                </Typography>
                {subtitle && (
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    {subtitle}
                  </Typography>
                )}
                {progress !== undefined && (
                  <LinearProgress
                    value={progress}
                    variant="determinate"
                    sx={{
                      height: 7,
                      borderRadius: 5,
                      mt: 1,
                      backgroundColor: theme.palette.action.selected,
                      "& .MuiLinearProgress-bar": { backgroundColor: theme.palette.info.main },
                    }}
                  />
                )}
              </Box>
            </Box>
          </CardContent>
        </GlassCard>
      </span>
    </Tooltip>
  );
};

// Main Dashboard component
export default function Dashboard() {
  const theme = useTheme();

  // State
  const [authTokens] = useState(() => JSON.parse(localStorage.getItem("authTokens")));
  const tokenStr = authTokens?.access ? String(authTokens.access) : "";
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [activeChart, setActiveChart] = useState("by_day");
  const [anchorEl, setAnchorEl] = useState(null);

  // Fetch dashboard data
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

  useEffect(() => { fetchDashboardData(); }, []);

  // Data transforms
  const chartByDay = dashboard?.chart_data?.by_day?.map((d) => ({
    name: new Date(d.day).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    count: d.count,
  })) || [];
  const chartByWeek = dashboard?.chart_data?.by_week?.map((d) => ({
    name: "Wk " + new Date(d.week).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    count: d.count,
  })) || [];
  const chartByMonth = dashboard?.chart_data?.by_month?.map((d) => ({
    name: new Date(d.month).toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
    count: d.count,
  })) || [];
  const trafficPie = [
    { name: "Vendors", value: dashboard?.users?.vendors ?? 0 },
    { name: "Customers", value: dashboard?.users?.customers ?? 0 },
  ];

  const subscriptionUsed =
    dashboard?.subscriptions?.total > 0
      ? Math.round(
        100 - (dashboard?.subscriptions?.cancelled ?? 0) / (dashboard?.subscriptions?.total || 1) * 100
      )
      : 100;

  const orderProgress =
    (dashboard?.orders?.total || 0) > 0
      ? Math.round(((dashboard?.orders?.last_week || 0) / (dashboard?.orders?.total || 1)) * 100)
      : 0;
  const vendorProgress =
    (dashboard?.users?.total || 0) > 0
      ? Math.round(((dashboard?.users?.vendors || 0) / (dashboard?.users?.total || 1)) * 100)
      : 0;

  // New statistics calculations
  const totalUsers = dashboard?.users?.total || 0;
  const lastMonthUsers = dashboard?.users?.last_month || 0;
  const activeLastWeekUsers = dashboard?.users?.active_last_week || 0;
  const newVendors = dashboard?.users?.new_vendors_monthly || 0;
  const totalCustomers = dashboard?.users?.customers || 0;

  const usersProgress = totalUsers > 0 ? Math.round((lastMonthUsers / totalUsers) * 100) : 0;
  const activeUsersProgress = totalUsers > 0 ? Math.round((activeLastWeekUsers / totalUsers) * 100) : 0;
  const newVendorsProgress = (dashboard?.users?.vendors || 0) > 0
    ? Math.round((newVendors / (dashboard?.users?.vendors || 1)) * 100)
    : 0;
  const customersProgress = totalUsers > 0 ? Math.round((totalCustomers / totalUsers) * 100) : 0;

  // Revenue breakdown chart data
  const revenueChart = [
    {
      name: "Total",
      Revenue: dashboard?.revenue?.total || 0,
      Commission: dashboard?.commission?.total || 0,
      Subscriptions: dashboard?.subscription_invoice?.total || 0,
    },
    {
      name: "Last Month",
      Revenue: dashboard?.revenue?.last_month || 0,
      Commission: dashboard?.commission?.last_month || 0,
      Subscriptions: dashboard?.subscription_invoice?.last_month || 0,
    },
    {
      name: "Last Year",
      Revenue: dashboard?.revenue?.last_year || 0,
      Commission: dashboard?.commission?.last_year || 0,
      Subscriptions: dashboard?.subscription_invoice?.last_year || 0,
    },
  ];

  // Orders and Subscriptions status chart data
  const statusChart = [
    {
      name: "Orders",
      Active: (dashboard?.orders?.total || 0) - (dashboard?.orders?.cancelled || 0),
      Cancelled: dashboard?.orders?.cancelled || 0,
    },
    {
      name: "Subscriptions",
      Active: (dashboard?.subscriptions?.total || 0) - (dashboard?.subscriptions?.cancelled || 0),
      Cancelled: dashboard?.subscriptions?.cancelled || 0,
    },
  ];

  // Loading state
  if (loading) return (
    <Box className="container-fluid py-5" sx={{ background: theme.palette.background.default }}>
      <Skeleton variant="rounded" height={60} sx={{ mb: 3, borderRadius: 3 }} />
      <div className="row">
        {[...Array(4)].map((_, i) => (
          <div className="col-12 col-md-6 col-lg-3 mb-3" key={i}>
            <Skeleton variant="rounded" height={100} sx={{ borderRadius: 4 }} />
          </div>
        ))}
      </div>
      <Skeleton variant="rounded" height={380} sx={{ mt: 3, borderRadius: 3 }} />
    </Box>
  );

  if (error) return (
    <Box className="container py-5" sx={{ background: theme.palette.background.default }}>
      <Typography variant="h5" color="error" align="center" gutterBottom>
        Error loading dashboard data
      </Typography>
      <Box textAlign="center">
        <Button onClick={fetchDashboardData} startIcon={<Refresh />}>
          Retry
        </Button>
      </Box>
    </Box>
  );

  // --- Main Modern Dashboard ---
  return (
    <Box
      className="container-fluid py-5"
      sx={{
        minHeight: "100vh",
        background: theme.palette.background.default,
        backgroundAttachment: "fixed",
        pb: 10,
      }}
    >
      {/* OVERVIEW HEADER */}
      <Box
        className="mb-4 d-flex flex-column flex-lg-row align-items-start align-items-lg-center justify-content-between"
      >
        <Box>
          <Typography variant="h3" fontWeight="bold" sx={{ color: theme.palette.text.primary }}>
            <DashboardIcon sx={{ mr: 1, mb: "-5px", color: theme.palette.info.main }} fontSize="large" />
            Business Dashboard
          </Typography>
          <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
            Welcome! Here’s your up-to-date business snapshot.
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<Refresh />}
            onClick={fetchDashboardData}
            sx={{
              borderRadius: 3,
              background: theme.palette.primary.main,
              color: "#fff",
              fontWeight: 600,
              boxShadow: theme.shadows[2],
              ":hover": { background: theme.palette.primary.dark },
            }}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* OVERVIEW STATS */}
      <div className="row gy-4 mb-4">
        <div className="col-12 col-sm-6 col-lg-3">
          <StatCard
            title="Total Revenue"
            value={"USD " + (dashboard?.revenue?.total ?? "-")}
            subtitle={`This Month: USD ${dashboard?.revenue?.last_month ?? "-"}`}
            icon={<LocalAtm fontSize="large" />}
            progress={Math.round(
              ((dashboard?.revenue?.last_month || 0) / (dashboard?.revenue?.total || 1)) * 100
            )}
            tooltip="Total revenue to date"
            highlight
            avatarBgColor={theme.palette.info.light}    // light blue
            iconColor={theme.palette.info.dark}
          />
        </div>
        <div className="col-12 col-sm-6 col-lg-3">
          <StatCard
            title="Vendors"
            value={dashboard?.users?.vendors ?? "-"}
            subtitle={`Active Last Week: ${dashboard?.users?.active_last_week ?? "-"}`}
            icon={<Store fontSize="large" />}
            progress={vendorProgress}
            tooltip="Total registered vendors"
            avatarBgColor={theme.palette.warning.light} // yellow/orange
            iconColor={theme.palette.warning.dark}
          />
        </div>
        <div className="col-12 col-sm-6 col-lg-3">
          <StatCard
            title="Orders"
            value={dashboard?.orders?.total ?? "-"}
            subtitle={`Last Week: ${dashboard?.orders?.last_week ?? "0"}`}
            icon={<InsertChart fontSize="large" />}
            progress={orderProgress}
            tooltip="Orders placed"
            badge={dashboard?.orders?.cancelled > 0 ? dashboard?.orders?.cancelled : null}
            avatarBgColor={theme.palette.success.light} // light green
            iconColor={theme.palette.success.dark}
          />
        </div>
        <div className="col-12 col-sm-6 col-lg-3">
          <StatCard
            title="Subscriptions"
            value={dashboard?.subscriptions?.total ?? "-"}
            subtitle={`Active: ${(dashboard?.subscriptions?.total ?? 0) - (dashboard?.subscriptions?.cancelled ?? 0)}`}
            icon={<ReceiptLong fontSize="large" />}
            progress={subscriptionUsed}
            tooltip="All time & active subscriptions"
            avatarBgColor={theme.palette.error.light}   // light red
            iconColor={theme.palette.error.dark}
          />
        </div>
      </div>

      {/* NEW USER STATISTICS ROW */}
      <div className="row gy-4 mb-4">
        <div className="col-12 col-sm-6 col-lg-3">
          <StatCard
            title="Total Users"
            value={totalUsers}
            subtitle={`Last Month: ${lastMonthUsers}`}
            icon={<SupervisorAccount fontSize="large" />}
            progress={usersProgress}
            tooltip="Total registered users"
            avatarBgColor={theme.palette.primary.light}
            iconColor={theme.palette.primary.dark}
          />
        </div>
        <div className="col-12 col-sm-6 col-lg-3">
          <StatCard
            title="Active Last Week"
            value={activeLastWeekUsers}
            subtitle={`${activeUsersProgress}% of all users`}
            icon={<ShowChart fontSize="large" />}
            progress={activeUsersProgress}
            tooltip="Users active in the last week"
            avatarBgColor={theme.palette.info.light}
            iconColor={theme.palette.info.dark}
          />
        </div>
        <div className="col-12 col-sm-6 col-lg-3">
          <StatCard
            title="New Vendors"
            value={newVendors}
            subtitle={`${newVendorsProgress}% of vendors`}
            icon={<PersonAdd fontSize="large" />}
            progress={newVendorsProgress}
            tooltip="New vendors registered this month"
            avatarBgColor={theme.palette.warning.light}
            iconColor={theme.palette.warning.dark}
          />
        </div>
        <div className="col-12 col-sm-6 col-lg-3">
          <StatCard
            title="Customers"
            value={totalCustomers}
            subtitle={`${customersProgress}% of users`}
            icon={<Person fontSize="large" />}
            progress={customersProgress}
            tooltip="Total customers registered"
            avatarBgColor={theme.palette.success.light}
            iconColor={theme.palette.success.dark}
          />
        </div>
      </div>

      {/* BIG CHARTS SECTION */}
      <div className="row gy-4 mb-4">
        <div className="col-12 col-lg-8">
          <GlassCard color={theme.palette.background.paper}>
            <CardHeader
              avatar={<ShowChart sx={{ color: theme.palette.info.main }} />}
              title="Order Activity"
              subheader={activeChart === "by_day" ? "Per Day" : "Per Month"}
              action={
                <>
                  <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ color: theme.palette.info.main }}>
                    <MoreVert />
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={() => setAnchorEl(null)}
                  >
                    <MenuItem onClick={() => { setActiveChart("by_day"); setAnchorEl(null); }}>
                      By Day
                    </MenuItem>
                    <MenuItem onClick={() => { setActiveChart("by_month"); setAnchorEl(null); }}>
                      By Month
                    </MenuItem>
                  </Menu>
                </>
              }
              sx={{
                borderBottom: `1.5px solid ${theme.palette.divider}`,
                background: theme.palette.background.default,
              }}
            />
            <CardContent sx={{ height: 310 }}>
              <ResponsiveContainer width="100%" height="95%">
                <AreaChart data={activeChart === "by_day" ? chartByDay : chartByMonth}>
                  <defs>
                    <linearGradient id="colorOrder" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={theme.palette.info.light} stopOpacity={0.8} />
                      <stop offset="95%" stopColor={theme.palette.info.dark} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke={theme.palette.text.secondary} />
                  <YAxis allowDecimals={false} stroke={theme.palette.text.secondary} />
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                  <RechartsTooltip />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke={theme.palette.info.main}
                    fillOpacity={1}
                    fill="url(#colorOrder)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </GlassCard>
        </div>
        <div className="col-12 col-lg-4">
          <GlassCard color={theme.palette.background.paper}>
            <CardHeader
              avatar={<SupervisorAccount sx={{ color: theme.palette.info.main }} />}
              title="User Distribution"
              subheader="Vendors vs Customers"
              sx={{
                borderBottom: `1.5px solid ${theme.palette.divider}`,
                background: theme.palette.background.default,
              }}
            />
            <CardContent sx={{ height: 310 }}>
              <ResponsiveContainer width="100%" height="90%">
                <PieChart>
                  <Pie
                    data={trafficPie}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#1976d2" // MUI blue as default fill (can be any)
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {trafficPie.map((entry, idx) => (
                      <Cell
                        key={`cell-${idx}`}
                        fill={idx === 0 ? "#1976d2" : "#ffa726"} // Blue for first, Orange for second
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend />
                </PieChart>

              </ResponsiveContainer>
              <Box sx={{ mt: 1, width: "100%" }}>
                <LinearProgress
                  variant="determinate"
                  value={vendorProgress}
                  sx={{ height: 8, borderRadius: 3, background: theme.palette.primary.dark }}
                />
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                  <Store fontSize="small" /> Vendors: {dashboard?.users?.vendors} &nbsp;&nbsp;
                  <Person fontSize="small" /> Customers: {dashboard?.users?.customers}
                </Typography>
              </Box>
            </CardContent>
          </GlassCard>
        </div>
      </div>

      {/* REVENUE AND ORDERS CONTAINERS */}
      <div className="row gy-4 mb-4">
        <div className="col-12 col-lg-6">
          <GlassCard color={theme.palette.background.paper}>
            <CardHeader
              avatar={<AttachMoney sx={{ color: theme.palette.success.main }} />}
              title="Commission & Invoices"
              sx={{ borderBottom: `1.5px solid ${theme.palette.divider}` }}
            />
            <CardContent>
              <div className="row">
                <div className="col-12 col-md-6 mb-2">
                  <StatCard
                    title="Total Commission"
                    value={"USD " + (dashboard?.commission?.total ?? "-")}
                    subtitle={`This Month: USD ${dashboard?.commission?.last_month ?? "-"}`}
                    icon={<Insights />}
                    avatarBgColor={theme.palette.success.light}
                    iconColor={theme.palette.success.dark}
                  />
                </div>
                <div className="col-12 col-md-6 mb-2">
                  <StatCard
                    title="Subscription Invoice"
                    value={"USD " + (dashboard?.subscription_invoice?.total ?? "-")}
                    subtitle={`This Month: USD ${dashboard?.subscription_invoice?.last_month ?? "-"}`}
                    icon={<ReceiptLong />}
                    avatarBgColor={theme.palette.primary.light}
                    iconColor={theme.palette.primary.dark}
                  />
                </div>
              </div>
            </CardContent>
          </GlassCard>
        </div>
        <div className="col-12 col-lg-6">
          <GlassCard color={theme.palette.background.paper}>
            <CardHeader
              avatar={<Cancel sx={{ color: theme.palette.error.light }} />}
              title="Cancellations"
              sx={{ borderBottom: `1.5px solid ${theme.palette.divider}` }}
            />
            <CardContent>
              <div className="row">
                <div className="col-12 col-md-6 mb-2">
                  <StatCard
                    title="Cancelled Orders"
                    value={dashboard?.orders?.cancelled ?? 0}
                    icon={<Cancel />}
                    badge={dashboard?.orders?.cancelled > 0 ? dashboard?.orders?.cancelled : null}
                    avatarBgColor={theme.palette.error.light}
                    iconColor={theme.palette.error.dark}
                  />
                </div>
                <div className="col-12 col-md-6 mb-2">
                  <StatCard
                    title="Cancelled Subs."
                    value={dashboard?.subscriptions?.cancelled ?? 0}
                    icon={<Cancel />}
                    badge={dashboard?.subscriptions?.cancelled > 0 ? dashboard?.subscriptions?.cancelled : null}
                    avatarBgColor={theme.palette.secondary.light}
                    iconColor={theme.palette.secondary.dark}
                  />
                </div>
              </div>
            </CardContent>
          </GlassCard>
        </div>
      </div>

      {/* TOP CUSTOMERS & VENDORS */}
      <div className="row gy-4 mb-4">
        <div className="col-12 col-lg-6">
          <GlassCard color={theme.palette.background.paper}>
            <CardHeader
              avatar={<EmojiEvents sx={{ color: theme.palette.warning.main }} />}
              title="Top Customer"
              subheader="By total value"
              sx={{ borderBottom: `1.5px solid ${theme.palette.divider}` }}
            />
            <CardContent>
              {dashboard?.top?.customers?.length > 0 ? (
                <List>
                  {dashboard.top.customers.map((cust, idx) => (
                    <ListItem key={cust.customer__id}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: theme.palette.info.light, color: theme.palette.info.dark }}>
                          <Person />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={cust.customer__email}
                        secondary={`Total: USD ${cust.total}`}
                        sx={{ color: theme.palette.text.primary }}
                      />
                      {idx === 0 && (
                        <Tooltip title="Top Customer">
                          <span><Star color="warning" sx={{ ml: 2 }} /></span>
                        </Tooltip>
                      )}
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                  No customer data.
                </Typography>
              )}
            </CardContent>
          </GlassCard>
        </div>
        <div className="col-12 col-lg-6">
          <GlassCard color={theme.palette.background.paper}>
            <CardHeader
              avatar={<Leaderboard sx={{ color: theme.palette.success.main }} />}
              title="Top Vendor"
              subheader="By total value"
              sx={{ borderBottom: `1.5px solid ${theme.palette.divider}` }}
            />
            <CardContent>
              {dashboard?.top?.vendors?.length > 0 ? (
                <List>
                  {dashboard.top.vendors.map((ven, idx) => (
                    <ListItem key={ven.vendor__id}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: theme.palette.success.light, color: theme.palette.success.dark }}>
                          <Store />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={ven.vendor__email}
                        secondary={`Total: USD ${ven.total}`}
                        sx={{ color: theme.palette.text.primary }}
                      />
                      {idx === 0 && (
                        <Tooltip title="Top Vendor">
                          <span><Star color="warning" sx={{ ml: 2 }} /></span>
                        </Tooltip>
                      )}
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                  No vendor data.
                </Typography>
              )}
            </CardContent>
          </GlassCard>
        </div>
      </div>

      {/* BOTTOM: ORDERS CHART & SUBSCRIPTION RADIAL */}
      <div className="row gy-4 mb-4">
        <div className="col-12 col-md-7">
          <GlassCard color={theme.palette.background.paper}>
            <CardHeader
              avatar={<BarChartIcon sx={{ color: theme.palette.warning.main }} />}
              title="Orders by Week"
              subheader="Weekly order counts"
              sx={{ borderBottom: `1.5px solid ${theme.palette.divider}` }}
            />
            <CardContent sx={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartByWeek}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                  <XAxis dataKey="name" stroke={theme.palette.text.secondary} />
                  <YAxis stroke={theme.palette.text.secondary} />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="count" name="Orders" fill={theme.palette.warning.main} radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </GlassCard>
        </div>
        <div className="col-12 col-md-5">
          <GlassCard color={theme.palette.background.paper}>
            <CardHeader
              avatar={<TrendingUp sx={{ color: theme.palette.info.main }} />}
              title="Subscriptions Status"
              subheader="Total vs Cancelled"
              sx={{ borderBottom: `1.5px solid ${theme.palette.divider}` }}
            />
            <CardContent sx={{ height: 280, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ResponsiveContainer width="100%" height="90%">
                <RadialBarChart
                  innerRadius="80%"
                  outerRadius="100%"
                  data={[
                    { name: "Active", value: dashboard?.subscriptions?.total - dashboard?.subscriptions?.cancelled, fill: theme.palette.info.main },
                    { name: "Cancelled", value: dashboard?.subscriptions?.cancelled, fill: theme.palette.error.main },
                  ]}
                  startAngle={90}
                  endAngle={-270}
                >
                  <RadialBar
                    minAngle={15}
                    background
                    clockWise
                    dataKey="value"
                  />
                  <Legend
                    iconSize={12}
                    width={100}
                    height={50}
                    layout="vertical"
                    verticalAlign="middle"
                    align="right"
                  />
                  <RechartsTooltip />
                </RadialBarChart>
              </ResponsiveContainer>
              <Box sx={{ textAlign: "center", position: "absolute", left: "62%", top: "45%" }}>
                <Typography variant="h4" sx={{ color: theme.palette.info.main }}>
                  {dashboard?.subscriptions?.total ?? "-"}
                </Typography>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                  Subscriptions
                </Typography>
              </Box>
            </CardContent>
          </GlassCard>
        </div>
      </div>

      {/* TOP COMPLETED CATEGORIES */}
      <div className="row mb-4">
        <div className="col-12">
          <GlassCard color={theme.palette.background.paper}>
            <CardHeader
              avatar={<AccountTree sx={{ color: theme.palette.warning.main }} />}
              title="Top Completed Category"
              subheader="By time period"
              sx={{ borderBottom: `1.5px solid ${theme.palette.divider}` }}
            />
            <CardContent>
              <div className="row">
                <div className="col-12 col-md-4 mb-2">
                  <Chip
                    label={`Last Week: ${dashboard?.top_completed_categories?.last_week ?? "-"}`}
                    color="success"
                    variant="filled"
                    icon={<Insights />}
                  />
                </div>
                <div className="col-12 col-md-4 mb-2">
                  <Chip
                    label={`Last Month: ${dashboard?.top_completed_categories?.last_month ?? "-"}`}
                    color="info"
                    variant="filled"
                    icon={<Insights />}
                  />
                </div>
                <div className="col-12 col-md-4 mb-2">
                  <Chip
                    label={`Last Year: ${dashboard?.top_completed_categories?.last_year ?? "-"}`}
                    color="warning"
                    variant="filled"
                    icon={<Insights />}
                  />
                </div>
              </div>
            </CardContent>
          </GlassCard>
        </div>
      </div>

      {/* NEW COMPARATIVE CHARTS */}
      <div className="row gy-4 mb-4">
        {/* Financial Breakdown Bar Chart */}
        <div className="col-12 col-md-6">
          <GlassCard color={theme.palette.background.paper}>
            <CardHeader
              avatar={<BarChartIcon sx={{ color: theme.palette.primary.main }} />}
              title="Financial Breakdown"
              subheader="Total vs Last Month vs Last Year"
              sx={{ borderBottom: `1.5px solid ${theme.palette.divider}` }}
            />
            <CardContent sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueChart} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                  <XAxis dataKey="name" stroke={theme.palette.text.secondary} />
                  <YAxis stroke={theme.palette.text.secondary} />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="Revenue" fill={theme.palette.success.main} name="Revenue" />
                  <Bar dataKey="Commission" fill={theme.palette.info.main} name="Commission" />
                  <Bar dataKey="Subscriptions" fill={theme.palette.warning.main} name="Subscriptions" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </GlassCard>
        </div>
        {/* Orders & Subscriptions Status Bar Chart */}
        <div className="col-12 col-md-6">
          <GlassCard color={theme.palette.background.paper}>
            <CardHeader
              avatar={<InsertChart sx={{ color: theme.palette.secondary.main }} />}
              title="Orders & Subs Status"
              subheader="Active vs Cancelled"
              sx={{ borderBottom: `1.5px solid ${theme.palette.divider}` }}
            />
            <CardContent sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusChart} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                  <XAxis dataKey="name" stroke={theme.palette.text.secondary} />
                  <YAxis stroke={theme.palette.text.secondary} />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="Active" stackId="a" fill={theme.palette.success.main} name="Active" />
                  <Bar dataKey="Cancelled" stackId="a" fill={theme.palette.error.main} name="Cancelled" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </GlassCard>
        </div>
      </div>

    </Box>
  );
}