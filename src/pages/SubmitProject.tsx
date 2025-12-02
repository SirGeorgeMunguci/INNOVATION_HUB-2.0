import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ArrowLeft, Upload } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

export default function SubmitProject() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [technologies, setTechnologies] = useState<any[]>([]);
  const [selectedTech, setSelectedTech] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    github_link: '',
    demo_link: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [categoriesRes, technologiesRes] = await Promise.all([
      supabase.from('categories').select('*').order('name'),
      supabase.from('technologies').select('*').order('name'),
    ]);

    if (categoriesRes.data) setCategories(categoriesRes.data);
    if (technologiesRes.data) setTechnologies(technologiesRes.data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setLoading(true);
    try {
      // Insert project
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          ...formData,
          student_id: profile.id,
          faculty_id: profile.faculty_id,
        })
        .select()
        .single();

      if (projectError) throw projectError;

      // Insert technologies
      if (selectedTech.length > 0) {
        const techInserts = selectedTech.map(tech_id => ({
          project_id: project.id,
          technology_id: tech_id,
        }));

        const { error: techError } = await supabase
          .from('project_technologies')
          .insert(techInserts);

        if (techError) throw techError;
      }

      toast.success('Project submitted successfully!');
      navigate('/student/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit project');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTechnology = (techId: string) => {
    setSelectedTech(prev =>
      prev.includes(techId)
        ? prev.filter(id => id !== techId)
        : [...prev, techId]
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/student/dashboard')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Submit New Project</CardTitle>
            <CardDescription>
              Share your innovation with the UCU community
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Project Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="My Awesome Project"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={5}
                  placeholder="Describe your project, its goals, and key features..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Technologies Used</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                  {technologies.map((tech) => (
                    <div key={tech.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={tech.id}
                        checked={selectedTech.includes(tech.id)}
                        onCheckedChange={() => toggleTechnology(tech.id)}
                      />
                      <label htmlFor={tech.id} className="text-sm cursor-pointer">
                        {tech.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="github_link">GitHub Repository</Label>
                <Input
                  id="github_link"
                  type="url"
                  value={formData.github_link}
                  onChange={(e) => setFormData({ ...formData, github_link: e.target.value })}
                  placeholder="https://github.com/username/repo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="demo_link">Live Demo URL</Label>
                <Input
                  id="demo_link"
                  type="url"
                  value={formData.demo_link}
                  onChange={(e) => setFormData({ ...formData, demo_link: e.target.value })}
                  placeholder="https://myproject.com"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-primary hover:opacity-90"
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit Project'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
