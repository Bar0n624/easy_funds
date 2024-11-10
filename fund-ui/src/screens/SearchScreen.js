import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../components/SideBar';
import SearchBar from '../components/SearchBar';
import SearchResults from '../components/SearchResults';

const SearchScreen= () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const location = useLocation();
    const navigate = useNavigate();
    const userId = location.state?.uid;

    useEffect(() => {
        if (!userId) {
            navigate('/');
        }
    }, [userId, navigate]);

    const fetchSearchResults = async (searchQuery) => {
        try {
            const response = await axios.get(`http://localhost:5000/search/fund?q=${searchQuery}`);
            setResults(response.data.results);
        } catch (error) {
            console.error('Error fetching search results:', error);
        }
    };

    const handleSearch = (event) => {
        const searchQuery = event.target.value;
        setQuery(searchQuery);

        if (searchQuery) {
            fetchSearchResults(searchQuery);
        } else {
            setResults([]);
        }
    };

    const handleResultClick = (fundId) => {
        navigate(`/fund`, { state: { fundId, uid: userId } });
    };

    if (!userId) return null;

    return (
        <div className="min-h-screen bg-gray-100">
            <Sidebar userId={userId} />
            <main className="ml-64 p-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-800 mb-8">Search Funds</h1>
                    <SearchBar query={query} onChange={handleSearch} />
                    {results.length > 0 && (
                        <SearchResults results={results} onResultClick={handleResultClick} />
                    )}
                </div>
            </main>
        </div>
    );
};

export default SearchScreen;