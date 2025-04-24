import React from "react"
import { useState, useEffect } from "react"
import {
  Box,
  Container,
  Grid,
  Typography,
  Avatar,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
  Chip,
  LinearProgress,
  Tab,
  Tabs,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
  Skeleton,
} from "@mui/material"
import {
  TrendingUp,
  People,
  AttachMoney,
  BarChart as BarChartIcon,
  MoreVert,
  ArrowUpward,
  ArrowDownward,
  CheckCircle,
  Schedule,
  CalendarToday,
  Refresh,
  FilterList,
  Download,
} from "@mui/icons-material"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts"

// Mock data for the dashboard
const fetchDashboardData = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        user: {
          name: "Alex Johnson",
          role: "Product Manager",
          avatar: "/placeholder.svg?height=128&width=128",
          email: "alex.johnson@example.com",
          notifications: 5,
        },
        stats: {
          revenue: 24580,
          revenueIncrease: 12.5,
          users: 1250,
          usersIncrease: 18.2,
          orders: 520,
          ordersIncrease: -5.4,
          conversion: 28.6,
          conversionIncrease: 4.6,
        },
        revenueData: [
          { name: "Jan", value: 4000 },
          { name: "Feb", value: 3000 },
          { name: "Mar", value: 5000 },
          { name: "Apr", value: 4000 },
          { name: "May", value: 6000 },
          { name: "Jun", value: 5500 },
          { name: "Jul", value: 7000 },
          { name: "Aug", value: 8000 },
          { name: "Sep", value: 7500 },
          { name: "Oct", value: 9000 },
          { name: "Nov", value: 8500 },
          { name: "Dec", value: 10000 },
        ],
        trafficData: [
          { name: "Direct", value: 35 },
          { name: "Social", value: 25 },
          { name: "Referral", value: 20 },
          { name: "Organic", value: 15 },
          { name: "Other", value: 5 },
        ],
        deviceData: [
          { name: "Desktop", value: 55 },
          { name: "Mobile", value: 35 },
          { name: "Tablet", value: 10 },
        ],
        recentTransactions: [
          { id: 1, customer: "John Doe", status: "Completed", date: "2023-10-15" },
          { id: 2, customer: "Jane Smith", status: "Pending", date: "2023-10-14" },
          { id: 3, customer: "Robert Johnson", status: "Completed", date: "2023-10-13" },
          { id: 4, customer: "Emily Davis", status: "Failed", date: "2023-10-12" },
          { id: 5, customer: "Michael Brown", amount: 540, status: "Completed", date: "2023-10-11" },
        ],
        tasks: [
          { id: 1, title: "Review marketing strategy", status: "Completed", dueDate: "2023-10-10" },
          { id: 2, title: "Prepare quarterly report", status: "In Progress", dueDate: "2023-10-20" },
          { id: 3, title: "Update product roadmap", status: "Pending", dueDate: "2023-10-25" },
          { id: 4, title: "Customer feedback analysis", status: "In Progress", dueDate: "2023-10-18" },
        ],
        performance: {
          sales: 78,
          marketing: 65,
          support: 82,
          development: 91,
        },
      })
    }, 1000) // Simulate network delay
  })
}

// Stat Card Component
const StatCard = ({ title, value, increase, icon, color }) => {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" component="div" sx={{ fontWeight: "bold", mb: 1 }}>
              {typeof value === "number" && title.includes("Revenue")
                ? `$${value.toLocaleString()}`
                : value.toLocaleString()}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              {increase > 0 ? (
                <ArrowUpward sx={{ fontSize: 16, color: "success.main", mr: 0.5 }} />
              ) : (
                <ArrowDownward sx={{ fontSize: 16, color: "error.main", mr: 0.5 }} />
              )}
              <Typography
                variant="body2"
                sx={{
                  color: increase > 0 ? "success.main" : "error.main",
                  fontWeight: "medium",
                }}
              >
                {Math.abs(increase)}%
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                vs last month
              </Typography>
            </Box>
          </Box>
          <Avatar sx={{ bgcolor: `${color}.light`, color: `${color}.main`, p: 1.5 }}>{icon}</Avatar>
        </Box>
      </CardContent>
    </Card>
  )
}

