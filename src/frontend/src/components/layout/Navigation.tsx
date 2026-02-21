import { useNavigate, useRouterState } from '@tanstack/react-router';
import { LayoutDashboard, Users, Calendar, Video } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/patients', label: 'Patients', icon: Users },
  { path: '/appointments', label: 'Appointments', icon: Calendar },
];

export default function Navigation() {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  return (
    <nav className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:w-64 lg:pt-20 bg-white border-r border-medical-200">
      <div className="flex-1 flex flex-col overflow-y-auto px-4 py-6 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path;
          
          return (
            <button
              key={item.path}
              onClick={() => navigate({ to: item.path })}
              className={cn(
                'flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-left',
                isActive
                  ? 'bg-medical-600 text-white shadow-md'
                  : 'text-medical-700 hover:bg-medical-50 hover:text-medical-900'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="p-4 border-t border-medical-200">
        <div className="text-xs text-center text-medical-600 space-y-1">
          <p>© {new Date().getFullYear()}</p>
          <p>
            Built with ❤️ using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-medical-700 hover:text-medical-900 font-medium"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </nav>
  );
}
