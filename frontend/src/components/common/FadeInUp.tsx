import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface FadeInUpProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  yDistance?: number;
  className?: string;
  staggerChildren?: number;
  once?: boolean;
}

export const FadeInUp: React.FC<FadeInUpProps> = ({
  children,
  delay = 0,
  duration = 0.6,
  yDistance = 30,
  className = '',
  once = true,
  ...props
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: yDistance }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: '-50px' }}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1.0], // smooth cubic-bezier curve
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const FadeInStaggerContainer: React.FC<{
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}> = ({ children, className = '', staggerDelay = 0.15 }) => {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const FadeInChild: React.FC<{
  children: React.ReactNode;
  className?: string;
  yDistance?: number;
}> = ({ children, className = '', yDistance = 25 }) => {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: yDistance },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.55,
            ease: [0.25, 0.1, 0.25, 1.0],
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
