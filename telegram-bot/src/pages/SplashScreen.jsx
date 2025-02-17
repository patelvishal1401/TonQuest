import { LoadingOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { profileState } from "../store/profileSlice";
import { useNavigate } from "react-router";
import {  useEffect } from "react";
import { routes } from "../constants/routes";

function SplashScreen() {
  const profile = useSelector(profileState);
  // const inviteCode = telegram?.initDataUnsafe?.start_param;
  // const squadInvite = inviteCode && inviteCode?.split("--")?.[0];
  // const squadname = inviteCode && inviteCode?.split("--")?.[1];
  // const { setPopupStatus } = useContext(Context);

  const navigate = useNavigate();

  useEffect(() => {
    if (profile?.userId) {
      navigate(routes.root);
    }
  }, [profile?.userId]);

  return (
    <div className='flex flex-col items-center justify-center w-full h-screen gap-2 text-white bg-black '>
      {/* <img src='/assets/images/introLogo.jpg' className='w-full h-1/2' /> */}

      {profile.message ? (
        <>
          <p>Error occurred</p>
          <p>Try again after some time</p>
        </>
      ) : (
        <LoadingOutlined spin delay={500} className='text-4xl text-white' />
      )}
    </div>
  );
}

export default SplashScreen;
