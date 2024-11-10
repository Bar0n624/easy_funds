import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/SideBar';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';

export default function FundScreen() {
    const [fundData, setFundData] = useState(null);
    const [graphData, setGraphData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();
    const { fundId, userId } = location.state;

    useEffect(() => {
        if (!userId || !fundId) {
            navigate('/');
            return;
        }

        const fetchFundData = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/fund?f_id=${fundId}`);
                setFundData(response.data);
            } catch (error) {
                console.error('Error fetching fund data:', error);
                setError("Failed to load fund data. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        const fetchGraphData = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/fund/graph_data?f_id=${fundId}`);
                setGraphData(response.data);
            } catch (error) {
                console.error('Error fetching graph data:', error);
                setError("Failed to load graph data. Please try again later.");
            }
        };

        fetchFundData();
        fetchGraphData();
    }, [fundId, userId, navigate]);

    const handleFundClick = (fundId) => {
        navigate('/fund', { state: { fundId, userId } });
    };

    const renderGraph = () => {
        if (!graphData) return null;

        const data = {
            labels: graphData.history.map(item => item[0]),
            datasets: [
                {
                    label: 'Fund Value',
                    data: graphData.history.map(item => item[1]),
                    fill: false,
                    backgroundColor: 'blue',
                    borderColor: 'blue',
                },
            ],
        };

        return <Line data={data} />;
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Sidebar userId={userId} />
            <main className="ml-64 p-8">
                <div className="max-w-7xl mx-auto">
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                        </div>
                    ) : error ? (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                    ) : (
                        fundData && (
                            <div>
                                <h1 className="text-4xl font-bold text-gray-800 mb-4">{fundData.info.fund_name}</h1>
                                <div className="mb-8">
                                    <p><strong>Category:</strong> {fundData.info.category_name}</p>
                                    <p><strong>Company:</strong> {fundData.info.company_name}</p>
                                    <p><strong>Value:</strong> {fundData.info.value}</p>
                                    <p><strong>Lifetime:</strong> {fundData.info.lifetime}</p>
                                    <p><strong>One Month:</strong> {fundData.info.one_month}</p>
                                    <p><strong>One Week:</strong> {fundData.info.one_week}</p>
                                    <p><strong>One Year:</strong> {fundData.info.one_year}</p>
                                    <p><strong>Six Months:</strong> {fundData.info.six_month}</p>
                                    <p><strong>Standard Deviation:</strong> {fundData.info.standard_deviation}</p>
                                    <p><strong>Three Months:</strong> {fundData.info.three_month}</p>
                                </div>
                                <div className="mb-8">
                                    {renderGraph()}
                                </div>
                                <div className="mb-8">
                                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Other Funds in Same Category</h2>
                                    <ul className="space-y-2">
                                        {fundData.same_category.map(([id, name, value]) => (
                                            <li
                                                key={id}
                                                onClick={() => handleFundClick(id)}
                                                className="p-4 bg-white rounded-lg shadow hover:shadow-md hover:bg-gray-300 cursor-pointer transition-all duration-200 hover:translate-y-[-2px]"
                                            >
                                                {name} - {value}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="mb-8">
                                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Other Funds in Same Company</h2>
                                    <ul className="space-y-2">
                                        {fundData.same_company.map(([id, name, value]) => (
                                            <li
                                                key={id}
                                                onClick={() => handleFundClick(id)}
                                                className="p-4 bg-white rounded-lg shadow hover:shadow-md hover:bg-gray-300 cursor-pointer transition-all duration-200 hover:translate-y-[-2px]"
                                            >
                                                {name} - {value}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )
                    )}
                </div>
            </main>
        </div>
    );
}