import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, ExternalLink, Github, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export default function StudentDashboard() {
  const { profile } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, [profile]);

  const fetchProjects = async () => {
    if (!profile) return;
    
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          categories (name),
          faculties (name),
          project_technologies (
            technologies (name)
          )
        `)
        .eq('student_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error: any) {
      toast.error('Failed to load projects');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-success text-success-foreground';
      case 'rejected': return 'bg-destructive text-destructive-foreground';
      case 'revision': return 'bg-warning text-warning-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Projects</h1>
            <p className="text-muted-foreground">Manage and track your submissions</p>
          </div>
          <Link to="/student/submit">
            <Button className="bg-gradient-primary hover:opacity-90">
              <Plus className="mr-2 h-4 w-4" />
              Submit Project
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : projects.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Projects Yet</h3>
              <p className="text-muted-foreground mb-4">Start by submitting your first project</p>
              <Link to="/student/submit">
                <Button className="bg-gradient-primary">
                  <Plus className="mr-2 h-4 w-4" />
                  Submit Project
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-lg">{project.title}</CardTitle>
                    <Badge className={getStatusColor(project.status)}>
                      {project.status}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {project.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <span className="font-medium mr-2">Category:</span>
                      {project.categories?.name}
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <span className="font-medium mr-2">Faculty:</span>
                      {project.faculties?.name}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {project.project_technologies?.map((pt: any, idx: number) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {pt.technologies.name}
                        </Badge>
                      ))}
                    </div>
                    {project.github_link && (
                      <a
                        href={project.github_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-primary hover:underline mt-2"
                      >
                        <Github className="h-4 w-4 mr-1" />
                        View Code
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
