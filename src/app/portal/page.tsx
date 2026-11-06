import Link from 'next/link';
import { redirect } from 'next/navigation';
import { BusFront, ClipboardCheck, MapPinned, ShieldCheck, Users, Route, LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import LogoutButton from '@/components/LogoutButton';

const roleLabels: Record<string, string> = {
  admin: 'Transport Administrator', driver: 'Driver', student: 'Student', faculty: 'Faculty',
};

export default async function PortalPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('login_id, full_name, role, department, route_id')
    .eq('id', user.id)
    .single();

  if (error || !profile) redirect('/login?error=account');

  const role = profile.role as string;
  const displayName = profile.full_name || profile.login_id;
  const cards = role === 'admin'
    ? [{ href: '/portal/admin', title: 'Admin dashboard', detail: 'Fleet, buses, routes, drivers and transport operations.', icon: BusFront }, { href: '/portal/attendance', title: 'Attendance', detail: 'Review transport attendance records.', icon: ClipboardCheck }]
    : role === 'driver'
    ? [{ href: '/portal/attendance', title: 'Mark attendance', detail: 'Record boarding attendance for your assigned route.', icon: ClipboardCheck }, { href: '/portal/attendance', title: 'Assigned route', detail: 'Open your assigned student roster.', icon: Route }]
    : role === 'faculty'
    ? [{ href: '/portal/attendance', title: 'Mark attendance', detail: 'Mark and verify transport attendance for students.', icon: ClipboardCheck }, { href: '/portal/attendance', title: 'Attendance records', detail: 'Review attendance by date and trip.', icon: Users }]
    : [{ href: '/portal/student-attendance', title: 'My attendance', detail: 'Review your recorded bus boarding history.', icon: ClipboardCheck }, { href: '/portal/student-attendance', title: 'My transport', detail: 'View your assigned route and attendance.', icon: MapPinned }];

  return (
    <main className="portal-shell">
      <header className="portal-topbar"><Link href="/portal" className="portal-logo"><span><BusFront size={21}/></span><b>SEC <em>TRANSPORT</em></b></Link><div className="portal-user"><div><b>{displayName}</b><small>{roleLabels[role] || role}</small></div><LogoutButton/></div></header>
      <section className="portal-content"><div className="portal-welcome"><div><span className="portal-eyebrow">SEC TRANSPORT WORKSPACE</span><h1>Hello, {displayName.split(' ')[0]} 👋</h1><p>Your transport workspace is ready. Choose an action below.</p></div><div className="portal-shield"><ShieldCheck size={36}/></div></div>
        <div className="portal-role-pill">SIGNED IN AS <strong>{roleLabels[role] || role.toUpperCase()}</strong></div>
        <div className="portal-card-grid">{cards.map((card,i)=>{const Icon=card.icon;return <Link href={card.href} className="portal-action-card" key={i}><span className="portal-card-icon"><Icon size={22}/></span><h2>{card.title}</h2><p>{card.detail}</p><span className="portal-card-link">Open workspace <b>↗</b></span></Link>})}</div>
      </section>
    </main>
  );
}
