import React from 'react';
import { FaLightbulb } from 'react-icons/fa';
import './Insights.css';

const Insights = ({ latestData, insightText }) => {
    if (!latestData) {
        return null; 
    }

    
    const getPfDescription = (pf) => {
        if (pf >= 0.95) return "Excellent! Your devices are using power very efficiently.";
        if (pf >= 0.90) return "Good. Your power efficiency is on the right track.";
        return "Fair. There might be some room to improve power efficiency.";
    };

    return (
        <div className="insights-container">
            <div className="insight-card">
                <FaLightbulb className="insight-icon" />
                <div className="insight-text">
                    <h4>Real-time Insight</h4>
                    <p>{insightText}</p>
                </div>
            </div>
            <div className="insight-card">
                <FaLightbulb className="insight-icon" />
                <div className="insight-text">
                    <h4>Efficiency Check (Power Factor)</h4>
                    <p>{getPfDescription(latestData.pf)}</p>
                </div>
            </div>
        </div>
    );
};

export default Insights;