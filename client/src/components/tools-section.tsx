import { motion } from "framer-motion";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { ToolCard } from "./ui/card-hover";
import ToolModal from "./tool-modal";

export default function ToolsSection() {
  const [selectedTool, setSelectedTool] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { data: tools, isLoading, error } = useQuery({
    queryKey: ["/api/tools"],
  });

  const handleToolClick = (tool: any) => {
    setSelectedTool(tool);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

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
    <section id="tools" className="py-16">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl section-title">
            Powerful AI <span className="bg-gradient-to-r from-primary to-secondary-500 bg-clip-text text-transparent">Tools</span>
          </h2>
          <p className="mx-auto max-w-2xl text-gray-800 dark:text-slate-300 section-description">
            Choose from our collection of specialized AI tools designed to enhance your content creation workflow.
          </p>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="flex justify-center py-12">
            <p className="text-red-500">Failed to load tools. Please try again later.</p>
          </div>
        ) : (
          <motion.div 
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
          >
            {tools?.map((tool: any) => (
              <motion.div key={tool.id} variants={item}>
                <ToolCard
                  icon={tool.icon}
                  color={tool.color}
                  title={tool.name}
                  description={tool.description}
                  onClick={() => handleToolClick(tool)}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
      
      <ToolModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        tool={selectedTool}
      />
    </section>
  );
}
