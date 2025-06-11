import { redirect } from 'next/navigation';

export default function RootPage() {
  // Redirect root to unified customer home
  redirect('/home');
}
