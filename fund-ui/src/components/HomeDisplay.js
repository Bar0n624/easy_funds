import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomeDisplay = ({ data, uid, name}) => {
    const navigate = useNavigate();
    const periods = {
        one_month: "Top Performers of the Last Month",
        three_month: "Top Performers of the Last 3 Months",
        six_month: "Top Performers of the Last 6 Months",
        one_year: "Top Performers of the Last Year"
    };

    const handleFundClick = (fundId) => {
        navigate('/fund', { state: { fundId, uid, name } });
    };

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(periods).map(([key, label]) => (
                    <div key={key} className="bg-white rounded-lg shadow hover:shadow-lg p-6 transition-all duration-200 hover:translate-y-[-2px]">
                        <h2 className="text-2xl font-bold text-black mb-4 p-2 bg-gray-100 rounded-lg flex items-center">
                            <span role="img" aria-label="rising graph" className="mr-2">📈</span>
                            {label}
                        </h2>
                        <div className="space-y-4">
                            {data[key].map((fund, index) => (
                                <li
                                    key={index}
                                    onClick={() => handleFundClick(fund[0])}
                                    className="fund-item px-12 py-4 bg-white rounded-lg shadow hover:shadow-lg hover:bg-gray-300 cursor-pointer transition-all duration-300 ease-in-out hover:translate-y-[-4px] hover:scale-105 flex justify-between"
                                >
                                    <div className="fund-text flex flex-col">
                                        <span className="fund-inner text-left text-xl font-semibold">
                                            {fund[2]}
                                        </span>
                                        <span className="text-gray-400 text-sm truncate">
                                            {fund[1]}
                                        </span>
                                    </div>
                                    <span
                                        className={`text-right font-bold text-lg ${
                                            fund[3] > 0 ? "text-green-500" : "text-red-500"
                                        }`}
                                        style={{ maxWidth: '20%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                                    >
                                        {fund[3] > 0 ? `+${fund[3]}` : fund[3]}%
                                    </span>
                                </li>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HomeDisplay;