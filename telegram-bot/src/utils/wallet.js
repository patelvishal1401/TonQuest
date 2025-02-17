import {
  TonClient,
  Address,
  WalletContractV4,
  internal,
  toNano,
} from "@ton/ton";
import {  mnemonicToPrivateKey } from "@ton/crypto";
import { envObj as env } from "../constants/env";

const client = new TonClient({
  endpoint: "https://testnet.toncenter.com/api/v2/jsonRPC",
  apiKey: env.tonApiKey,
});

const fetchBalance = async (address) => {
  const balance = await client.getBalance(address);

  // Convert balance from nanoTON to TON
  const balanceInTON = Number(balance) / 1e9;

  console.log(`Balance of ${address}: ${balanceInTON} TON`);
  return balanceInTON;
};

const getAddress = async () => {

    const mnemonic = env.passphrase.split(" ");
  const keyPair = await mnemonicToPrivateKey(mnemonic);
  const wallet = WalletContractV4.create({
    workchain: 0, // Workchain ID (0 for basechain)
    publicKey: keyPair.publicKey,
  });
  let contract = client.open(wallet);
  const walletAddress = wallet.address;
  console.log("Wallet Address:", walletAddress.toString());
  return { mnemonic, keyPair, wallet, contract };
};

const transferTON = async ({ address, value }) => {
  try {
    const { keyPair, wallet, contract } = await getAddress();

    const recipientAddress = Address.parse(address);

    let seqno = await contract.getSeqno();

    const transfer = await contract.createTransfer({
      seqno: seqno, // Get current seqno
      secretKey: keyPair.secretKey,
      messages: [
        internal({
          bounce: false,
          to: recipientAddress,
          value: toNano(value),
          // body: "Hello from TON!", // optional message!
        }),
      ],
    });

    await client
      .sendExternalMessage(contract, transfer)
      .then((data) => console.log(data));
    return true;
  } catch (error) {
    console.log(error);

    return false;
  }
};

export { fetchBalance, transferTON };
