const Block = require("./Block");

class StudentChain {
    constructor(studentData, classJson) {

        // Get parent's last block hash
        const parentLast = classJson.chain[classJson.chain.length - 1].hash;

        this.student = studentData;

        this.chain = [
            this.createGenesisBlock(parentLast)
        ];
    }

    createGenesisBlock(prevHash) {
        const block = new Block(
            0,
            Date.now(),
            { type: "GENESIS_STUDENT", student: this.student },
            prevHash
        );
        block.mine(); // REQUIRED
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
    addAttendance(status) {
    const last = this.getLatestBlock();

    const block = new Block(
        last.index + 1,
        Date.now(),
        {
            type: "ATTENDANCE",
            status: status
        },
        last.hash
    );

    block.mine();
    this.chain.push(block);
    return block;
}

    // Clean student validation (matches validationController)
    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const cur = this.chain[i];
            const prev = this.chain[i - 1];

            // recompute hash exactly like Block.js
            const recalculated = new Block(
                cur.index,
                cur.timestamp,
                cur.transactions,
                cur.prev_hash
            ).computeHash(cur.nonce);

            if (cur.hash !== recalculated) return false;
            if (cur.prev_hash !== prev.hash) return false;
            if (!cur.hash.startsWith("0000")) return false;
        }
        return true;
    }
}

module.exports = StudentChain;
