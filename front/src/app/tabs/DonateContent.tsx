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
  const [maxAmount, setMaxAmount] = useState<number | null>(100);

  const itemsPerPage = 100;

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

  //   const fetchBalance = async () => {
  //     if (activeAccount) {
  //       try {
  //         const balance = await readContract({
  //           contract: usdcContract,
  //           method: "balanceOf",
  //           params: [activeAccount.address],
  //         });
  //         setMaxAmount(Number(balance)); // Convert balance to number
  //       } catch (error) {
  //         console.error("Failed to fetch balance:", error);
  //       }
  //     }
  //   };

  useEffect(() => {
    fetchDonationsData();
    // fetchBalance(); // Fetch balance on mount
  }, [page, activeAccount]);

  const totalPages = Math.ceil(donations.length / itemsPerPage);
  const paginatedDonations = donations.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const handleDonate = async () => {
    if (!amount || !activeAccount || Number(amount) <= 0) return;
    const amountInTokenUnits = parseUnits(amount, 6); // USDC has 6 decimal places

    try {
      setShowModal(true); // Show modal
      setIsLoading(true);

      // Create approval transaction
      const approveTx = approve({
        contract: usdcContract,
        amount: amount,
        spender: donateContract.address,
      });

      // Create donation transaction
      const donateTx = prepareContractCall({
        contract: donateContract,
        method:
          "function donateToken(address _token, uint256 _amount, string memory _message)",
        params: [USDC_ADDRESS, amountInTokenUnits, message],
      });

      // Send transactions
      await sendBatch([approveTx, donateTx]);

      // After transaction is successful
      setIsLoading(false);
      setShowCheck(true); // Show success checkmark

      // Fetch updated donations data
      await fetchDonationsData();
    } catch (error) {
      console.error("Donation process failed:", error);
      setIsLoading(false);
      setShowCheck(false); // Hide success checkmark on error
    }
  };

  return (
    <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl border-2 border-blue-300">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-blue-800">Donate USDC</h2>
        <a
          href={
            "https://sepolia.etherscan.io/address/" +
            DONATE_CONTRACT_ADDRESS +
            "#tokentxns"
          }
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline text-sm"
        >
          Check Onchain History
        </a>
      </div>

      {/* Donation Form */}
      <Card className="p-4 mb-6 bg-white shadow-lg rounded-lg">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-4">
          <div className="flex-none sm:w-40">
            <Input
              type="number"
              placeholder="Amount in USDC"
              value={amount}
              onChange={(e) => {
                const value = e.target.value;
                // Ensure the value is non-negative and within maxAmount
                if (
                  value === "" ||
                  (Number(value) >= 0 && Number(value) <= (maxAmount || 0))
                ) {
                  setAmount(value);
                }
              }}
              min="0" // Prevent negative values
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
            disabled={isLoading || !activeAccount || Number(amount) <= 0}
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
                  <p className="mb-4">
                    Your transaction has been sent. <br />
                    It may take some time for the on-chain data to be updated.
                    Please wait a moment.
                  </p>
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
