import React from 'react';

const SearchResults = ({ results, onResultClick }) => {
    return (
        <div className="w-[600px] mt-4">
            <ul className="space-y-2">
                {results.map(([fundId, fundName]) => (
                    <li
                        key={fundId}
                        onClick={() => onResultClick(fundId)}
                        className="p-4 bg-white rounded-lg shadow hover:shadow-md hover:bg-gray-300 cursor-pointer transition-all transition- duration-200 hover:translate-y-[-2px]"
                    >
                        {fundName}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default SearchResults;