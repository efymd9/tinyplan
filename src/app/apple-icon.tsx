import { ImageResponse } from "next/og";

// Apple touch icons are shown on a rounded home-screen tile and must be opaque
// (no alpha). Generated via ImageResponse so the coral background is baked in.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          // Brand coral (palette: --primary)
          background: "#EF815B",
        }}
      >
        <svg
          width="118"
          height="118"
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M30 14a3 3 0 0 1 6 0v6h6a3 3 0 0 1 0 6h-6v15a4 4 0 0 0 4 4h2a3 3 0 0 1 0 6h-2a10 10 0 0 1-10-10V26h-4a3 3 0 0 1 0-6h4v-6Z"
            fill="#FFFFFF"
          />
          <circle cx="46.5" cy="44.5" r="4.5" fill="#FFF7DF" />
          <circle cx="46.5" cy="44.5" r="2.2" fill="#D8B542" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
