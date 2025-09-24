/**
 * Admin Login Page
 * Entry point for admin authentication
 */

import AdminLoginForm from '@/components/auth/AdminLoginForm';

export default function LoginPage() {
  return <AdminLoginForm />;
}

export const metadata = {
  title: 'Admin Login - Tap2Go',
  description: 'Sign in to your Tap2Go admin dashboard',
};
