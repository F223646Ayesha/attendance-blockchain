const Block = require("./Block");

class DepartmentChain {
    constructor(deptName) {
        this.deptName = deptName;
        this.chain = [this.createGenesisBlock()];
    }

    createGenesisBlock() {
        const block = new Block(
            0,
            Date.now(),
            { type: "GENESIS", chain: this.deptName },
            ""
        );
        block.mine();
        return block;
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    addBlock(data) {
        const last = this.getLatestBlock();
        const block = new Block(
            last.index + 1,
            Date.now(),
            data,
            last.hash
        );
        block.mine();
        this.chain.push(block);
        return block;
    }
    isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
        const current = this.chain[i];
        const prev = this.chain[i - 1];

        // Check hash recalculation
        if (current.hash !== current.calculateHash()) {
            return false;
        }

        // Check previous hash linking
        if (current.prev_hash !== prev.hash) {
            return false;
        }

        // Check PoW difficulty
        if (!current.hash.startsWith("0000")) {
            return false;
        }
    }

    return true;
}
getLatestBlock() {
    return this.chain[this.chain.length - 1];
}

}


module.exports = DepartmentChain;
