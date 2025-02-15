import React, { useEffect, useState } from 'react';
import { Grid, Box, CircularProgress } from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';
import SalesOverview from './components/SalesOverview';
import YearlyBreakup from './components/YearlyBreakup';
import RecentTransactions from './components/RecentTransactions';
import ProductPerformance from './components/ProductPerformance';
import Blog from './components/Blog';
import MonthlyEarnings from './components/MonthlyEarnings';
import { PieChart } from '@mui/x-charts/PieChart';
import { Typography } from '@mui/material';
import DashboardCard from '../../components/shared/DashboardCard';
import axios from 'axios';
import { url } from '../../../mainurl';
import Blog2 from './components/Blog2';


const Dashboard = () => {


  // get Dashboard Data

  const authTokens = JSON.parse(localStorage.getItem('authTokens'));
  let tokenStr = String(authTokens.access);
  const [dashboardData, setdashboardData] = useState([])
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboard = () => {
    setIsLoading(true);
    axios
      .get(`${url}/hotel/statistics/`, {
        headers: {
          Authorization: `Bearer ${tokenStr}`,
          "Content-Type": "application/json",
        },
        withCredentials: false,
      })
      .then((res) => {
        setdashboardData(res.data);
        setIsLoading(false);
      })
      .catch((error) => {
        let refresh = String(authTokens.refresh);
        axios.post(`${url}/api/token/refresh/`, { refresh: refresh }).then((res) => {
          localStorage.setItem("authTokens", JSON.stringify(res.data));
          //   setNewAuthTokens(JSON.stringify(res.data));

          const new_headers = {
            Authorization: `Bearer ${res.data.access}`,
          };
          axios
            .get(`${url}/hotel/statistics/`, { headers: new_headers })
            .then((res) => {
              setdashboardData(res.data);
              setIsLoading(false);
            });
        });
      });
  };

  useEffect(() => {
    fetchDashboard()
  }, [])

  // pie chart

  const totalImpressions = dashboardData.impressions_current_month + dashboardData.impressions_current_year + dashboardData.impressions_last_week + dashboardData.impressions_today || 0;

  const desktopOS = [
    { id: 'Today', count: dashboardData.impressions_today, value: (dashboardData.impressions_today / totalImpressions * 100).toFixed(2), color: '#9BBFEC ' }, // Blue for today
    { id: 'Last Week', count: dashboardData.impressions_last_week, value: (dashboardData.impressions_last_week / totalImpressions * 100).toFixed(2), color: '#E8A09A ' }, // Green for weekly
    { id: 'Current Month', count: dashboardData.impressions_current_month, value: (dashboardData.impressions_current_month / totalImpressions * 100).toFixed(2), color: '#FBE29F' }, // Yellow for monthly
    { id: 'Current Year', count: dashboardData.impressions_current_year, value: (dashboardData.impressions_current_year / totalImpressions * 100).toFixed(2), color: '#C6D68F ' }, // Red for yearly
  ];


  const valueFormatter = (value) => `${value.id} - ${value.count}`;


  return (
    <PageContainer title="Dashboard" description="this is Dashboard">
      <Box>
        {isLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="70vh">
            <CircularProgress size={40} />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {[
              { title: "Total Hotels", count: dashboardData.total_hotels || 0, bgColor: "primary.light" },
              { title: "Impressions Last Year", count: dashboardData.impressions_last_year || 0, bgColor: "secondary.light" },
              { title: "Impressions Current Year", count: dashboardData.impressions_current_year || 0, bgColor: "success.light" },
              { title: "Impressions Current Month", count: dashboardData.impressions_current_month || 0, bgColor: "warning.light" },
              { title: "Impressions Last Week", count: dashboardData.impressions_last_week || 0, bgColor: "info.light" },
              { title: "Impressions Today", count: dashboardData.impressions_today || 0, bgColor: "primary.light" },
            ].map((item, index) => (
              <Grid item xs={12} sm={4} key={index}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "start",
                    justifyContent: "center",
                    p: 3,
                    borderRadius: 2,
                    boxShadow: 3,
                    bgcolor: item.bgColor,
                  }}
                >
                  <Typography variant="h5" fontWeight="bold" color="">
                    {item.title}
                  </Typography>
                  <Typography variant="h1" color="" fontWeight="bold">
                    {item.count}
                  </Typography>
                </Box>
              </Grid>
            ))}
            {/* <Grid item xs={12} lg={8}>
            <DashboardCard title={`Impressions Overview (${totalImpressions})`}>
              <PieChart
                series={[
                  {
                    data: desktopOS,
                    highlightScope: { fade: 'global', highlight: 'item' },
                    faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
                    valueFormatter,
                  },
                ]}
                height={350}
                legend={{
                  position: 'right',
                  spacing: 10,
                  labels: desktopOS.map((item) => item.id),
                }}
              />
              <Box mt={3} display="flex" justifyContent="center">
                {desktopOS.map((item) => (
                  <Box
                    key={item.id}
                    display="flex"
                    alignItems="center"
                    mr={3}
                  >
                    <Box
                      width={15}
                      height={15}
                      bgcolor={item.color}
                      mr={1}
                    />
                    <Typography variant="body1">{item.id}</Typography>
                  </Box>
                ))}
              </Box>
            </DashboardCard>
          </Grid>
          <Grid item xs={12} lg={4}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <YearlyBreakup value={dashboardData.impressions_current_year} totalcount={totalImpressions} lastyear={dashboardData.impressions_last_year} />
              </Grid>
              <Grid item xs={12}>
                <MonthlyEarnings value={dashboardData.impressions_current_month} />
              </Grid>
            </Grid>
          </Grid> */}
            {/* <Grid item xs={12} lg={12}>
            <ProductPerformance value={dashboardData.top_impression_hotels}/>
          </Grid> */}
            {/* <Grid item xs={12}>
            <Blog value={dashboardData.top_impression_hotels} />
          </Grid> */}
            <Grid item xs={12}>
              <Blog2 value={dashboardData.most_favorite_hotels} />
            </Grid>
            <Grid item xs={12}>
              <Blog value={dashboardData.top_impression_hotels} />
            </Grid>
          </Grid>
        )}
      </Box>
    </PageContainer>
  );
};

export default Dashboard;
