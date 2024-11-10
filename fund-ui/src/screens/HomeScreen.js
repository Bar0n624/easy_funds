import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/SideBar';
import HomeDisplay from '../components/HomeDisplay';

export default function Home() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();

    // Extract user_id from the location state
    const user_id = location.state?.uid;

    useEffect(() => {

        if (!user_id) {
            navigate('/');
            return;
        }

        // Fetch data from the backend
        const fetchData = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/home?u_id=${user_id}`);
                setData(response.data);
            } catch (error) {
                console.error('Error fetching data:', error);
                setError("Failed to load data. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        // Call fetchData only once
        fetchData();
    }, [user_id, navigate]);

    return (
        <div className="min-h-screen bg-gray-100">
            <Sidebar uid={user_id}/>
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
                        data && <HomeDisplay data={data}/>
                    )}
                </div>
            </main>
        </div>
    );
}
