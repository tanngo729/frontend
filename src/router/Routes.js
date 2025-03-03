import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import PrivateRoute from '../components/PrivateRoute';
import LoginPage from '../views/Login/LoginPage';

// Lazy load các trang
const HomePage = lazy(() => import('../views/client/Home/HomePage'));
const ProductListPage = lazy(() => import('../views/client/Products/ProductListPage'));
const ProductDetailView = lazy(() => import('../views/client/Products/ProductDetailView'));
const AdminDashboard = lazy(() => import('../views/admin/dashboard/AdminDashboard'));
const ProductAdminView = lazy(() => import('../views/admin/products/ProductAdminView'));
const AdminProductDetailView = lazy(() => import('../views/admin/products/AdminProductDetailView'));
const CategoryAdminView = lazy(() => import('../views/admin/categories/CategoryAdminView'));
const RoleManagement = lazy(() => import('../views/admin/Roles/RoleManagement'));
const PermissionAssignment = lazy(() => import('../views/admin/Permissions/PermissionAssignment'));
const AccountManagement = lazy(() => import('../views/admin/Accounts/AccountManagement'));
const SettingPage = lazy(() => import('../views/admin/Setting/SettingPage'));
const LogHistoryPage = lazy(() => import('../views/admin/Logs/LogHistoryPage'));
const ProfilePage = lazy(() => import('../views/admin/Profile/ProfilePage'));
const Banner = lazy(() => import('../views/admin/banner/BannerManagement'));

const AppRoutes = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductListPage />} />
        <Route path="/products/:id" element={<ProductDetailView />} />

        <Route path="/admin" element={
          <PrivateRoute>
            <AdminDashboard />
          </PrivateRoute>
        } />
        <Route path="/admin/products" element={
          <PrivateRoute>
            <ProductAdminView />
          </PrivateRoute>
        } />
        <Route path="/admin/products/:id" element={
          <PrivateRoute>
            <AdminProductDetailView />
          </PrivateRoute>
        } />
        <Route path="/admin/categories" element={
          <PrivateRoute>
            <CategoryAdminView />
          </PrivateRoute>
        } />
        <Route path="/admin/roles" element={
          <PrivateRoute>
            <RoleManagement />
          </PrivateRoute>
        } />
        <Route path="/admin/permissions" element={
          <PrivateRoute>
            <PermissionAssignment />
          </PrivateRoute>
        } />
        <Route path="/admin/accounts" element={
          <PrivateRoute>
            <AccountManagement />
          </PrivateRoute>
        } />
        <Route path="/admin/settings/*" element={
          <PrivateRoute>
            <SettingPage />
          </PrivateRoute>
        } />
        <Route path="/admin/logs" element={
          <PrivateRoute>
            <LogHistoryPage />
          </PrivateRoute>
        } />
        <Route path="/admin/profile" element={
          <PrivateRoute>
            <ProfilePage />
          </PrivateRoute>
        } />
        <Route path="/admin/banners" element={
          <PrivateRoute>
            <Banner />
          </PrivateRoute>
        } />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
