// src/router/Routes.js
import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminPrivateRoute from '../components/AdminPrivateRoute';
import { ProtectedClientRoute } from '../components/ProtectedRoute';
import LoginPage from '../views/client/Login/LoginPage';
import RegisterPage from '../views/client/Register/RegisterPage';
import ForgotPasswordPage from '../views/client/ForgotPassword/ForgotPasswordPage';
import ResetPasswordPage from '../views/client/ResetPassword/ResetPasswordPage';
import AdminLoginPage from '../views/admin/Login/LoginAdminPage';
import UnauthorizedPage from '../views/admin/Unauthorized/UnauthorizedPage';

// Lazy load client pages
const HomePage = lazy(() => import('../views/client/Home/HomePage'));
const ProductListPage = lazy(() => import('../views/client/Products/ProductListPage'));
const ProductDetailView = lazy(() => import('../views/client/Products/ProductDetailView'));
const CartPage = lazy(() => import('../views/client/Cart/CartPage'));
const CheckoutPage = lazy(() => import('../views/client/checkout/CheckoutPage'));
const CheckoutFailedPage = lazy(() => import('../views/client/checkout/CheckoutFailedPage'));
const OrderSuccessPage = lazy(() => import('../views/client/Order/OrderSuccessPage'));
const UserOrdersPage = lazy(() => import('../views/client/Order/UserOrdersPage'));
const OrderDetailView = lazy(() => import('../views/client/Order/OrderDetailView'));

// Lazy load admin pages
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
const OrderManagement = lazy(() => import('../views/admin/order/OrderManagement'));
const OrderDetailPage = lazy(() => import('../views/admin/order/details/OrderDetail'));
const PaymentMethodManagement = lazy(() => import('../views/admin/Payment/PaymentMethodManagement'));


// Define admin routes with their required permissions
const ADMIN_ROUTES = [
  {
    path: '/admin',
    component: AdminDashboard,
    permission: null // Dashboard is always accessible
  },
  {
    path: '/admin/products',
    component: ProductAdminView,
    permission: 'product.view'
  },
  {
    path: '/admin/products/edit/:id',
    component: AdminProductDetailView,
    permission: 'product.edit',
    props: { isEditing: true }
  },
  {
    path: '/admin/products/:id',
    component: AdminProductDetailView,
    permission: 'product.view',
    props: { isEditing: false }
  },
  {
    path: '/admin/categories',
    component: CategoryAdminView,
    permission: 'category.view'
  },
  {
    path: '/admin/roles',
    component: RoleManagement,
    permission: 'role.view'
  },
  {
    path: '/admin/permissions',
    component: PermissionAssignment,
    permission: 'permission.view'
  },
  {
    path: '/admin/accounts',
    component: AccountManagement,
    permission: 'user.view'
  },
  {
    path: '/admin/settings/*',
    component: SettingPage,
    permission: 'system.config'
  },
  {
    path: '/admin/logs',
    component: LogHistoryPage,
    permission: 'audit_log.view'
  },
  {
    path: '/admin/profile',
    component: ProfilePage,
    permission: null // Profile accessible to all
  },
  {
    path: '/admin/banners',
    component: Banner,
    permission: 'banner.view'
  },
  {
    path: '/admin/orders',
    component: OrderManagement,
    permission: 'order.view'
  },
  {
    path: '/admin/orders/:id',
    component: OrderDetailPage,
    permission: 'order.view'
  },
  {
    path: '/admin/payment-methods',
    component: PaymentMethodManagement,
    permission: 'system.payment_settings'
  }
];

const AppRoutes = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />
        <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/auth/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductListPage />} />
        <Route path="/products/:slug" element={<ProductDetailView />} />


        <Route element={<ProtectedClientRoute />}>
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/checkout/failed" element={<CheckoutFailedPage />} />
          <Route path="/orders" element={<UserOrdersPage />} />
          <Route path="/orders/:orderId" element={<OrderDetailView />} />
          <Route path="/order/success/:orderId" element={<OrderSuccessPage />} />
        </Route>

        <Route path="/admin/auth/login" element={<AdminLoginPage />} />

        <Route path="/admin/unauthorized" element={<UnauthorizedPage />} />

        {ADMIN_ROUTES.map(route => (
          <Route
            key={route.path}
            path={route.path}
            element={
              <AdminPrivateRoute
                requiredPermission={route.permission}
              >
                <route.component {...(route.props || {})} />
              </AdminPrivateRoute>
            }
          />
        ))}

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;