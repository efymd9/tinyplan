"use client";

import React from "react";

// ── Palette ──────────────────────────────────────────────────────────
const C = {
  peach: "#FCDDD2",
  beige: "#F0EAE2",
  orange: "#D4704E",
  green: "#4A7B62",
  cream: "#FDFAF6",
  blue: "#B8D4E3",
  yellow: "#D4A72C",
  pink: "#F5D0D0",
  dark: "#1C1917",
  muted: "#78716C",
} as const;

// ── Shared wrapper ───────────────────────────────────────────────────
function HeroSvg({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 320 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ width: "100%", height: "100%" }}
    >
      {children}
    </svg>
  );
}

// ── Activity illustrations ───────────────────────────────────────────

function BlanketFort({ className }: { className?: string }) {
  return (
    <HeroSvg className={className}>
      <rect width="320" height="180" rx="16" fill={C.cream} />
      {/* moon + stars */}
      <circle cx="60" cy="36" r="14" fill={C.yellow} />
      <circle cx="54" cy="32" r="12" fill={C.cream} />
      <circle cx="90" cy="24" r="2.5" fill={C.yellow} opacity="0.7" />
      <circle cx="110" cy="40" r="2" fill={C.yellow} opacity="0.5" />
      <circle cx="78" cy="48" r="1.8" fill={C.yellow} opacity="0.6" />
      {/* chair legs */}
      <rect x="100" y="100" width="6" height="50" rx="3" fill={C.muted} />
      <rect x="210" y="100" width="6" height="50" rx="3" fill={C.muted} />
      {/* blanket drape */}
      <path
        d="M90 100 Q120 50 160 60 Q200 50 230 100 L230 150 Q160 140 90 150 Z"
        fill={C.peach}
        opacity="0.9"
      />
      <path
        d="M100 105 Q130 65 160 72 Q190 65 220 105"
        stroke={C.orange}
        strokeWidth="2"
        fill="none"
        opacity="0.4"
      />
      {/* book inside */}
      <rect x="140" y="120" width="30" height="22" rx="2" fill={C.blue} />
      <rect x="155" y="120" width="1.5" height="22" fill={C.cream} />
      {/* flashlight beam */}
      <rect x="180" y="110" width="16" height="7" rx="3" fill={C.yellow} opacity="0.6" />
      <path d="M196 108 L230 95 L230 125 L196 118 Z" fill={C.yellow} opacity="0.2" />
    </HeroSvg>
  );
}

function BedtimeYoga({ className }: { className?: string }) {
  return (
    <HeroSvg className={className}>
      <rect width="320" height="180" rx="16" fill={C.cream} />
      {/* crescent moon */}
      <circle cx="260" cy="34" r="16" fill={C.yellow} />
      <circle cx="252" cy="30" r="14" fill={C.cream} />
      {/* stars */}
      <circle cx="40" cy="28" r="2" fill={C.yellow} opacity="0.5" />
      <circle cx="280" cy="60" r="1.8" fill={C.yellow} opacity="0.4" />
      {/* yoga mat */}
      <ellipse cx="160" cy="155" rx="120" ry="14" fill={C.green} opacity="0.3" />
      <rect x="50" y="148" width="220" height="8" rx="4" fill={C.green} opacity="0.5" />
      {/* cat stretch silhouette */}
      <ellipse cx="100" cy="130" rx="24" ry="12" fill={C.orange} opacity="0.7" />
      <ellipse cx="80" cy="128" rx="8" ry="6" fill={C.orange} opacity="0.7" />
      <path d="M74 122 L72 114 L78 120 Z" fill={C.orange} opacity="0.7" />
      <path d="M82 122 L84 114 L78 120 Z" fill={C.orange} opacity="0.7" />
      <path d="M124 130 Q132 120 130 134" stroke={C.orange} strokeWidth="2.5" fill="none" opacity="0.7" strokeLinecap="round" />
      {/* butterfly shape */}
      <ellipse cx="190" cy="110" rx="16" ry="22" transform="rotate(-20 190 110)" fill={C.pink} opacity="0.6" />
      <ellipse cx="210" cy="110" rx="16" ry="22" transform="rotate(20 210 110)" fill={C.peach} opacity="0.6" />
      <rect x="198" y="96" width="3" height="30" rx="1.5" fill={C.muted} opacity="0.5" />
      {/* flamingo */}
      <circle cx="260" cy="108" r="10" fill={C.pink} opacity="0.7" />
      <rect x="259" y="118" width="2.5" height="30" rx="1" fill={C.pink} opacity="0.7" />
      <circle cx="260" cy="100" r="6" fill={C.pink} opacity="0.7" />
    </HeroSvg>
  );
}

