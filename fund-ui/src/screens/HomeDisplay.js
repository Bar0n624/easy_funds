import React from 'react';

export default function HomeDisplay({ data }) {
    return (
        <div className="home-display">
            <h1>Top Performing Funds</h1>

            {/* Render each time period */}
            {["one_month", "three_month", "six_month", "one_year"].map((period) => (
                <div key={period} className="fund-section">
                    <h2>{period.replace('_', ' ').toUpperCase()}</h2>
                    <table>
                        <thead>
                        <tr>
                            <th>Company</th>
                            <th>Fund Name</th>
                            <th>Performance (%)</th>
                        </tr>
                        </thead>
                        <tbody>
                        {data[period].map((fund, index) => (
                            <tr key={index}>
                                <td>{fund[0]}</td>
                                <td>{fund[1]}</td>
                                <td>{fund[2]}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            ))}

            {/* Watchlist */}
            <div className="fund-section">
                <h2>Watchlist</h2>
                {data.watchlist.length > 0 ? (
                    <table>
                        <thead>
                        <tr>
                            <th>Fund ID</th>
                            <th>Fund Name</th>
                            <th>Lifetime Return</th>
                            <th>1 Day Change</th>
                        </tr>
                        </thead>
                        <tbody>
                        {data.watchlist.map((fund, index) => (
                            <tr key={index}>
                                <td>{fund[0]}</td>
                                <td>{fund[1]}</td>
                                <td>{fund[2]}</td>
                                <td>{fund[3]}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                ) : (
                    <p>No funds in your watchlist.</p>
                )}
            </div>
        </div>
    );
}
