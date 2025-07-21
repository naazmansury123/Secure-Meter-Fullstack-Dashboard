import React from 'react';
import { FaBolt, FaWaveSquare, FaBroadcastTower, FaPercentage, FaPlug } from 'react-icons/fa'; // Icons
import './DataCard.css';

const iconMap = {
    Power: <FaBolt />,
    Voltage: <FaPlug />,
    Current: <FaWaveSquare />,
    'Power Factor': <FaPercentage />,
    Frequency: <FaBroadcastTower />,
};

const DataCard = ({ title, value, unit, onClick, isActive }) => {
    const cardClassName = `card ${isActive ? 'active' : ''}`;
    
    return (
        <div className={cardClassName} onClick={onClick}>
            <div className="card-header">
                <span className="card-icon">{iconMap[title]}</span>
                <h3>{title}</h3>
            </div>
            {value !== undefined ? (
                <p className="value" key={value}> 
                    {Number(value).toFixed(2)}
                    <span className="unit">{unit}</span>
                </p>
            ) : (
                <p className="value">--</p>
            )}
        </div>
    );
};

export default DataCard;