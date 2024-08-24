// npx hardhat ignition deploy ignition/modules/VTuberDonateFactoryDeployment.ts --network sepolia --verify

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

// デプロイパラメータを直接定義
const DEPLOY_PARAMS = {
  DEFAULT_SERVICE_FEE_WALLET: "0x2e4B8ea28136Eae64FCE57F72a04CD732D7Db7cC", // サービス手数料を受け取るウォレットアドレス
  DEFAULT_FEE_PERCENTAGE: 0, // 0%
  INITIAL_VTUBER_WALLET: "0x2e4B8ea28136Eae64FCE57F72a04CD732D7Db7cC", // 初期VTuberのウォレットアドレス
};

export default buildModule("VTuberDonateFactoryDeployment", (m) => {
  // VTuberDonateFactoryのデプロイ
  const factory = m.contract("VTuberDonateFactory", [
    DEPLOY_PARAMS.DEFAULT_SERVICE_FEE_WALLET,
    DEPLOY_PARAMS.DEFAULT_FEE_PERCENTAGE,
  ]);

  // 初期VTuberDonateコントラクトの作成（オプション）
  if (DEPLOY_PARAMS.INITIAL_VTUBER_WALLET !== "") {
    const initialDonateContract = m.call(factory, "createDonateContract", [
      DEPLOY_PARAMS.INITIAL_VTUBER_WALLET,
    ]);
  }

  return { factory };
});
