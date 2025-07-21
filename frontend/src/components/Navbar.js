import React from 'react';
import './Navbar.css';

const logoUrl = '/secure-logo.png'; 

const Navbar = () => {
    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <img src={logoUrl} alt="Secure Meters Logo" className="navbar-logo" />
            </div>
            <div className="navbar-title">
                Real-Time Energy Dashboard
            </div>
        </nav>
    );
};

export default Navbar;