import type { ReactNode, SVGProps } from "react";

export type LandingIconName =
  | "screen-off"
  | "transition"
  | "lightbulb"
  | "speech"
  | "blocks"
  | "spark"
  | "script"
  | "lifebuoy"
  | "check-circle"
  | "calendar"
  | "shield"
  | "heart"
  | "refresh"
  | "clock"
  | "user"
  | "alert"
  | "home"
  | "sliders"
  | "chart"
  | "grid"
  | "timer"
  | "lock"
  | "arrow-right";

function Svg({ children, ...props }: SVGProps<SVGSVGElement> & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      width={24}
      height={24}
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

const paths: Record<LandingIconName, ReactNode> = {
  "screen-off": (
    <>
      <rect x="6" y="3" width="12" height="18" rx="2.5" />
      <line x1="11" y1="6" x2="13" y2="6" />
      <line x1="3.5" y1="3.5" x2="20.5" y2="20.5" />
    </>
  ),
  transition: (
    <>
      <path d="M4 9h13" />
      <path d="M14 6l3 3-3 3" />
      <path d="M20 15H7" />
      <path d="M10 12l-3 3 3 3" />
    </>
  ),
  lightbulb: (
    <>
      <path d="M9.5 18h5" />
      <path d="M10 21h4" />
      <path d="M12 3a6 6 0 0 0-3.8 10.6c.7.6 1.1 1.4 1.2 2.4h5.2c.1-1 .5-1.8 1.2-2.4A6 6 0 0 0 12 3Z" />
    </>
  ),
  speech: (
    <>
      <path d="M20.5 12a7.5 7.5 0 0 1-10.9 6.7L4 20.5l1.8-5.6A7.5 7.5 0 1 1 20.5 12Z" />
      <line x1="8.5" y1="11" x2="8.5" y2="11" />
      <line x1="12" y1="11" x2="12" y2="11" />
      <line x1="15.5" y1="11" x2="15.5" y2="11" />
    </>
  ),
  blocks: (
    <>
      <rect x="3.5" y="13" width="7" height="7" rx="1.6" />
      <rect x="13.5" y="13" width="7" height="7" rx="1.6" />
      <rect x="8.5" y="3.5" width="7" height="7" rx="1.6" />
    </>
  ),
  spark: (
    <>
      <path d="M12 3.5l1.7 4.6 4.6 1.7-4.6 1.7L12 16.1l-1.7-4.6L5.7 9.8l4.6-1.7L12 3.5Z" />
      <path d="M18.5 15l.7 1.9 1.9.7-1.9.7-.7 1.9-.7-1.9-1.9-.7 1.9-.7.7-1.9Z" />
    </>
  ),
  script: (
    <>
      <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v9A1.5 1.5 0 0 1 18.5 16H9l-5 4V5.5Z" />
      <line x1="8" y1="8.5" x2="16" y2="8.5" />
      <line x1="8" y1="12" x2="13" y2="12" />
    </>
  ),
  lifebuoy: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="3.4" />
      <line x1="5.9" y1="5.9" x2="9.6" y2="9.6" />
      <line x1="14.4" y1="14.4" x2="18.1" y2="18.1" />
      <line x1="18.1" y1="5.9" x2="14.4" y2="9.6" />
      <line x1="9.6" y1="14.4" x2="5.9" y2="18.1" />
    </>
  ),
  "check-circle": (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M8.5 12.3l2.4 2.4 4.6-5" />
    </>
  ),
  calendar: (
    <>
      <rect x="4" y="5" width="16" height="15" rx="2.5" />
      <line x1="4" y1="9.5" x2="20" y2="9.5" />
      <line x1="8.5" y1="3" x2="8.5" y2="6.5" />
      <line x1="15.5" y1="3" x2="15.5" y2="6.5" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3.2l7 2.6v5.1c0 4.4-3 7.6-7 9.1-4-1.5-7-4.7-7-9.1V5.8l7-2.6Z" />
      <path d="M9 11.8l2 2 4-4.3" />
    </>
  ),
  heart: (
    <path d="M12 20.2C6.8 17 3.5 13.9 3.5 9.9 3.5 7.3 5.5 5.3 8 5.3c1.7 0 3.1 1 4 2.4.9-1.4 2.3-2.4 4-2.4 2.5 0 4.5 2 4.5 4.6 0 4-3.3 7.1-8.5 10.3Z" />
  ),
  refresh: (
    <>
      <path d="M20.5 12a8.5 8.5 0 1 1-2.5-6" />
      <path d="M20.5 3.8V9h-5.2" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7v5.2l3.4 2" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="3.8" />
      <path d="M4.5 20c0-3.6 3.4-5.8 7.5-5.8S19.5 16.4 19.5 20" />
    </>
  ),
  alert: (
    <>
      <path d="M12 4.2l8.4 14.6H3.6L12 4.2Z" />
      <line x1="12" y1="10" x2="12" y2="13.6" />
      <line x1="12" y1="16.4" x2="12" y2="16.4" />
    </>
  ),
  home: (
    <>
      <path d="M4 11l8-6 8 6" />
      <path d="M6 10v9.5h12V10" />
      <path d="M10.5 19.5v-5h3v5" />
    </>
  ),
  sliders: (
    <>
      <line x1="4" y1="8" x2="20" y2="8" />
      <line x1="4" y1="16" x2="20" y2="16" />
      <circle cx="9" cy="8" r="2.3" />
      <circle cx="15" cy="16" r="2.3" />
    </>
  ),
  chart: (
    <>
      <path d="M4 4v16h16" />
      <path d="M7.5 14.5l3-3.5 2.5 2 4-5.5" />
    </>
  ),
  grid: (
    <>
      <rect x="4" y="4" width="7" height="7" rx="1.6" />
      <rect x="13" y="4" width="7" height="7" rx="1.6" />
      <rect x="4" y="13" width="7" height="7" rx="1.6" />
      <rect x="13" y="13" width="7" height="7" rx="1.6" />
    </>
  ),
  timer: (
    <>
      <circle cx="12" cy="13.5" r="7.5" />
      <path d="M12 13.5V9.5" />
      <line x1="9.5" y1="3" x2="14.5" y2="3" />
      <line x1="12" y1="3" x2="12" y2="6" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="11" width="14" height="9" rx="2.2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </>
  ),
  "arrow-right": (
    <>
      <line x1="4" y1="12" x2="19" y2="12" />
      <path d="M14 7l5 5-5 5" />
    </>
  ),
};

export function LandingIcon({
  name,
  className,
  ...props
}: { name: LandingIconName } & SVGProps<SVGSVGElement>) {
  return (
    <Svg className={className} {...props}>
      {paths[name]}
    </Svg>
  );
}

const tintClasses = {
  peach: "tk-accent-play",
  blush: "tk-accent-sos",
  lavender: "tk-accent-skill",
  sage: "tk-accent-sage",
  gold: "tk-accent-yellow",
  neutral: "tk-accent-neutral",
} as const;

export type IconTileTint = keyof typeof tintClasses;

export function IconTile({
  name,
  tint = "peach",
  size = "md",
  className = "",
}: {
  name: LandingIconName;
  tint?: IconTileTint;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizes = {
    sm: "h-9 w-9 rounded-xl",
    md: "h-11 w-11 rounded-2xl",
    lg: "h-14 w-14 rounded-2xl",
  };
  const iconSizes = { sm: "h-[18px] w-[18px]", md: "h-[22px] w-[22px]", lg: "h-7 w-7" };
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center ${sizes[size]} ${tintClasses[tint]} ${className}`}
    >
      <LandingIcon name={name} className={iconSizes[size]} />
    </span>
  );
}