function TreasureHunt({ className }: { className?: string }) {
  return (
    <HeroSvg className={className}>
      <rect width="320" height="180" rx="16" fill={C.cream} />
      {/* ground */}
      <ellipse cx="160" cy="160" rx="140" ry="18" fill={C.green} opacity="0.15" />
      {/* magnifying glass */}
      <circle cx="120" cy="80" r="28" stroke={C.orange} strokeWidth="5" fill={C.blue} opacity="0.3" />
      <circle cx="120" cy="80" r="28" stroke={C.orange} strokeWidth="5" fill="none" />
      <rect x="142" y="100" width="6" height="28" rx="3" fill={C.orange} transform="rotate(40 145 114)" />
      {/* leaf */}
      <ellipse cx="200" cy="100" rx="18" ry="10" fill={C.green} opacity="0.7" transform="rotate(-15 200 100)" />
      <line x1="186" y1="104" x2="214" y2="96" stroke={C.green} strokeWidth="1.5" opacity="0.5" />
      {/* pebble */}
      <ellipse cx="240" cy="130" rx="14" ry="10" fill={C.beige} />
      <ellipse cx="238" cy="128" rx="10" ry="7" fill={C.peach} opacity="0.5" />
      {/* checklist */}
      <rect x="55" y="120" width="40" height="48" rx="4" fill="white" />
      <rect x="55" y="120" width="40" height="48" rx="4" stroke={C.beige} strokeWidth="1.5" fill="none" />
      <line x1="62" y1="132" x2="72" y2="132" stroke={C.beige} strokeWidth="2" />
      <path d="M78 130 L81 133 L88 126" stroke={C.green} strokeWidth="2" fill="none" strokeLinecap="round" />
      <line x1="62" y1="142" x2="72" y2="142" stroke={C.beige} strokeWidth="2" />
      <path d="M78 140 L81 143 L88 136" stroke={C.green} strokeWidth="2" fill="none" strokeLinecap="round" />
      <line x1="62" y1="152" x2="72" y2="152" stroke={C.beige} strokeWidth="2" />
      <rect x="78" y="150" width="10" height="5" rx="1" stroke={C.beige} strokeWidth="1" fill="none" />
    </HeroSvg>
  );
}

function ColourSorting({ className }: { className?: string }) {
  return (
    <HeroSvg className={className}>
      <rect width="320" height="180" rx="16" fill={C.cream} />
      {/* rainbow arc */}
      <path d="M60 150 Q160 20 260 150" stroke={C.orange} strokeWidth="8" fill="none" opacity="0.4" />
      <path d="M70 150 Q160 35 250 150" stroke={C.yellow} strokeWidth="8" fill="none" opacity="0.4" />
      <path d="M80 150 Q160 50 240 150" stroke={C.green} strokeWidth="8" fill="none" opacity="0.3" />
      <path d="M90 150 Q160 65 230 150" stroke={C.blue} strokeWidth="8" fill="none" opacity="0.4" />
      {/* colour circles scattered */}
      <circle cx="90" cy="130" r="10" fill={C.orange} opacity="0.7" />
      <circle cx="130" cy="140" r="10" fill={C.yellow} opacity="0.7" />
      <circle cx="170" cy="135" r="10" fill={C.green} opacity="0.7" />
      <circle cx="210" cy="140" r="10" fill={C.blue} opacity="0.7" />
      <circle cx="245" cy="130" r="10" fill={C.pink} opacity="0.7" />
      {/* bowls */}
      <path d="M60 155 Q75 172 90 155" stroke={C.muted} strokeWidth="2.5" fill={C.beige} strokeLinecap="round" />
      <path d="M140 155 Q155 172 170 155" stroke={C.muted} strokeWidth="2.5" fill={C.beige} strokeLinecap="round" />
      <path d="M225 155 Q240 172 255 155" stroke={C.muted} strokeWidth="2.5" fill={C.beige} strokeLinecap="round" />
    </HeroSvg>
  );
}

