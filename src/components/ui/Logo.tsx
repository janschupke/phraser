/**
 * The app mark, matching public/favicon.svg: 語 on a rounded primary square.
 * Decorative -- wherever it appears, the "Phraser" text beside it is the name.
 */
export function Logo({ className = '' }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      lang="zh-Hant"
      className={`inline-flex items-center justify-center w-8 h-8 rounded-[7px] bg-primary-600 text-white text-xl font-bold leading-none select-none ${className}`}
    >
      語
    </span>
  );
}
