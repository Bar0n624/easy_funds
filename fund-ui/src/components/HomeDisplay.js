import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomeDisplay = ({ data, uid }) => {
    const navigate = useNavigate();
    const periods = {
        one_month: "1 Month",
        three_month: "3 Months",
        six_month: "6 Months",
        one_year: "1 Year"
    };

    const handleFundClick = (fundId) => {
        navigate('/fund', { state: { fundId, uid } });
    };

    return (
        <div className="space-y-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">Top Performing Funds</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(periods).map(([key, label]) => (
                    <div key={key} className="bg-white rounded-lg shadow hover:shadow-lg p-6 transition-all duration-200 hover:translate-y-[-2px]">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">{label}</h2>
                        <div className="space-y-4">
                            {data[key].map((fund, index) => (
                                <li
                                    key={index}
                                    onClick={() => handleFundClick(fund[0])}
                                    className="fund-item px-12 py-4 bg-white rounded-lg shadow hover:shadow-lg hover:bg-gray-300 cursor-pointer transition-all duration-300 ease-in-out hover:translate-y-[-4px] hover:scale-105 flex justify-between"
                                >
                                    <div className="fund-text flex flex-col">
                                        <span className="fund-inner text-left text-xl font-semibold " >
                                            {fund[2]}
                                        </span>
                                        <span className="text-gray-400 text-sm truncate" >
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

            <div className="bg-white rounded-lg shadow hover:shadow-lg p-6 transition-all duration-200 hover:translate-y-[-2px] mt-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Watchlist</h2>
                {data.watchlist.length > 0 ? (
                    <div className="space-y-4">
                        {data.watchlist.map((fund, index) => (
                            <li
                                key={index}
                                onClick={() => handleFundClick(fund[0])}
                                className="px-12 py-4 bg-white rounded-lg shadow hover:shadow-lg hover:bg-gray-300 cursor-pointer transition-all duration-300 ease-in-out hover:translate-y-[-4px] hover:scale-105 flex justify-between"
                            >
                                <div className="flex flex-col">
                                    <span className="text-left text-xl font-semibold">
                                        {fund[1]}
                                    </span>
                                    <span className="text-gray-400 text-sm">
                                        {fund[0]}
                                    </span>
                                </div>
                                <div className="flex flex-col text-right">
                                    <span className="font-bold text-lg">
                                        {fund[2] > 0 ? `+${fund[2]}` : fund[2]}%
                                    </span>
                                    <span className="text-gray-400 text-sm">
                                        {fund[3]}
                                    </span>
                                </div>
                            </li>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-center py-4">No funds in your watchlist.</p>
                )}
            </div>
        </div>
    );
};

export default HomeDisplay;