function PuppetShow({ className }: { className?: string }) {
  return (
    <HeroSvg className={className}>
      <rect width="320" height="180" rx="16" fill={C.cream} />
      {/* stage curtain */}
      <rect x="60" y="20" width="200" height="140" rx="8" fill={C.beige} />
      <path d="M60 20 Q80 60 60 100 L60 20 Z" fill={C.orange} opacity="0.5" />
      <path d="M260 20 Q240 60 260 100 L260 20 Z" fill={C.orange} opacity="0.5" />
      <rect x="60" y="16" width="200" height="10" rx="4" fill={C.orange} opacity="0.7" />
      {/* curtain drape top */}
      <path d="M60 26 Q110 42 160 26 Q210 42 260 26" stroke={C.orange} strokeWidth="2" fill="none" opacity="0.5" />
      {/* sock puppet */}
      <path
        d="M140 70 Q130 60 135 50 Q145 40 155 50 Q160 60 150 70 Q155 80 155 100 L135 100 Q135 80 140 70 Z"
        fill={C.green}
        opacity="0.8"
      />
      {/* puppet eye */}
      <circle cx="145" cy="56" r="3" fill="white" />
      <circle cx="146" cy="56" r="1.5" fill={C.dark} />
      {/* speech bubble */}
      <rect x="170" y="44" width="60" height="30" rx="12" fill="white" />
      <path d="M175 74 L168 68 L180 68 Z" fill="white" />
      <circle cx="192" cy="56" r="2" fill={C.yellow} />
      <circle cx="202" cy="56" r="2" fill={C.orange} opacity="0.6" />
      <circle cx="212" cy="56" r="2" fill={C.pink} />
      {/* stage floor */}
      <rect x="60" y="150" width="200" height="10" rx="2" fill={C.peach} opacity="0.5" />
    </HeroSvg>
  );
}

function PuddleSplash({ className }: { className?: string }) {
  return (
    <HeroSvg className={className}>
      <rect width="320" height="180" rx="16" fill={C.cream} />
      {/* sky hint */}
      <circle cx="260" cy="36" r="18" fill={C.yellow} opacity="0.3" />
      {/* ground */}
      <ellipse cx="160" cy="158" rx="140" ry="20" fill={C.green} opacity="0.12" />
      {/* puddle */}
      <ellipse cx="150" cy="140" rx="50" ry="16" fill={C.blue} opacity="0.4" />
      <ellipse cx="145" cy="138" rx="30" ry="9" fill={C.blue} opacity="0.25" />
      {/* splash drops */}
      <ellipse cx="130" cy="118" rx="4" ry="6" fill={C.blue} opacity="0.5" />
      <ellipse cx="165" cy="114" rx="3" ry="5" fill={C.blue} opacity="0.4" />
      <ellipse cx="148" cy="110" rx="3.5" ry="5.5" fill={C.blue} opacity="0.45" />
      {/* wooden spoon */}
      <rect x="190" y="90" width="5" height="50" rx="2.5" fill={C.yellow} opacity="0.7" transform="rotate(15 192 115)" />
      <ellipse cx="191" cy="88" rx="8" ry="5" fill={C.yellow} opacity="0.6" transform="rotate(15 191 88)" />
      {/* bowl */}
      <path d="M210 130 Q230 155 250 130" stroke={C.muted} strokeWidth="3" fill={C.peach} opacity="0.6" strokeLinecap="round" />
      {/* leaves */}
      <ellipse cx="90" cy="130" rx="10" ry="5" fill={C.green} opacity="0.5" transform="rotate(-25 90 130)" />
      <ellipse cx="110" cy="145" rx="8" ry="4" fill={C.green} opacity="0.4" transform="rotate(10 110 145)" />
      <ellipse cx="240" cy="148" rx="9" ry="4.5" fill={C.green} opacity="0.45" transform="rotate(-10 240 148)" />
    </HeroSvg>
  );
}

