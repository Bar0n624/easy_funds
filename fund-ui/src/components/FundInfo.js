import React, { useState } from 'react';
import axios from 'axios';

const FundInfo = ({ info, uid }) => {
    const [boughtOn, setBoughtOn] = useState('');
    const [boughtFor, setBoughtFor] = useState('');
    const [investedAmount, setInvestedAmount] = useState('');
    const [soldOn, setSoldOn] = useState('');
    const [soldFor, setSoldFor] = useState('');
    const [returnAmount, setReturnAmount] = useState('');
    console.log(info.fund_id)

    const addToWatchlist = async () => {
        try {
            await axios.post('http://localhost:5000/watchlist/addone', {
                user_id: uid,
                fund_id: info.fund_id
            });
            alert('Fund added to watchlist');
        } catch (error) {
            console.error('Error adding to watchlist:', error);
        }
    };

    const addToPortfolio = async () => {
        try {
            await axios.post('http://localhost:5000/portfolio/add', {
                user_id: uid,
                fund_id: info.fund_id,
                bought_on: `${boughtOn} 00:00:00`,
                bought_for: parseFloat(boughtFor),
                invested_amount: parseFloat(investedAmount),
                sold_on: soldOn ? `${soldOn} 00:00:00` : null,
                sold_for: soldFor ? parseFloat(soldFor) : null,
                return_amount: returnAmount ? parseFloat(returnAmount) : null
            });
            alert('Fund added to portfolio');
        } catch (error) {
            console.error('Error adding to portfolio:', error);
        }
    };

    return (
        <div className="mb-8 bg-white p-12 rounded-lg shadow-md">
            <h1 className="text-5xl font-bold text-gray-800 mb-8">{info.fund_name}</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <p className="text-lg text-gray-700"><strong>Category:</strong> {info.category_name}</p>
                <p className="text-lg text-gray-700"><strong>Company:</strong> {info.company_name}</p>
                <p className="text-lg text-gray-700"><strong>Value:</strong> {info.value.toFixed(2)}</p>
                <p className="text-lg text-gray-700"><strong>Lifetime:</strong> {info.lifetime.toFixed(2)}%</p>
                <p className="text-lg text-gray-700"><strong>One Month:</strong> {info.one_month.toFixed(2)}%</p>
                <p className="text-lg text-gray-700"><strong>One Week:</strong> {info.one_week.toFixed(2)}%</p>
                <p className="text-lg text-gray-700"><strong>One Year:</strong> {info.one_year.toFixed(2)}%</p>
                <p className="text-lg text-gray-700"><strong>Six Months:</strong> {info.six_month.toFixed(2)}%</p>
                <p className="text-lg text-gray-700"><strong>Standard Deviation:</strong> {info.standard_deviation.toFixed(2)}%</p>
                <p className="text-lg text-gray-700"><strong>Three Months:</strong> {info.three_month.toFixed(2)}%</p>
            </div>
            <button
                onClick={addToWatchlist}
                className="mt-8 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
            >
                Add to Watchlist
            </button>
            <div className="mt-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Add to Portfolio</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-gray-700">Bought On</label>
                        <input
                            type="date"
                            value={boughtOn}
                            onChange={(e) => setBoughtOn(e.target.value)}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700">Bought For</label>
                        <input
                            type="number"
                            value={boughtFor}
                            onChange={(e) => setBoughtFor(e.target.value)}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700">Invested Amount</label>
                        <input
                            type="number"
                            value={investedAmount}
                            onChange={(e) => setInvestedAmount(e.target.value)}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700">Sold On</label>
                        <input
                            type="date"
                            value={soldOn}
                            onChange={(e) => setSoldOn(e.target.value)}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700">Sold For</label>
                        <input
                            type="number"
                            value={soldFor}
                            onChange={(e) => setSoldFor(e.target.value)}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700">Return Amount</label>
                        <input
                            type="number"
                            value={returnAmount}
                            onChange={(e) => setReturnAmount(e.target.value)}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded"
                        />
                    </div>
                </div>
                <button
                    onClick={addToPortfolio}
                    className="mt-4 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors"
                >
                    Add to Portfolio
                </button>
            </div>
        </div>
    );
};

export default FundInfo;