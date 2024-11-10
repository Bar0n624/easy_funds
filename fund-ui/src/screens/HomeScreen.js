import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Home() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();

    // Extract user_id from the location state
    const user_id = location.state?.uid;

    useEffect(() => {
        // Redirect to login if user_id is missing
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
        <div className="home">
            <h1>Home Screen</h1>
            {loading ? (
                <p>Loading...</p>
            ) : error ? (
                <p>{error}</p>
            ) : (
                <pre>{JSON.stringify(data, null, 2)}</pre>
            )}
        </div>
    );
}
