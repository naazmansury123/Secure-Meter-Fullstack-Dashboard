import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import Navbar from './components/Navbar';
import DataCard from './components/DataCard';
import Insights from './components/Insights';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:8080';


const App = () => {
    const [data, setData] = useState([]);
    const [latestData, setLatestData] = useState(null);
    const [highLoadAlert, setHighLoadAlert] = useState(false);
    const [highlightedLine, setHighlightedLine] = useState('power');
    const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 1)));
    const [endDate, setEndDate] = useState(new Date());
    const [insight, setInsight] = useState("Monitoring energy patterns...");

    const ws = useRef(null);
    
    const formatDataForChart = (rawData) => {
        return rawData.map(d => ({
            ...d,
            time: new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        }));
    };

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const response = await fetch(`${API_URL}/api/initial-data`);
                const initialData = await response.json();
                
                const formattedData = formatDataForChart(initialData);
                setData(formattedData);
                if (formattedData.length > 0) {
                    setLatestData(formattedData[formattedData.length - 1]);
                }
            } catch (error) {
                console.error("Failed to fetch initial data:", error);
            }
        };

        fetchInitialData();

        ws.current = new WebSocket(WS_URL);

        ws.current.onopen = () => console.log('WebSocket Connected');
        ws.current.onclose = () => console.log('WebSocket Disconnected');
        ws.current.onerror = (error) => console.error('WebSocket Error:', error);

        ws.current.onmessage = (event) => {
            const receivedData = JSON.parse(event.data);
            const formattedPoint = formatDataForChart([receivedData])[0];
            
            setData(prevData => [...prevData.slice(-99), formattedPoint]);
            setLatestData(formattedPoint);
            setHighLoadAlert(formattedPoint.power > 2000);
            
            if (formattedPoint.power > 1800) {
                setInsight("High consumption! Major appliances like a geyser or AC might be running.");
            } else if (formattedPoint.power > 800) {
                setInsight("Moderate consumption. Regular household activity detected.");
            } else {
                setInsight("Low consumption. Looks like you are saving energy right now!");
            }
        };

        return () => {
            if (ws.current) ws.current.close();
        };
    }, []);

    const handleDateChange = async (dates) => {
        const [start, end] = dates;
        setStartDate(start);
        setEndDate(end);

        if (start && end) {
            try {
                const response = await fetch(`${API_URL}/api/data-by-range?start=${start.toISOString()}&end=${end.toISOString()}`);
                const historicalData = await response.json();
                setData(formatDataForChart(historicalData));
            } catch (error) {
                console.error("Failed to fetch data for date range:", error);
            }
        }
    };

    const handleCardClick = (metric) => {
        setHighlightedLine(metric);
    };

    return (
        <div className="App">
            <Navbar />
            
            <main className="main-content">
                <header className="header">
                    <p>Live data from your smart meter, updated every 10 seconds</p>
                </header>
                
                {highLoadAlert && (
                    <div className="alert-banner">
                        ⚠️ HIGH POWER LOAD DETECTED! Consumption is above 2000W.
                    </div>
                )}

                <div className="live-data-cards">
                    <DataCard title="Power" value={latestData?.power} unit="W" onClick={() => handleCardClick('power')} isActive={highlightedLine === 'power'} />
                    <DataCard title="Voltage" value={latestData?.voltage} unit="V" onClick={() => handleCardClick('voltage')} isActive={highlightedLine === 'voltage'} />
                    <DataCard title="Current" value={latestData?.current} unit="A" onClick={() => handleCardClick('current')} isActive={highlightedLine === 'current'} />
                    <DataCard title="Power Factor" value={latestData?.pf} unit="" onClick={() => handleCardClick('pf')} isActive={highlightedLine === 'pf'} />
                    <DataCard title="Frequency" value={latestData?.frequency} unit="Hz" onClick={() => handleCardClick('frequency')} isActive={highlightedLine === 'frequency'} />
                </div>
                
                <Insights latestData={latestData} insightText={insight} />
                
                <div className="chart-container">
                    <div className="chart-header">
                        <h3>Energy Consumption Graph</h3>
                        <div className="date-picker-container">
                            <DatePicker
                                selected={startDate}
                                onChange={handleDateChange}
                                startDate={startDate}
                                endDate={endDate}
                                selectsRange
                                dateFormat="dd/MM/yyyy"
                                className="date-picker"
                                isClearable={true}
                            />
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="time" />
                            <YAxis yAxisId="left" stroke="#d32f2f" label={{ value: 'Power (W)', angle: -90, position: 'insideLeft' }} />
                            <YAxis yAxisId="right" orientation="right" stroke="#8884d8" label={{ value: 'Voltage (V) / Current (A)', angle: 90, position: 'insideRight' }}/>
                            <Tooltip />
                            <Line yAxisId="left" type="monotone" dataKey="power" name="Power (W)" stroke="#d32f2f" strokeWidth={highlightedLine === 'power' ? 4 : 2} dot={false} />
                            <Line yAxisId="right" type="monotone" dataKey="voltage" name="Voltage (V)" stroke="#8884d8" strokeWidth={highlightedLine === 'voltage' ? 4 : 2} dot={false} />
                            <Line yAxisId="right" type="monotone" dataKey="current" name="Current (A)" stroke="#82ca9d" strokeWidth={highlightedLine === 'current' ? 4 : 2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="our-promise-section">
                    <h3>Our Promise: Empowering You</h3>
                    <p>
                        At Secure, we believe in providing you with transparent, accurate, and real-time data to help you understand and manage your energy consumption effectively. This dashboard is our commitment to empowering you with the insights you need to make smarter energy choices, save money, and contribute to a sustainable future.
                    </p>
                </div>
            </main>
        </div>
    );
};

export default App;