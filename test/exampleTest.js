const etherlime = require('etherlime');
const ethers = require('ethers');
const POWFaucet = require('../build/POWFaucet.json');


describe('Example', () => {
    let aliceAccount = accounts[3];
    let bobsAccount = accounts[4];
    let deployer;
    let faucetInstance;
    let difficulty;

    const mine = function (sender, recipient, difficulty) {
        nonce = ethers.utils.bigNumberify(Math.ceil((Math.random() * 100000) % 10000));
        while (true) {
            const hash = ethers.utils.bigNumberify(ethers.utils.solidityKeccak256(["address", "address", "uint256"], [sender, recipient, nonce]))

            if (hash.lt(difficulty)) {
                return nonce
            }
            nonce = nonce.add(1)
        }
    }

    beforeEach(async () => {
        deployer = new etherlime.EtherlimeGanacheDeployer(aliceAccount.secretKey);
        difficulty = ethers.utils.bigNumberify(2);
        difficulty = difficulty.pow(245)
        faucetInstance = await deployer.deploy(POWFaucet, {}, difficulty);
    });


    it('should create lime from another account', async () => {
        const storedDiff = await faucetInstance.difficulty();
        assert(storedDiff.eq(difficulty), "Difficulties are not the same");
    })

    it('should be able to fund faucet', async () => {
        const sendAmount = ethers.utils.parseEther('10.0')

        const tx = await aliceAccount.signer.sendTransaction({
            to: faucetInstance.contractAddress,
            value: sendAmount
        });
        const balance = await deployer.provider.getBalance(faucetInstance.contractAddress)
        assert(balance.eq(sendAmount), "Balance not updated");

    })
    describe('Funded faucet', () => {

        beforeEach(async () => {
            const sendAmount = ethers.utils.parseEther('10.0')

            const tx = await aliceAccount.signer.sendTransaction({
                to: faucetInstance.contractAddress,
                value: sendAmount
            });
        })

        it('should be able to mine', async () => {
            // TODO get bob balance
            const nonce = mine(aliceAccount.signer.address, bobsAccount.signer.address, difficulty)
            const tx = await faucetInstance.from(aliceAccount).requestFunding(bobsAccount.signer.address, nonce)

            const balance = await deployer.provider.getBalance(faucetInstance.contractAddress)
            assert(balance.eq(ethers.utils.parseEther('9.0')), "Balance not updated");
        })

        it('should revert on already used proof', async () => {
            const nonce = mine(aliceAccount.signer.address, bobsAccount.signer.address, difficulty)
            const tx1 = await faucetInstance.from(aliceAccount).requestFunding(bobsAccount.signer.address, nonce)
            await assert.revert(faucetInstance.from(aliceAccount).requestFunding(bobsAccount.signer.address, nonce))
        })

        it('should revert on wrong sender', async () => {
            const nonce = mine(aliceAccount.signer.address, bobsAccount.signer.address, difficulty)
            await assert.revert(faucetInstance.from(bobsAccount).requestFunding(bobsAccount.signer.address, nonce))
        })

        it('should revert on wrong recepient', async () => {
            const nonce = mine(aliceAccount.signer.address, bobsAccount.signer.address, difficulty)
            await assert.revert(faucetInstance.from(aliceAccount).requestFunding(aliceAccount.signer.address, nonce))
        })

        it('should revert on wrong nonce', async () => {
            await assert.revert(faucetInstance.from(aliceAccount).requestFunding(aliceAccount.signer.address, 0))
        })
    })

});