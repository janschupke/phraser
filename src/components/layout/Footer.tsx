import { FaGithub } from 'react-icons/fa';

/**
 * Hidden on short screens for the viewport-fit route, where ~72px of chrome is
 * worth more as card space.
 */
export function Footer({ fit = false }: { fit?: boolean }) {
  return (
    <footer
      className={`bg-surface border-t border-neutral-200 shrink-0${fit ? ' hidden sm:block' : ''}`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-center items-center">
          <a
            href="https://github.com/janschupke/phraser"
            target="_blank"
            rel="noopener noreferrer"
            className="block p-2 rounded-lg text-neutral-500 hover:text-neutral-700 hover:bg-hover-strong transition-colors duration-200 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
            aria-label="View on GitHub"
          >
            <FaGithub className="w-6 h-6" />
          </a>
        </div>
      </div>
    </footer>
  );
}
