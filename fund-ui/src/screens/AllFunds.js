import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/SideBar';
import FundDisplay from '../components/FundDisplay';

export default function AllFunds() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const location = useLocation();
    const navigate = useNavigate();

    const user_id = location.state?.uid;

    useEffect(() => {
        if (!user_id) {
            navigate('/');
            return;
        }

        const fetchData = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/all/fund`);
                setData(response.data);
            } catch (error) {
                console.error('Error fetching data:', error);
                setError("Failed to load data. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user_id, navigate]);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const filteredFunds = data?.results.filter(fund =>
        fund[1].toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-100">
            <Sidebar userId={user_id}/>
            <main className="ml-64 p-8">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4 p-3">All Funds</h1>
                    <div className="mb-8">
                        <input
                            type="text"
                            placeholder="Search funds..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className="w-full p-6 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
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
                        data && <FundDisplay data={{ results: filteredFunds }} userId={user_id}/>
                    )}
                </div>
            </main>
        </div>
    );
}