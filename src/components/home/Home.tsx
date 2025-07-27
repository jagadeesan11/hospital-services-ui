import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import chettinadLogo from '../../assets/chettinad-logo.svg';

const Home: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mt: 4,
          mb: 4
        }}
      >
        <img
          src={chettinadLogo}
          alt="Chettinad Hospital"
          style={{
            maxWidth: '400px',
            width: '100%',
            height: 'auto',
            marginBottom: '2rem'
          }}
        />
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome to Chettinad Hospital Management System
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" align="center">
          Providing Excellence in Healthcare Management
        </Typography>
      </Box>
    </Container>
  );
};

export default Home;
