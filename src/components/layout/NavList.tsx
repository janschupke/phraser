import { NavLink } from 'react-router';
import { ROUTES } from '../../routes';

interface NavListProps {
  className?: string;
  translationCount: number;
  onNavigate?: () => void;
  itemClassName?: string;
}

/**
 * Rendered twice -- the desktop row and the mobile panel -- from one list, so
 * the two cannot drift.
 *
 * NavLink rather than a hand-rolled active check: it sets aria-current="page"
 * itself, which is what tells a screen reader which page you are on.
 */
export function NavList({
  className = '',
  translationCount,
  onNavigate,
  itemClassName = '',
}: NavListProps) {
  return (
    <ul className={className}>
      {ROUTES.filter(route => route.showInNav).map(route => (
        <li key={route.path}>
          <NavLink
            to={route.path}
            onClick={onNavigate}
            className={({ isActive }) =>
              `block px-4 py-2 rounded-lg transition-colors duration-200 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ${
                isActive ? 'bg-primary-600 text-white' : 'text-neutral-700 hover:bg-neutral-100'
              } ${itemClassName}`
            }
          >
            {route.label}
            {route.path === '/list' && translationCount > 0 && (
              <span className="ml-2 px-1.5 py-0.5 text-xs bg-neutral-200 text-neutral-700 rounded-sm">
                {translationCount}
              </span>
            )}
          </NavLink>
        </li>
      ))}
    </ul>
  );
}
