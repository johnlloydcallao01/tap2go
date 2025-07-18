/**
 * Admin Signup Page
 * Entry point for admin account creation (development only)
 */

import AdminSignupForm from '@/components/auth/AdminSignupForm';

export default function SignupPage() {
  return <AdminSignupForm />;
}

export const metadata = {
  title: 'Admin Signup - Tap2Go',
  description: 'Create your Tap2Go admin account',
};
