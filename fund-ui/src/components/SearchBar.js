import React from 'react';


const SearchBar= ({ query, onChange }) => {
    return (
        <input
            type="text"
            placeholder="Search Funds..."
            value={query}
            onChange={onChange}
            className="w-full max-w-2xl px-6 py-3 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors sticky top-4 bg-white shadow-md"
        />
    );
};

export default SearchBar;