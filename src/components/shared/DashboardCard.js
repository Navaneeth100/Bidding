import React from 'react';
import { Card, CardContent, Typography, Stack, Box, useTheme } from '@mui/material';

const DashboardCard = ({
  title,
  subtitle,
  children,
  action,
  footer,
  cardheading,
  headtitle,
  headsubtitle,
  middlecontent,
}) => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        padding: 0,
        backgroundColor: theme.palette.background.paper, // dark mode compatible
        color: theme.palette.text.primary,
        boxShadow: theme.shadows[3], // optional shadow from theme
        borderRadius: 2,
      }}
      elevation={9}
      variant={undefined}
    >
      {cardheading ? (
        <CardContent>
          <Typography variant="h5" sx={{ color: 'text.primary' }}>
            {headtitle}
          </Typography>
          <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
            {headsubtitle}
          </Typography>
        </CardContent>
      ) : (
        <CardContent sx={{ p: "30px" }}>
          {title ? (
            <Stack
              direction="row"
              spacing={2}
              justifyContent="space-between"
              alignItems={'center'}
              mb={3}
            >
              <Box>
                {title ? (
                  <Typography variant="h5" sx={{ color: 'text.primary' }}>
                    {title}
                  </Typography>
                ) : null}

                {subtitle ? (
                  <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                    {subtitle}
                  </Typography>
                ) : null}
              </Box>
              {action}
            </Stack>
          ) : null}

          {children}
        </CardContent>
      )}

      {middlecontent}
      {footer}
    </Card>
  );
};

export default DashboardCard;
