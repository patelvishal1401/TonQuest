import { Address, TonClient } from "@ton/ton";
import { envObj } from "../constants/env";
import { addUser, getUser } from "../services/supabase/query";
import TaskContract from "./task";
import { Task } from "./contract.ts";
import { Buffer } from "buffer";

window.Buffer = Buffer;

const telegram = window?.Telegram?.WebApp;

const login = async () => {
    const userDetails = telegram?.initDataUnsafe?.user;
    // const inviteCode = telegram?.initDataUnsafe?.start_param;

    const username = userDetails?.username || `${userDetails?.first_name}`;

    const data = {
        username,
        userId: userDetails?.id || 6564829932,
        // initData: telegram?.initData,
    };
    try {
        const response = await addUser(data)
        if (response.error) {
            const fetchResponse = await getUser(data?.userId);
            if (fetchResponse.error) {
                console.log(fetchResponse.error);
            }
            return fetchResponse.data
        }
        return response.data;
    } catch (error) {
        console.error("Error fetching data:", error);
    }
};

const formatWalletAddress = (address) =>
    address?.substring(0, 5) + "...." + address?.substring(address.length - 5);


 const tonClient = new TonClient({
      endpoint: "https://testnet.toncenter.com/api/v2/jsonRPC",
      apiKey: envObj.tonApiKey,
  });
    

const contractInit = (address) => {
    // const task = new Task(
    //   "kQAFOz3tB-K_UQE2TT-idSkknErErzvdcLg9h9NPC7cxRp1K"
    // );

    const task = Task.createFromAddress(Address.parse("kQBdZkyCZmLfLK1kaHNbfH1HAZ7U_AahXpt2nXuJDvkMr8Nb"));

    return tonClient.open(task);
  }

export { login, telegram, formatWalletAddress ,tonClient, contractInit}