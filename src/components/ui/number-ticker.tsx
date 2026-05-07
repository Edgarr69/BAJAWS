"use client"

import { useEffect, useRef, type ComponentPropsWithoutRef } from "react"
import { cn } from "@/lib/utils"

interface NumberTickerProps extends ComponentPropsWithoutRef<"span"> {
  value: number
  startValue?: number
  direction?: "up" | "down"
  delay?: number
  decimalPlaces?: number
  onComplete?: () => void
}

export function NumberTicker({
  value,
  startValue = 0,
  direction = "up",
  delay = 0,
  className,
  decimalPlaces = 0,
  onComplete,
  ...props
}: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const raf = useRef<number | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const from = direction === "down" ? value : startValue
  const to   = direction === "down" ? startValue : value

  const fmt = (n: number) =>
    Intl.NumberFormat("en-US", {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
    }).format(Number(n.toFixed(decimalPlaces)))

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()

        timer.current = setTimeout(() => {
          const duration = 1400
          const start = performance.now()

          const tick = (now: number) => {
            const elapsed = now - start
            const t = Math.min(elapsed / duration, 1)
            // ease-out cubic
            const ease = 1 - Math.pow(1 - t, 3)
            const current = from + (to - from) * ease
            if (el) el.textContent = fmt(current)
            if (t < 1) {
              raf.current = requestAnimationFrame(tick)
            } else {
              if (el) el.textContent = fmt(to)
              onComplete?.()
            }
          }

          raf.current = requestAnimationFrame(tick)
        }, delay * 1000)
      },
      { rootMargin: "0px" }
    )

    observer.observe(el)

    return () => {
      observer.disconnect()
      if (timer.current !== null) clearTimeout(timer.current)
      if (raf.current !== null) cancelAnimationFrame(raf.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <span
      ref={ref}
      className={cn(
        "inline-block tracking-wider text-black tabular-nums dark:text-white",
        className
      )}
      {...props}
    >
      {fmt(from)}
    </span>
  )
}
