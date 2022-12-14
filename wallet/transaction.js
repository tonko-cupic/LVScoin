const ChainUtil = require('../chain-util')

class Transaction {
    constructor(){
        this.id = ChainUtil.id();
        this.input = null;
        this.outputs = [];
    }

    static transactionWithOutputs(senderWallet, outputs){
        let transaction = new this();

        transaction.outputs.push(...outputs)
        transaction = Transaction.signTransaction(transaction, senderWallet);

        return transaction;
    }

    static rewardTransaction(minerWallet, blockchainWallet){
        return Transaction.transactionWithOutputs(blockchainWallet, [{
            amount : 10, address: minerWallet.publicKey
        }])
    }

    static newTransaction(senderWallet, recipient, amount){
        let transaction = new this();

        if (amount > senderWallet.balance){
            console.log('Amount exceeds balance!');
            return;
        }
        transaction.outputs.push(...[
            { amount : senderWallet.balance - amount, address : senderWallet.publicKey},
            { amount , address : recipient}
        ])

        transaction = Transaction.signTransaction(transaction, senderWallet);

        return transaction;
    }

    static signTransaction(transaction, senderWallet){
        transaction.input = {
            timestamp : Date.now(),
            amount : senderWallet.balance,
            address : senderWallet.publicKey,
            signature : senderWallet.sign(ChainUtil.hash(transaction.outputs))
        }
        return transaction;
        
    }

    static verifyTransaction(transaction){
        return ChainUtil.verifySignature(transaction.input.address, transaction.input.signature, ChainUtil.hash(transaction.outputs))
    }

}

module.exports = Transaction;