import { motion } from "framer-motion";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardHoverProps {
  children: ReactNode;
  className?: string;
}

export function CardHover({ children, className }: CardHoverProps) {
  return (
    <motion.div
      className={cn(
        "rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-800/50",
        className
      )}
      whileHover={{ 
        y: -5,
        boxShadow: "0 12px 20px rgba(0, 0, 0, 0.1)"
      }}
      transition={{ 
        type: "spring", 
        stiffness: 300,
        damping: 20 
      }}
    >
      {children}
    </motion.div>
  );
}

export function ToolCard({ 
  icon, 
  color, 
  title, 
  description, 
  onClick 
}: { 
  icon: string; 
  color: string; 
  title: string; 
  description: string;
  onClick: () => void;
}) {
  // Determine color class based on the color prop
  const colorClass = {
    primary: "bg-primary-100 text-primary-600 dark:bg-primary-900/50 dark:text-primary-400",
    secondary: "bg-secondary-100 text-secondary-600 dark:bg-secondary-900/50 dark:text-secondary-400",
    accent: "bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400"
  }[color] || "bg-primary-100 text-primary-600 dark:bg-primary-900/50 dark:text-primary-400";

  return (
    <CardHover>
      <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg ${colorClass}`}>
        <span className="material-icons">{icon}</span>
      </div>
      <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">{title}</h3>
      <p className="mb-4 text-gray-700 dark:text-slate-300">{description}</p>
      <div className="mt-auto">
        <button
          onClick={onClick}
          className="inline-flex items-center font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
        >
          Use Tool <span className="material-icons ml-1 text-sm">arrow_forward</span>
        </button>
      </div>
    </CardHover>
  );
}

export function FeatureCard({ icon, color, title, description }: { icon: string; color: string; title: string; description: string }) {
  // Determine color class based on the color prop
  const colorClass = {
    primary: "bg-primary-100 text-primary-600 dark:bg-primary-900/50 dark:text-primary-400",
    secondary: "bg-secondary-100 text-secondary-600 dark:bg-secondary-900/50 dark:text-secondary-400",
    accent: "bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400"
  }[color] || "bg-primary-100 text-primary-600 dark:bg-primary-900/50 dark:text-primary-400";

  return (
    <motion.div
      className="rounded-xl bg-white p-6 shadow-sm dark:bg-slate-800/80"
      whileHover={{ y: -3, boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1)" }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg ${colorClass}`}>
        <span className="material-icons">{icon}</span>
      </div>
      <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">{title}</h3>
      <p className="text-gray-700 dark:text-slate-300">{description}</p>
    </motion.div>
  );
}

export function TestimonialCard({ name, title, text, initials, rating }: { name: string; title: string; text: string; initials: string; rating: number }) {
  return (
    <motion.div
      className="rounded-xl bg-white p-6 shadow-sm dark:bg-slate-800/80"
      whileHover={{ y: -3, boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1)" }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div className="mb-4 flex items-center space-x-4">
        <div className="h-12 w-12 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
          <span className="font-medium text-slate-500 dark:text-slate-300">{initials}</span>
        </div>
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white">{name}</h4>
          <p className="text-sm text-gray-700 dark:text-slate-300">{title}</p>
        </div>
      </div>
      <p className="text-gray-700 dark:text-slate-300">{text}</p>
      <div className="mt-4 flex text-yellow-400">
        {[...Array(5)].map((_, i) => (
          <span key={i} className="material-icons">
            {i < rating ? 'star' : (i === Math.floor(rating) && rating % 1 ? 'star_half' : 'star_border')}
          </span>
        ))}
      </div>
    </motion.div>
  );
}
