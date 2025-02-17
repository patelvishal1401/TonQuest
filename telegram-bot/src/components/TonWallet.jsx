import {
  useTonConnectUI,
  useTonAddress,
} from "@tonconnect/ui-react";
import { updateUser } from "../services/supabase/query";
import { useDispatch, useSelector } from "react-redux";
import { profileFn, profileState } from "../store/profileSlice";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { routes } from "../constants/routes";

function TonWallet() {
  const [tonConnectUi] = useTonConnectUI();
  const userFriendlyAddress = useTonAddress();
  const profile = useSelector(profileState);
  const dispatch = useDispatch()
  const navigate=useNavigate()

  const connectWallet = async () => {
    const response = await tonConnectUi.openModal();
    console.log(response);
  };

  useEffect(() => {
    (async () => {
      if (tonConnectUi?.connected && profile?.userId) {
        const response = await updateUser({
          data: { wallet: userFriendlyAddress },
          userId: profile.userId,
        });
        console.log(response);
        if (response.error) {
          return;
        }
        dispatch(profileFn({ wallet: userFriendlyAddress }));
        navigate(routes.view)

      }
    })();
  }, [tonConnectUi?.connected]);

  return (
    <div className='flex flex-col items-center gap-6 p-8 rounded-xl bg-white/5 backdrop-blur-sm '>
      <div className='flex flex-wrap justify-center '>
        <button
          onClick={connectWallet}
          className='px-6 py-2.5 bg-purple-600 text-white rounded-lg font-medium 
          transition-all duration-300 hover:bg-[#8b75f3] hover:shadow-lg 
          hover:shadow-purple-500/20 active:scale-95'
        >
          Connect Wallet
        </button>
      </div>
    </div>
  );
}

export default TonWallet;
