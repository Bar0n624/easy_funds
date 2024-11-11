import React from 'react';
import { useNavigate } from 'react-router-dom';

const SmallFundList = ({ data, uid, name }) => {
    const navigate = useNavigate();

    const handleFundClick = (fundId) => {
        navigate('/fund', { state: { fundId, uid, name} });
    };

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {data.results.map((fund) => (
                    <li
                        key={fund[0]}
                        className="fund-item px-12 py-4 bg-white rounded-lg shadow hover:shadow-lg hover:bg-gray-300 cursor-pointer transition-all duration-300 ease-in-out hover:translate-y-[-4px] hover:scale-105 flex justify-between"
                        onClick={() => handleFundClick(fund[0])}
                    >
                        <div className="fund-text flex flex-col">
                            <span className="fund-inner text-left text-xl font-semibold">
                                {fund[1]}
                            </span>
                        </div>
                        <span
                            className={`text-right font-bold text-lg ${
                                fund[2] > 0 ? "text-green-500" : "text-red-500"
                            }`}
                        >
                            {fund[2] > 0 ? `+${fund[2]}` : fund[2]}%
                            <span className="text-gray-400 text-sm">{" 1Y"}</span>
                        </span>
                    </li>
                ))}
            </div>
        </div>
    );
};

export default SmallFundList;