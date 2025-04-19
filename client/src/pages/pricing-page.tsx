import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";

const pricingPlans = [
  {
    name: "Free",
    description: "Perfect for trying out our AI tools",
    price: "$0",
    features: [
      "3 AI generations per day",
      "Access to all AI tools",
      "Basic support",
      "Standard response time",
    ],
    color: "bg-slate-100 dark:bg-slate-800",
    buttonVariant: "outline" as const,
  },
  {
    name: "Premium",
    description: "Best for professionals and content creators",
    price: "$19",
    interval: "month",
    features: [
      "Unlimited AI generations",
      "Priority access to new tools",
      "Priority support",
      "Faster response time",
      "Save generation history",
      "Advanced customization options",
      "Share on all social platforms",
    ],
    color: "bg-primary/10 dark:bg-primary/20",
    buttonVariant: "default" as const,
    popular: true,
  },
  {
    name: "Enterprise",
    description: "For teams and organizations",
    price: "Custom",
    features: [
      "Everything in Premium",
      "Custom AI model training",
      "API access",
      "Dedicated support",
      "Custom integrations",
      "Team collaboration features",
      "Usage analytics",
    ],
    color: "bg-slate-100 dark:bg-slate-800",
    buttonVariant: "outline" as const,
  },
];

export default function PricingPage() {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
            <p className="text-xl text-muted-foreground">
              Choose the plan that's right for you
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {pricingPlans.map((plan) => (
              <Card
                key={plan.name}
                className={`relative ${plan.color} border-2 ${
                  plan.popular ? "border-primary" : "border-transparent"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-5 left-0 right-0 mx-auto w-fit">
                    <span className="bg-primary px-3 py-1 text-sm font-medium text-primary-foreground rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.interval && (
                      <span className="text-muted-foreground">/{plan.interval}</span>
                    )}
                  </div>
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center">
                        <Check className="h-4 w-4 text-primary mr-2" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  {plan.name === "Free" ? (
                    <Button
                      variant={plan.buttonVariant}
                      className="w-full"
                      asChild
                    >
                      <Link href={user ? "/dashboard" : "/auth"}>
                        {user ? "Go to Dashboard" : "Get Started"}
                      </Link>
                    </Button>
                  ) : plan.name === "Premium" ? (
                    <Button
                      variant={plan.buttonVariant}
                      className="w-full"
                      asChild
                    >
                      <Link href={user ? "/upgrade" : "/auth"}>
                        {user ? "Upgrade Now" : "Get Premium"}
                      </Link>
                    </Button>
                  ) : (
                    <Button
                      variant={plan.buttonVariant}
                      className="w-full"
                      asChild
                    >
                      <Link href="/contact">Contact Sales</Link>
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>

          <div className="mt-16 text-center">
            <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
            <div className="max-w-3xl mx-auto grid gap-6 md:grid-cols-2">
              <div className="text-left">
                <h3 className="font-medium mb-2">What payment methods do you accept?</h3>
                <p className="text-muted-foreground">
                  We accept all major credit cards, PayPal, and bank transfers for Enterprise plans.
                </p>
              </div>
              <div className="text-left">
                <h3 className="font-medium mb-2">Can I cancel my subscription?</h3>
                <p className="text-muted-foreground">
                  Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period.
                </p>
              </div>
              <div className="text-left">
                <h3 className="font-medium mb-2">Is there a free trial?</h3>
                <p className="text-muted-foreground">
                  Our Free tier allows you to try all our tools with a daily limit. No credit card required.
                </p>
              </div>
              <div className="text-left">
                <h3 className="font-medium mb-2">Do you offer refunds?</h3>
                <p className="text-muted-foreground">
                  Yes, we offer a 14-day money-back guarantee if you're not satisfied with our service.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
} 