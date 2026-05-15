import { redirect } from 'next/navigation';

// The root URL "/" immediately sends the user to the dashboard.
export default function Home() {
  redirect('/dashboard');
}
