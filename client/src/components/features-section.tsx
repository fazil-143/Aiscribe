import { motion } from "framer-motion";
import { FeatureCard } from "./ui/card-hover";

export default function FeaturesSection() {
  const features = [
    {
      icon: "speed",
      color: "primary",
      title: "Lightning Fast",
      description: "Generate high-quality content in seconds, not hours. Save time and boost productivity."
    },
    {
      icon: "history",
      color: "secondary",
      title: "Save & Retrieve",
      description: "Never lose your generated content. Access your history anytime in your personal dashboard."
    },
    {
      icon: "tune",
      color: "accent",
      title: "Customizable Output",
      description: "Adjust tone, length, and style to match your brand voice and target audience perfectly."
    },
    {
      icon: "verified",
      color: "primary",
      title: "Quality Assured",
      description: "Our AI models are trained to produce coherent, relevant, and engaging content every time."
    },
    {
      icon: "devices",
      color: "secondary",
      title: "Multi-platform",
      description: "Access our tools from any device. Your content syncs seamlessly across desktop and mobile."
    },
    {
      icon: "lock",
      color: "accent",
      title: "Secure & Private",
      description: "Your content stays private. We prioritize data security and user privacy at every step."
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
    <section id="features" className="bg-slate-100 py-16 dark:bg-slate-800/30">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl section-title">
            Why Choose <span className="bg-gradient-to-r from-primary to-secondary-500 bg-clip-text text-transparent">AIScribe</span>
          </h2>
          <p className="mx-auto max-w-2xl text-gray-800 dark:text-slate-300 section-description">
            Get more done with our powerful content generation platform built for creators and businesses alike.
          </p>
        </div>
        
        <motion.div 
          className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          {features.map((feature, index) => (
            <motion.div key={index} variants={item}>
              <FeatureCard
                icon={feature.icon}
                color={feature.color}
                title={feature.title}
                description={feature.description}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
