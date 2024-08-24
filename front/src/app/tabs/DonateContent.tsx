"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DONATE_CONTRACT_ADDRESS, USDC_ADDRESS } from "@/lib/definition";
import { parseUnits, formatUnits } from "viem";
import { getContract, readContract, prepareContractCall } from "thirdweb";
import { sepolia } from "thirdweb/chains";
import {
  useActiveAccount,
  useSendBatchTransaction,
  useReadContract,
} from "thirdweb/react";
import { createThirdwebClient } from "thirdweb";
import { approve } from "thirdweb/extensions/erc20";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Check, X, RefreshCw, Loader2 } from "lucide-react";
import { fetchDonations } from "@/lib/fetchDonations";

const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID!,
});

interface Donation {
  donor: string;
  token: string;
  tokenSymbol: string;
  amount: bigint;
  message: string;
  timestamp: bigint;
}

export const DonateContent: React.FC = () => {
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [donations, setDonations] = useState<Donation[]>([]);
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showCheck, setShowCheck] = useState(false);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const itemsPerPage = 10;

  const activeAccount = useActiveAccount();
  const { mutate: sendBatch } = useSendBatchTransaction();

  const usdcContract = getContract({
    client,
    address: USDC_ADDRESS,
    chain: sepolia,
  });

  const donateContract = getContract({
    client,
    address: DONATE_CONTRACT_ADDRESS,
    chain: sepolia,
  });

  const fetchDonationsData = async () => {
    setIsLoading(true);
    const { donations: newDonations, hasMore: more } = await fetchDonations(
      BigInt((page - 1) * itemsPerPage),
      BigInt(itemsPerPage)
    );
    setDonations(newDonations);
    setHasMore(more);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchDonationsData();
  }, [page]);

  const totalPages = Math.ceil(donations.length / itemsPerPage);
  const paginatedDonations = donations.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const handleDonate = async () => {
    if (!amount || !activeAccount) return;
    const amountInTokenUnits = parseUnits(amount, 6); // USDC has 6 decimal places

    try {
      setShowModal(true); // モーダルを表示
      setIsLoading(true);

      // 承認トランザクションの作成
      const approveTx = approve({
        contract: usdcContract,
        amount: amount,
        spender: donateContract.address,
      });

      // 寄付トランザクションの作成
      const donateTx = prepareContractCall({
        contract: donateContract,
        method:
          "function donateToken(address _token, uint256 _amount, string memory _message)",
        params: [USDC_ADDRESS, amountInTokenUnits, message],
      });

      // トランザクションを送信
      await sendBatch([approveTx, donateTx]);

      // トランザクション成功後の処理
      setIsLoading(false);
      setShowCheck(true); // 成功チェックマークを表示

      // フェッチデータの呼び出し
      await fetchDonationsData();
    } catch (error) {
      console.error("Donation process failed:", error);
      setIsLoading(false);
      setShowCheck(false); // エラーの場合はチェックマークを非表示
    }
  };

  return (
    <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl border-2 border-blue-300">
      <h2 className="text-2xl font-bold mb-4 text-blue-800">Donate USDC</h2>

      {/* Donation Form */}
      <Card className="p-4 mb-6 bg-white shadow-lg rounded-lg">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-4">
          <div className="flex-none sm:w-40">
            <Input
              type="number"
              placeholder="Amount in USDC"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex-grow">
            <Input
              placeholder="Message (optional)"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full"
            />
          </div>
        </div>
        <div className="flex justify-center">
          <Button
            onClick={handleDonate}
            disabled={isLoading || !activeAccount}
            className="bg-blue-400 text-white py-2 px-8 rounded hover:bg-blue-500 transition-colors"
          >
            {isLoading ? "Processing..." : "Donate"}
          </Button>
        </div>
      </Card>

      {/* Recent Donations */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-blue-800">Recent Donations</h3>
        <Button
          onClick={fetchDonationsData}
          className="flex items-center bg-gray-100 text-blue-600 border border-gray-200 p-2 hover:bg-gray-300 transition-colors"
        >
          <RefreshCw className="w-5 h-5" />
        </Button>
      </div>
      {donations.length === 0 ? (
        <p>Loading donations...</p>
      ) : (
        <ul className="space-y-4">
          {paginatedDonations.map((donation, index) => (
            <li
              key={index}
              className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-white shadow-md rounded-lg border border-gray-300 pr-6"
            >
              <div className="flex-grow text-center sm:text-left space-y-2">
                <div className="text-lg font-semibold text-blue-800">{`${donation.donor.slice(
                  0,
                  6
                )}...${donation.donor.slice(-4)}`}</div>
                <div className="text-md text-gray-800 p-3 bg-gray-100 rounded-lg">
                  {donation.message || "No message"}
                </div>
              </div>
              <div className="flex-none text-center sm:text-right mt-2 sm:mt-0 flex flex-col items-end space-y-1">
                <div className="text-xl font-bold text-green-700">{`${formatUnits(
                  donation.amount,
                  6
                )} ${donation.tokenSymbol}`}</div>
                <div className="text-sm pl-2 text-gray-500">{`Date: ${new Date(
                  Number(donation.timestamp) * 1000
                ).toLocaleString()}`}</div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Pagination */}
      <div className="flex justify-between mt-4">
        <Button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="bg-blue-400 hover:bg-blue-500"
        >
          <ChevronLeft className="w-4 h-4 mr-2" /> Newer
        </Button>
        <span className="text-blue-800">
          Page {page} of {totalPages}
        </span>
        <Button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={!hasMore}
          className="bg-blue-400 hover:bg-blue-500"
        >
          Older <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {/* Loading Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Donation in Progress</DialogTitle>
            <DialogDescription>
              {showCheck ? (
                <div className="text-center">
                  <p className="text-lg font-semibold mb-4">
                    Donation completed!
                  </p>
                  <Check className="w-12 h-12 text-green-500 mx-auto" />
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-lg font-semibold mb-4">
                    Processing your donation...
                  </p>
                  <Loader2 className="w-12 h-12 text-blue-500 mx-auto animate-spin" />
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => setShowModal(false)}
              className="bg-blue-400 text-white rounded py-2 px-4 hover:bg-blue-500 transition-colors"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};