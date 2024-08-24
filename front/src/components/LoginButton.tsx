"use client";
import { createThirdwebClient } from "thirdweb";
import {
  ConnectButton,
  lightTheme,
  useActiveWallet,
  useActiveAccount,
  useSendTransaction,
} from "thirdweb/react";
import { sepolia } from "thirdweb/chains";
import { useEffect, useState } from "react";
import { USDC_ADDRESS } from "@/lib/definition";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { InfoIcon } from "lucide-react";

const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID!,
});

export default function LoginButton() {
  const wallet = useActiveWallet();
  const [address, setAddress] = useState("");

  const updateAddress = async () => {
    if (wallet) {
      setAddress((await wallet?.getAccount())?.address || "");
    }
  };
  useEffect(() => {
    updateAddress();
  }, [wallet]);

  return (
    <div className="flex items-center space-x-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <a
              href={`https://faucet.circle.com/`}
              target="_blank"
              className={`inline-flex items-center justify-center bg-blue-500 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200 ${
                !address
                  ? "opacity-50 cursor-not-allowed pointer-events-none"
                  : "hover:bg-blue-600"
              }`}
            >
              USDC Faucet
              <InfoIcon className="ml-2 h-4 w-4" />
            </a>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p className="font-semibold">
              You can get Testnet USDC Token by Faucet.
            </p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <a
              href={`https://global-stg.transak.com?apiKey=${process.env
                .NEXT_PUBLIC_TRANSAK_API_KEY!}&environment=STAGING&fiatCurrency=JPY&fiatAmount=5000&cryptoCurrencyCode=USDC&walletAddress=${address}`}
              target="_blank"
              className={`inline-flex items-center justify-center bg-blue-500 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200 ${
                !address
                  ? "opacity-50 cursor-not-allowed pointer-events-none"
                  : "hover:bg-blue-600"
              }`}
            >
              Buy USDC
              <InfoIcon className="ml-2 h-4 w-4" />
            </a>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p>
              This is a hackathon test environment.
              <br /> You can complete the payment demo, <br />
              but no USDC will be sent to you after the transaction.
              <br /> Please use the following dummy information:
            </p>
            <ul className="list-disc pl-5 mt-2 list-none">
              <li>Card Number: 4111 1111 1111 1111</li>
              <li>Expiration: Any future date</li>
              <li>CVV: Any 3 digits</li>
              <li>Personal Info: Any dummy data</li>
            </ul>
            <p className="mt-2 text-sm text-gray-500">
              For KYC, use &quot;Doe&quot; as First Name and &quot;Jane&quot; as
              Last Name.
            </p>
            <p className="mt-2 text-sm text-gray-500">
              For more details, refer to the{" "}
              <a
                href="https://docs.transak.com/docs/test-credentials#blockchain-testnets"
                target="_blank"
                className="text-blue-500 hover:underline"
              >
                Transak documentation
              </a>
              .
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <ConnectButton
        client={client}
        accountAbstraction={{
          chain: sepolia,
          sponsorGas: true,
        }}
        detailsButton={{
          displayBalanceToken: { [sepolia.id]: USDC_ADDRESS },
        }}
        theme={lightTheme({})}
      />
    </div>
  );
}
