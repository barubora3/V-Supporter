"use client";
import { createThirdwebClient } from "thirdweb";
import { ConnectButton, lightTheme } from "thirdweb/react";
import { sepolia } from "thirdweb/chains";
import { useEffect, useState } from "react";
import { USDC_ADDRESS } from "@/lib/definition";
const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID!,
});

export default function LoginButton() {
  return (
    <ConnectButton
      client={client}
      accountAbstraction={{
        chain: sepolia,
        sponsorGas: true,
      }}
      detailsButton={{ displayBalanceToken: { [sepolia.id]: USDC_ADDRESS } }}
      theme={lightTheme({})}
      //   locale="ja_JP"
    />
  );
}
