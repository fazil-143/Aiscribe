import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <section className="bg-gradient-to-br from-primary via-primary-800 to-primary-700 py-16 text-white md:py-24">
      <div className="container mx-auto px-4">
        <div className="grid items-center gap-8 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="mb-4 text-4xl font-bold md:text-5xl lg:text-6xl">
              Supercharge Your Content Creation
            </h1>
            <p className="mb-8 text-lg md:text-xl">
              Harness the power of AI to generate high-quality content in seconds. Blogs, ideas, summaries - all at your fingertips.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-slate-100"
                asChild
              >
                <Link href="#tools">Explore Tools</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10"
              >
                View Demo
              </Button>
            </div>
          </motion.div>
          <motion.div
            className="flex justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="w-full overflow-hidden rounded-lg shadow-lg">
              <img
                src="https://images.unsplash.com/photo-1677442136019-21780ecad995"
                alt="AI Content Generation"
                className="h-64 w-full object-cover md:h-80 lg:h-96"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
