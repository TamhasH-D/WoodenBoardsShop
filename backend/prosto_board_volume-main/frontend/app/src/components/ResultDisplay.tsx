import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AnalysisResponse, WoodenBoard, Point } from '../types';

interface ResultDisplayProps {
  imageUrl: string;
  result: AnalysisResponse | null;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ imageUrl, result }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredBoard, setHoveredBoard] = useState<WoodenBoard | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{ x: number, y: number } | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<'top' | 'bottom'>('bottom');
  const [tooltipAlign, setTooltipAlign] = useState<'left' | 'right' | 'center'>('center');

  // Calculate distance between point and line segment
  const distToSegment = (p: Point, v: Point, w: Point) => {
    const l2 = Math.pow(w.x - v.x, 2) + Math.pow(w.y - v.y, 2);
    if (l2 === 0) return Math.sqrt(Math.pow(p.x - v.x, 2) + Math.pow(p.y - v.y, 2));
    
    let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    t = Math.max(0, Math.min(1, t));
    
    const projX = v.x + t * (w.x - v.x);
    const projY = v.y + t * (w.y - v.y);
    
    return Math.sqrt(Math.pow(p.x - projX, 2) + Math.pow(p.y - projY, 2));
  };

  // Check if point is near any edge of the polygon
  const isNearPolygonEdge = (point: Point, vertices: Point[], threshold: number) => {
    for (let i = 0; i < vertices.length; i++) {
      const v1 = vertices[i];
      const v2 = vertices[(i + 1) % vertices.length];
      if (distToSegment(point, v1, v2) <= threshold) {
        return true;
      }
    }
    return false;
  };

  // Convert meters to centimeters for display
  const mToCm = (meters: number) => meters * 100;

  useEffect(() => {
    if (!result || !imageUrl || !canvasRef.current) return;

    const image = new Image();
    image.src = imageUrl;
    
    image.onload = () => {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext('2d')!;
      
      canvas.width = image.width;
      canvas.height = image.height;
      
      const drawScene = (highlightedBoard: WoodenBoard | null = null) => {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw the original image
        ctx.drawImage(image, 0, 0);
        
        // Add semi-transparent overlay if a board is highlighted
        if (highlightedBoard) {
          // Draw dark overlay
          ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Clear the highlighted board area
          ctx.save();
          const { points } = highlightedBoard.detection;
          ctx.beginPath();
          ctx.moveTo(points[0].x, points[0].y);
          points.forEach((point, i) => {
            const nextPoint = points[(i + 1) % points.length];
            ctx.lineTo(nextPoint.x, nextPoint.y);
          });
          ctx.closePath();
          ctx.clip();
          ctx.drawImage(image, 0, 0);
          ctx.restore();
        }
        
        // Draw all board outlines
        result.wooden_boards.forEach(board => {
          const { points } = board.detection;
          const isHighlighted = board === highlightedBoard;
          
          ctx.strokeStyle = isHighlighted ? '#00ff00' : '#ffffff';
          ctx.lineWidth = isHighlighted ? 4 : 2;
          ctx.beginPath();
          ctx.moveTo(points[0].x, points[0].y);
          points.forEach((point, i) => {
            const nextPoint = points[(i + 1) % points.length];
            ctx.lineTo(nextPoint.x, nextPoint.y);
          });
          ctx.closePath();
          ctx.stroke();
        });
      };
      
      // Initial draw
      drawScene();
      
      // Update drawScene when hoveredBoard changes
      if (hoveredBoard) {
        drawScene(hoveredBoard);
      }
    };
  }, [imageUrl, result, hoveredBoard]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!result || !canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    const rect = canvas.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    const point = { x, y };

    // Find board under cursor
    const board = result.wooden_boards.find(board => {
      const { points } = board.detection;
      
      if (isNearPolygonEdge(point, points, 10)) {
        return true;
      }
      
      let inside = false;
      for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
        const xi = points[i].x, yi = points[i].y;
        const xj = points[j].x, yj = points[j].y;
        
        const intersect = ((yi > y) !== (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
      }
      
      return inside;
    });

    if (board !== hoveredBoard) {
      if (board) {
        const mouseY = e.clientY - containerRect.top;
        const mouseX = e.clientX - containerRect.left;
        
        setTooltipPosition(mouseY > containerRect.height / 2 ? 'top' : 'bottom');
        
        if (mouseX < containerRect.width * 0.3) {
          setTooltipAlign('left');
        } else if (mouseX > containerRect.width * 0.7) {
          setTooltipAlign('right');
        } else {
          setTooltipAlign('center');
        }
        
        setHoveredBoard(board);
        setHoverPosition({ x: e.clientX - containerRect.left, y: e.clientY - containerRect.top });
      } else {
        setHoveredBoard(null);
        setHoverPosition(null);
      }
    } else if (board && hoverPosition) {
      setHoverPosition({ x: e.clientX - containerRect.left, y: e.clientY - containerRect.top });
    }
  };

  const handleMouseLeave = () => {
    setHoveredBoard(null);
    setHoverPosition(null);
  };

  if (!result) return null;

  const getTooltipStyle = () => {
    if (!hoverPosition) return {};
    
    const style: React.CSSProperties = {
      position: 'absolute',
      zIndex: 10,
      pointerEvents: 'none',
    };

    if (tooltipPosition === 'top') {
      style.top = hoverPosition.y - 16;
      style.transform = 'translateY(-100%)';
    } else {
      style.top = hoverPosition.y + 16;
    }

    if (tooltipAlign === 'left') {
      style.left = 16;
    } else if (tooltipAlign === 'right') {
      style.right = 16;
    } else {
      style.left = hoverPosition.x;
      style.transform = `${style.transform || ''} translateX(-50%)`;
    }

    return style;
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="relative" ref={containerRef}>
        <canvas
          ref={canvasRef}
          className="w-full h-auto rounded-lg shadow-lg cursor-pointer"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        />
        <AnimatePresence>
          {hoveredBoard && hoverPosition && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 30,
                duration: 0.2
              }}
              className="absolute bg-white/95 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-gray-100"
              style={getTooltipStyle()}
            >
              <div className="space-y-4 min-w-[280px]">
                <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                  <div>
                    <p className="text-sm font-medium text-indigo-600">Volume</p>
                    <p className="text-lg font-semibold">{hoveredBoard.volume.toFixed(4)} m³</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-indigo-600">Width</p>
                    <p className="text-lg font-semibold">{mToCm(hoveredBoard.width).toFixed(1)} cm</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-indigo-600">Height</p>
                    <p className="text-lg font-semibold">{mToCm(hoveredBoard.height).toFixed(1)} cm</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-indigo-600">Length</p>
                    <p className="text-lg font-semibold">{mToCm(hoveredBoard.length).toFixed(1)} cm</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-sm font-medium text-indigo-600">Confidence</p>
                  <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${hoveredBoard.detection.confidence * 100}%` }}
                    />
                  </div>
                  <p className="text-right text-sm text-gray-600 mt-1">
                    {(hoveredBoard.detection.confidence * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-xl shadow-lg border border-gray-200"
      >
        <h3 className="text-lg font-semibold mb-6 text-gray-800 border-b pb-3">Analysis Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-indigo-50 p-4 rounded-lg shadow-sm">
            <p className="text-indigo-700 font-medium mb-1">Total Volume</p>
            <div className="flex items-baseline">
              <p className="text-2xl font-bold text-indigo-900">{result.total_volume.toFixed(4)}</p>
              <p className="ml-1 text-indigo-700">m³</p>
            </div>
          </div>
          <div className="bg-indigo-50 p-4 rounded-lg shadow-sm">
            <p className="text-indigo-700 font-medium mb-1">Total Boards</p>
            <p className="text-2xl font-bold text-indigo-900">{result.total_count}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
