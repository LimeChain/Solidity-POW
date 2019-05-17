const etherlime = require('etherlime');
const ethers = require('ethers');
const POWFaucet = require('../build/POWFaucet.json');


const deploy = async (network, secret, etherscanApiKey) => {
	console.log(etherscanApiKey)
	difficulty = ethers.utils.bigNumberify(2);
	difficulty = difficulty.pow(240)

	const deployer = new etherlime.InfuraPrivateKeyDeployer(secret, network, "ede61953adb34beeb5106a2c0c61f200", { etherscanApiKey });
	const faucetInstance = await deployer.deployAndVerify(POWFaucet, {}, difficulty);

	const sendAmount = ethers.utils.parseEther('10.0')

	const tx = await deployer.signer.sendTransaction({
		to: faucetInstance.contractAddress,
		value: sendAmount
	});

	await faucetInstance.verboseWaitForTransaction(tx, "Funding")

};

module.exports = {
	deploy
};