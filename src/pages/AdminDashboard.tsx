import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, FolderGit, CheckCircle, Clock } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0, rejected: 0 });
  const [facultyData, setFacultyData] = useState<any[]>([]);
  const [techData, setTechData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [projectsRes, facultiesRes, techRes] = await Promise.all([
        supabase.from('projects').select('status, faculty_id'),
        supabase.from('faculties').select('id, name'),
        supabase.from('project_technologies').select('technology_id, technologies(name)'),
      ]);

      const projects = projectsRes.data || [];
      setStats({
        total: projects.length,
        approved: projects.filter(p => p.status === 'approved').length,
        pending: projects.filter(p => p.status === 'pending').length,
        rejected: projects.filter(p => p.status === 'rejected').length,
      });

      const faculties = facultiesRes.data || [];
      const facultyStats = faculties.map(f => ({
        name: f.name.split(' ')[0],
        count: projects.filter(p => p.faculty_id === f.id).length,
        approved: projects.filter(p => p.faculty_id === f.id && p.status === 'approved').length,
      }));
      setFacultyData(facultyStats);

      const techCount: any = {};
      (techRes.data || []).forEach((pt: any) => {
        const name = pt.technologies.name;
        techCount[name] = (techCount[name] || 0) + 1;
      });
      const topTech = Object.entries(techCount).sort((a: any, b: any) => b[1] - a[1]).slice(0, 8).map(([name, value]) => ({ name, value }));
      setTechData(topTech);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c'];

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Analytics Dashboard</h1>

        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total Projects</CardTitle><FolderGit className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.total}</div></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Approved</CardTitle><CheckCircle className="h-4 w-4 text-success" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.approved}</div></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Pending</CardTitle><Clock className="h-4 w-4 text-warning" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.pending}</div></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Approval Rate</CardTitle><Users className="h-4 w-4 text-primary" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.total ? Math.round((stats.approved / stats.total) * 100) : 0}%</div></CardContent></Card>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card><CardHeader><CardTitle>Projects per Faculty</CardTitle></CardHeader><CardContent><ResponsiveContainer width="100%" height={300}><BarChart data={facultyData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Legend /><Bar dataKey="count" fill="#0088FE" name="Total" /><Bar dataKey="approved" fill="#00C49F" name="Approved" /></BarChart></ResponsiveContainer></CardContent></Card>

          <Card><CardHeader><CardTitle>Trending Technologies</CardTitle></CardHeader><CardContent><ResponsiveContainer width="100%" height={300}><PieChart><Pie data={techData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>{techData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></CardContent></Card>
        </div>
      </div>
    </div>
  );
}
