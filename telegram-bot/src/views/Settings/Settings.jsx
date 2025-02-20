import { useEffect, useState } from "react";
import { User, Wallet, ArrowDownToLine } from "lucide-react";
import { useSelector } from "react-redux";
import { profileState } from "../../store/profileSlice";
import { contractInit, formatWalletAddress } from "../../utils/helper";
import { useTonConnectUI } from "@tonconnect/ui-react";
import { MdContentCopy } from "react-icons/md";
import { LuCopyCheck } from "react-icons/lu";
import { useNavigate } from "react-router";
import { routes } from "../../constants/routes";
import { TonClient } from "@ton/ton";
import { envObj } from "../../constants/env";
import { getUser, updateUser } from "../../services/supabase/query";
import { transferTON } from "../../utils/wallet";
import { BtnLoader } from "../../components/Loader";
import { useTonConnect } from "../../hooks/useTonConnect";
import ViewTasks from "./CompletedTask";


const Settings = () => {
  const [tonConnectUi] = useTonConnectUI();
  const profile = useSelector(profileState);
  const [balance, setBalance] = useState(0); // Example balance, replace with actual balance
  const [isCopied, setIsCopied] = useState(false); // State to manage copy icon toggle
  const [rewards, setRewards] = useState(0)
  const [loading, setLoading] = useState(false);
  const { sender } = useTonConnect();


  useEffect(() => {
    const fetchBalance = async () => {
      if (!profile?.wallet) return; 
      // Initialize TonClient
      const client = new TonClient({
        endpoint: envObj.envType === "dev" ? 
        "https://testnet.toncenter.com/api/v2/jsonRPC" : 
        "https://toncenter.com/api/v2/jsonRPC",
      });
      try {
        // Fetch the balance
        const balance = await client.getBalance(profile.wallet);
        setBalance(Number(balance));
      } catch (error) {
        console.error("Error fetching balance:", error);
      }
    };

    fetchBalance();
  }, [profile?.wallet]);


  
  useEffect(() => {
    const fetchBalance = async () => {
      const user = await getUser(profile?.userId);
      setRewards(user.data[0]?.rewards);
      
    };

    fetchBalance();
  }, [profile?.wallet]);




  const navigate = useNavigate()
  


  const handleWithdraw = async () => {
    
    const contract = contractInit();
    const claim=contract.sendClaimReward(sender,{taskId:1})


    // setLoading(true);
    //   const conversionRate = 1000;
    //   const value = rewards / conversionRate;
    //   const transferResponse = await transferTON({
    //     address: tonConnectUi.account.address,
    //     value,
    //   });

    // if (!transferResponse) {
    // setLoading(false);
    //   return
    // };
    
      
    // const updateResponse = await updateUser({ data: { rewards: 0 }, userId: profile?.userId });
    // if (updateResponse.error)
    // {
    // setLoading(false);
      
    //   return
    // }

    //   setRewards(updateResponse?.data?.[0]?.rewards)
      
    





    // setLoading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(profile?.wallet).then(() => {
      setIsCopied(true); // Show the checkmark icon
      setTimeout(() => setIsCopied(false), 1000);
    });
  };

  const handleLogout = () => {
    tonConnectUi.disconnect().then(()=>navigate(routes.root))
  }

  return (
    <div className='px-4 overflow-auto '>
      <div className='pb-8 space-y-8'>
        <div>
          <h2 className='text-2xl font-medium tracking-tight'>Settings</h2>
          <p className='text-neutral-600'>Manage your preferences here.</p>
        </div>

        {/* Profile Section */}
        <div className='p-6 space-y-6 bg-white border rounded-lg border-neutral-200'>
          <div className='flex items-center gap-4'>
            <div className='flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full'>
              <User className='w-8 h-8 text-purple-600' />
            </div>
            <div>
              <h3 className='text-lg font-medium'>{ profile?.username}</h3>
              <p className='text-sm text-neutral-600'>Connected with TON</p>
            </div>
          </div>
        </div>

        {/* Wallet Section */}
        <div className='p-6 space-y-4 bg-white border rounded-lg border-neutral-200'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Wallet className='w-5 h-5 text-purple-600' />
              <h3 className='font-medium'>Wallet Address</h3>
            </div>
            <button
              className='text-sm text-purple-600 hover:text-purple-700'
              onClick={handleCopy}
            >
              {isCopied ? (
                <LuCopyCheck className='w-5 h-5' />
              ) : (
                <MdContentCopy className='w-5 h-5' />
              )}
            </button>
          </div>
          <div className="flex items-center justify-between">
              <p className="p-3 font-mono text-sm break-all rounded-md bg-neutral-50 w-[13rem] text-center">
                {formatWalletAddress(profile?.wallet)}
              </p>
            <button
              onClick={handleLogout}
                className="px-2 py-1 bg-purple-600 text-white rounded text-[10px] hover:bg-[#8b75f3]"
              >
                Disconnect
              </button>
          </div>
        </div>

        {/* Rewards Section */}
        <div className='p-6 bg-white border rounded-lg border-neutral-200'>
          <div className='flex flex-col items-center space-y-4 text-center'>
            <h3 className='font-medium'>Available Rewards</h3>
            <ViewTasks/>
            {/* <p className='text-3xl font-bold text-purple-600'>{rewards}</p>
            <button
              onClick={handleWithdraw}
              className='flex items-center justify-center w-full gap-2 px-6 py-2 text-white transition-colors bg-purple-600 rounded-md hover:bg-purple-700'
            >
              <ArrowDownToLine className='w-5 h-5' />
              Withdraw Rewards {loading ? <BtnLoader/>:null}
            </button> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;