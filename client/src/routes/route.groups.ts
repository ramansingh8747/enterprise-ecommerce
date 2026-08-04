import type { IAppRoute } from './route.types';
import { ROUTES } from '@/config/routes.config';

/**
 * Enterprise Route Groups (Module 4 - Step 4.5).
 *
 * Categorized route group arrays for public, auth, customer, admin, and error domains.
 */

export const publicRoutes: readonly IAppRoute[] = Object.freeze([
  {
    path: ROUTES.HOME,
    meta: {
      title: 'Home',
      category: 'public',
      description: 'Enterprise E-Commerce Storefront',
      requiresAuth: false,
      layout: 'public',
      breadcrumb: 'Home',
    },
  },
  {
    path: ROUTES.TABLE_DEMO,
    meta: {
      title: 'Data Table Demo',
      category: 'public',
      description: 'Generic Data Table validation and demo view',
      requiresAuth: false,
      layout: 'public',
      breadcrumb: 'Table Demo',
    },
  },
]);

export const authRoutes: readonly IAppRoute[] = Object.freeze([
  {
    path: ROUTES.AUTH.LOGIN,
    meta: {
      title: 'Sign In',
      category: 'auth',
      description: 'Account authentication login',
      guestOnly: true,
      layout: 'auth',
      breadcrumb: 'Sign In',
    },
  },
  {
    path: ROUTES.AUTH.REGISTER,
    meta: {
      title: 'Create Account',
      category: 'auth',
      description: 'New user registration',
      guestOnly: true,
      layout: 'auth',
      breadcrumb: 'Register',
    },
  },
]);

export const customerRoutes: readonly IAppRoute[] = Object.freeze([
  {
    path: ROUTES.USERS.PROFILE,
    meta: {
      title: 'My Profile',
      category: 'customer',
      description: 'Customer profile management',
      requiresAuth: true,
      layout: 'customer',
      breadcrumb: 'Profile',
    },
  },
  {
    path: ROUTES.ORDERS.LIST,
    meta: {
      title: 'My Orders',
      category: 'customer',
      description: 'Customer order history',
      requiresAuth: true,
      layout: 'customer',
      breadcrumb: 'Orders',
    },
  },
]);

export const adminRoutes: readonly IAppRoute[] = Object.freeze([
  {
    path: ROUTES.DASHBOARD,
    meta: {
      title: 'Admin Dashboard',
      category: 'admin',
      description: 'Enterprise management dashboard',
      requiresAuth: true,
      roles: ['ADMIN', 'SUPER_ADMIN'],
      layout: 'admin',
      breadcrumb: 'Dashboard',
    },
  },
]);

export const errorRoutes: readonly IAppRoute[] = Object.freeze([
  {
    path: ROUTES.ERRORS.NOT_FOUND,
    meta: {
      title: 'Page Not Found',
      category: 'error',
      description: '404 resource not found error page',
      layout: 'blank',
      breadcrumb: '404',
    },
  },
]);
