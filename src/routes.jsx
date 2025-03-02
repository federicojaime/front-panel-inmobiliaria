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
import { OwnersPage } from './pages/OwnersPage';
import { OwnerFormPage } from './pages/OwnerFormPage';
import { RentedPropertiesPage } from './pages/RentedPropertiesPage';
import { SoldPropertiesPage } from './pages/SoldPropertiesPage';

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
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
        path="/properties/rented"
        element={
          <PrivateRoute>
            <Layout>
              <RentedPropertiesPage />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/properties/sold"
        element={
          <PrivateRoute>
            <Layout>
              <SoldPropertiesPage />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/owners"
        element={
          <PrivateRoute>
            <Layout>
              <OwnersPage />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/owners/new"
        element={
          <PrivateRoute>
            <Layout>
              <OwnerFormPage />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/owners/:id/edit"
        element={
          <PrivateRoute>
            <Layout>
              <OwnerFormPage />
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

export default AppRoutes;