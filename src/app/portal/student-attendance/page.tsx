import { redirect } from 'next/navigation';
import Link from 'next/link';
import { BusFront, CalendarDays, CheckCircle2, CircleAlert } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

export default async function StudentAttendancePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const { data: profile } = await supabase.from('profiles').select('role, full_name, login_id, route_id').eq('id', user.id).single();
  if (!profile || profile.role !== 'student') redirect('/portal');

  const { data: records, error } = await supabase.from('attendance')
    .select('attendance_date, trip_type, status, created_at')
    .eq('student_id', user.id).order('attendance_date', { ascending: false }).limit(60);

  return <main className="student-attendance-shell"><header><Link href="/portal">← Workspace</Link><span><BusFront size={19}/> SEC TRANSPORT</span></header><section><span className="attendance-eyebrow">STUDENT PORTAL</span><h1>My transport attendance</h1><p>{profile.full_name || profile.login_id} · {profile.route_id ? 'Route assigned' : 'No route assigned yet'}</p><div className="student-attendance-card"><h2>Attendance history</h2>{error ? <p>Could not load attendance records. Please try again later.</p> : !records?.length ? <p>No attendance has been recorded for your account yet.</p> : <table><thead><tr><th>Date</th><th>Trip</th><th>Status</th><th>Recorded</th></tr></thead><tbody>{records.map((r,i)=><tr key={i}><td><CalendarDays size={14}/> {r.attendance_date}</td><td>{r.trip_type === 'morning' ? 'Morning' : 'Evening'}</td><td><span className={`student-attendance-status ${r.status}`}>{r.status === 'present' ? <CheckCircle2 size={14}/> : <CircleAlert size={14}/>} {r.status}</span></td><td>{new Date(r.created_at).toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'})}</td></tr>)}</tbody></table>}</div></section></main>;
}
