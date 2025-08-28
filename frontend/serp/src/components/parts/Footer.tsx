import React from 'react';
import { Box, Link, Typography } from '@mui/material';

const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 2,
        px: 2,
        backgroundColor: '#f5f5f5',
        textAlign: 'center',
      }}
    >
      <Typography variant="body2" color="text.secondary" align="center">
            {'Copyright © '}
            <Link color="inherit" href="http://www.sci-it.co.jp/">
              SCI
            </Link>
            {' '}
            {new Date().getFullYear()}
            {'.'}
          </Typography>
    </Box>
  );
};

export default Footer;
