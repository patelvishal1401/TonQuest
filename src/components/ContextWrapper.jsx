import { createContext, useEffect } from "react";
import { telegram } from "../utils/helper";
import { useSelector, useDispatch } from "react-redux";
import { profileState, profileFn } from "../store/profileSlice";
import { login } from "../utils/helper";
import { getUser } from "../services/supabase/query";
import { useTonAddress, useTonConnectUI } from "@tonconnect/ui-react";

export const Context = createContext();

export default function ContextWrapper({ children }) {
  const profile = useSelector(profileState);
  const dispatch = useDispatch();
  const [tonConnectUi] = useTonConnectUI();
  const userFriendlyAddress = useTonAddress();

  useEffect(() => {
    if (!telegram.isExpanded) {
      telegram.expand();
      telegram.enableClosingConfirmation();
    }
    const fetchData = async () => {
      if (profile?.userId === "") {
        const result = await login();

        console.log(result);
        if (result && result.length) {
          console.log(tonConnectUi.connected);

          //   const chatId = telegram?.initDataUnsafe?.user?.id;
          const userInfo = tonConnectUi?.connected
            ? { ...result?.[0], wallet: userFriendlyAddress }
            : result?.[0];
          dispatch(profileFn(userInfo));
        }
      }
    };

    fetchData();
  }, [profile?.userId]);

  const getProfileInfo = async () => {
    const response = await getUser(profile?.userId);

    if (response) {
      dispatch(profileFn(response?.[0]));
    }
    console.log(response);
    return response;
  };


  return (
    <Context.Provider
      value={{
        getProfileInfo,
      }}
    >
      {children}
    </Context.Provider>
  );
}
