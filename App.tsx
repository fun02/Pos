import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './LoginPage'; // Pastikan path-nya sesuai

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ini yang akan merender form login di browser */}
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
}
