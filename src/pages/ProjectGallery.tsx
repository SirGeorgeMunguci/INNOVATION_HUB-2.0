import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Github, ExternalLink, Search } from 'lucide-react';

export default function ProjectGallery() {
  const [projects, setProjects] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [faculties, setFaculties] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFaculty, setSelectedFaculty] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [selectedCategory, selectedFaculty]);

  const fetchData = async () => {
    try {
      let query = supabase.from('projects').select(`*, categories(name), faculties(name), profiles!projects_student_id_fkey(full_name), project_technologies(technologies(name))`).eq('status', 'approved');
      if (selectedCategory !== 'all') query = query.eq('category_id', selectedCategory);
      if (selectedFaculty !== 'all') query = query.eq('faculty_id', selectedFaculty);
      
      const [projectsRes, categoriesRes, facultiesRes] = await Promise.all([
        query.order('created_at', { ascending: false }),
        supabase.from('categories').select('*').order('name'),
        supabase.from('faculties').select('*').order('name'),
      ]);

      setProjects(projectsRes.data || []);
      setCategories(categoriesRes.data || []);
      setFaculties(facultiesRes.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(project => 
    project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Project Gallery</h1>
          <p className="text-muted-foreground">Explore approved student innovations</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search projects..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}><SelectTrigger className="w-full md:w-[200px]"><SelectValue placeholder="All Categories" /></SelectTrigger><SelectContent><SelectItem value="all">All Categories</SelectItem>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select>
          <Select value={selectedFaculty} onValueChange={setSelectedFaculty}><SelectTrigger className="w-full md:w-[200px]"><SelectValue placeholder="All Faculties" /></SelectTrigger><SelectContent><SelectItem value="all">All Faculties</SelectItem>{faculties.map(f => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}</SelectContent></Select>
        </div>

        {loading ? <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div> : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map(project => (
                <Card key={project.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedProject(project)}>
                  <CardHeader>
                    <CardTitle className="text-lg">{project.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{project.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="text-muted-foreground"><span className="font-medium">By:</span> {project.profiles?.full_name || 'Unknown'}</div>
                      <div className="text-muted-foreground"><span className="font-medium">Faculty:</span> {project.faculties?.name}</div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {project.project_technologies?.map((pt: any, idx: number) => (
                          <Badge key={idx} variant="outline" className="text-xs">{pt.technologies.name}</Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredProjects.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No projects found matching your criteria.
              </div>
            )}

            <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
              <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                {selectedProject && (
                  <>
                    <DialogHeader>
                      <DialogTitle className="text-2xl">{selectedProject.title}</DialogTitle>
                      <DialogDescription className="text-base mt-2">{selectedProject.description}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div>
                        <h4 className="font-semibold mb-1">Student</h4>
                        <p className="text-muted-foreground">{selectedProject.profiles?.full_name || 'Unknown'}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Faculty</h4>
                        <p className="text-muted-foreground">{selectedProject.faculties?.name}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Category</h4>
                        <p className="text-muted-foreground">{selectedProject.categories?.name}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Year</h4>
                        <p className="text-muted-foreground">{selectedProject.year}</p>
                      </div>
                      {selectedProject.project_technologies?.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2">Technologies</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedProject.project_technologies.map((pt: any, idx: number) => (
                              <Badge key={idx} variant="secondary">{pt.technologies.name}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="flex gap-3 pt-4">
                        {selectedProject.github_link && (
                          <a href={selectedProject.github_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                            <Github className="h-4 w-4" />View Code
                          </a>
                        )}
                        {selectedProject.demo_link && (
                          <a href={selectedProject.demo_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors">
                            <ExternalLink className="h-4 w-4" />View Demo
                          </a>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>
    </div>
  );
}
