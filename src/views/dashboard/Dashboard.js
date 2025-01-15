import React, { useEffect, useState } from 'react';
import { Grid, Box } from '@mui/material';
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


const Dashboard = () => {

  // pie chart

  const desktopOS = [
    { id: 'Dubai', value: 45, color: '#3f51b5' },
    { id: 'Abu Dhabi', value: 30, color: '#ff9800' },
    { id: 'Sharjah', value: 15, color: '#4caf50' },
    { id: 'Ajman', value: 10, color: '#f44336' },
  ];

  const valueFormatter = (value) => `${value.id} - ${value.value}%`;

  // get Dashboard Data

  const authTokens = JSON.parse(localStorage.getItem('authTokens'));
  let tokenStr = String(authTokens.access);
  const [dashboardData, setdashboardData] = useState([])

  const fetchDashboard = () => {
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
            });
        });
      });
  };

  useEffect(() => {
    fetchDashboard()
  }, [])
  

  return (
    <PageContainer title="Dashboard" description="this is Dashboard">
      <Box>
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <DashboardCard title="Hotel Overview">
              <PieChart
                series={[
                  {
                    data: desktopOS,
                    highlightScope: { fade: 'global', highlight: 'item' },
                    faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
                    valueFormatter,
                  },
                ]}
                height={300}
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
                <YearlyBreakup value={dashboardData.impressions_current_year} />
              </Grid>
              <Grid item xs={12}>
                <MonthlyEarnings  value={dashboardData.impressions_current_month}/>
              </Grid>
            </Grid>
          </Grid>
          {/* <Grid item xs={12} lg={12}>
            <ProductPerformance value={dashboardData.top_impression_hotels}/>
          </Grid> */}
          <Grid item xs={12}>
            <Blog value={dashboardData.top_impression_hotels}/>
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
};

export default Dashboard;
