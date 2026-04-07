import type React from "react"
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
  serieStyle?: React.CSSProperties
  numStyle?: React.CSSProperties
}> = {
  sm:  { w: 48,  h: 56,  pt: 18, serieFs: "7pt",  numFs: "14pt", src: "/tag-bg_sm.png", serieStyle: { marginBottom: 2 }, numStyle: { paddingLeft: 1 } },
  md:  { w: 72,  h: 84,  pt: 28, serieFs: "10pt", numFs: "20pt", src: "/tag-bg_md.png", serieStyle: { marginBottom: 3 }, numStyle: { paddingLeft: 2 } },
  lg:  { w: 110, h: 128, pt: 46, serieFs: "15pt", numFs: "32pt", src: "/tag-bg_lg.png", serieStyle: { marginBottom: 4 }, numStyle: { paddingLeft: 3 } },
  xl:  { w: 160, h: 144, pt: 60, serieFs: "20pt", numFs: "40pt", src: "/tag-bg.png", serieStyle: { marginBottom: 4 }, numStyle: { paddingLeft: 4 } },
}

export function TagView({
  caravana,
  size = "md",
}: {
  caravana: string
  size?: TagSize
}) {
  const { serie, num } = caravanaParts(caravana)
  const { w, h, pt, serieFs, numFs, src, serieStyle, numStyle } = CONFIG[size]

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
          style={{ fontFamily: FONT, fontSize: serieFs, lineHeight: 0.8, ...serieStyle }}
        >
          {serie}
        </span>
        <span
          className="text-foreground tracking-wider"
          style={{ fontFamily: FONT, fontSize: numFs, lineHeight: 0.8, ...numStyle }}
        >
          {num}
        </span>
      </div>
    </div>
  )
}
