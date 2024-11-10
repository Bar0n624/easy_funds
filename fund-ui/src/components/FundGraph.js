import React from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';

const FundGraph = ({ graphData }) => {
    if (!graphData) return null;

    const reversedHistory = [...graphData.history].reverse();

    const data = {
        labels: reversedHistory.map(item => item[0]),
        datasets: [
            {
                label: 'Fund Value',
                data: reversedHistory.map(item => item[1]),
                fill: false,
                backgroundColor: 'blue',
                borderColor: 'blue',
            },
        ],
    };

    return <Line data={data} />;
};

export default FundGraph;