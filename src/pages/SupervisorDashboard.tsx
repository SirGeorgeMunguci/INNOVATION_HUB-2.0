import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CheckCircle, XCircle, Eye, Github, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export default function SupervisorDashboard() {
  const { profile } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          categories (name),
          faculties (name),
          profiles!projects_student_id_fkey (full_name, student_id),
          project_technologies (
            technologies (name)
          )
        `)
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

  const handleReview = async (status: 'approved' | 'rejected' | 'revision') => {
    if (!selectedProject || !profile) return;

    setSubmitting(true);
    try {
      // Update project status
      const { error: updateError } = await supabase
        .from('projects')
        .update({ status })
        .eq('id', selectedProject.id);

      if (updateError) throw updateError;

      // Insert review record
      const { error: reviewError } = await supabase
        .from('reviews')
        .insert({
          project_id: selectedProject.id,
          reviewer_id: profile.id,
          status,
          comment: comment || null,
        });

      if (reviewError) throw reviewError;

      toast.success(`Project ${status}`);
      setSelectedProject(null);
      setComment('');
      fetchProjects();
    } catch (error: any) {
      toast.error('Failed to submit review');
      console.error(error);
    } finally {
      setSubmitting(false);
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Project Review Queue</h1>
          <p className="text-muted-foreground">Review and approve student submissions</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
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
                  <div className="space-y-2 text-sm mb-4">
                    <div className="text-muted-foreground">
                      <span className="font-medium">Student:</span> {project.profiles?.full_name}
                    </div>
                    <div className="text-muted-foreground">
                      <span className="font-medium">Faculty:</span> {project.faculties?.name}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {project.project_technologies?.map((pt: any, idx: number) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {pt.technologies.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setSelectedProject(project)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Review
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Review Dialog */}
      <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedProject?.title}</DialogTitle>
          </DialogHeader>
          {selectedProject && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">{selectedProject.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-1">Student</h4>
                  <p className="text-sm">{selectedProject.profiles?.full_name}</p>
                  <p className="text-xs text-muted-foreground">{selectedProject.profiles?.student_id}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Category</h4>
                  <p className="text-sm">{selectedProject.categories?.name}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Technologies</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.project_technologies?.map((pt: any, idx: number) => (
                    <Badge key={idx} variant="outline">
                      {pt.technologies.name}
                    </Badge>
                  ))}
                </div>
              </div>

              {selectedProject.github_link && (
                <a
                  href={selectedProject.github_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-primary hover:underline"
                >
                  <Github className="h-4 w-4 mr-2" />
                  View GitHub Repository
                </a>
              )}

              {selectedProject.demo_link && (
                <a
                  href={selectedProject.demo_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-primary hover:underline"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Live Demo
                </a>
              )}

              <div>
                <h4 className="font-semibold mb-2">Review Comment</h4>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add feedback or comments..."
                  rows={4}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => handleReview('approved')}
                  disabled={submitting}
                  className="flex-1 bg-success hover:bg-success/90"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve
                </Button>
                <Button
                  onClick={() => handleReview('revision')}
                  disabled={submitting}
                  variant="outline"
                  className="flex-1"
                >
                  Needs Revision
                </Button>
                <Button
                  onClick={() => handleReview('rejected')}
                  disabled={submitting}
                  variant="destructive"
                  className="flex-1"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
