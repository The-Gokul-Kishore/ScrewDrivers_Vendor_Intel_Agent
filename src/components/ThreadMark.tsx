export function ThreadMark({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 12a1 1 0 1 1 2 0 2 2 0 1 1-4 0 3 3 0 1 1 6 0 4 4 0 1 1-8 0 5 5 0 1 1 10 0" />
    </svg>
  );
}
