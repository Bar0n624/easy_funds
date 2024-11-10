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
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fund Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance (%)</th>
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                {data[key].map((fund, index) => (
                                    <tr
                                        key={index}
                                        onClick={() => handleFundClick(fund[0])}
                                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{fund[1]}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{fund[2]}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{fund[3]}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-lg shadow hover:shadow-lg p-6 transition-all duration-200 hover:translate-y-[-2px] mt-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Watchlist</h2>
                {data.watchlist.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fund ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fund Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lifetime Return</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">1 Day Change</th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {data.watchlist.map((fund, index) => (
                                <tr
                                    key={index}
                                    onClick={() => handleFundClick(fund[0])}
                                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{fund[0]}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{fund[1]}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{fund[2]}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{fund[3]}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-gray-500 text-center py-4">No funds in your watchlist.</p>
                )}
            </div>
        </div>
    );
};

export default HomeDisplay;