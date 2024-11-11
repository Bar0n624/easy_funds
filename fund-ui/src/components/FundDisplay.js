import React from 'react';
import { useNavigate } from 'react-router-dom';

const FundDisplay = ({ data, uid , name}) => {
    const navigate = useNavigate();

    const handleFundClick = (fundId) => {
        navigate('/fund', { state: { fundId, uid , name} });
    };

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {data.results.map((fund) => (
                    <div
                        key={fund[0]}
                        className="bg-white rounded-lg p-6 cursor-pointer shadow hover:shadow-md hover:bg-gray-300 transition-all transition- duration-200 hover:translate-y-[-2px]"
                        onClick={() => handleFundClick(fund[0])}
                    >
                        <h2 className="text-l font-bold text-gray-800">{fund[1]}</h2>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FundDisplay;