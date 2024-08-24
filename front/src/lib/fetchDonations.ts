import { createClient, parseUnits, formatUnits } from "viem";
import { sepolia } from "viem/chains";
import { DONATE_CONTRACT_ADDRESS } from "./definition";
import { publicClient } from "./client";
// コントラクトのABI
const DONATE_CONTRACT_ABI = [
  {
    inputs: [
      { internalType: "uint256", name: "_startIndex", type: "uint256" },
      { internalType: "uint256", name: "_limit", type: "uint256" },
    ],
    name: "getDonationsPaginated",
    outputs: [
      {
        components: [
          { internalType: "address", name: "donor", type: "address" },
          { internalType: "address", name: "token", type: "address" },
          { internalType: "string", name: "tokenSymbol", type: "string" },
          { internalType: "uint256", name: "amount", type: "uint256" },
          { internalType: "string", name: "message", type: "string" },
          { internalType: "uint256", name: "timestamp", type: "uint256" },
        ],
        internalType: "struct VTuberDonate.Donation[]",
        name: "result",
        type: "tuple[]",
      },
      { internalType: "bool", name: "hasMore", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
];

export const fetchDonations = async (startIndex: bigint, limit: bigint) => {
  try {
    const data = await publicClient.readContract({
      address: DONATE_CONTRACT_ADDRESS,
      abi: DONATE_CONTRACT_ABI,
      functionName: "getDonationsPaginated",
      args: [startIndex, limit],
    });

    const [donationsResult, hasMore] = data as [any[], boolean];

    if (Array.isArray(donationsResult)) {
      const formattedDonations = donationsResult.map((donation: any) => ({
        donor: donation.donor,
        token: donation.token,
        tokenSymbol: donation.tokenSymbol,
        amount: BigInt(donation.amount.toString()),
        message: donation.message,
        timestamp: BigInt(donation.timestamp.toString()),
      }));
      return { donations: formattedDonations.reverse(), hasMore };
    }
    return { donations: [], hasMore };
  } catch (error) {
    console.error("Error fetching donations:", error);
    return { donations: [], hasMore: false };
  }
};
