// app.js

document.addEventListener('DOMContentLoaded', () => {
    // --- All DOM Element Selections ---
    const blockchainDiv = document.getElementById('blockchain');
    const statusDiv = document.getElementById('status');
    
    // Action Buttons
    const mineButton = document.getElementById('mineButton');
    const blockDataInput = document.getElementById('blockData');
    const tamperButton = document.getElementById('tamperButton');
    const blockIndexInput = document.getElementById('blockIndex');
    const tamperDataInput = document.getElementById('tamperData');
    const validateButton = document.getElementById('validateButton');

    // Chat Console Buttons & Inputs
    const chatDisplay = document.getElementById('chatDisplay');
    const chatSenderSelect = document.getElementById('chatSender');
    const chatMessageInput = document.getElementById('chatMessage');
    const sendMessageButton = document.getElementById('sendMessageButton');
    const saveChatButton = document.getElementById('saveChatButton');

    // --- Global State ---
    const API_URL = 'http://localhost:3001';
    let currentChat = []; // Array to hold the current chat session messages

    // --- Core Functions ---

    // Function to update the status message panel
    const updateStatus = (message, isError = false) => {
        statusDiv.textContent = message;
        statusDiv.className = isError ? 'status-error' : 'status-success';
    };

    // Function to fetch the entire blockchain from the server and display it
    const fetchChain = async () => {
        try {
            const response = await fetch(`${API_URL}/blockchain`);
            if (!response.ok) throw new Error('Network response was not ok');
            const { chain } = await response.json();
            
            blockchainDiv.innerHTML = ''; // Clear previous content

            chain.forEach((block, index) => {
                const blockElement = document.createElement('div');
                blockElement.className = 'block';

                // Safely stringify data, which could be a string or an object/array (like our chat)
                const data = JSON.stringify(block.data, null, 2); 
                blockElement.innerHTML = `
                    <h3>Block ${index} ${index === 0 ? '(Genesis)' : ''}</h3>
                    <p><strong>Timestamp:</strong> ${new Date(block.timestamp).toLocaleString()}</p>
                    <p><strong>Data:</strong> <pre>${data}</pre></p>
                    <p><strong>Hash:</strong> <span class="hash">${block.hash}</span></p>
                    <p><strong>Previous Hash:</strong> <span class="hash">${block.previousHash}</span></p>
                    <p><strong>Nonce:</strong> ${block.nonce}</p>
                `;
                blockchainDiv.appendChild(blockElement);
            });
        } catch (error) {
            updateStatus('Error fetching blockchain.', true);
            console.error('Fetch Chain Error:', error);
        }
    };

    // --- Chat Functions ---

    // Function to render the current chat messages to the display box
    const renderChat = () => {
        chatDisplay.innerHTML = ''; // Clear display
        currentChat.forEach(msg => {
            const messageEl = document.createElement('div');
            messageEl.classList.add('message');
            messageEl.classList.add(msg.sender === 'A' ? 'message-a' : 'message-b');
            messageEl.textContent = `${msg.sender}: ${msg.message}`;
            chatDisplay.appendChild(messageEl);
        });
        chatDisplay.scrollTop = chatDisplay.scrollHeight; // Auto-scroll
    };

    // Function to handle sending a new chat message
    const handleSendMessage = () => {
        const sender = chatSenderSelect.value;
        const message = chatMessageInput.value.trim();
        if (!message) return; // Don't send empty messages

        currentChat.push({ sender, message });
        renderChat();
        chatMessageInput.value = ''; // Clear input
        chatMessageInput.focus();
    };


    // --- All Event Listeners ---

    // Event listener for the "Mine Custom Block" button
    mineButton.addEventListener('click', async () => {
        const data = blockDataInput.value;
        if (!data) {
            updateStatus('Custom block data cannot be empty.', true);
            return;
        }
        try {
            await fetch(`${API_URL}/mine`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data }),
            });
            updateStatus('New custom block mined successfully!');
            blockDataInput.value = '';
            fetchChain();
        } catch (error) {
            updateStatus('Error mining custom block.', true);
        }
    });

    // Event listener for the "Tamper Block" button
    tamperButton.addEventListener('click', async () => {
        const index = blockIndexInput.value;
        const data = tamperDataInput.value;
        if (!index || !data) {
            updateStatus('Block index and new data are required to tamper.', true);
            return;
        }
        try {
            await fetch(`${API_URL}/tamper/${index}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data }),
            });
            updateStatus(`Successfully tampered with block ${index}. Run validation to see the effect.`);
            blockIndexInput.value = '';
            tamperDataInput.value = '';
            fetchChain();
        } catch (error) {
            updateStatus('Error tampering with block.', true);
        }
    });
    
    // Event listener for the "Validate Chain" button
    validateButton.addEventListener('click', async () => {
        try {
            const response = await fetch(`${API_URL}/validate`);
            const validationReport = await response.json();
            if (validationReport.isValid) {
                updateStatus('Chain is valid!');
            } else {
                updateStatus(`Chain is INVALID! ${validationReport.message} at block ${validationReport.invalidBlockIndex}`, true);
            }
        } catch (error) {
            updateStatus('Error validating chain.', true);
        }
    });

    // Event listener for the chat "Send" button
    sendMessageButton.addEventListener('click', handleSendMessage);

    // Also allow sending a chat message by pressing the Enter key
    chatMessageInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            handleSendMessage();
        }
    });

    // Event listener for the "Save Chat to New Block" button
    saveChatButton.addEventListener('click', async () => {
        if (currentChat.length === 0) {
            updateStatus('Chat is empty. Nothing to save.', true);
            return;
        }
        try {
            await fetch(`${API_URL}/mine`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data: currentChat }), 
            });
            updateStatus('Chat successfully saved to a new block!');
            currentChat = []; // Reset the chat
            renderChat(); // Clear the chat display
            fetchChain(); // Refresh the blockchain display
        } catch (error) {
            updateStatus('Error saving chat to block.', true);
        }
    });

    // --- Initial Application Load ---
    fetchChain();
});