'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, BusFront, CalendarDays, Check, CircleAlert, Loader2, Save, Users } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type Profile = { id: string; login_id: string; full_name: string; department: string | null; route_id: string | null };
type AttendanceRow = { student_id: string; status: 'present' | 'absent' };
type AttendanceStatus = 'present' | 'absent';

export default function AttendanceClient() {
  const [supabase] = useState(() => createClient());
  const [students, setStudents] = useState<Profile[]>([]);
  const [statuses, setStatuses] = useState<Record<string, AttendanceStatus>>({});
  const [role, setRole] = useState('');
  const [userId, setUserId] = useState('');
  const [routeId, setRouteId] = useState<string | null>(null);
  const [date, setDate] = useState(() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; });
  const [tripType, setTripType] = useState<'morning' | 'evening'>('morning');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError(''); setMessage('');
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) { setError('Your session expired. Please sign in again.'); setLoading(false); return; }
    setUserId(authData.user.id);

    const { data: profile, error: profileError } = await supabase.from('profiles')
      .select('role, route_id').eq('id', authData.user.id).single();
    if (profileError || !profile) { setError('Could not load your SEC profile.'); setLoading(false); return; }
    setRole(profile.role); setRouteId(profile.route_id);

    if (profile.role === 'driver' && !profile.route_id) {
      setError('No route is assigned to your driver account. Contact the transport administrator.');
      setStudents([]); setLoading(false); return;
    }

    let studentsQuery = supabase.from('profiles')
      .select('id, login_id, full_name, department, route_id')
      .eq('role', 'student').order('full_name');
    studentsQuery = studentsQuery.not('route_id', 'is', null);
    if (profile.role === 'driver' && profile.route_id) studentsQuery = studentsQuery.eq('route_id', profile.route_id);
    const { data: studentRows, error: studentError } = await studentsQuery;
    if (studentError) { setError(`Unable to load students: ${studentError.message}`); setLoading(false); return; }
    const list = (studentRows || []) as Profile[];
    setStudents(list);

    if (list.length) {
      const { data: attendanceRows, error: attendanceError } = await supabase.from('attendance')
        .select('student_id, status').eq('attendance_date', date).eq('trip_type', tripType)
        .in('student_id', list.map(s => s.id));
      if (attendanceError) { setError(`Unable to load attendance: ${attendanceError.message}`); setLoading(false); return; }
      const map: Record<string, AttendanceStatus> = {};
      ((attendanceRows ?? []) as AttendanceRow[]).forEach(row => { map[row.student_id] = row.status; });
      setStatuses(map);
    } else setStatuses({});
    setLoading(false);
  }, [supabase, date, tripType]);

  useEffect(() => { void load(); }, [load]);

  function mark(studentId: string, status: AttendanceStatus) {
    setStatuses(current => ({ ...current, [studentId]: status }));
  }

  async function saveAttendance() {
    setSaving(true); setError(''); setMessage('');
    const marked = students.filter(student => statuses[student.id]);
    if (!marked.length) { setError('Mark at least one student as present or absent first.'); setSaving(false); return; }

    const rows = marked.map(student => ({
      student_id: student.id,
      route_id: student.route_id,
      attendance_date: date,
      trip_type: tripType,
      status: statuses[student.id],
      marked_by: userId,
    }));

    const { error: saveError } = await supabase.from('attendance').upsert(rows, {
      onConflict: 'student_id,attendance_date,trip_type',
    });
    if (saveError) setError(`Save failed: ${saveError.message}`);
    else setMessage(`Attendance saved for ${marked.length} student(s).`);
    setSaving(false);
  }

  const presentCount = students.filter(s => statuses[s.id] === 'present').length;
  const absentCount = students.filter(s => statuses[s.id] === 'absent').length;
  const markedCount = presentCount + absentCount;

  return <main className="attendance-shell">
    <header className="attendance-header"><Link href="/portal" className="attendance-back"><ArrowLeft size={16}/> Workspace</Link><div className="attendance-brand"><BusFront size={21}/> SEC <b>TRANSPORT</b></div></header>
    <section className="attendance-content"><div className="attendance-title"><div><span className="attendance-eyebrow">TRANSPORT OPERATIONS / ATTENDANCE</span><h1>Mark attendance</h1><p>Record student bus boarding for the selected trip.</p></div><span className="attendance-role">{role.toUpperCase()}</span></div>
      <div className="attendance-toolbar"><label><CalendarDays size={16}/> Date <input type="date" value={date} onChange={e=>setDate(e.target.value)}/></label><label>Trip <select value={tripType} onChange={e=>setTripType(e.target.value as 'morning'|'evening')}><option value="morning">Morning boarding</option><option value="evening">Evening boarding</option></select></label><button className="attendance-refresh" onClick={()=>void load()}>Refresh</button></div>
      <div className="attendance-summary"><div><Users size={18}/><span>Total students</span><b>{students.length}</b></div><div><Check size={18}/><span>Present</span><b>{presentCount}</b></div><div><CircleAlert size={18}/><span>Absent</span><b>{absentCount}</b></div><div><CalendarDays size={18}/><span>Marked</span><b>{markedCount}/{students.length}</b></div></div>
      {error && <div className="attendance-message error">{error}</div>}{message && <div className="attendance-message success">{message}</div>}
      <section className="attendance-table-panel"><div className="attendance-table-heading"><div><h2>Student roster</h2><p>{role === 'driver' ? 'Students assigned to your route' : 'Students available for attendance marking'}</p></div><button className="attendance-save" onClick={()=>void saveAttendance()} disabled={saving || loading || !students.length}>{saving ? <Loader2 size={16} className="spin"/> : <Save size={16}/>} {saving ? 'Saving…' : 'Save attendance'}</button></div>
      {loading ? <div className="attendance-empty"><Loader2 className="spin"/> Loading student roster…</div> : students.length === 0 ? <div className="attendance-empty">No students found for your access scope.</div> : <div className="attendance-table-scroll"><table className="attendance-table"><thead><tr><th>STUDENT</th><th>LOGIN ID</th><th>DEPARTMENT</th><th>ROUTE</th><th>ATTENDANCE</th></tr></thead><tbody>{students.map(student=><tr key={student.id}><td><div className="attendance-person"><span>{student.full_name.split(' ').map(s=>s[0]).slice(0,2).join('').toUpperCase()}</span><b>{student.full_name}</b></div></td><td>{student.login_id}</td><td>{student.department || '—'}</td><td>{student.route_id ? student.route_id.slice(0,8).toUpperCase() : 'Unassigned'}</td><td><div className="attendance-choice"><button className={statuses[student.id] === 'present' ? 'chosen present' : ''} onClick={()=>mark(student.id,'present')}><Check size={14}/> Present</button><button className={statuses[student.id] === 'absent' ? 'chosen absent' : ''} onClick={()=>mark(student.id,'absent')}><CircleAlert size={14}/> Absent</button></div></td></tr>)}</tbody></table></div>}
      <div className="attendance-note">Only Admin, assigned Drivers, and Faculty can mark attendance. Changes are stored in Supabase.</div></section>
    </section>
  </main>;
}
