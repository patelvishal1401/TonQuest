import { addUser, getUser } from "../services/supabase/query";
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

export { login, telegram, formatWalletAddress }