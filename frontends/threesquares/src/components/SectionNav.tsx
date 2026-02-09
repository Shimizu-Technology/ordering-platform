import { useLocation, useNavigate } from 'react-router-dom';
import { UtensilsCrossed, ChefHat, Cookie } from 'lucide-react';
import { motion } from 'framer-motion';

interface SectionNavProps {
  slug: string;
}

const sections = [
  { id: 'menu', path: '', label: 'Menu', icon: UtensilsCrossed },
  { id: 'catering', path: '/catering', label: 'Catering', icon: ChefHat },
  { id: 'cookies', path: '/cookies', label: 'Cookies', icon: Cookie },
];

export function SectionNav({ slug }: SectionNavProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const currentPath = location.pathname;
  
  const getActiveSection = () => {
    if (currentPath.includes('/catering')) return 'catering';
    if (currentPath.includes('/cookies')) return 'cookies';
    return 'menu';
  };

  const activeSection = getActiveSection();

  return (
    <nav className="bg-white border-b border-border-default sticky top-0 z-30">
      <div className="flex justify-center">
        <div className="flex gap-1 p-1">
          {sections.map((section) => {
            const isActive = activeSection === section.id;
            const Icon = section.icon;
            
            return (
              <button
                key={section.id}
                onClick={() => navigate(`/${slug}${section.path}`)}
                className={`
                  relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium
                  transition-colors duration-200
                  ${isActive 
                    ? 'text-brand' 
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span>{section.label}</span>
                
                {isActive && (
                  <motion.div
                    layoutId="section-indicator"
                    className="absolute inset-0 bg-brand/10 rounded-lg -z-10"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
