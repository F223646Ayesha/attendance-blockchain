const Block = require("./Block");
const DepartmentChain = require("./DepartmentChain");

class ClassChain {
    constructor(className, deptJson, classJson = null) {

        // Restore Department Chain
        const restoredDept = new DepartmentChain(deptJson.deptName);
        restoredDept.chain = deptJson.chain;

        const parentLast = restoredDept.getLatestBlock();

        // Use updated class name if available in DB
        this.className = classJson?.className || className;

        // Restore chain if editing existing class
        this.chain = classJson?.chain || [
            this.createGenesisBlock(parentLast.hash)
        ];

        // Restore students if available
        this.students = classJson?.students || {};
    }

    createGenesisBlock(prevHash) {
        const block = new Block(
            0,
            Date.now(),
            { type: "GENESIS_CLASS", class: this.className },
            prevHash
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

        if (current.hash !== current.calculateHash()) return false;
        if (current.prev_hash !== prev.hash) return false;
        if (!current.hash.startsWith("0000")) return false;
    }

    return true;
}
getLatestBlock() {
    return this.chain[this.chain.length - 1];
}

}

module.exports = ClassChain;
