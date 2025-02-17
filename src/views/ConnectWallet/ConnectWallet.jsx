import TonWallet from "../../components/TonWallet";

const ConnectWallet = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full max-w-md p-8">
        <div className="p-8 rounded-xl bg-white/80 backdrop-blur-sm">
          
          <h2 className="mb-8 text-2xl font-semibold text-center text-purple-600">
            Connect your wallet to continue
          </h2>
          <div className="flex justify-center">
            <TonWallet/>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectWallet;