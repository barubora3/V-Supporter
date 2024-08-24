// npx hardhat ignition deploy ignition/modules/DonateDeploy.ts --network sepolia --verify

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

// デプロイパラメータを直接定義
const DEPLOY_PARAMS = {
  VTUBER_WALLET: "0x2e4B8ea28136Eae64FCE57F72a04CD732D7Db7cC", // VTuberのウォレットアドレス
  SERVICE_FEE_WALLET: "0x2e4B8ea28136Eae64FCE57F72a04CD732D7Db7cC", // サービス手数料を受け取るウォレットアドレス
  FEE_PERCENTAGE: 0, // 0%
};

export default buildModule("VTuberDonateDeployment", (m) => {
  // VTuberDonateのデプロイ
  const vtuberDonate = m.contract("VTuberDonate", [
    DEPLOY_PARAMS.VTUBER_WALLET,
    DEPLOY_PARAMS.SERVICE_FEE_WALLET,
    DEPLOY_PARAMS.FEE_PERCENTAGE,
  ]);

  return { vtuberDonate };
});
