import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PortfolioDisplay = ({ data, uid, name }) => {
    const [portfolioData, setPortfolioData] = useState([]);

    useEffect(() => {
        const initialData = data.map(fund => {
            const isUpdated = fund[5] && fund[6] && fund[7];
            const soldFor = fund[6] || fund[8];
            const soldOn = fund[5] || '';
            const returnAmount = fund[7] || ((fund[4] / fund[3]) * soldFor).toFixed(2);
            return {
                ...fund,
                isUpdated,
                soldFor,
                soldOn,
                returnAmount
            };
        });
        setPortfolioData(initialData);
    }, [data]);

    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString);
            return date.toISOString().split('T')[0];
        }
        catch{
            return new Date().toISOString().split('T')[0];
        }
        // Format as yyyy-mm-dd
    };

    const handleInputChange = async (index, field, value) => {
        const updatedData = [...portfolioData];
        updatedData[index][field] = value;

        if (field === 'soldOn') {
            try {
                const response = await axios.get(`http://localhost:5000/fund/date?f_id=${updatedData[index][0]}&date=${value} 00:00:00`);
                if (response.status === 200) {
                    updatedData[index].soldFor = response.data.price;
                    updatedData[index].returnAmount = ((updatedData[index][4] / updatedData[index][3]) * response.data.price).toFixed(2);
                }
            } catch (error) {
                console.error('Error fetching price:', error);
                updatedData[index].soldFor = '';
            }
        }

        if (field === 'soldFor') {
            updatedData[index].returnAmount = ((updatedData[index][4] / updatedData[index][3]) * value).toFixed(2); // Update return_amount
        }

        setPortfolioData(updatedData);
    };

    const handleCopyCurrentValue = (index) => {
        const updatedData = [...portfolioData];
        updatedData[index].soldFor = updatedData[index][8]; // Copy current value to sold_for
        updatedData[index].soldOn = new Date().toISOString().split('T')[0]; // Update sold_on to current date
        updatedData[index].returnAmount = ((updatedData[index][4] / updatedData[index][3]) * updatedData[index].soldFor).toFixed(2); // Update return_amount
        setPortfolioData(updatedData);
    };

    const handleUpdatePortfolio = async (fund, index) => {
        try {
            const boughtOnFormatted = new Date(fund[2]).toISOString().split('T')[0] + ' 00:00:00';
            const soldOnFormatted = new Date(fund.soldOn).toISOString().split('T')[0] + ' 00:00:00';
            await axios.post('http://localhost:5000/portfolio/update', {
                user_id: uid,
                fund_id: fund[0],
                bought_on: boughtOnFormatted,
                sold_on: soldOnFormatted,
                sold_for: parseFloat(fund.soldFor),
                return_amount: parseFloat(fund.returnAmount),
            });
            alert('Portfolio updated successfully');
            const updatedData = [...portfolioData];
            updatedData[index].isUpdated = true;
            setPortfolioData(updatedData);
        } catch (error) {
            console.error('Error updating portfolio:', error);
            alert('Failed to update portfolio. Please try again later.');
        }
    };

    const handleDeleteFund = async (fund) => {
        try {
            const boughtOnFormatted = formatDate(fund[2]) + ' 00:00:00';
            console.log(boughtOnFormatted);
            await axios.post('http://localhost:5000/portfolio/delete', {
                user_id: uid,
                fund_id: fund[0],
                bought_on: boughtOnFormatted,
            });
            setPortfolioData(portfolioData.filter(item => item[0] !== fund[0] && item[2] !== fund[2]));
            alert('Fund deleted successfully');
        } catch (error) {
            console.error('Error deleting fund:', error);
            alert('Failed to delete fund. Please try again later.');
        }
    };

    const totalInvested = portfolioData.reduce((sum, fund) => sum + parseFloat(fund[4]), 0);
    const totalReturns = portfolioData.reduce((sum, fund) => sum + parseFloat(fund.returnAmount), 0);
    const netProfitLoss = totalReturns - totalInvested;
    const netProfitLossPercentage = ((netProfitLoss / totalInvested) * 100).toFixed(2);
    const numberOfFunds = portfolioData.length;

    return (
        <div className="space-y-8 p-8">
            <div className="p-4 bg-gray-200 rounded-lg">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Portfolio Summary</h3>
                <div className="grid grid-cols-2 gap-4">
                    <p className="text-gray-700"><strong>Total Invested Amount:</strong> ₹{totalInvested.toFixed(2)}</p>
                    <p className="text-gray-700"><strong>Total Returns:</strong> ₹{totalReturns.toFixed(2)}</p>
                    <p className="text-gray-700"><strong>Number of Funds:</strong> {numberOfFunds}</p>
                    <p className={`text-gray-700 ${netProfitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        <strong>Net {netProfitLoss >= 0 ? 'Profit' : 'Loss'}:</strong> ₹{Math.abs(netProfitLoss).toFixed(2)} ({netProfitLossPercentage}%)
                    </p>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {portfolioData.map((fund, index) => {
                    const netProfitLoss = fund.returnAmount - fund[4];
                    const netProfitLossPercentage = ((netProfitLoss / fund[4]) * 100).toFixed(2);
                    const profitLossColor = netProfitLoss >= 0 ? 'text-green-500' : 'text-red-500';
                    const isUpdated = fund.isUpdated;

                    return (
                        <div
                            key={fund[0]}
                            className="bg-white rounded-lg p-8 shadow hover:shadow-md transition-all duration-200"
                        >
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-semibold text-gray-800">{fund[1]}</h2>
                                <p className="text-gray-600">Current Value: <span className="font-bold">₹{fund[8]}</span></p>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div>
                                    <label className="block text-gray-700">Bought On</label>
                                    <input
                                        type="date"
                                        value={formatDate(fund[2])}
                                        readOnly
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded bg-gray-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700">Sold On</label>
                                    <input
                                        type="date"
                                        value={formatDate(fund.soldOn)}
                                        onChange={(e) => handleInputChange(index, 'soldOn', e.target.value)}
                                        className={`mt-1 block w-full p-2 border border-gray-300 rounded ${isUpdated ? 'bg-gray-100' : ''}`}
                                        readOnly={isUpdated}
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700">Bought For</label>
                                    <input
                                        type="number"
                                        value={fund[3]}
                                        readOnly
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded bg-gray-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700">Invested Amount</label>
                                    <input
                                        type="number"
                                        value={fund[4]}
                                        readOnly
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded bg-gray-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700">Sold For</label>
                                    <input
                                        type="number"
                                        value={fund.soldFor}
                                        onChange={(e) => handleInputChange(index, 'soldFor', e.target.value)}
                                        className={`mt-1 block w-full p-2 border border-gray-300 rounded ${isUpdated ? 'bg-gray-100' : ''}`}
                                        readOnly={isUpdated}
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700">Return Amount</label>
                                    <input
                                        type="number"
                                        value={fund.returnAmount}
                                        readOnly
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded bg-gray-100"
                                    />
                                </div>
                            </div>
                            <div className={`flex ${isUpdated ? 'justify-center' : 'justify-between'} mt-4`}>
                                {!isUpdated && (
                                    <>
                                        <button
                                            onClick={() => handleUpdatePortfolio(fund, index)}
                                            className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors"
                                        >
                                            Update Portfolio
                                        </button>
                                        <button
                                            onClick={() => handleCopyCurrentValue(index)}
                                            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
                                        >
                                            Copy Current Value
                                        </button>
                                    </>
                                )}
                                <button
                                    onClick={() => handleDeleteFund(fund)}
                                    className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-700 transition-colors"
                                >
                                    Delete Fund
                                </button>
                            </div>
                            {fund.soldFor && fund.soldFor !== 0 && (
                                <div className={`mt-4 ${profitLossColor}`}>
                                    <p>Net {netProfitLoss >= 0 ? 'Profit' : 'Loss'}: ₹{Math.abs(netProfitLoss).toFixed(2)} ({netProfitLossPercentage}%)</p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default PortfolioDisplay;