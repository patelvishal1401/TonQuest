import { BrowserRouter as Router } from "react-router";
import { TonConnectUIProvider } from "@tonconnect/ui-react";
import { store } from "./store";
import { Provider as StoreProvider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { persistStore } from "redux-persist";
import ContextWrapper from "./components/ContextWrapper";
import { envObj } from "./constants/env";

export const persistor = persistStore(store);

function Provider({ children }) {
  return (
    <TonConnectUIProvider
      actionsConfiguration={{ twaReturnUrl: envObj.botUrl }}
      manifestUrl='https://ton-connect.github.io/demo-dapp-with-wallet/tonconnect-manifest.json'
    >
      <StoreProvider store={store}>
        <PersistGate loading={false} persistor={persistor}>
          <Router>
            <ContextWrapper>{children}</ContextWrapper>
          </Router>
        </PersistGate>
      </StoreProvider>
    </TonConnectUIProvider>
  );
}

export default Provider;
