const crypto = require("crypto");

function computeHash(block) {
    return crypto.createHash("sha256")
        .update(
            block.timestamp +
            JSON.stringify(block.transactions) +
            block.prev_hash +
            block.nonce
        )
        .digest("hex");
}

function mineBlock(block) {
    while (true) {
        block.hash = computeHash(block);
        if (block.hash.startsWith("0000")) break;
        block.nonce++;
    }
    return block;
}

module.exports = { computeHash, mineBlock };
