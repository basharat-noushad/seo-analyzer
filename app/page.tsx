import { redirect } from 'next/navigation';

/**
 * Home Page - Redirects to Competitor Analyzer
 */
export default function HomePage() {
  redirect('/competitor-analyzer');
}