function BlockTower({ className }: { className?: string }) {
  return (
    <HeroSvg className={className}>
      <rect width="320" height="180" rx="16" fill={C.cream} />
      {/* ground line */}
      <rect x="40" y="158" width="240" height="4" rx="2" fill={C.beige} />
      {/* tower blocks */}
      <rect x="130" y="130" width="60" height="28" rx="4" fill={C.blue} opacity="0.7" />
      <rect x="136" y="104" width="48" height="26" rx="4" fill={C.peach} />
      <rect x="140" y="80" width="40" height="24" rx="4" fill={C.green} opacity="0.6" />
      <rect x="146" y="58" width="28" height="22" rx="4" fill={C.yellow} opacity="0.8" />
      {/* star on top */}
      <polygon
        points="160,30 163,44 178,44 166,52 170,66 160,57 150,66 154,52 142,44 157,44"
        fill={C.orange}
        opacity="0.85"
      />
      {/* scattered loose blocks */}
      <rect x="70" y="142" width="24" height="16" rx="3" fill={C.pink} opacity="0.5" />
      <rect x="230" y="138" width="20" height="20" rx="3" fill={C.yellow} opacity="0.4" />
      <rect x="245" y="146" width="16" height="12" rx="2" fill={C.orange} opacity="0.3" transform="rotate(12 253 152)" />
    </HeroSvg>
  );
}

function GenericPlay({ className }: { className?: string }) {
  return (
    <HeroSvg className={className}>
      <rect width="320" height="180" rx="16" fill={C.cream} />
      {/* abstract playful shapes */}
      <circle cx="100" cy="90" r="36" fill={C.peach} opacity="0.6" />
      <circle cx="180" cy="70" r="28" fill={C.blue} opacity="0.5" />
      <circle cx="230" cy="110" r="32" fill={C.green} opacity="0.3" />
      <rect x="80" y="120" width="50" height="30" rx="10" fill={C.yellow} opacity="0.5" />
      <rect x="200" y="130" width="40" height="20" rx="8" fill={C.pink} opacity="0.5" />
      {/* sparkle */}
      <polygon
        points="160,40 163,52 175,52 165,59 169,71 160,63 151,71 155,59 145,52 157,52"
        fill={C.orange}
        opacity="0.6"
      />
      <circle cx="260" cy="50" r="3" fill={C.yellow} opacity="0.5" />
      <circle cx="55" cy="45" r="2.5" fill={C.orange} opacity="0.4" />
    </HeroSvg>
  );
}

// ── Activity ID map ──────────────────────────────────────────────────
const activityMap: Record<string, React.FC<{ className?: string }>> = {
  "fallback-blanket-fort": BlanketFort,
  "fallback-bedtime-yoga": BedtimeYoga,
  "fallback-treasure-hunt": TreasureHunt,
  "fallback-colour-sorting": ColourSorting,
  "fallback-puppet-show": PuppetShow,
  "fallback-puddle-splash": PuddleSplash,
  "fallback-block-tower": BlockTower,
};

export function ActivityIllustration({
  activityId,
  className,
}: {
  activityId: string;
  className?: string;
}) {
  const Component = activityMap[activityId] ?? GenericPlay;
  return <Component className={className} />;
}

// ── Spot icons (48x48) ──────────────────────────────────────────────

function SpotSvg({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width="48"
      height="48"
      className={className}
    >
      {children}
    </svg>
  );
}

