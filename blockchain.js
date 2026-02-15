// blockchain.js

const SHA256 = require('crypto-js/sha256');

/**
 * Represents a single block in the blockchain.
 */
class Block {
    constructor(timestamp, data, previousHash = '') {
        this.timestamp = timestamp;
        this.data = data; // The data associated with the block (e.g., transaction details)
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
        this.nonce = 0; // A random value used in mining
    }

    /**
     * Calculates the SHA256 hash of the block's contents.
     */
    calculateHash() {
        return SHA256(this.previousHash + this.timestamp + JSON.stringify(this.data) + this.nonce).toString();
    }

    /**
     * Mines the block by finding a hash that starts with a certain number of zeros.
     * This is the "Proof of Work".
     * @param {number} difficulty - The number of leading zeros required for the hash.
     */
    mineBlock(difficulty) {
        while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
            this.nonce++;
            this.hash = this.calculateHash();
        }
        console.log(`Block Mined: ${this.hash}`);
    }
}


/**
 * Represents the entire chain of blocks.
 */
class Blockchain {
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 2; // Difficulty for mining (number of leading zeros)
    }

    /**
     * Creates the very first block in the chain, known as the Genesis Block.
     */
    createGenesisBlock() {
        return new Block(Date.now(), "Genesis Block", "0");
    }

    /**
     * Returns the most recent block in the chain.
     */
    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    /**
     * Adds a new block to the chain.
     * @param {object} newData - The data for the new block.
     */
    addBlock(newData) {
        const newBlock = new Block(Date.now(), newData, this.getLatestBlock().hash);
        console.log("Mining new block...");
        newBlock.mineBlock(this.difficulty);
        this.chain.push(newBlock);
    }

    /**
     * Validates the integrity of the blockchain and returns a detailed report.
     */
    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            // Check if the block's stored hash is still valid by recalculating it
            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return {
                    isValid: false,
                    message: "Data tampering detected. The hash of a block is invalid.",
                    invalidBlockIndex: i,
                    invalidBlock: currentBlock
                };
            }

            // Check if the block's previousHash pointer correctly links to the previous block's hash
            if (currentBlock.previousHash !== previousBlock.hash) {
                return {
                    isValid: false,
                    message: "Chain is broken. A block's previousHash does not match the hash of the preceding block.",
                    invalidBlockIndex: i,
                    invalidBlock: currentBlock
                };
            }
        }
        // If the loop completes without finding issues, the chain is valid
        return { isValid: true };
    }
}

// Export the Blockchain class to be used in other files
module.exports = Blockchain;