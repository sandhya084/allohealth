"use client"
import React, { useEffect, useState } from 'react'
import type { HTMLAttributes, ReactNode } from 'react'
import type { MotionProps } from 'framer-motion'

export default function MotionDiv({ children, whileHover, className, ...props }: MotionProps & HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  const [Motion, setMotion] = useState<any>(null)

  useEffect(() => {
    let active = true
    import('framer-motion')
      .then((mod) => {
        if (active) setMotion(() => mod.motion)
      })
      .catch(() => {
        // fallback to plain div if framer-motion fails to load
      })
    return () => {
      active = false
    }
  }, [])

  if (Motion) {
    return (
      <Motion.div whileHover={whileHover} className={className} {...props}>
        {children}
      </Motion.div>
    )
  }

  return (
    <div className={className} {...props}>
      {children}
    </div>
  )
}
