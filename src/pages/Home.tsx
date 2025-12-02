import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Lightbulb, Trophy, Users } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-10"></div>
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
            Showcase Student Innovation
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            UCU Innovators Hub is the premier platform for discovering, submitting, and reviewing outstanding student projects across all faculties.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/gallery">
              <Button size="lg" className="bg-gradient-primary hover:opacity-90 shadow-lg">
                Explore Projects
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" variant="outline" className="shadow-lg">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Why UCU Innovators Hub?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Lightbulb className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Student Innovation</h3>
              <p className="text-muted-foreground">
                Submit your projects and showcase your skills to the university community and beyond.
              </p>
            </div>

            <div className="bg-card p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-secondary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Expert Review</h3>
              <p className="text-muted-foreground">
                Supervisors provide valuable feedback and approve outstanding work for public display.
              </p>
            </div>

            <div className="bg-card p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-accent/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Trophy className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Track Success</h3>
              <p className="text-muted-foreground">
                Analytics dashboard helps administrators monitor innovation trends across faculties.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center bg-gradient-primary rounded-2xl p-12 shadow-xl">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Share Your Innovation?</h2>
          <p className="text-white/90 mb-8 text-lg">
            Join UCU Innovators Hub today and let your projects inspire others.
          </p>
          <Link to="/auth">
            <Button size="lg" variant="secondary" className="shadow-lg">
              Create Account
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
