import { Routes, Route, Navigate } from "react-router";
import SplashScreen from "./pages/SplashScreen";
import Settings from "./pages/Settings";
import CreateTask from "./pages/CreateTask";
import ViewTasks from "./pages/ViewTasks";
import ConnectWallet from "./pages/ConnectWallet";
import { useSelector } from "react-redux";
import { profileState } from "./store/profileSlice";
import { routes } from "./constants/routes";
import { useTonConnectUI } from "@tonconnect/ui-react";

function App() {

  return (
    <Routes>
      <Route path={routes.splash} element={<SplashScreen />} />
      <Route
        path={routes.settings}
        element={<PrivateRoute path={routes.settings} children={<Settings />} />}
      />
      <Route
        path={routes.create}
        element={<PrivateRoute path={routes.create} children={<CreateTask />} />}
      />
      <Route
        path={routes.view}
        element={<PrivateRoute path={routes.view} children={<ViewTasks />} />}
      />
      <Route
        path={routes.root}
        element={<PrivateRoute path={routes.root} children={<ConnectWallet />} />}
      />
    </Routes>
  );
}

export default App;

function PrivateRoute({ children ,path}) {
  const { wallet, userId } = useSelector(profileState);
    const [tonConnectUi] = useTonConnectUI();
  console.log(wallet,tonConnectUi.c);
  
  if (!userId) return <Navigate to={routes.splash} />;
  
  if ((!wallet || !tonConnectUi.connected) && path===routes.root) return children;
  
  if (path === routes.root) return <Navigate to={routes.view} />

  return children;
}