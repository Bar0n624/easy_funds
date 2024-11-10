import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import SideBar from '../components/SideBar';

const TopFundsScreen = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortOrder, setSortOrder] = useState('desc');
    const location = useLocation();
    const navigate = useNavigate();
    const uid = location.state?.uid;

    useEffect(() => {
        if (!uid) {
            navigate('/');
            return;
        }

        const fetchData = async () => {
            try {
                const response = await axios.get('http://localhost:5000/top/fund');
                const results = response.data.results.map(fund => ({
                    ...fund,
                    performance: fund[3] !== null ? fund[3] : NaN
                }));
                setData(results);
            } catch (error) {
                console.error('Error fetching data:', error);
                setError('Failed to load data. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [uid, navigate]);

    const handleSortChange = () => {
        setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    };

    const handleFundClick = (fundId) => {
        navigate('/fund', { state: { fundId, uid } });
    };

    const sortedData = [...data].sort((a, b) => {
        return sortOrder === 'desc' ? b.performance - a.performance : a.performance - b.performance;
    });

    return (
        <div className="min-h-screen bg-gray-100">
            <SideBar uid={uid} />
            <main className="ml-64 p-8">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4 p-3 text-center">Top Funds</h1>
                    <div className="mb-8 flex justify-end">
                        <button
                            onClick={handleSortChange}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-sm hover:bg-blue-600 transition-all duration-200"
                        >
                            Sort by {sortOrder === 'desc' ? 'Ascending' : 'Descending'}
                        </button>
                    </div>
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                        </div>
                    ) : error ? (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {sortedData.map((fund) => (
                                <div
                                    key={fund[0]}
                                    className="bg-white rounded-lg p-6 shadow hover:shadow-md transition-all duration-200 cursor-pointer"
                                    onClick={() => handleFundClick(fund[0])}
                                >
                                    <h2 className="text-xl font-semibold text-gray-800">{fund[2]}</h2>
                                    <p className="text-gray-700">Company: {fund[1]}</p>
                                    <p className="text-gray-700">Performance: {fund.performance.toFixed(2)}%</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default TopFundsScreen;