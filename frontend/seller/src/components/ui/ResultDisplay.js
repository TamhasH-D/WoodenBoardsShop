import React, { useRef, useEffect, useState } from 'react';

/**
 * Компонент отображения результатов анализа досок
 * Адаптирован из backend/prosto_board_volume-main/frontend
 */
const ResultDisplay = ({ imageUrl, result }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [hoveredBoard, setHoveredBoard] = useState(null);
  const [hoverPosition, setHoverPosition] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState('bottom');

  // const isMobile = window.innerWidth <= 768; // Removed, use Tailwind classes

  // Вычисление расстояния между точкой и отрезком линии
  const distToSegment = (p, v, w) => {
    const l2 = Math.pow(w.x - v.x, 2) + Math.pow(w.y - v.y, 2);
    if (l2 === 0) return Math.sqrt(Math.pow(p.x - v.x, 2) + Math.pow(p.y - v.y, 2));
    
    let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    t = Math.max(0, Math.min(1, t));
    
    const projX = v.x + t * (w.x - v.x);
    const projY = v.y + t * (w.y - v.y);
    
    return Math.sqrt(Math.pow(p.x - projX, 2) + Math.pow(p.y - projY, 2));
  };

  // Проверка, находится ли точка рядом с любым краем полигона
  const isNearPolygonEdge = (point, vertices, threshold) => {
    for (let i = 0; i < vertices.length; i++) {
      const v1 = vertices[i];
      const v2 = vertices[(i + 1) % vertices.length];
      if (distToSegment(point, v1, v2) <= threshold) {
        return true;
      }
    }
    return false;
  };

  // Конвертация метров в сантиметры для отображения
  const mToCm = (meters) => meters * 100;

  useEffect(() => {
    if (!result || !imageUrl || !canvasRef.current) return;

    const image = new Image();
    image.src = imageUrl;
    
    image.onload = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      canvas.width = image.width;
      canvas.height = image.height;
      
      const drawScene = (highlightedBoard = null) => {
        // Очистка canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Рисуем оригинальное изображение
        ctx.drawImage(image, 0, 0);
        
        // Добавляем полупрозрачное наложение если доска выделена
        if (highlightedBoard) {
          // Рисуем темное наложение
          ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Очищаем область выделенной доски
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
        
        // Рисуем контуры всех досок
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
      
      // Первоначальная отрисовка
      drawScene();
      
      // Обновляем drawScene когда hoveredBoard изменяется
      if (hoveredBoard) {
        drawScene(hoveredBoard);
      }
    };
  }, [imageUrl, result, hoveredBoard]);

  const handleMouseMove = (e) => {
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

    // Находим доску под курсором
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

        setTooltipPosition(mouseY > containerRect.height / 2 ? 'top' : 'bottom');
        
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
    if (!hoverPosition || !containerRef.current) return {};

    const containerRect = containerRef.current.getBoundingClientRect();
    // const isMobile = window.innerWidth <= 768; // Removed

    const style = {
      position: 'absolute',
      zIndex: 10,
      pointerEvents: 'none',
    };

    // На мобильных устройствах показываем tooltip по центру снизу
    // if (isMobile) { // Removed this block
    //   style.bottom = '16px';
    //   style.left = '50%';
    //   style.transform = 'translateX(-50%)';
    //   style.position = 'fixed';
    //   style.zIndex = 1000;
    //   return style;
    // }

    // Проверяем границы экрана для desktop
    const tooltipWidth = 280; // минимальная ширина tooltip
    const margin = 16;

    if (tooltipPosition === 'top') {
      style.top = Math.max(margin, hoverPosition.y - 16);
      style.transform = 'translateY(-100%)';
    } else {
      style.top = hoverPosition.y + 16;
    }

    // Умное позиционирование по горизонтали
    if (hoverPosition.x + tooltipWidth / 2 > containerRect.width - margin) {
      // Tooltip выходит за правую границу
      style.right = margin;
    } else if (hoverPosition.x - tooltipWidth / 2 < margin) {
      // Tooltip выходит за левую границу
      style.left = margin;
    } else {
      // Центрируем tooltip
      style.left = hoverPosition.x;
      style.transform = `${style.transform || ''} translateX(-50%)`;
    }

    return style;
  };

  const isMobile = window.innerWidth <= 768;

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6">
      <div className="relative overflow-hidden rounded-lg" ref={containerRef}>
        <canvas
          ref={canvasRef}
          // style prop removed
          className="max-h-[60vh] md:max-h-none object-contain md:object-initial w-full h-auto rounded-lg shadow-xl cursor-pointer"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        />
        {hoveredBoard && hoverPosition && (
          <div
            style={getTooltipStyle()}
            className="bg-white/95 backdrop-blur-md p-4 md:p-6 rounded-xl shadow-2xl border border-slate-200/50 opacity-100 scale-100 transition-all duration-200 ease-in-out max-w-[90vw] md:max-w-xs min-w-[280px] fixed sm:absolute bottom-4 left-1/2 sm:left-auto sm:bottom-auto sm:-translate-x-1/2"
          >
            <div className="flex flex-col gap-3 md:gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-x-4 md:gap-y-6">
                <div>
                  <p className="text-sm font-medium text-blue-600 m-0 mb-1">Объем</p>
                  <p className="text-base md:text-lg font-semibold m-0">{hoveredBoard.volume.toFixed(4)} м³</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-600 m-0 mb-1">Ширина</p>
                  <p className="text-base md:text-lg font-semibold m-0">{mToCm(hoveredBoard.width).toFixed(1)} см</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-600 m-0 mb-1">Высота</p>
                  <p className="text-base md:text-lg font-semibold m-0">{mToCm(hoveredBoard.height).toFixed(1)} см</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-600 m-0 mb-1">Длина</p>
                  <p className="text-base md:text-lg font-semibold m-0">{mToCm(hoveredBoard.length).toFixed(1)} см</p>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-200/50">
                <p className="text-sm font-medium text-blue-600 m-0 mb-1">Уверенность</p>
                <div className="mt-1 w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-in-out"
                    style={{ width: `${hoveredBoard.detection.confidence * 100}%` }}
                  />
                </div>
                <p className="text-right text-sm text-slate-500 mt-1 m-0">
                  {(hoveredBoard.detection.confidence * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div
        className="bg-white p-4 md:p-6 rounded-xl shadow-xl border border-slate-200 opacity-100 transform-none transition-all duration-300 ease-in-out"
      >
        <h3 className="text-base md:text-lg font-semibold mb-4 md:mb-6 text-slate-700 border-b border-slate-200 pb-3">
          Сводка анализа
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="bg-blue-50 p-3 md:p-4 rounded-lg shadow-sm">
            <p className="text-blue-700 font-medium mb-1 text-sm md:text-base m-0">
              Общий объем
            </p>
            <div className="flex items-baseline flex-wrap">
              <p className="text-2xl md:text-3xl font-bold text-blue-800 m-0">
                {result.total_volume.toFixed(4)}
              </p>
              <p className="ml-1 text-blue-700 text-base md:text-lg m-0">
                м³
              </p>
            </div>
          </div>
          <div className="bg-blue-50 p-3 md:p-4 rounded-lg shadow-sm">
            <p className="text-blue-700 font-medium mb-1 text-sm md:text-base m-0">
              Всего досок
            </p>
            <p className="text-2xl md:text-3xl font-bold text-blue-800 m-0">
              {result.total_count}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultDisplay;
