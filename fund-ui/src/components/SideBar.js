import React from 'react';
import { Link, useLocation } from 'react-router-dom';


const Sidebar= ({ uid }) => {
    const location = useLocation();
    const currentPath = location.pathname;

    const menuItems = [
        { path: '/search', label: 'Search Screen' },
        { path: '/top-funds' , label: 'Top Funds' },
        { path: '/all-categories', label: 'All Categories' },
        { path: '/all-companies', label: 'All Companies' },
        { path: '/all-funds', label: 'All Funds' },
        { path: '/watchlist', label: 'Watchlist' },
        { path: '/portfolio', label: 'Portfolio' },
    ];

    return (
        <div className="w-64 h-screen bg-gray-800 text-white fixed left-0 top-0 p-6">
            <Link
                to="/home"
                state={{ uid: uid }}
                className="block mb-8"
            >
                <h2 className="text-2xl font-bold hover:text-blue-400 transition-colors">Easy Funds</h2>
            </Link>
            <ul className="space-y-2">
                {menuItems.map((item) => (
                    <li key={item.path}>
                        <Link
                            to={item.path}
                            state={{ uid: uid }}
                            className={`block py-2 px-4 rounded transition-colors ${
                                currentPath === item.path
                                    ? 'bg-blue-600 text-white'
                                    : 'hover:bg-gray-700'
                            }`}
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