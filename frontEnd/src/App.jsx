import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Pages/Login/Login';
import PrivateRoute from './PrivateRoute';
import Home from './Pages/Home';
import Register from './Pages/Login/Register';
import Navbar from './Components/NavBar/Navbar';
import DocumentsPage from './Pages/File/DocumentsPage';
import PdfPreviewPage from './Pages/File/PdfPreviewPage'
import AI from './Pages/AI/AI';
function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Home />} />

        <Route path="/documents" element={<PrivateRoute element={<DocumentsPage />} />} />
        <Route path="/AI" element={<PrivateRoute element={<AI />} />} />
        <Route path="/pdf-preview/:nome" element={<PrivateRoute element={<PdfPreviewPage />} />} />

      </Routes>
    </Router>
  );
}

export default App;