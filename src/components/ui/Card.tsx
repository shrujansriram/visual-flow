import { ReactNode } from 'react'
import { motion } from 'framer-motion'

export interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
}

export function Card({ children, className = '', hover = true }: CardProps) {
  return (
    <motion.div
      className={`neon-card p-6 ${hover ? 'hover:shadow-neon-blue' : ''} transition-smooth ${className}`}
      whileHover={hover ? { y: -5 } : {}}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  )
}
