import { formatUnits } from "viem";
import { publicClient } from "./client";
import { USDC_ADDRESS } from "./definition";

// USDC Contract ABI (必要な部分のみ)
const USDC_ABI = [
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    type: "function",
  },
];

export const fetchUsdcBalance = async (address: string): Promise<string> => {
  try {
    const balance = await publicClient.readContract({
      address: USDC_ADDRESS,
      abi: USDC_ABI,
      functionName: "balanceOf",
      args: [address],
    });

    // USDCは6桁の小数点を持つため、6を使用
    return formatUnits(balance as bigint, 6);
  } catch (error) {
    console.error("Error fetching USDC balance:", error);
    return "0";
  }
};
