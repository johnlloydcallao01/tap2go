/**
 * Admin Root Page
 * 
 * This is the root page of the admin application.
 * It redirects users to the dashboard in demo mode.
 */

import { redirect } from 'next/navigation';

export default function AdminRootPage() {
  // Redirect to dashboard in demo mode
  redirect('/dashboard');
}