const spotIcons: Record<string, React.FC<{ className?: string }>> = {
  week: ({ className }) => (
    <SpotSvg className={className}>
      <rect x="6" y="8" width="36" height="32" rx="6" fill={C.peach} />
      <rect x="6" y="8" width="36" height="10" rx="6" fill={C.orange} opacity="0.7" />
      <rect x="14" y="6" width="3" height="6" rx="1.5" fill={C.orange} />
      <rect x="31" y="6" width="3" height="6" rx="1.5" fill={C.orange} />
      <path d="M14 26 L17 29 L22 23" stroke={C.green} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M26 26 L29 29 L34 23" stroke={C.green} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 34 L17 37 L22 31" stroke={C.green} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="27" y="33" width="8" height="3" rx="1.5" fill={C.beige} />
    </SpotSvg>
  ),

  library: ({ className }) => (
    <SpotSvg className={className}>
      <path d="M10 36 L24 30 L38 36 L24 42 Z" fill={C.beige} />
      <path d="M10 36 L24 12 L24 30 L10 36 Z" fill={C.blue} opacity="0.7" />
      <path d="M38 36 L24 12 L24 30 L38 36 Z" fill={C.blue} opacity="0.5" />
      <line x1="16" y1="22" x2="16" y2="28" stroke={C.cream} strokeWidth="1" opacity="0.5" />
      <line x1="20" y1="18" x2="20" y2="26" stroke={C.cream} strokeWidth="1" opacity="0.5" />
    </SpotSvg>
  ),

  sos: ({ className }) => (
    <SpotSvg className={className}>
      <path
        d="M24 38 C14 30 6 24 6 17 C6 11 11 6 17 6 C20 6 22.5 7.5 24 10 C25.5 7.5 28 6 31 6 C37 6 42 11 42 17 C42 24 34 30 24 38 Z"
        fill={C.pink}
      />
      <path d="M14 22 L19 22 L21 18 L24 26 L27 20 L29 22 L34 22" stroke={C.orange} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </SpotSvg>
  ),

  profile: ({ className }) => (
    <SpotSvg className={className}>
      <circle cx="20" cy="18" r="8" fill={C.orange} opacity="0.7" />
      <ellipse cx="20" cy="38" rx="12" ry="8" fill={C.orange} opacity="0.4" />
      <circle cx="32" cy="22" r="5" fill={C.peach} />
      <ellipse cx="32" cy="36" rx="8" ry="6" fill={C.peach} opacity="0.6" />
    </SpotSvg>
  ),

  "plan-reveal": ({ className }) => (
    <SpotSvg className={className}>
      <rect x="12" y="16" width="24" height="24" rx="4" fill={C.peach} />
      <rect x="12" y="16" width="24" height="6" rx="3" fill={C.orange} opacity="0.6" />
      <rect x="22" y="16" width="4" height="24" rx="2" fill={C.orange} opacity="0.4" />
      <polygon points="24,4 26,12 34,12 28,17 30,25 24,20 18,25 20,17 14,12 22,12" fill={C.yellow} />
    </SpotSvg>
  ),

  routine: ({ className }) => (
    <SpotSvg className={className}>
      <circle cx="24" cy="24" r="16" fill={C.beige} />
      <circle cx="24" cy="24" r="16" stroke={C.green} strokeWidth="2.5" fill="none" opacity="0.6" />
      <line x1="24" y1="24" x2="24" y2="14" stroke={C.green} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="24" y1="24" x2="32" y2="24" stroke={C.orange} strokeWidth="2" strokeLinecap="round" />
      <circle cx="24" cy="24" r="2" fill={C.orange} />
      <path d="M36 8 Q42 14 38 22" stroke={C.green} strokeWidth="2" fill="none" strokeLinecap="round" />
      <polygon points="38,22 40,16 34,18" fill={C.green} />
    </SpotSvg>
  ),

  activity: ({ className }) => (
    <SpotSvg className={className}>
      <polygon
        points="24,4 28,16 42,16 31,24 35,38 24,30 13,38 17,24 6,16 20,16"
        fill={C.yellow}
      />
      <polygon
        points="24,10 27,18 36,18 29,23 31,32 24,27 17,32 19,23 12,18 21,18"
        fill={C.orange}
        opacity="0.3"
      />
    </SpotSvg>
  ),

  progress: ({ className }) => (
    <SpotSvg className={className}>
      <rect x="16" y="36" width="16" height="6" rx="3" fill={C.beige} />
      <rect x="20" y="30" width="8" height="10" rx="2" fill={C.green} opacity="0.4" />
      <line x1="24" y1="12" x2="24" y2="30" stroke={C.green} strokeWidth="2.5" strokeLinecap="round" />
      <ellipse cx="17" cy="20" rx="6" ry="4" fill={C.green} opacity="0.6" transform="rotate(-30 17 20)" />
      <ellipse cx="31" cy="16" rx="6" ry="4" fill={C.green} opacity="0.5" transform="rotate(25 31 16)" />
      <ellipse cx="18" cy="28" rx="5" ry="3.5" fill={C.green} opacity="0.45" transform="rotate(-20 18 28)" />
      <circle cx="24" cy="10" r="3" fill={C.yellow} opacity="0.7" />
    </SpotSvg>
  ),

  insight: ({ className }) => (
    <SpotSvg className={className}>
      <path
        d="M24 6 C16 6 10 12 10 20 C10 26 14 30 18 32 L18 36 L30 36 L30 32 C34 30 38 26 38 20 C38 12 32 6 24 6 Z"
        fill={C.yellow}
      />
      <rect x="18" y="37" width="12" height="3" rx="1.5" fill={C.orange} opacity="0.5" />
      <rect x="20" y="41" width="8" height="2" rx="1" fill={C.orange} opacity="0.4" />
      <line x1="24" y1="16" x2="24" y2="26" stroke={C.cream} strokeWidth="2" strokeLinecap="round" />
      <line x1="19" y1="21" x2="29" y2="21" stroke={C.cream} strokeWidth="2" strokeLinecap="round" />
    </SpotSvg>
  ),

  chat: ({ className }) => (
    <SpotSvg className={className}>
      <rect x="6" y="6" width="36" height="28" rx="10" fill={C.blue} opacity="0.6" />
      <polygon points="16,34 12,42 24,34" fill={C.blue} opacity="0.6" />
      <path
        d="M24 16 C21 16 18 18.5 18 21.5 C18 24 20 26 23 26.5 L22 29 L25 27 C28 26.5 30 24 30 21.5 C30 18.5 27 16 24 16 Z"
        fill={C.pink}
        opacity="0.8"
      />
    </SpotSvg>
  ),
};

