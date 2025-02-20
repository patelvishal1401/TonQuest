// import { TonClient, WalletContractV4, internal, beginCell, Address } from "ton";
import {
    TonClient,
    Address,
    WalletContractV4,
    internal,
    toNano,

    beginCell,
    external,
} from "@ton/ton";

// import { ContractProvider, Sender, Address } from "@ton/core"

// import { TonConnect } from "@tonconnect/ui-react";
import { envObj as env } from "../constants/env";
import TaskContract from "./task";

const tonClient = new TonClient({
  endpoint: "https://testnet.toncenter.com/api/v2/jsonRPC",
  apiKey: env.tonApiKey,
});

// Initialize TonConnect (For interacting with a wallet like Tonkeeper)

const CONTRACT_ADDRESS = "kQAscQiWNfzg6OH2kU2Gsgh6ru6w7SO6KL4bq1cxyQwCdTX3"; // Replace with your actual contract address
const contract = Address.parse(CONTRACT_ADDRESS);

/**
 * Send a transaction to create a task.
 * @param {number} maxParticipants - Maximum participants for the task.
 * @param {number} rewardAmount - Total reward amount in nanotons.
 * @param {string} description - Task description (converted to cell).
 */
export async function createTask(maxParticipants, rewardAmount, description, publicKey) {
    console.log(publicKey);
    

    const contractAddress = new Address(contract);
    const taskContract = new TaskContract(contractAddress);

    // Step 3: Interact with the contract using the connected wallet
    await taskContract.sendCreateTask(publicKey, 10, '1', 'Description of task');

    // const wallet = WalletContractV4.create({
    //     workchain: 0,
    //     publicKey:Buffer(publicKey,'hex'),
    //     walletId:1
        
    // });
    // console.log(wallet);
    // const client= tonClient.open(wallet)

    // let getMethodResult = await tonClient.runMethod(CONTRACT_ADDRESS, "seqno"); // run "seqno" GET method from your wallet contract
    // let seqno = getMethodResult.stack.readNumber();

 
    // // Build the payload
    // const payload = beginCell()
    //     .storeUint(1, 32) // Op code for createTask
    //     .storeUint(maxParticipants, 32)
    //     .storeCoins(rewardAmount)
    //     .storeRef(beginCell().storeStringTail(description).endCell()) // Store task description
    //     .endCell();
    // console.log(payload);
    
    // const transfer = await client.createTransfer({
    //     seqno,
    //     messages: [
    //         internal({
    //             value: toNano(rewardAmount),
    //             dest: "0QAscQiWNfzg6OH2kU2Gsgh6ru6w7SO6KL4bq1cxyQwCdWgy",
    //             body:  `Create Task with reward ${rewardAmount} and max participants ${maxParticipants}`,  // You would replace this with actual body data
    //         }),
    //     ],
    // });

    // // const taskId = await wallet.runMethod(wallet.address, "create_task", [wallet.address, maxParticipants, rewardAmount, description]);
    // console.log(taskId);
    
    // const message = await client.sendExternalMessage(wallet, transfer);
    // console.log("Transaction sent:", message);

}

/**
 * Send a transaction to complete a task.
 * @param {number} taskId - The task ID to complete.
 */
export async function completeTask(taskId) {
    if (!tonConnect.connected) {
        throw new Error("Wallet not connected");
    }

    const senderAddress = await tonConnect.getWallet().account.address;

    // Build the payload
    const payload = beginCell()
        .storeUint(2, 32) // Op code for completeTask
        .storeUint(taskId, 32)
        .storeAddress(Address.parse(senderAddress)) // Participant address
        .endCell();

    // Send transaction
    await tonConnect.sendTransaction({
        to: contract,
        value: 50000000n, // Minimum storage cost
        payload: payload.toBoc().toString("base64"),
    });

    console.log("Task completion transaction sent!");
}

/**
 * Send a transaction to claim a task reward.
 * @param {number} taskId - The task ID for which to claim the reward.
 */
export async function claimReward(taskId) {
    if (!tonConnect.connected) {
        throw new Error("Wallet not connected");
    }

    const senderAddress = await tonConnect.getWallet().account.address;

    // Build the payload
    const payload = beginCell()
        .storeUint(3, 32) // Op code for claimReward
        .storeUint(taskId, 32)
        .endCell();

    // Send transaction
    await tonConnect.sendTransaction({
        to: contract,
        value: 50000000n, // Minimum storage cost
        payload: payload.toBoc().toString("base64"),
    });

    console.log("Reward claim transaction sent!");
}