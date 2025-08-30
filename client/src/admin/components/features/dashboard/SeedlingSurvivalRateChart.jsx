import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, Title);

const SeedlingSurvivalRateChart = ({ data }) => {
  // Calculate unaccounted seedlings based on the assumption that totalDead represents dead seedlings
  const unaccountedSeedlings = data.totalSeedsDistributed - data.totalAlive - data.totalDead;
  const totalSeedlings = data.totalSeedsDistributed;

  const chartData = {
    labels: ['Planted Seedlings', 'Dead Seedlings', 'Unaccounted Seedlings'],
    datasets: [
      {
        label: 'Number of Seedlings',
        data: [data.totalAlive, data.totalDead, unaccountedSeedlings],
        backgroundColor: ['#42A5F5', '#EF5350', '#FFCA28'], // A new, softer color palette: Blue for planted, Red for dead, Yellow for unaccounted
        borderColor: ['#1E88E5', '#D32F2F', '#FFA000'],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom', // Move legend to bottom for consistency
        labels: {
          font: {
            size: 14,
          },
        },
      },
      title: {
        display: true,
        text: 'Seedling Distribution and Survival',
        font: {
          size: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed !== null) {
              label += context.parsed + ' (' + ((context.parsed / totalSeedlings) * 100).toFixed(1) + '%)';
            }
            return label;
          }
        }
      }
    },
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '300px' }}> {/* Consistent height with CropSuccessRateChart */}
      <Pie data={chartData} options={options} />
    </div>
  );
};

export default SeedlingSurvivalRateChart;
