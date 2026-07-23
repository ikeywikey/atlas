"use client"

import * as React from "react"
import { Progress as ProgressPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

/**
 * A determinate progress/meter bar.
 *
 * Radix rather than a bare <div> so the bar carries role="progressbar" plus
 * aria-valuenow/min/max — the bar is a *supplement* to a visible label and
 * value, never the only way to read the number.
 *
 * Deliberately theme-neutral: the indicator defaults to `bg-primary` and the
 * call site recolours it with the Tailwind v4 child variant, e.g.
 * `*:data-[slot=progress-indicator]:bg-positive`. Same choice as select.tsx —
 * primitives stay generic, feature components bring the palette.
 */
function Progress({
  className,
  value,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "relative h-1.5 w-full overflow-hidden rounded-full bg-muted",
        className
      )}
      value={value}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="h-full w-full flex-1 rounded-full bg-primary transition-transform duration-500 ease-out"
        // Radix renders a full-width indicator and expects it to be slid out of
        // frame — translating is GPU-cheap and avoids animating `width`, which
        // would trigger layout on every frame.
        style={{ transform: `translateX(-${100 - (value ?? 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }
