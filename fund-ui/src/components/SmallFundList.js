import React from 'react';
import { useNavigate } from 'react-router-dom';

const CategoryDisplay = ({ data, uid}) => {
    const navigate = useNavigate();

    const handleFundClick = (fundId) => {
        navigate('/fund', { state: { fundId, uid } });
    };

    return (
        <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {data.results.map((fund) => (
                    <div
                        key={fund[0]}
                        className="bg-white rounded-lg p-6 cursor-pointer shadow hover:shadow-md hover:bg-gray-300 transition-all duration-200"
                        onClick={() => handleFundClick(fund[0])}
                    >
                        <h2 className="text-xl font-semibold text-gray-800">{fund[1]}</h2>
                        <p className="text-gray-700">Performance: {fund[2]}%</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CategoryDisplay;