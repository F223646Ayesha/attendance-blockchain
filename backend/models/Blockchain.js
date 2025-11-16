const Block = require("./Block");
const { computeHash, mineBlock } = require("../utils/crypto");

class Blockchain {
    constructor(name) {
        this.name = name;
        this.chain = [];
    }

    createGenesisBlock(prev_hash = "") {
        const block = new Block(
            0,
            Date.now().toString(),
            { type: "GENESIS", chain: this.name },
            prev_hash
        );
        return mineBlock(block);
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    addBlock(transactions) {
        const block = new Block(
            this.chain.length,
            Date.now().toString(),
            transactions,
            this.getLatestBlock().hash
        );
        return mineBlock(block);
    }
}

module.exports = Blockchain;
