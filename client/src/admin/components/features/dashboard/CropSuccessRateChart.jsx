import React from 'react';
import { Doughnut } from 'react-chartjs-2'; // Change from Bar to Doughnut
import { Chart as ChartJS, ArcElement, Title, Tooltip, Legend } from 'chart.js'; // Add ArcElement

ChartJS.register(ArcElement, Title, Tooltip, Legend); // Register ArcElement

const CropSuccessRateChart = ({ data }) => {
  const totalCrops = (data.totalAlive ?? 0) + (data.totalDead ?? 0);
  const totalDistributed = data.totalSeedsDistributed ?? 0;
  // Prefer success based on total distributed vs dead; fallback to alive/(alive+dead)
  const successRate = (() => {
    if (totalDistributed > 0) {
      const success = ((totalDistributed - (data.totalDead ?? 0)) / totalDistributed) * 100;
      return success.toFixed(1);
    }
    if (totalCrops > 0) {
      const success = ((data.totalAlive ?? 0) / totalCrops) * 100;
      return success.toFixed(1);
    }
    return 0;
  })();

  const chartData = {
    labels: ['Alive Crops', 'Dead Crops'],
    datasets: [
      {
        label: 'Number of Crops',
        data: [data.totalAlive, data.totalDead],
        backgroundColor: ['#4CAF50', '#F44336'], // Green for alive, Red for dead
        borderColor: ['#388E3C', '#D32F2F'],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%', // Make it a doughnut chart
    plugins: {
      legend: {
        position: 'bottom', // Move legend to bottom
        labels: {
          font: {
            size: 14,
          },
        },
      },
      title: {
        display: true,
        text: 'Crop Success Rate',
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
              const percentBase = totalDistributed > 0 ? totalDistributed : (totalCrops > 0 ? totalCrops : 1);
              label += context.parsed + ' (' + ((context.parsed / percentBase) * 100).toFixed(1) + '%)';
            }
            return label;
          }
        }
      }
    },
  };

  // Custom Plugin for center text
  const textCenter = {
    id: 'textCenter',
    beforeDatasetsDraw(chart) {
      const { ctx } = chart;
      ctx.save();
      ctx.font = 'bold 24px sans-serif';
      ctx.fillStyle = '#424242';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const x = chart.getDatasetMeta(0).data[0].x;
      const y = chart.getDatasetMeta(0).data[0].y;
      ctx.fillText(`${successRate}%`, x, y - 10); // Display percentage
      ctx.font = '12px sans-serif';
      ctx.fillStyle = '#616161';
      ctx.fillText('Success Rate', x, y + 15); // Display label
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '300px' }}> {/* Increased height for better Doughnut display */}
      <Doughnut data={chartData} options={options} plugins={[textCenter]} />
    </div>
  );
};

export default CropSuccessRateChart;
