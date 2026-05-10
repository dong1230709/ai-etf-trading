import { useEffect, useRef } from 'react';
import type { StockQuoteWithValidation } from '../../types/quote';

interface PriceChartProps {
  data: StockQuoteWithValidation[];
  height?: number;
  showVolume?: boolean;
  showMA?: boolean;
}

export function PriceChart({ 
  data, 
  height = 200,
  showVolume = true,
  showMA = true 
}: PriceChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const chartHeight = showVolume ? height * 0.7 : height;
    const volumeHeight = showVolume ? height * 0.2 : 0;
    const padding = { top: 10, right: 10, bottom: 10, left: 10 };

    const prices = data.map(d => d.price);
    const minPrice = Math.min(...prices) * 0.998;
    const maxPrice = Math.max(...prices) * 1.002;
    const priceRange = maxPrice - minPrice;

    const volumes = data.map(d => d.volume);
    const maxVolume = Math.max(...volumes);

    ctx.clearRect(0, 0, width, height);

    const gridColor = 'rgba(46, 58, 82, 0.3)';
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 0.5;
    ctx.setLineDash([5, 5]);

    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartHeight / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      const priceLabel = (maxPrice - (priceRange / 4) * i).toFixed(2);
      ctx.fillStyle = '#5a6178';
      ctx.font = '10px JetBrains Mono';
      ctx.fillText(priceLabel, 5, y + 3);
    }

    ctx.setLineDash([]);

    const priceColor = data[data.length - 1]?.changePercent >= 0 ? '#00d68f' : '#ff3d71';
    ctx.strokeStyle = priceColor;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    data.forEach((point, i) => {
      const x = padding.left + (i / (data.length - 1)) * (width - padding.left - padding.right);
      const y = padding.top + (1 - (point.price - minPrice) / priceRange) * chartHeight;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    const gradient = ctx.createLinearGradient(0, padding.top, 0, chartHeight + padding.top);
    gradient.addColorStop(0, priceColor.replace(')', ', 0.3)').replace('rgb', 'rgba'));
    gradient.addColorStop(1, priceColor.replace(')', ', 0)').replace('rgb', 'rgba'));

    ctx.fillStyle = gradient;
    ctx.beginPath();
    data.forEach((point, i) => {
      const x = padding.left + (i / (data.length - 1)) * (width - padding.left - padding.right);
      const y = padding.top + (1 - (point.price - minPrice) / priceRange) * chartHeight;

      if (i === 0) {
        ctx.moveTo(x, chartHeight + padding.top);
        ctx.lineTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.lineTo(width - padding.right, chartHeight + padding.top);
    ctx.closePath();
    ctx.fill();

    if (showVolume) {
      const volumeColor = '#3366ff';
      ctx.fillStyle = volumeColor + '40';
      
      data.forEach((point, i) => {
        const x = padding.left + (i / (data.length - 1)) * (width - padding.left - padding.right);
        const barHeight = (point.volume / maxVolume) * volumeHeight;
        const y = height - padding.bottom - barHeight;
        
        ctx.fillRect(x - 2, y, 4, barHeight);
      });
    }

    const lastPoint = data[data.length - 1];
    if (lastPoint) {
      const x = width - padding.right;
      const y = padding.top + (1 - (lastPoint.price - minPrice) / priceRange) * chartHeight;

      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fillStyle = priceColor;
      ctx.fill();
      ctx.strokeStyle = '#0a0e17';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(x, y, 10, 0, Math.PI * 2);
      ctx.strokeStyle = priceColor + '60';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }, [data, height, showVolume, showMA]);

  return (
    <div className="relative" style={{ height }}>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}
