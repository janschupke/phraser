import { useEffect, useRef, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Navigation } from './Navigation';
import { Footer } from './Footer';
import { ROUTES } from '../../routes';

/**
 * Page shell.
 *
 * Routes marked fitViewport are sized to the viewport and do not scroll the
 * document; everything else scrolls normally. Keeping the document as the
 * scroll container on ordinary routes matters on mobile, where a non-document
 * scroller disables the URL-bar auto-hide and costs real estate.
 *
 * The fit route uses svh (smallest viewport height) rather than dvh: with dvh
 * the box resizes as the mobile URL bar collapses, and since nothing scrolls,
 * the user watches the card reflow mid-interaction.
 */
export function AppLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const isFirstRender = useRef(true);

  const route = ROUTES.find(r => r.path === location.pathname);
  const fit = route?.fitViewport ?? false;

  // Hard-stop iOS rubber-banding on the fit route, where nothing should move.
  useEffect(() => {
    if (!fit) return;
    document.documentElement.dataset['fit'] = 'true';
    return () => {
      delete document.documentElement.dataset['fit'];
    };
  }, [fit]);

  // SPA navigation is silent to a screen reader and leaves focus wherever it
  // was. Move focus to main and announce the new page -- but not on first load,
  // where the browser has already done the right thing.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    mainRef.current?.focus();
  }, [location.pathname]);

  return (
    <div className={fit ? 'h-svh overflow-hidden flex flex-col' : 'min-h-dvh flex flex-col'}>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:z-70 focus:m-2 focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2 focus:ring-2 focus:ring-primary-500"
      >
        Skip to main content
      </a>

      <Navigation />

      <main
        id="main"
        ref={mainRef}
        tabIndex={-1}
        className={`flex-1 min-h-0 w-full outline-hidden${fit ? ' overflow-hidden flex' : ''}`}
      >
        <div
          className={`max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8${
            fit ? ' py-4 flex-1 min-h-0 flex flex-col' : ' py-8 sm:py-12'
          }`}
        >
          {children}
        </div>
      </main>

      <p aria-live="polite" className="sr-only">
        {route ? `${route.label} page` : 'Page not found'}
      </p>

      <Footer fit={fit} />
    </div>
  );
}
