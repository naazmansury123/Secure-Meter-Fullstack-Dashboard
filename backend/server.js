const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const WebSocket = require('ws');
const cors = require('cors');
const mqtt = require('mqtt');
require('dotenv').config();

const MeterData = require('./models/meterData');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors({
  origin: [
    'http://localhost:3000', 
    process.env.FRONTEND_URL  
  ],
  credentials: true
}));

app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("MongoDB Connected Successfully!"))
  .catch(err => console.error("MongoDB Connection Error:", err));

wss.on('connection', ws => {
    console.log('Client connected to WebSocket');
    ws.on('close', () => console.log('Client disconnected'));
});

function broadcast(data) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

const MQTT_BROKER_URL = process.env.MQTT_BROKER_URL || 'mqtt://broker.emqx.io';
const MQTT_TOPIC = process.env.MQTT_TOPIC || 'secure/meters/demo/data';

const mqttClient = mqtt.connect(MQTT_BROKER_URL);

mqttClient.on('connect', () => {
    console.log('Connected to MQTT Broker!');
    mqttClient.subscribe(MQTT_TOPIC, (err) => {
        if (!err) console.log(`Subscribed to topic: ${MQTT_TOPIC}`);
    });
});

mqttClient.on('message', async (topic, message) => {
    console.log(`Message received on topic ${topic}`);
    try {
        const dataPoint = JSON.parse(message.toString());
        const newData = new MeterData(dataPoint);
        const savedData = await newData.save();
        broadcast(savedData);
    } catch (err) {
        console.error("Error processing MQTT message or broadcasting:", err);
    }
});

mqttClient.on('error', (err) => console.error('MQTT Error:', err));

app.get('/api/initial-data', async (req, res) => {
    try {
        const data = await MeterData.find().sort({ timestamp: -1 }).limit(100);
        res.json(data.reverse());
    } catch (err) {
        res.status(500).json({ message: "Error fetching initial data", error: err.message });
    }
});

app.get('/api/data-by-range', async (req, res) => {
    try {
        const { start, end } = req.query;
        if (!start || !end) {
            return res.status(400).json({ message: "Start and end date query parameters are required." });
        }
        const data = await MeterData.find({
            timestamp: { $gte: new Date(start), $lte: new Date(end) }
        }).sort({ timestamp: 1 });
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: "Error fetching data by range", error: err.message });
    }
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`Backend server running on http://localhost:${PORT}`));