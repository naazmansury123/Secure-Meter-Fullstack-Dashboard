const mongoose = require('mongoose');

const meterDataSchema = new mongoose.Schema({
    voltage: { type: Number, required: true },
    current: { type: Number, required: true },
    power: { type: Number, required: true },
    pf: { type: Number, required: true }, // Power Factor
    frequency: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MeterData', meterDataSchema);