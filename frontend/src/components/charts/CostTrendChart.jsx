import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const CostTrendChart = ({ data = [] }) => {
  const chartData = {
    labels: data.map((d) => d.month),
    datasets: [
      {
        label: 'Spare Parts Cost',
        data: data.map((d) => d.partsCost),
        backgroundColor: '#3b82f6',
        borderRadius: 4
      },
      {
        label: 'Labor Cost',
        data: data.map((d) => d.laborCost),
        backgroundColor: '#f59e0b',
        borderRadius: 4
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { color: '#94a3b8', font: { family: 'Inter', size: 12 } }
      },
      tooltip: {
        backgroundColor: '#1f2937',
        titleColor: '#f8fafc',
        bodyColor: '#94a3b8',
        callbacks: {
          label: (context) => `₹${context.parsed.y.toLocaleString('en-IN')}`
        }
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(51, 65, 85, 0.4)' },
        ticks: { color: '#94a3b8' }
      },
      y: {
        grid: { color: 'rgba(51, 65, 85, 0.4)' },
        ticks: {
          color: '#94a3b8',
          callback: (value) => `₹${value / 1000}k`
        }
      }
    }
  };

  return (
    <div style={{ height: '260px', position: 'relative' }}>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default CostTrendChart;
