import { createPublicClient, http } from "viem";

const ALCHEMY_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY; // Alchemy の API キー

export const publicClient = createPublicClient({
  transport: http(`https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`),
});
