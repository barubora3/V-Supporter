// npx hardhat ignition deploy ignition/modules/StreamMementoNFT.ts --network sepolia --verify

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("StreamMementoNFTDeployment", (m) => {
  // StreamMementoNFTのデプロイ
  const streamMementoNFT = m.contract("StreamMementoNFT", []);

  return { streamMementoNFT };
});
