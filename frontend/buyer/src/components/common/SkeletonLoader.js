import React from 'react';
import { motion } from 'framer-motion';

const SkeletonLoader = ({ 
  variant = 'default',
  count = 1,
  className = ""
}) => {
  const skeletonVariants = {
    default: "h-4 bg-gray-200 rounded",
    card: "h-32 bg-gray-200 rounded-lg",
    avatar: "h-10 w-10 bg-gray-200 rounded-full",
    button: "h-10 w-24 bg-gray-200 rounded-md",
    table: "h-12 bg-gray-200 rounded",
    text: "h-4 bg-gray-200 rounded",
    title: "h-6 bg-gray-200 rounded"
  };

  const skeletonClass = skeletonVariants[variant] || skeletonVariants.default;

  const SkeletonItem = ({ index }) => (
    <motion.div
      key={index}
      className={`${skeletonClass} ${className}`}
      animate={{
        opacity: [0.5, 1, 0.5],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
        delay: index * 0.1
      }}
    />
  );

  if (variant === 'card') {
    return (
      <div className="space-y-4">
        {Array.from({ length: count }, (_, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
            <SkeletonItem index={index} />
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className="space-y-2">
        {Array.from({ length: count }, (_, index) => (
          <div key={index} className="flex space-x-4">
            <div className="h-12 bg-gray-200 rounded flex-1"></div>
            <div className="h-12 bg-gray-200 rounded w-24"></div>
            <div className="h-12 bg-gray-200 rounded w-20"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {Array.from({ length: count }, (_, index) => (
        <SkeletonItem key={index} index={index} />
      ))}
    </div>
  );
};

export default SkeletonLoader;
