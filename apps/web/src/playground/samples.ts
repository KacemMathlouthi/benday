export interface Sample {
  id: string;
  label: string;
  /** What this sample is here to stress. */
  note: string;
  src: string;
}

const encode = (svg: string) =>
  `data:image/svg+xml,${encodeURIComponent(svg.replaceAll(/\s+/gu, " ").trim())}`;

const wrap = (viewBox: string, body: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">${body}</svg>`;

/** Twelve hairline spokes inside a hairline ring: the legibility torture test. */
function burst(): string {
  let d = "";
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
    const x1 = 50 + Math.cos(a) * 12;
    const y1 = 50 + Math.sin(a) * 12;
    const x2 = 50 + Math.cos(a) * 45;
    const y2 = 50 + Math.sin(a) * 45;
    d += `M${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}`;
  }
  return encode(
    wrap(
      "0 0 100 100",
      `<g fill="none" stroke="#111" stroke-width="1.4" stroke-linecap="round">
        <circle cx="50" cy="50" r="46"/><path d="${d}"/>
      </g>`
    )
  );
}

export const SAMPLES: Sample[] = [
  {
    id: "diamond",
    label: "Diamond",
    note: "Solid geometric mark, the easy case.",
    src: encode(
      wrap("0 0 100 100", '<path d="M50 2 98 50 50 98 2 50Z" fill="#111"/>')
    ),
  },
  {
    id: "bolt",
    label: "Bolt",
    note: "Angular silhouette with a thin waist.",
    src: encode(
      wrap(
        "0 0 100 100",
        '<path d="M60 2 18 58h26l-6 40 44-56H56z" fill="#111"/>'
      )
    ),
  },
  {
    id: "ring",
    label: "Ring",
    note: "Hollow shape: depth peaks in the stroke, not the middle.",
    src: encode(
      wrap(
        "0 0 100 100",
        '<circle cx="50" cy="50" r="38" fill="none" stroke="#111" stroke-width="14"/>'
      )
    ),
  },
  {
    id: "burst",
    label: "Hairline burst",
    note: "Sub-pixel strokes. Without dilate this turns to mush.",
    src: burst(),
  },
  {
    id: "wordmark",
    label: "Wordmark",
    note: "Wide aspect + thin letterforms. Try fit: natural.",
    src: encode(
      wrap(
        "0 0 220 70",
        '<text x="110" y="50" text-anchor="middle" font-family="Georgia, serif" font-size="44" letter-spacing="1" fill="#111">think</text>'
      )
    ),
  },
  {
    id: "opaque",
    label: "Opaque tile",
    note: "No alpha channel at all, so it forces the luminance mask.",
    src: encode(
      wrap(
        "0 0 100 100",
        `<rect width="100" height="100" fill="#f2efe8"/>
         <path d="M50 16 84 78H16Z" fill="#141414"/>
         <circle cx="50" cy="58" r="9" fill="#f2efe8"/>`
      )
    ),
  },
  {
    id: "soft",
    label: "Soft blob",
    note: "Gradient edges: the threshold slider decides where the mark ends.",
    src: encode(
      wrap(
        "0 0 100 100",
        `<defs><radialGradient id="g"><stop offset="0.25" stop-color="#111" stop-opacity="1"/>
         <stop offset="1" stop-color="#111" stop-opacity="0"/></radialGradient></defs>
         <ellipse cx="50" cy="50" rx="46" ry="40" fill="url(#g)"/>`
      )
    ),
  },
];
