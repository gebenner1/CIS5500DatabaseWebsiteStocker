import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import { Navbar } from './components/Navbar';
import { Box, Typography } from '@mui/material';
import { Login } from './components/account/Login';
import { useState } from 'react';
import { Register } from './components/account/Register';
import { PasswordReset } from './components/account/PasswordReset';
import { Security } from './components/security/Security';
import Portfolio from './components/portfolio/Portfolio';

export const App = () => {

  const [auth, setAuth] = useState(sessionStorage.getItem("token") !== null);

  return (
    <BrowserRouter>
      <Navbar auth={auth} setAuth={setAuth} />
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="100%" maxWidth="xs" marginTop={12}>
        <Routes>
          <Route path="/login" element={<Login auth={auth} setAuth={setAuth} />} />
          <Route path="/register" element={<Register auth={auth} />} />
          <Route path="/password-reset" element={<PasswordReset auth={auth} />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/security/:ticker" element={<Security />} />
        </Routes>
        <Typography variant="body2" marginTop={4}>Made with ❤️ in Philadelphia </Typography>
      </Box>
    </BrowserRouter>
  );
}

