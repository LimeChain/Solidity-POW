// Ex. node scripts/mine.js 0xD9995BAE12FEe327256FFec1e3184d492bD94C31 0xd4Fa489Eacc52BA59438993f37Be9fcC20090E39 1766847064778384329583297500742918515827483896875618958121606201292619776

const ethers = require('ethers');

const run = () => {

	if (process.argv.length < 5) {
		throw new Error('Invalid arguments');
	}

	const senderAddress = process.argv[2];
	const recepientAddress = process.argv[3];
	const difficulty = process.argv[4];

	const nonce = mine(senderAddress, recepientAddress, ethers.utils.bigNumberify(difficulty))

	console.log(nonce.toString());

}


const mine = (sender, recipient, difficulty) => {
	nonce = ethers.utils.bigNumberify(Math.ceil((Math.random() * 1000000000000) % 100000000000));
	while (true) {
		const hash = ethers.utils.bigNumberify(ethers.utils.solidityKeccak256(["address", "address", "uint256"], [sender, recipient, nonce]))

		if (hash.lt(difficulty)) {
			return nonce
		}
		nonce = nonce.add(1)
	}
}

run()