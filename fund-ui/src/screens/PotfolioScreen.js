import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import SideBar from '../components/SideBar';

const PortfolioScreen = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();
    const uid = location.state?.uid;
    const name = location.state?.name;

    useEffect(() => {
        if (!uid) {
            navigate('/');
            return;
        }

        const fetchData = async () => {
            try {
                const response = await axios.post('http://localhost:5000/portfolio/list', { user_id: uid });
                setData(response.data.results);
            } catch (error) {
                console.error('Error fetching data:', error);
                setError('Failed to load data. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [uid, navigate]);

    const handleFundClick = (fundId) => {
        navigate('/fund', { state: { fundId, uid, name } });
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <SideBar uid={uid} username={name} />
            <main className="ml-64 p-8">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4 p-3 text-center">Portfolio</h1>
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
                            {data.map((fund) => (
                                <div
                                    key={fund[0]}
                                    className="bg-white rounded-lg p-6 cursor-pointer shadow hover:shadow-md hover:bg-gray-300 transition-all duration-200 hover:translate-y-[-2px]"
                                    onClick={() => handleFundClick(fund[0])}
                                >
                                    <h2 className="text-xl font-semibold text-gray-800">{fund[1]}</h2>
                                    <p className="text-gray-600">Bought On: {fund[2]}</p>
                                    <p className="text-gray-600">Bought For: {fund[3]}</p>
                                    <p className="text-gray-600">Invested Amount: {fund[4]}</p>
                                    <p className="text-gray-600">Sold On: {fund[5]}</p>
                                    <p className="text-gray-600">Sold For: {fund[6]}</p>
                                    <p className="text-gray-600">Return Amount: {fund[7]}</p>
                                    <p className="text-gray-600">Value: {fund[8]}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default PortfolioScreen;