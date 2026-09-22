import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const DowntimeChart = ({ data = [] }) => {
  const chartData = {
    labels: data.map((d) => d.category),
    datasets: [
      {
        label: 'Downtime Hours',
        data: data.map((d) => d.hours),
        backgroundColor: '#ef4444',
        borderRadius: 4
      }
    ]
  };

  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1f2937',
        titleColor: '#f8fafc',
        bodyColor: '#94a3b8',
        callbacks: {
          label: (context) => `${context.parsed.x} Hours`
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
        ticks: { color: '#94a3b8' }
      }
    }
  };

  return (
    <div style={{ height: '240px', position: 'relative' }}>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default DowntimeChart;
