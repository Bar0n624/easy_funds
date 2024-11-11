import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import SideBar from '../components/SideBar';
import PortfolioDisplay from '../components/PortfolioDisplay';

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
                        <PortfolioDisplay data={data} uid={uid} name={name} />
                    )}
                </div>
            </main>
        </div>
    );
};

export default PortfolioScreen;