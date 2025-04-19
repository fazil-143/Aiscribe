import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

// const teamMembers = [
//   {
//     name: "Sarah Johnson",
//     role: "CEO & Founder",
//     image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
//     description: "AI enthusiast with 10+ years of experience in tech leadership",
//   },
//   {
//     name: "Michael Chen",
//     role: "CTO",
//     image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
//     description: "Machine learning expert and former research scientist",
//   },
//   {
//     name: "Emily Rodriguez",
//     role: "Head of Product",
//     image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80",
//     description: "Product strategist focused on user-centered design",
//   },
// ];

const stats = [
  {
    number: "1M+",
    label: "AI Generations",
  },
  {
    number: "50K+",
    label: "Active Users",
  },
  {
    number: "100+",
    label: "Countries",
  },
  {
    number: "4.9/5",
    label: "User Rating",
  },
];

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary via-primary-800 to-primary-700 py-20 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <motion.h1 
                className="text-4xl md:text-5xl font-bold mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                Our Mission
              </motion.h1>
              <motion.p 
                className="text-xl mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                We're on a mission to democratize AI-powered content creation, making it accessible and easy for everyone to create high-quality content.
              </motion.p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-slate-50 dark:bg-slate-900">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="text-4xl font-bold text-primary mb-2">{stat.number}</div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-6">Our Story</h2>
              <div className="prose dark:prose-invert max-w-none">
                <p className="mb-4">
                  Founded in 2024, AIScribe emerged from a simple observation: creating high-quality content consistently is challenging and time-consuming. We believed that AI could help solve this problem, but existing solutions were either too complex or too limited.
                </p>
                <p className="mb-4">
                  We set out to build a platform that would make AI-powered content creation accessible to everyone, from individual creators to large enterprises. Our focus on user experience and output quality quickly gained traction, and today we're proud to serve users worldwide.
                </p>
                <p>
                  As we continue to grow, our commitment remains the same: to provide the most intuitive and powerful AI content generation tools while maintaining the highest standards of quality and reliability.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        {/* <section className="py-16 bg-slate-50 dark:bg-slate-900">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 text-center">Meet Our Team</h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={member.name}
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="mb-4">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-32 h-32 rounded-full mx-auto object-cover"
                    />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{member.name}</h3>
                  <p className="text-primary mb-2">{member.role}</p>
                  <p className="text-muted-foreground">{member.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section> */}

        {/* CTA Section */}
        <section className="py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of content creators who trust AIScribe
            </p>
            <Button size="lg" asChild>
              <a href="/auth">Try AIScribe Free</a>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
} 