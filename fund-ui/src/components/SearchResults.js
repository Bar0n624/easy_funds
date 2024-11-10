import React from 'react';
import { useNavigate } from 'react-router-dom';

const SearchResults = ({ results, onResultClick, uid}) => {
    const navigate = useNavigate();

    const handleResultClick = (fundId) => {
        if (onResultClick) {
            onResultClick(fundId);
        } else {
            navigate(`/fund`, { state: { fundId, uid } });
        }
    };

    return (
        <div className="flex justify-center">
            {results.length === 0 ? (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    No Search Results Found
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-3 max-w-4xl">
                    {results.map((result, index) => (
                        <li
                            key={index}
                            onClick={() => handleResultClick(result[0])}
                            className="search-item px-12 py-4 bg-white rounded-lg shadow hover:shadow-lg hover:bg-gray-300 cursor-pointer transition-all duration-300 ease-in-out hover:translate-y-[-4px] hover:scale-105 flex justify-between"
                        >
                            <div className="fund-text flex flex-col">
                                <span className="fund-inner text-left text-xl font-semibold">{result[1]}</span>
                            </div>
                            <span
                                className={`text-right font-bold text-lg ${
                                    result[2] > 0 ? "text-green-500" : "text-red-500"
                                }`}
                            >
                                {result[2] > 0 ? `+${result[2].toFixed(2)}` : result[2].toFixed(2)}%
                            </span>
                        </li>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SearchResults;