import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AttendanceClient from './AttendanceClient';

export default async function AttendancePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (!profile || !['admin', 'driver', 'faculty'].includes(profile.role)) redirect('/portal');

  return <AttendanceClient />;
}
