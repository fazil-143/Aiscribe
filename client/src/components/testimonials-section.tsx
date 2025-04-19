import { motion } from "framer-motion";
import { TestimonialCard } from "./ui/card-hover";

export default function TestimonialsSection() {
  const testimonials = [
    {
      name: "Sarah Johnson",
      title: "Content Marketer",
      text: "AIScribe has cut my content creation time in half. The blog generator creates amazing first drafts that need minimal editing. It's become an essential part of my toolkit.",
      initials: "SJ",
      rating: 5
    },
    {
      name: "Michael Torres",
      title: "Freelance Writer",
      text: "The email composer has been a game-changer for my client communications. It helps me maintain a professional tone and saves me from writer's block when following up with prospects.",
      initials: "MT",
      rating: 4.5
    },
    {
      name: "Aisha Lee",
      title: "Social Media Manager",
      text: "I manage multiple social accounts across different platforms, and AIScribe's social media copy tool gives me platform-specific content that feels authentic and engaging.",
      initials: "AL",
      rating: 5
    }
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <section className="bg-slate-100 py-16 dark:bg-slate-800/30">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">
            What Our <span className="bg-gradient-to-r from-primary to-secondary-500 bg-clip-text text-transparent">Users Say</span>
          </h2>
          <p className="mx-auto max-w-2xl text-slate-600 dark:text-slate-400">
            Hear from content creators who've transformed their workflow with AIScribe.
          </p>
        </div>
        
        <motion.div 
          className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          {testimonials.map((testimonial, index) => (
            <motion.div key={index} variants={item}>
              <TestimonialCard
                name={testimonial.name}
                title={testimonial.title}
                text={testimonial.text}
                initials={testimonial.initials}
                rating={testimonial.rating}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
