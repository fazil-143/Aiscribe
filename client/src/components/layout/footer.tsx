import { Link } from "wouter";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  const footerLinks = {
    product: [
      { label: "Features", href: "#" },
      { label: "Pricing", href: "#pricing" },
      { label: "Use Cases", href: "#" },
      { label: "Integrations", href: "#" },
      { label: "API", href: "#" },
    ],
    resources: [
      { label: "Documentation", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Tutorials", href: "#" },
      { label: "Help Center", href: "#" },
      { label: "Community", href: "#" },
    ],
    company: [
      { label: "About", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Press", href: "#" },
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
    ],
  };
  
  const socialLinks = [
    { icon: "alternate_email", label: "Twitter", href: "#" },
    { icon: "facebook", label: "Facebook", href: "#" },
    { icon: "photo_camera", label: "Instagram", href: "#" },
    { icon: "group", label: "LinkedIn", href: "#" },
  ];

  return (
    <footer className="border-t border-slate-200 bg-white py-12 dark:border-slate-800 dark:bg-slate-900">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-white">
                <span className="material-icons text-sm">autorenew</span>
              </div>
              <span className="text-xl font-bold">AIScribe</span>
            </div>
            <p className="mt-4 text-slate-600 dark:text-slate-400">
              Powerful AI-powered content generation for creators and businesses.
            </p>
            <div className="mt-4 flex space-x-4">
              {socialLinks.map((link) => (
                <a 
                  key={link.label}
                  href={link.href} 
                  className="text-slate-600 hover:text-primary dark:text-slate-400 dark:hover:text-primary-400" 
                  aria-label={link.label}
                >
                  <span className="material-icons">{link.icon}</span>
                </a>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="mb-4 font-semibold">Product</h3>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <Link href={link.href}>
                    <a className="text-slate-600 hover:text-primary dark:text-slate-400 dark:hover:text-primary-400">
                      {link.label}
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="mb-4 font-semibold">Resources</h3>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  <Link href={link.href}>
                    <a className="text-slate-600 hover:text-primary dark:text-slate-400 dark:hover:text-primary-400">
                      {link.label}
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="mb-4 font-semibold">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link href={link.href}>
                    <a className="text-slate-600 hover:text-primary dark:text-slate-400 dark:hover:text-primary-400">
                      {link.label}
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="mt-8 border-t border-slate-200 pt-8 text-center dark:border-slate-800">
          <p className="text-slate-600 dark:text-slate-400">
            &copy; {currentYear} AIScribe. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
