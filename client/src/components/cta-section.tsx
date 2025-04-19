import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";

export default function CTASection() {
  const { user } = useAuth();
  
  return (
    <section className="relative py-16">
      <div className="container mx-auto px-4">
        <motion.div 
          className="overflow-hidden rounded-2xl bg-primary p-8 md:p-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div>
              <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">Ready to transform your content workflow?</h2>
              <p className="mb-6 text-primary-100">Join thousands of content creators who are saving time and creating better content with AIScribe.</p>
              <div className="flex flex-wrap gap-4">
                {user ? (
                  <Button
                    size="lg"
                    className="bg-white text-primary hover:bg-slate-100"
                    asChild
                  >
                    <Link href="/dashboard">Go to Dashboard</Link>
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    className="bg-white text-primary hover:bg-slate-100"
                    asChild
                  >
                    <Link href="/auth">Get Started Free</Link>
                  </Button>
                )}
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white bg-transparent text-white hover:bg-white/10"
                >
                  Watch Demo
                </Button>
              </div>
            </div>
            <div className="relative hidden md:block">
              <div className="relative h-96 w-full overflow-hidden rounded-lg bg-white/10 shadow-lg">
                <img 
                  src="https://images.unsplash.com/photo-1690142112274-99dcbf9ff0b4" 
                  alt="Dashboard Preview" 
                  className="h-full w-full object-cover" 
                />
              </div>
              <div className="absolute -bottom-4 -left-4 h-40 w-40 rounded-lg bg-secondary-500 opacity-20 blur-3xl"></div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
