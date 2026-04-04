import { caravanaParts } from "@/lib/utils"

type TagSize = "lg" | "md" | "sm"

const SIZES: Record<TagSize, { w: number; h: number }> = {
  lg: { w: 96, h: 120 },
  md: { w: 64, h: 80 },
  sm: { w: 40, h: 50 },
}

const TAG_FILL = "#F4E04D"
const TEXT_SERIE = "#6B6330"
const TEXT_NUM = "#2D2810"

export function CaravanaTag({
  caravana,
  size = "md",
}: {
  caravana: string
  size?: TagSize
}) {
  const { serie, num } = caravanaParts(caravana)
  const { w, h } = SIZES[size]

  return (
    <svg
      viewBox="0 0 100 128"
      width={w}
      height={h}
      className="shrink-0"
      aria-label={`Caravana ${serie} ${num}`}
    >
      {/* Ear loop */}
      <circle cx="50" cy="10" r="9" fill={TAG_FILL} />
      <circle cx="50" cy="10" r="4" fill="transparent" />

      {/* Tag body — trapezoid wider at bottom */}
      <path
        d="M24,18 C38,14 62,14 76,18 L94,104 C96,116 92,122 82,122 L18,122 C8,122 4,116 6,104 Z"
        fill={TAG_FILL}
      />

      {/* Serie (top, smaller) */}
      <text
        x="50"
        y="58"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="16"
        fontWeight="600"
        fill={TEXT_SERIE}
        fontFamily="'Bebas Kai', 'DM Sans', sans-serif"
      >
        {serie}
      </text>

      {/* Num (bottom, large bold) */}
      <text
        x="50"
        y="96"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="30"
        fontWeight="800"
        fill={TEXT_NUM}
        fontFamily="'Bebas Kai', 'DM Sans', sans-serif"
      >
        {num}
      </text>
    </svg>
  )
}
