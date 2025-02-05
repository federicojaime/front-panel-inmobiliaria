// src/routes.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { PropertiesPage } from './pages/PropertiesPage';
import { PropertyFormPage } from './pages/PropertyFormPage';
import { UsersPage } from './pages/UsersPage';
import { UserFormPage } from './pages/UserFormPage';

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

export function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <LoginPage />}
      />
      
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout>
              <DashboardPage />
            </Layout>
          </PrivateRoute>
        }
      />
      
      <Route
        path="/properties"
        element={
          <PrivateRoute>
            <Layout>
              <PropertiesPage />
            </Layout>
          </PrivateRoute>
        }
      />
      
      <Route
        path="/properties/new"
        element={
          <PrivateRoute>
            <Layout>
              <PropertyFormPage />
            </Layout>
          </PrivateRoute>
        }
      />
      
      <Route
        path="/properties/:id/edit"
        element={
          <PrivateRoute>
            <Layout>
              <PropertyFormPage />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/users"
        element={
          <PrivateRoute>
            <Layout>
              <UsersPage />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/users/new"
        element={
          <PrivateRoute>
            <Layout>
              <UserFormPage />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/users/:id/edit"
        element={
          <PrivateRoute>
            <Layout>
              <UserFormPage />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}