// Transaction Status Component
const TransactionStatus = ({ status }) => {
  let color = "default"
  let icon = null

  switch (status) {
    case "Completed":
      color = "success"
      icon = <CheckCircle fontSize="small" />
      break
    case "Pending":
      color = "warning"
      icon = <Schedule fontSize="small" />
      break
    case "Failed":
      color = "error"
      icon = <ArrowDownward fontSize="small" />
      break
    default:
      color = "default"
  }

  return <Chip label={status} color={color} size="small" icon={icon} variant="outlined" />
}

// Performance Indicator Component
const PerformanceIndicator = ({ label, value }) => {
  let color = "primary"

  if (value >= 80) color = "success"
  else if (value >= 60) color = "primary"
  else if (value >= 40) color = "warning"
  else color = "error"

  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
        <Typography variant="body2">{label}</Typography>
        <Typography variant="body2" fontWeight="medium">
          {value}%
        </Typography>
      </Box>
      <LinearProgress variant="determinate" value={value} color={color} sx={{ height: 8, borderRadius: 5 }} />
    </Box>
  )
}

// Main Dashboard Component
export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(0)
  const [anchorEl, setAnchorEl] = useState(null)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchDashboardData()
        setDashboardData(data)
      } catch (error) {
        console.error("Error loading dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
  }

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleRefresh = async () => {
    setLoading(true)
    try {
      const data = await fetchDashboardData()
      setDashboardData(data)
    } catch (error) {
      console.error("Error refreshing dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Skeleton variant="rectangular" height={80} />
          </Grid>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={12} sm={6} md={3} key={item}>
              <Skeleton variant="rectangular" height={120} />
            </Grid>
          ))}
          <Grid item xs={12} md={8}>
            <Skeleton variant="rectangular" height={300} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rectangular" height={300} />
          </Grid>
          <Grid item xs={12}>
            <Skeleton variant="rectangular" height={250} />
          </Grid>
        </Grid>
      </Container>
    )
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
          flexDirection: isMobile ? "column" : "row",
          gap: isMobile ? 2 : 0,
        }}
      >
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome back, {dashboardData.user.name}! Here's what's happening today.
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button variant="outlined" startIcon={<Download />} sx={{ borderRadius: 2 }}>
            Export
          </Button>
          <Button variant="contained" startIcon={<Refresh />} onClick={handleRefresh} sx={{ borderRadius: 2 }}>
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Revenue"
            value={dashboardData.stats.revenue}
            increase={dashboardData.stats.revenueIncrease}
            icon={<AttachMoney />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Users"
            value={dashboardData.stats.users}
            increase={dashboardData.stats.usersIncrease}
            icon={<People />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="New Orders"
            value={dashboardData.stats.orders}
            increase={dashboardData.stats.ordersIncrease}
            icon={<BarChartIcon />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Conversion Rate"
            value={`${dashboardData.stats.conversion}%`}
            increase={dashboardData.stats.conversionIncrease}
            icon={<TrendingUp />}
            color="info"
          />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Card sx={{ height: "100%" }}>
            <CardHeader
              title="Revenue Overview"
              subheader="Monthly revenue for the current year"
              action={
                <IconButton aria-label="settings" onClick={handleMenuClick}>
                  <MoreVert />
                </IconButton>
              }
            />
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
              <MenuItem onClick={handleMenuClose}>Last 6 months</MenuItem>
              <MenuItem onClick={handleMenuClose}>Last year</MenuItem>
              <MenuItem onClick={handleMenuClose}>All time</MenuItem>
            </Menu>
            <Divider />
            <CardContent sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dashboardData.revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip formatter={(value) => [`$${value}`, "Revenue"]} />
                  <Area type="monotone" dataKey="value" stroke="#8884d8" fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: "100%" }}>
            <CardHeader title="Traffic Sources" subheader="Where your visitors come from" />
            <Divider />
            <CardContent sx={{ height: 300, display: "flex", justifyContent: "center", alignItems: "center" }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dashboardData.trafficData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {dashboardData.trafficData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, "Traffic"]} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Transactions and Tasks */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} lg={8}>
          <Card>
            <CardHeader
              title="Recent Transactions"
              subheader="Your latest financial activities"
              action={
                <Button size="small" endIcon={<FilterList />}>
                  Filter
                </Button>
              }
            />
            <Divider />
            <Box sx={{ overflow: "auto", maxHeight: 350 }}>
              <List sx={{ width: "100%" }}>
                {dashboardData.recentTransactions.map((transaction) => (
                  <React.Fragment key={transaction.id}>
                    <ListItem secondaryAction={<TransactionStatus status={transaction.status} />}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: "primary.light" }}>{transaction.customer.charAt(0)}</Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={transaction.customer}
                        secondary={
                          <Typography variant="body2" color="text.secondary">
                            {new Date(transaction.date).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </Typography>
                        }
                      />
                      <Typography variant="body1" fontWeight="medium" sx={{ ml: 2 }}>
                        {/* ${transaction.amount.toLocaleString()} */}
                      </Typography>
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </React.Fragment>
                ))}
              </List>
            </Box>
            <Box sx={{ p: 2, display: "flex", justifyContent: "center" }}>
              <Button color="primary">View All Transactions</Button>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <CardHeader title="Performance Metrics" subheader="Key performance indicators" />
            <Divider />
            <CardContent sx={{ flexGrow: 1 }}>
              <PerformanceIndicator label="Sales Performance" value={dashboardData.performance.sales} />
              <PerformanceIndicator label="Marketing ROI" value={dashboardData.performance.marketing} />
              <PerformanceIndicator label="Customer Support" value={dashboardData.performance.support} />
              <PerformanceIndicator label="Development Progress" value={dashboardData.performance.development} />
            </CardContent>
            <Box sx={{ p: 2, display: "flex", justifyContent: "center" }}>
              <Button color="primary">View Detailed Report</Button>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Device Distribution */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardHeader title="Device Distribution" subheader="User device preferences" />
            <Divider />
            <CardContent>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dashboardData.deviceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value}%`, "Usage"]} />
                    <Legend />
                    <Bar dataKey="value" name="Percentage" fill="#8884d8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tasks Section */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <Card>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs value={activeTab} onChange={handleTabChange} aria-label="task tabs">
                <Tab label="All Tasks" />
                <Tab label="In Progress" />
                <Tab label="Completed" />
                <Tab label="Pending" />
              </Tabs>
            </Box>
            <List sx={{ width: "100%" }}>
              {dashboardData.tasks
                .filter((task) => {
                  if (activeTab === 0) return true
                  if (activeTab === 1) return task.status === "In Progress"
                  if (activeTab === 2) return task.status === "Completed"
                  if (activeTab === 3) return task.status === "Pending"
                  return true
                })
                .map((task) => (
                  <React.Fragment key={task.id}>
                    <ListItem
                      secondaryAction={
                        <Chip
                          label={task.status}
                          color={
                            task.status === "Completed"
                              ? "success"
                              : task.status === "In Progress"
                                ? "primary"
                                : "warning"
                          }
                          size="small"
                        />
                      }
                    >
                      <ListItemAvatar>
                        <Avatar
                          sx={{
                            bgcolor:
                              task.status === "Completed"
                                ? "success.light"
                                : task.status === "In Progress"
                                  ? "primary.light"
                                  : "warning.light",
                          }}
                        >
                          {task.status === "Completed" ? <CheckCircle /> : <Schedule />}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={task.title}
                        secondary={
                          <Box sx={{ display: "flex", alignItems: "center", mt: 0.5 }}>
                            <CalendarToday sx={{ fontSize: 14, mr: 0.5, color: "text.secondary" }} />
                            <Typography variant="body2" color="text.secondary">
                              Due:{" "}
                              {new Date(task.dueDate).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </React.Fragment>
                ))}
            </List>
            {activeTab === 0 && dashboardData.tasks.length === 0 && (
              <Box sx={{ p: 4, textAlign: "center" }}>
                <Typography variant="body1" color="text.secondary">
                  No tasks available
                </Typography>
              </Box>
            )}
            {activeTab !== 0 &&
              dashboardData.tasks.filter((task) => {
                if (activeTab === 1) return task.status === "In Progress"
                if (activeTab === 2) return task.status === "Completed"
                if (activeTab === 3) return task.status === "Pending"
                return true
              }).length === 0 && (
                <Box sx={{ p: 4, textAlign: "center" }}>
                  <Typography variant="body1" color="text.secondary">
                    No tasks in this category
                  </Typography>
                </Box>
              )}
          </Card>
        </Grid>
      </Grid>
    </Container>
  )
}

