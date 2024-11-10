import React from 'react';
import { Link } from 'react-router-dom';


const Sidebar = ({ userId }) => {
    const menuItems = [
        { path: '/search', label: 'Search Screen' },
        { path: '/all-categories', label: 'All Categories' },
        { path: '/all-companies', label: 'All Companies' },
        { path: '/all-funds', label: 'All Funds' },
        { path: '/watchlist', label: 'Watchlist' },
        { path: '/portfolio', label: 'Portfolio' },
    ];

    return (
        <div className="w-64 h-screen bg-gray-800 text-white fixed left-0 top-0 p-6">
            <h2 className="text-2xl font-bold mb-6">Menu</h2>
            <ul className="space-y-2">
                {menuItems.map((item) => (
                    <li key={item.path}>
                        <Link
                            to={item.path}
                            state={{ uid: userId }}
                            className="block py-2 px-4 rounded hover:bg-gray-700 transition-colors"
                        >
                            {item.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Sidebar;