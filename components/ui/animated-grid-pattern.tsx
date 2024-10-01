"use client";

import { useEffect, useId, useRef, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GridPatternProps {
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  strokeDasharray?: any;
  numSquares?: number;
  className?: string;
  maxOpacity?: number;
  duration?: number;
  repeatDelay?: number;
  containerClassName?: string;
}

export function GridPattern({
  width = 40,
  height = 40,
  x = -1,
  y = -1,
  strokeDasharray = 0,
  numSquares = 200,
  className,
  maxOpacity = 0.5,
  duration = 1,
  repeatDelay = 0.5,
  containerClassName,
  ...props
}: GridPatternProps) {
  const id = useId();
  const containerRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const squares = useMemo(() => {
    const cols = Math.ceil(dimensions.width / width);
    const rows = Math.ceil(dimensions.height / height);
    const totalSquares = cols * rows;
    const indices = Array.from({ length: totalSquares }, (_, i) => i);
    
    // Ensure even distribution across all rows
    const selectedIndices = [];
    for (let i = 0; i < rows; i++) {
      const rowIndices = indices.filter(index => Math.floor(index / cols) === i);
      const shuffled = rowIndices.sort(() => Math.random() - 0.5);
      selectedIndices.push(...shuffled.slice(0, Math.ceil(numSquares / rows)));
    }
    
    return selectedIndices.slice(0, numSquares).map(index => ({
      id: index,
      x: (index % cols) * width,
      y: Math.floor(index / cols) * height,
    }));
  }, [dimensions, width, height, numSquares]);

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div className={cn("absolute inset-0 -z-10", containerClassName)}>
      <svg
        ref={containerRef}
        aria-hidden="true"
        className={cn(
          "h-full w-full fill-gray-400/30 stroke-gray-400/30",
          className
        )}
        {...props}
      >
        <defs>
          <pattern
            id={id}
            width={width}
            height={height}
            patternUnits="userSpaceOnUse"
            x={x}
            y={y}
          >
            <path
              d={`M.5 ${height}V.5H${width}`}
              fill="none"
              strokeDasharray={strokeDasharray}
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${id})`} />
        <svg x={x} y={y} className="overflow-visible">
          {squares.map(({ id, x, y }) => (
            <motion.rect
              key={id}
              initial={{ opacity: 0 }}
              animate={{ opacity: maxOpacity }}
              transition={{
                duration,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
                delay: Math.random() * 5,
              }}
              width={width - 1}
              height={height - 1}
              x={x + 1}
              y={y + 1}
              fill="currentColor"
              strokeWidth="0"
            />
          ))}
        </svg>
      </svg>
    </div>
  );
}

export default GridPattern;
