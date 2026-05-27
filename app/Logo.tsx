// SharpSpots logo: jade circular double-ring seal with italic serif S + two
// vertical slashes (dollar-sign treatment).
// Sized via the `size` prop — defaults to 48px to match the larger header lockup.
// Pass `aria-label` if rendered without an adjacent wordmark.

interface LogoProps {
  size?: number;
  className?: string;
}

export default function Logo({ size = 48, className }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 44 44"
      className={className}
      aria-label="SharpSpots"
      role="img"
    >
      <circle cx="22" cy="22" r="18" fill="var(--bg)" stroke="var(--jade)" strokeWidth="1.5" />
      <circle cx="22" cy="22" r="14" fill="none" stroke="var(--jade)" strokeWidth="0.5" />
      <text
        x="22"
        y="30"
        textAnchor="middle"
        fill="var(--jade)"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontStyle="italic"
        fontWeight="700"
        fontSize="22"
      >
        S
      </text>
      <line x1="19" y1="6" x2="19" y2="38" stroke="var(--jade)" strokeWidth="1.2" />
      <line x1="25" y1="6" x2="25" y2="38" stroke="var(--jade)" strokeWidth="1.2" />
    </svg>
  );
}
