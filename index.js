// index.js

// 1. Import required packages
const express = require('express');
const cors = require('cors'); // Required for frontend communication
const Blockchain = require('./blockchain'); // Import our blockchain logic

// 2. Initialize the application and create a blockchain instance
const app = express();
const port = 3001;
const myCoin = new Blockchain();

// 3. Setup Middleware
// Use CORS to allow cross-origin requests from our frontend webpage
app.use(cors()); 

// Use express.json() to parse incoming JSON data from request bodies
app.use(express.json()); 


// --- API Endpoints ---

// Root endpoint: Provides a welcome message for API health checks.
app.get('/', (req, res) => {
    res.send('Welcome to your Simple Node.js Blockchain API! Try /blockchain, /mine, or /validate.');
});

// GET Endpoint: Returns the entire blockchain.
app.get('/blockchain', (req, res) => {
    res.json(myCoin);
});

// POST Endpoint: Mines a new block. 
// This is the endpoint used by BOTH the "Mine Custom Block" button and the "Save Chat" button.
// It's designed to accept any data structure in the `req.body.data` field.
app.post('/mine', (req, res) => {
    const blockData = req.body.data;
    if (!blockData) {
        return res.status(400).json({ error: 'Block data is required.' });
    }
    myCoin.addBlock(blockData);
    res.status(201).json({
        message: 'New block mined and added successfully!',
        newBlock: myCoin.getLatestBlock()
    });
});

// GET Endpoint: Validates the integrity of the chain and returns a detailed report.
app.get('/validate', (req, res) => {
    const validationReport = myCoin.isChainValid();
    res.json(validationReport);
});

// POST Endpoint: Tampers with a specific block's data to simulate an attack.
app.post('/tamper/:blockIndex', (req, res) => {
    const blockIndex = parseInt(req.params.blockIndex, 10);
    const newData = req.body.data;

    // Basic validation for the request
    if (isNaN(blockIndex) || blockIndex < 0 || blockIndex >= myCoin.chain.length) {
        return res.status(400).json({ error: 'Invalid block index.' });
    }
    if (!newData) {
        return res.status(400).json({ error: 'New data is required for tampering.' });
    }

    // Directly change the data without recalculating the hash to simulate tampering
    myCoin.chain[blockIndex].data = newData;

    res.json({
        message: `Successfully tampered with block ${blockIndex}. Remember to run /validate to see the effect.`,
        block: myCoin.chain[blockIndex]
    });
});


// 4. Start the server and listen for requests on the specified port
app.listen(port, () => {
    console.log(`Blockchain server running at http://localhost:${port}`);
});