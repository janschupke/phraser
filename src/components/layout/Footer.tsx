import { FaGithub } from 'react-icons/fa';

export function Footer() {
  return (
    <footer className="bg-surface border-t border-neutral-200 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-center items-center">
          <a
            href="https://github.com/janschupke/phraser"
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-400 hover:text-neutral-600 transition-colors duration-200"
            aria-label="View on GitHub"
          >
            <FaGithub className="w-6 h-6" />
          </a>
        </div>
      </div>
    </footer>
  );
}
