import React from 'react';
import { cn } from '../../utils/cn';
import { motion } from 'framer-motion';

export const Button = React.forwardRef(({ className, variant = 'primary', size = 'default', children, ...props }, ref) => {
  const baseStyles = "inline-flex items-center justify-center rounded-full font-medium transition-all duration-300 focus-visible:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:pointer-events-none disabled:opacity-50";
  
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 hover:scale-105 hover:shadow-[0_8px_30px_rgb(37,99,235,0.3)]",
    secondary: "bg-white border border-gray-200 text-slate-900 hover:bg-slate-50 hover:scale-105 hover:shadow-lg transition-all duration-300",
    outline: "border border-gray-200 bg-transparent hover:bg-slate-50 text-slate-900 hover:scale-105 hover:shadow-md transition-all duration-300",
    ghost: "hover:bg-slate-100 text-slate-700 hover:scale-105 transition-all duration-300",
  };

  const sizes = {
    default: "h-10 px-5 py-2",
    sm: "h-9 px-4 text-sm",
    lg: "h-12 px-8 text-lg",
    icon: "h-10 w-10",
  };

  return (
    <motion.button
      ref={ref}
      whileTap={{ scale: 0.98 }}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </motion.button>
  );
});
Button.displayName = "Button";
