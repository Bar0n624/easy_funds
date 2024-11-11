import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/SideBar';
import HomeDisplay from '../components/HomeDisplay';
import SearchBar from '../components/SearchBar';
import SearchResults from '../components/SearchResults'; // Assuming you have a SearchResults component

export default function Home() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const location = useLocation();
    const navigate = useNavigate();

    // Extract uid from the location state
    const uid = location.state?.uid;
    const name = location.state?.name;

    useEffect(() => {
        if (!uid) {
            navigate('/');
            return;
        }

        // Fetch data from the backend
        const fetchData = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/home?u_id=${uid}`);
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
    }, [uid, navigate]);

    useEffect(() => {
        if (searchQuery) {
            setLoading(true);
            axios.get(`http://localhost:5000/search/fund?q=${searchQuery}`)
                .then(response => {
                    setSearchResults(response.data.results);
                    setLoading(false);
                })
                .catch(error => {
                    console.error('Error fetching search results:', error);
                    setError('Failed to load search results. Please try again later.');
                    setLoading(false);
                });
        } else {
            setSearchResults([]);
        }
    }, [searchQuery]);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Sidebar uid={uid} username={name} />
            <main className="ml-64 p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-center mb-8">
                        <SearchBar query={searchQuery} onChange={handleSearchChange} />
                    </div>
                    {searchQuery ? (
                        loading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                            </div>
                        ) : error ? (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                                {error}
                            </div>
                        ) : (
                            <SearchResults results={searchResults} uid={uid} />
                        )
                    ) : (
                        loading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                            </div>
                        ) : error ? (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                                {error}
                            </div>
                        ) : (
                            data && <HomeDisplay data={data} uid={uid} name={name}/>
                        )
                    )}
                </div>
            </main>
        </div>
    );
}