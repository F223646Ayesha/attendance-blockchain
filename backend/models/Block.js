// models/Block.js
const crypto = require("crypto");

class Block {
  constructor(index, timestamp, transactions, prev_hash) {
    this.index = index;
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.prev_hash = prev_hash;
    this.nonce = 0;
    this.hash = this.computeHash();
  }

  computeHash(nonceOverride = null) {
    const nonceToUse = nonceOverride !== null ? nonceOverride : this.nonce;

    return crypto
      .createHash("sha256")
      .update(
        String(this.index) +
          String(this.timestamp) +
          JSON.stringify(this.transactions) +
          String(this.prev_hash ?? "") +
          String(nonceToUse)
      )
      .digest("hex");
  }

  mine(difficulty = 4) {
    while (!this.hash.startsWith("0000")) {
      this.nonce++;
      this.hash = this.computeHash();
    }
  }
}

module.exports = Block;
