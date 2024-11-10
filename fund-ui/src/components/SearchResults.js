import React from 'react';


const SearchResults = ({ results, onResultClick }) => {
    return (
        <div className="w-full max-w-2xl mt-4">
            <ul className="space-y-2">
                {results.map(([fundId, fundName]) => (
                    <li
                        key={fundId}
                        onClick={() => onResultClick(fundId)}
                        className="p-4 bg-white rounded-lg shadow hover:shadow-md cursor-pointer transition-all duration-200 hover:translate-y-[-2px]"
                    >
                        {fundName}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default SearchResults;