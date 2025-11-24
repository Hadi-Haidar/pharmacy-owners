import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Medicines from './pages/Medicines';
import MyPharmacy from './pages/MyPharmacy';
import Chat from './pages/Chat';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          
          {/* Protected routes with Layout */}
          <Route
            path="/medicines"
            element={
              <ProtectedRoute>
                <Layout>
                  <Medicines />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/my-inventory"
            element={
              <ProtectedRoute>
                <Layout>
                  <MyPharmacy />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <Layout>
                  <Chat />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Catch all - redirect to landing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
