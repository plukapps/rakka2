import Image from "next/image"
import { caravanaParts } from "@/lib/utils"

type TagSize = "sm" | "md" | "lg" | "xl"

const FONT = "'Bebas Kai', sans-serif"

const CONFIG: Record<TagSize, {
  w: number
  h: number
  pt: number
  serieFs: string
  numFs: string
  src: string
}> = {
  sm:  { w: 48,  h: 56,  pt: 16, serieFs: "7pt",  numFs: "13pt", src: "/tag-bg_sm.png" },
  md:  { w: 72,  h: 84,  pt: 24, serieFs: "10pt", numFs: "20pt", src: "/tag-bg_md.png" },
  lg:  { w: 110, h: 128, pt: 36, serieFs: "14pt", numFs: "28pt", src: "/tag-bg_lg.png" },
  xl:  { w: 160, h: 144, pt: 46, serieFs: "18pt", numFs: "38pt", src: "/tag-bg.png" },
}

export function TagView({
  caravana,
  size = "md",
}: {
  caravana: string
  size?: TagSize
}) {
  const { serie, num } = caravanaParts(caravana)
  const { w, h, pt, serieFs, numFs, src } = CONFIG[size]

  return (
    <div
      className="relative flex items-center justify-center shrink-0"
      style={{ width: w, height: h }}
      aria-label={`Caravana ${serie} ${num}`}
    >
      <Image
        src={src}
        alt=""
        fill
        className="object-contain pointer-events-none"
      />
      <div
        className="relative z-10 flex flex-col items-center text-center"
        style={{ paddingTop: pt }}
      >
        <span
          className="text-muted-foreground tracking-widest"
          style={{ fontFamily: FONT, fontSize: serieFs, lineHeight: 0.8 }}
        >
          {serie}
        </span>
        <span
          className="text-foreground tracking-wider"
          style={{ fontFamily: FONT, fontSize: numFs, lineHeight: 0.8 }}
        >
          {num}
        </span>
      </div>
    </div>
  )
}
