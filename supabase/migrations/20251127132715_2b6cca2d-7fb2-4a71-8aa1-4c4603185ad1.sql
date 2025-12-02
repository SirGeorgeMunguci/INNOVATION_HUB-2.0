-- Create roles enum
CREATE TYPE user_role AS ENUM ('student', 'supervisor', 'admin');

-- Create project status enum
CREATE TYPE project_status AS ENUM ('pending', 'approved', 'rejected', 'revision');

-- Create faculties table
CREATE TABLE faculties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create technologies table
CREATE TABLE technologies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'student',
  faculty_id UUID REFERENCES faculties(id),
  student_id TEXT,
  phone TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category_id UUID REFERENCES categories(id),
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  faculty_id UUID REFERENCES faculties(id),
  status project_status DEFAULT 'pending',
  github_link TEXT,
  demo_link TEXT,
  supervisor_id UUID REFERENCES profiles(id),
  submission_date TIMESTAMPTZ DEFAULT now(),
  year INTEGER DEFAULT EXTRACT(YEAR FROM now()),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create project_files table
CREATE TABLE project_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  uploaded_at TIMESTAMPTZ DEFAULT now()
);

-- Create project_technologies pivot table
CREATE TABLE project_technologies (
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  technology_id UUID REFERENCES technologies(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, technology_id)
);

-- Create reviews table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES profiles(id),
  status project_status NOT NULL,
  comment TEXT,
  reviewed_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE faculties ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE technologies ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_technologies ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for faculties (public read, admin write)
CREATE POLICY "Anyone can view faculties" ON faculties FOR SELECT USING (true);

-- RLS Policies for categories (public read)
CREATE POLICY "Anyone can view categories" ON categories FOR SELECT USING (true);

-- RLS Policies for technologies (public read)
CREATE POLICY "Anyone can view technologies" ON technologies FOR SELECT USING (true);

-- RLS Policies for projects
CREATE POLICY "Anyone can view approved projects" ON projects FOR SELECT USING (status = 'approved' OR auth.uid() = student_id OR auth.uid() = supervisor_id OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

CREATE POLICY "Students can create own projects" ON projects FOR INSERT WITH CHECK (auth.uid() = student_id AND EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'student'));

CREATE POLICY "Students can update own pending projects" ON projects FOR UPDATE USING (auth.uid() = student_id AND status = 'pending');

-- RLS Policies for project_files
CREATE POLICY "Users can view project files if they can view the project" ON project_files FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = project_files.project_id 
    AND (projects.status = 'approved' OR projects.student_id = auth.uid() OR projects.supervisor_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'))
  )
);

CREATE POLICY "Students can upload files to own projects" ON project_files FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = project_files.project_id AND projects.student_id = auth.uid())
);

-- RLS Policies for project_technologies
CREATE POLICY "Anyone can view project technologies" ON project_technologies FOR SELECT USING (true);
CREATE POLICY "Students can add technologies to own projects" ON project_technologies FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = project_technologies.project_id AND projects.student_id = auth.uid())
);

-- RLS Policies for reviews
CREATE POLICY "Anyone can view reviews for visible projects" ON reviews FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = reviews.project_id 
    AND (projects.status = 'approved' OR projects.student_id = auth.uid() OR projects.supervisor_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'))
  )
);

CREATE POLICY "Supervisors and admins can create reviews" ON reviews FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND (profiles.role = 'supervisor' OR profiles.role = 'admin'))
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default faculties
INSERT INTO faculties (name, code) VALUES
  ('Faculty of Science', 'FSC'),
  ('Faculty of Engineering', 'ENG'),
  ('Faculty of Business', 'BUS'),
  ('Faculty of Computing and Informatics', 'FCI'),
  ('Faculty of Arts', 'ART');

-- Insert default categories
INSERT INTO categories (name, description) VALUES
  ('Web Development', 'Web applications and websites'),
  ('Mobile Development', 'Mobile applications for iOS and Android'),
  ('Data Science', 'Data analysis and machine learning projects'),
  ('IoT & Hardware', 'Internet of Things and hardware projects'),
  ('AI & Machine Learning', 'Artificial intelligence applications'),
  ('Game Development', 'Video games and interactive applications');

-- Insert default technologies
INSERT INTO technologies (name) VALUES
  ('React'),
  ('Node.js'),
  ('Python'),
  ('Java'),
  ('TypeScript'),
  ('Flutter'),
  ('TensorFlow'),
  ('MongoDB'),
  ('PostgreSQL'),
  ('Docker'),
  ('AWS'),
  ('Firebase'),
  ('React Native'),
  ('Unity'),
  ('Arduino');