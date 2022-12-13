const express = require('express')
const Blockchain = require('../blockchain');
const bodyParser = require('body-parser')
const P2PServer = require('../p2p-server');
const Wallet = require('../wallet/wallet');
const TransactionPool = require('../wallet/transaction-pool');
const Miner = require('./miner');


const PORT = process.env.PORT || 3001;

const app = express()
const bc = new Blockchain();


const wallet = new Wallet();
const tp = new TransactionPool();
const p2pServer = new P2PServer(bc,tp);
const miner = new Miner(bc, tp, wallet, p2pServer)

app.use(bodyParser.json());


app.get('/blocks', (req,res)=> {
    res.json(bc.chain);
})

app.post('/mine', (req,res) => {
    const block = bc.addBlock(req.body.data);
    console.log('New block added: '+ block.toString())

    p2pServer.syncChains();


    res.redirect('/blocks')

})


app.get('/transactions', (req,res) => {
    res.json(tp.transactions);
})

app.post('/transact', (req,res) => {
    const { recipient, amount} = req.body;
    const transaction = wallet.createTransaction(recipient, amount,bc, tp);
    console.log(transaction, '22')
    p2pServer.broadcastTransaction(transaction);


    res.redirect('/transactions')
})

app.get('/public-key', (req,res) => {
    res.json({ publicKey : wallet.publicKey});
})

app.get('/mine-transactions', (req,res) => {
    const block = miner.mine();
    console.log('new block has been added!'+block.toString())
    res.redirect('/blocks')
})





app.listen(PORT, () => {
    console.log('Listening on port '+PORT);
})
p2pServer.listen();