import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";
import { Link } from "wouter";

export default function PricingSection() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [upgrading, setUpgrading] = useState(false);

  const handleUpgrade = async () => {
    if (!user) {
      // Redirect to auth page if not logged in
      return;
    }

    setUpgrading(true);

    try {
      await apiRequest("POST", "/api/upgrade");
      
      // Refetch user data
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      
      toast({
        title: "Upgrade Successful",
        description: "Welcome to Premium! You now have unlimited access to all AIScribe features.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Upgrade Failed",
        description: error.message || "Something went wrong. Please try again.",
      });
    } finally {
      setUpgrading(false);
    }
  };

  const freeTierFeatures = [
    { name: "Access to all AI tools", included: true },
    { name: "3 generations per day", included: true },
    { name: "Standard quality output", included: true },
    { name: "No saved history", included: false },
    { name: "No customization options", included: false },
  ];

  const premiumFeatures = [
    { name: "Access to all AI tools", included: true },
    { name: "Unlimited generations", included: true },
    { name: "Premium quality output", included: true },
    { name: "Save & organize content", included: true },
    { name: "Advanced customization", included: true },
  ];

  return (
    <section id="pricing" className="py-16">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl section-title">
            Simple, Transparent <span className="bg-gradient-to-r from-primary to-secondary-500 bg-clip-text text-transparent">Pricing</span>
          </h2>
          <p className="mx-auto max-w-2xl text-gray-800 dark:text-slate-300 section-description">
            Choose the plan that works best for your content needs. No hidden fees. Cancel anytime.
          </p>
        </div>
        
        <div className="grid max-w-4xl gap-8 mx-auto md:grid-cols-2">
          {/* Free Tier */}
          <motion.div
            className="flex flex-col rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-800/50"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            viewport={{ once: true }}
            whileHover={{ y: -5, boxShadow: "0 12px 20px rgba(0, 0, 0, 0.1)" }}
          >
            <div className="border-b border-slate-200 p-6 dark:border-slate-700">
              <h3 className="mb-2 text-xl font-semibold">Free Tier</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold">$0</span>
                <span className="text-slate-600 dark:text-slate-400">/month</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400">Perfect for occasional use and trying out our tools.</p>
            </div>
            <div className="flex-1 p-6">
              <ul className="mb-6 space-y-3">
                {freeTierFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    {feature.included ? (
                      <Check className="mr-2 h-5 w-5 text-green-500" />
                    ) : (
                      <X className="mr-2 h-5 w-5 text-slate-400" />
                    )}
                    <span className={feature.included ? "" : "text-slate-400"}>
                      {feature.name}
                    </span>
                  </li>
                ))}
              </ul>
              <Button 
                variant="outline" 
                className="w-full" 
                asChild
              >
                <Link href={user ? "/dashboard" : "/auth"}>
                  Get Started
                </Link>
              </Button>
            </div>
          </motion.div>
          
          {/* Premium Tier */}
          <motion.div
            className="flex flex-col rounded-xl border-2 border-primary bg-white dark:bg-slate-800/50"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            viewport={{ once: true }}
            whileHover={{ y: -5, boxShadow: "0 12px 20px rgba(0, 0, 0, 0.1)" }}
          >
            <div className="relative border-b border-slate-200 p-6 dark:border-slate-700">
              <div className="absolute -top-4 right-4 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white">
                RECOMMENDED
              </div>
              <h3 className="mb-2 text-xl font-semibold">Premium</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold">$19</span>
                <span className="text-slate-600 dark:text-slate-400">/month</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400">For professionals and businesses with regular content needs.</p>
            </div>
            <div className="flex-1 p-6">
              <ul className="mb-6 space-y-3">
                {premiumFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="mr-2 h-5 w-5 text-green-500" />
                    <span>
                      {feature.name === "Unlimited generations" ? (
                        <span><strong>Unlimited</strong> generations</span>
                      ) : (
                        feature.name
                      )}
                    </span>
                  </li>
                ))}
              </ul>
              <Button 
                className="w-full" 
                onClick={handleUpgrade}
                disabled={upgrading || (user && user.premium)}
              >
                {upgrading ? (
                  <>
                    <span className="mr-2">Processing</span>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  </>
                ) : user && user.premium ? (
                  "Current Plan"
                ) : user ? (
                  "Upgrade Now"
                ) : (
                  <Link href="/auth">Sign Up & Upgrade</Link>
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