export function SpotIcon({
  type,
  className,
}: {
  type: string;
  className?: string;
}) {
  const Icon = spotIcons[type];
  if (!Icon) {
    return (
      <SpotSvg className={className}>
        <circle cx="24" cy="24" r="18" fill={C.beige} />
        <circle cx="24" cy="24" r="4" fill={C.orange} opacity="0.5" />
      </SpotSvg>
    );
  }
  return <Icon className={className} />;
}

// ── Profile illustrations (64x64) ───────────────────────────────────

function ProfileSvg({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width="64"
      height="64"
      className={className}
    >
      {children}
    </svg>
  );
}

const profileIcons: Record<string, React.FC<{ className?: string }>> = {
  "connection-seeker": ({ className }) => (
    <ProfileSvg className={className}>
      <circle cx="32" cy="32" r="30" fill={C.cream} />
      <circle cx="24" cy="28" r="14" fill={C.pink} opacity="0.6" />
      <circle cx="38" cy="28" r="14" fill={C.peach} opacity="0.6" />
      <path
        d="M31 40 C27 34 22 32 22 27 C22 23 26 20 30 22 C31 22.5 31.5 23 32 24 C32.5 23 33 22.5 34 22 C38 20 42 23 42 27 C42 32 37 34 33 40 L32 42 Z"
        fill={C.orange}
        opacity="0.7"
      />
    </ProfileSvg>
  ),

  "big-feelings-explorer": ({ className }) => (
    <ProfileSvg className={className}>
      <circle cx="32" cy="32" r="30" fill={C.cream} />
      <path
        d="M32 14 C24 14 18 20 18 28 C18 34 24 40 32 48 C40 40 46 34 46 28 C46 20 40 14 32 14 Z"
        fill={C.pink}
      />
      {/* waves inside heart */}
      <path d="M22 28 Q27 24 32 28 Q37 32 42 28" stroke={C.cream} strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M24 34 Q29 30 34 34 Q39 38 42 34" stroke={C.cream} strokeWidth="1.5" fill="none" opacity="0.6" strokeLinecap="round" />
    </ProfileSvg>
  ),

  "curious-builder": ({ className }) => (
    <ProfileSvg className={className}>
      <circle cx="32" cy="32" r="30" fill={C.cream} />
      <rect x="20" y="38" width="24" height="12" rx="3" fill={C.blue} opacity="0.6" />
      <rect x="23" y="28" width="18" height="10" rx="3" fill={C.green} opacity="0.5" />
      <rect x="26" y="18" width="12" height="10" rx="3" fill={C.yellow} opacity="0.7" />
      <rect x="29" y="12" width="6" height="6" rx="2" fill={C.orange} opacity="0.7" />
    </ProfileSvg>
  ),

  "story-seeker": ({ className }) => (
    <ProfileSvg className={className}>
      <circle cx="32" cy="32" r="30" fill={C.cream} />
      <path d="M14 44 L32 20 L32 38 L14 44 Z" fill={C.blue} opacity="0.6" />
      <path d="M50 44 L32 20 L32 38 L50 44 Z" fill={C.blue} opacity="0.45" />
      <path d="M14 44 L32 38 L50 44 L32 48 Z" fill={C.beige} />
      {/* sparkle */}
      <polygon points="44,16 45.5,20 50,20 46.5,23 48,27 44,24 40,27 41.5,23 38,20 42.5,20" fill={C.yellow} />
    </ProfileSvg>
  ),

  "routine-lover": ({ className }) => (
    <ProfileSvg className={className}>
      <circle cx="32" cy="32" r="30" fill={C.cream} />
      <circle cx="32" cy="30" r="18" fill={C.beige} />
      <circle cx="32" cy="30" r="18" stroke={C.green} strokeWidth="2.5" fill="none" opacity="0.6" />
      <line x1="32" y1="30" x2="32" y2="20" stroke={C.green} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="32" y1="30" x2="40" y2="30" stroke={C.orange} strokeWidth="2" strokeLinecap="round" />
      <circle cx="32" cy="30" r="2" fill={C.orange} />
      {/* heart */}
      <path
        d="M32 50 C29 46 24 44 24 41 C24 39 26 37 28 38 C30 39 31 40 32 41 C33 40 34 39 36 38 C38 37 40 39 40 41 C40 44 35 46 32 50 Z"
        fill={C.pink}
        opacity="0.7"
      />
    </ProfileSvg>
  ),

  "fast-bored-sprinter": ({ className }) => (
    <ProfileSvg className={className}>
      <circle cx="32" cy="32" r="30" fill={C.cream} />
      {/* circle */}
      <circle cx="32" cy="32" r="16" fill={C.yellow} opacity="0.4" />
      {/* lightning bolt */}
      <polygon points="34,10 22,34 30,34 28,54 42,28 34,28" fill={C.orange} opacity="0.85" />
    </ProfileSvg>
  ),
};

export function ProfileIllustration({
  profile,
  className,
}: {
  profile: string;
  className?: string;
}) {
  const Icon = profileIcons[profile];
  if (!Icon) {
    return (
      <ProfileSvg className={className}>
        <circle cx="32" cy="32" r="28" fill={C.beige} />
        <circle cx="32" cy="32" r="8" fill={C.peach} opacity="0.6" />
      </ProfileSvg>
    );
  }
  return <Icon className={className} />;
}
