import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const EquipmentStatusChart = ({ data = [] }) => {
  const chartData = {
    labels: data.map((d) => d.status),
    datasets: [
      {
        data: data.map((d) => d.count),
        backgroundColor: [
          '#10b981',
          '#3b82f6',
          '#f59e0b',
          '#ef4444'
        ],
        borderColor: '#111827',
        borderWidth: 2
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#94a3b8',
          font: { family: 'Inter', size: 12 },
          padding: 15
        }
      },
      tooltip: {
        backgroundColor: '#1f2937',
        titleColor: '#f8fafc',
        bodyColor: '#94a3b8',
        borderColor: '#374151',
        borderWidth: 1
      }
    },
    cutout: '70%'
  };

  return (
    <div style={{ height: '240px', position: 'relative' }}>
      <Doughnut data={chartData} options={options} />
    </div>
  );
};

export default EquipmentStatusChart;
