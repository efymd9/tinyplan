import Image from "next/image";

interface BrandLogoProps {
  width?: number;
  priority?: boolean;
  className?: string;
}

export function BrandLogo({ width = 130, priority = false, className }: BrandLogoProps) {
  const height = Math.round(width * (396 / 1370));
  return (
    <Image
      src="/images/tinyplan-logo.png"
      alt="TinyPlan"
      width={width}
      height={height}
      priority={priority}
      className={className}
    />
  );
}
