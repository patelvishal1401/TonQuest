import { toNano } from '@ton/core';
import { Task } from '../wrappers/Task';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const task = provider.open(Task.createFromConfig({}, await compile('Task')));

    await task.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(task.address);

    // run methods on `task`
}

// import * as fs from 'fs';
// import { getHttpEndpoint } from '@orbs-network/ton-access';
// import { mnemonicToWalletKey } from '@ton/crypto';
// import { TonClient, Cell, WalletContractV4, toNano } from '@ton/ton';
// import { Task } from '../wrappers/Task';

// export async function run() {
//     // Initialize TON client
//     const endpoint = await getHttpEndpoint({ network: 'testnet' });
//     const client = new TonClient({ endpoint });

//     // Load contract code
//     const counterCode = Cell.fromBoc(fs.readFileSync('build/task.cell'))[0];
//     const task = Task.createFromConfig({}, counterCode);

//     console.log('Contract address:', task.address.toString());

//     // Check if contract is already deployed
//     if (await client.isContractDeployed(task.address)) {
//         return console.log('Task contract already deployed');
//     }

//     // Load wallet from mnemonic
//     const mnemonic = "system mystery wash moment license candy desk wheat brother faint era stable puppy report hand over divide leopard range program interest power slim distance"; // Replace with your mnemonic
//     const key = await mnemonicToWalletKey(mnemonic.split(' '));
//     const wallet = WalletContractV4.create({ publicKey: key.publicKey, workchain: 0 });

//     // Open wallet and get sender
//     const walletContract = client.open(wallet);
//     const walletSender = walletContract.sender(key.secretKey);

//     // Check if wallet is deployed
//     if (!await client.isContractDeployed(wallet.address)) {
//         console.log('Deploying wallet...');
//         await walletContract.sendDeploy(walletSender);
//         await sleep(5000); // Wait for deployment to complete
//     }

//     // Open the task contract
//     const taskContract = client.open(task);

//     // Deploy the contract
//     try {
//         console.log('Deploying task contract...');
//         await taskContract.sendDeploy(walletSender, toNano('1'));
//     } catch (error) {
//         console.error('Deployment failed:', error);
//         return;
//     }

//     // Wait for deployment to confirm
//     let currentSeqno = await walletContract.getSeqno();
//     while (true) {
//         console.log('Waiting for deploy transaction to confirm...');
//         await sleep(1500);
//         const newSeqno = await walletContract.getSeqno();
//         if (newSeqno > currentSeqno) {
//             console.log('Deploy transaction confirmed!');
//             break;
//         }
//     }
// }

// function sleep(ms: number) {
//     return new Promise(resolve => setTimeout(resolve, ms));
// }