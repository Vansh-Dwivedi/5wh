import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { HelmetProvider } from 'react-helmet-async';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import theme from './theme/theme';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import NewsPage from './pages/NewsPage';
import NewsDetailPage from './pages/NewsDetailPage';
import AudioPage from './pages/AudioPage';
import AudioDetailPage from './pages/AudioDetailPage';
import VideosPage from './pages/VideosPage';
import VideoDetailPage from './pages/VideoDetailPage';
import LivePage from './pages/LivePage';
import OpinionPage from './pages/OpinionPage';
import SantokhSinghDhirPage from './pages/SantokhSinghDhirPage';
import DhirStoryPage from './pages/DhirStoryPage';
import ContactPage from './pages/ContactPage';
import AboutPage from './pages/AboutPage';
import AdminLogin from './pages/admin/AdminLogin';
import AdminRouter from './pages/admin/AdminRouter';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

function App() {
  const ScrollToTop = () => {
    const { pathname } = useLocation();
    useEffect(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, [pathname]);
    return null;
  };
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AuthProvider>
            <Router>
              <ScrollToTop />
              <div className="App" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <Header />
                <main style={{ flex: 1 }}>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/news" element={<NewsPage />} />
                    <Route path="/news/:slug" element={<NewsDetailPage />} />
                    <Route path="/audio" element={<AudioPage />} />
                    <Route path="/audio/:slug" element={<AudioDetailPage />} />
                    <Route path="/videos" element={<VideosPage />} />
                    <Route path="/videos/:slug" element={<VideoDetailPage />} />
                    <Route path="/live" element={<LivePage />} />
                    <Route path="/5wh-opinion" element={<OpinionPage />} />
                    <Route path="/santokh-singh-dhir" element={<SantokhSinghDhirPage />} />
                    <Route path="/santokh-singh-dhir/:slug" element={<DhirStoryPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route 
                      path="/admin/*" 
                      element={
                        <ProtectedRoute requiredRole="admin">
                          <AdminRouter />
                        </ProtectedRoute>
                      } 
                    />
                  </Routes>
                </main>
                <Footer />
              </div>
            </Router>
          </AuthProvider>
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </ThemeProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
