import React, { useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate, Link } from 'react-router-dom';  // For navigation to fund details page

const SearchScreen = ({ userId }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const location = useLocation();
    const navigate = useNavigate();
    const user_id = location.state?.uid;
    const uid = user_id;
    if (!user_id) {
        navigate('/');
        return;
    }

    // Function to fetch search results
    const fetchSearchResults = async (searchQuery) => {
        try {
            const response = await axios.get(`http://localhost:5000/search/fund?q=${searchQuery}`);
            setResults(response.data.results);
        } catch (error) {
            console.error('Error fetching search results:', error);
        }
    };

    // Handle user typing in the search bar
    const handleSearch = (event) => {
        const searchQuery = event.target.value;
        setQuery(searchQuery);

        // Fetch results as the user types
        if (searchQuery) {
            fetchSearchResults(searchQuery);
        } else {
            setResults([]);  // Clear results if the search query is empty
        }
    };

    // Handle click on a search result
    const handleResultClick = (fundId) => {
        // Navigate to the fund details page, passing fund_id and user_id as state
        navigate(`/fund`, { state: { fundId, uid } });
    };

    return (
        <div>
            {/* Navigation Bar */}
            <nav>
                <ul>
                    <li><a href="/">Home</a></li>
                    <li><a href="/search">Search</a></li>
                </ul>
            </nav>

            {/* Search Bar */}
            <input
                type="text"
                placeholder="Search Funds..."
                value={query}
                onChange={handleSearch}
            />

            {/* Display Search Results */}
            <div>
                {results.length > 0 && (
                    <ul>
                        {results.map(([fundId, fundName]) => (
                            <li key={fundId} onClick={() => handleResultClick(fundId)}>
                                {fundName}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default SearchScreen;
