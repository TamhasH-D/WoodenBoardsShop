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
  const [tooltipAlign, setTooltipAlign] = useState('center');

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
    
    const style = {
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
    <div style={{ width: '100%', maxWidth: '64rem', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ position: 'relative' }} ref={containerRef}>
        <canvas
          ref={canvasRef}
          style={{ 
            width: '100%', 
            height: 'auto', 
            borderRadius: '0.5rem', 
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)', 
            cursor: 'pointer' 
          }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        />
        {hoveredBoard && hoverPosition && (
          <div 
            style={{
              ...getTooltipStyle(),
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(8px)',
              padding: '1.5rem',
              borderRadius: '0.75rem',
              boxShadow: '0 20px 25px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(229, 231, 235, 0.5)',
              opacity: 1,
              transform: `${getTooltipStyle().transform || ''} scale(1)`,
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: '280px' }}>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '1.5rem 1rem' 
              }}>
                <div>
                  <p style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--color-primary)', margin: '0 0 0.25rem 0' }}>Объем</p>
                  <p style={{ fontSize: '1.125rem', fontWeight: '600', margin: 0 }}>{hoveredBoard.volume.toFixed(4)} м³</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--color-primary)', margin: '0 0 0.25rem 0' }}>Ширина</p>
                  <p style={{ fontSize: '1.125rem', fontWeight: '600', margin: 0 }}>{mToCm(hoveredBoard.width).toFixed(1)} см</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--color-primary)', margin: '0 0 0.25rem 0' }}>Высота</p>
                  <p style={{ fontSize: '1.125rem', fontWeight: '600', margin: 0 }}>{mToCm(hoveredBoard.height).toFixed(1)} см</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--color-primary)', margin: '0 0 0.25rem 0' }}>Длина</p>
                  <p style={{ fontSize: '1.125rem', fontWeight: '600', margin: 0 }}>{mToCm(hoveredBoard.length).toFixed(1)} см</p>
                </div>
              </div>
              <div style={{ paddingTop: '0.5rem', borderTop: '1px solid rgba(229, 231, 235, 0.5)' }}>
                <p style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--color-primary)', margin: '0 0 0.25rem 0' }}>Уверенность</p>
                <div style={{ marginTop: '0.25rem', width: '100%', backgroundColor: '#e5e7eb', borderRadius: '9999px', height: '0.5rem' }}>
                  <div 
                    style={{ 
                      backgroundColor: 'var(--color-primary)', 
                      height: '0.5rem', 
                      borderRadius: '9999px', 
                      transition: 'all 0.3s ease',
                      width: `${hoveredBoard.detection.confidence * 100}%`
                    }}
                  />
                </div>
                <p style={{ textAlign: 'right', fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem', margin: '0.25rem 0 0 0' }}>
                  {(hoveredBoard.detection.confidence * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div 
        style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '0.75rem',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb',
          opacity: 1,
          transform: 'translateY(0)',
          transition: 'all 0.3s ease'
        }}
      >
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1.5rem', color: '#374151', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.75rem' }}>
          Сводка анализа
        </h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: window.innerWidth >= 768 ? '1fr 1fr' : '1fr', 
          gap: '1.5rem' 
        }}>
          <div style={{ backgroundColor: '#dbeafe', padding: '1rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
            <p style={{ color: '#1e40af', fontWeight: '500', marginBottom: '0.25rem', margin: '0 0 0.25rem 0' }}>Общий объем</p>
            <div style={{ display: 'flex', alignItems: 'baseline' }}>
              <p style={{ fontSize: '2rem', fontWeight: '700', color: '#1e3a8a', margin: 0 }}>{result.total_volume.toFixed(4)}</p>
              <p style={{ marginLeft: '0.25rem', color: '#1e40af', margin: '0 0 0 0.25rem' }}>м³</p>
            </div>
          </div>
          <div style={{ backgroundColor: '#dbeafe', padding: '1rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
            <p style={{ color: '#1e40af', fontWeight: '500', marginBottom: '0.25rem', margin: '0 0 0.25rem 0' }}>Всего досок</p>
            <p style={{ fontSize: '2rem', fontWeight: '700', color: '#1e3a8a', margin: 0 }}>{result.total_count}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultDisplay;
