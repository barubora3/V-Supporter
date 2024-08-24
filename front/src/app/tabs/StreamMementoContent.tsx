import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Video,
  AlertCircle,
  Clock,
  Users,
  ThumbsUp,
  ExternalLink,
  Check,
  Search,
} from "lucide-react";
import { STREAM_MEMENTO_NFT_CONTRACRT_ADDRESS } from "@/lib/definition";
import {
  createThirdwebClient,
  getContract,
  prepareContractCall,
} from "thirdweb";
import { sepolia } from "thirdweb/chains";
import {
  useActiveAccount,
  useSendTransaction,
  useReadContract,
} from "thirdweb/react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const ALCHEMY_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;

interface StreamData {
  isLive: boolean;
  title?: string;
  description?: string;
  videoId?: string;
  thumbnailUrl?: string;
  startTime?: string;
  viewCount?: number;
  likeCount?: number;
}

interface NFT {
  id: string;
  imageUrl: string;
  title: string;
}

const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID!,
});

export const StreamMementoContent: React.FC = () => {
  const [channelId, setChannelId] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [streamData, setStreamData] = useState<StreamData | null>(null);
  const [loading, setLoading] = useState(false);
  const [userNFTs, setUserNFTs] = useState<NFT[]>([]);
  const [error, setError] = useState<null | string>(null);
  const [isMinting, setIsMinting] = useState(false);
  const [mintTxHash, setMintTxHash] = useState<string | null>(null);
  const [mintSuccess, setMintSuccess] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);

  const activeAccount = useActiveAccount();
  const {
    mutate: sendTransaction,
    data: transactionResult,
    isSuccess,
  } = useSendTransaction();

  const contract = getContract({
    address: STREAM_MEMENTO_NFT_CONTRACRT_ADDRESS,
    chain: sepolia,
    client,
  });

  const fetchChannelId = async (username: string) => {
    try {
      const response = await fetch(`/api/channel?username=${username}`);
      if (!response.ok) {
        throw new Error("Failed to fetch channel info");
      }
      const data = await response.json();
      return data.id;
    } catch (error) {
      setError(
        "Failed to fetch channel ID.\n\n" +
          "YouTube API has strict rate limits, which may cause occasional search failures.\n\n" +
          "Please try again in a few minutes or search for a different channel.\n" +
          "If the problem persists, the daily quota may have been reached."
      );
      setIsErrorModalOpen(true);
      return null;
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    const fetchedChannelId = await fetchChannelId(username);
    if (fetchedChannelId) {
      setChannelId(fetchedChannelId);
      await fetchStreamStatus(fetchedChannelId);
    }
    setLoading(false);
  };

  const fetchStreamStatus = async (channelId: string) => {
    try {
      const response = await fetch(`/api/live?channelId=${channelId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch stream status");
      }
      const data = await response.json();
      setStreamData(data);
    } catch (error) {
      setError("Failed to fetch stream status");
      setIsErrorModalOpen(true);
    }
  };

  const fetchUserNFTs = async () => {
    if (!activeAccount) return;

    try {
      const response = await fetch(
        `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}/getNFTs/?owner=${activeAccount.address}&contractAddresses[]=${STREAM_MEMENTO_NFT_CONTRACRT_ADDRESS}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch user NFTs");
      }
      const data = await response.json();
      const nfts = data.ownedNfts.map((nft: any) => ({
        id: nft.id.tokenId,
        imageUrl: nft.metadata.image,
        title: nft.title,
      }));
      setUserNFTs(nfts);
    } catch (error) {
      setError("Failed to fetch your NFTs");
      setIsErrorModalOpen(true);
    }
  };

  const handleMint = async () => {
    if (!streamData || !activeAccount) return;

    try {
      setError(null);
      setIsMinting(true);
      const startTime = Math.floor(
        new Date(streamData.startTime || "").getTime() / 1000
      );

      const transaction = prepareContractCall({
        contract,
        method:
          "function mintStreamMemento(string memory name, string memory thumbnailUrl, uint256 streamDate, uint256 viewCount, uint256 likeCount, bytes memory signature)",
        params: [
          streamData.title || "",
          streamData.thumbnailUrl || "",
          BigInt(startTime),
          BigInt(streamData.viewCount || 0),
          BigInt(streamData.likeCount || 0),
          "0x", // Placeholder for signature
        ],
      });
      await sendTransaction(transaction);
    } catch (err) {
      setError("Failed to mint NFT");
      setIsErrorModalOpen(true);
    } finally {
      setIsMinting(false);
    }
  };

  useEffect(() => {
    if (activeAccount) {
      fetchUserNFTs();
    }
  }, [activeAccount]);

  useEffect(() => {
    if (isSuccess) {
      setMintSuccess(true);
      fetchUserNFTs();
    }
  }, [isSuccess]);

  return (
    <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl border-2 border-blue-300">
      <h2 className="text-2xl font-bold mb-4 text-indigo-800">
        Stream Memento
      </h2>
      <div className="mb-4 flex space-x-2">
        <Input
          type="text"
          placeholder="Enter YouTube username (e.g., @example)"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <Button onClick={handleSearch} disabled={loading}>
          <Search className="w-4 h-4 mr-2" />
          {loading ? "Searching..." : "Search"}
        </Button>
      </div>
      <p className="text-xs text-gray-500 italic mb-4">
        Note: This search feature is not part of the actual service concept. Its
        provided for demonstration purposes, allowing you to test the
        functionality even when the default channel is not streaming. This
        enables you to search for any active YouTube channel as an alternative,
        ensuring you can experience the Stream Memento feature regardless of the
        streaming status of a specific channel.
      </p>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
      ) : streamData?.isLive ? (
        <Card className="p-6 bg-white shadow-lg rounded-xl mb-6">
          <div className="flex items-center mb-4">
            <Video className="w-6 h-6 text-red-500 mr-2 animate-pulse" />
            <span className="text-lg font-semibold text-red-500">
              Live Now!
            </span>
          </div>
          <h3 className="text-xl font-semibold mb-2 text-gray-800">
            {streamData.title}
          </h3>
          <div className="relative mb-4">
            <iframe
              width="100%"
              height="315"
              src={`https://www.youtube.com/embed/${streamData.videoId}?autoplay=1&mute=1`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="rounded-lg shadow-md"
            ></iframe>
            <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-md text-sm font-semibold">
              LIVE
            </div>
          </div>
          <div className="mb-4">
            <h4 className="text-lg font-semibold mb-2 text-gray-700">
              NFT Preview Image
            </h4>
            <img
              src={streamData.thumbnailUrl}
              alt="Stream Thumbnail"
              className="w-full max-h-64 object-contain rounded-lg shadow-md"
            />
          </div>
          <p className="text-gray-600 mb-4">{streamData.description}</p>
          <div className="flex justify-between items-center mb-4 text-sm text-gray-500">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              <span>
                Started{" "}
                {new Date(streamData.startTime || "").toLocaleTimeString()}
              </span>
            </div>
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              <span>{streamData.viewCount} viewers</span>
            </div>
            <div className="flex items-center">
              <ThumbsUp className="w-4 h-4 mr-1" />
              <span>{streamData.likeCount} likes</span>
            </div>
          </div>
          <div className="flex space-x-4 mb-4">
            <Button
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={handleMint}
              disabled={!activeAccount || isMinting}
            >
              {isMinting ? (
                <span className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Minting...
                </span>
              ) : mintSuccess ? (
                <span className="flex items-center">
                  <Check className="w-4 h-4 mr-2" />
                  Minted!
                </span>
              ) : (
                "Mint Stream Memento NFT"
              )}
            </Button>
            <Button
              className="flex items-center justify-center bg-red-600 hover:bg-red-700 text-white"
              onClick={() =>
                window.open(
                  `https://www.youtube.com/watch?v=${streamData.videoId}`,
                  "_blank"
                )
              }
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Watch on YouTube
            </Button>
          </div>
          {mintSuccess && (
            <p className="text-green-500 mb-4">
              NFT minted successfully! Transaction hash: {mintTxHash}
            </p>
          )}
          {!activeAccount && (
            <p className="text-yellow-500 mb-4">
              Please connect your wallet to mint NFTs.
            </p>
          )}
        </Card>
      ) : channelId ? (
        <Card className="p-6 bg-white shadow-lg rounded-xl mb-6">
          <div className="flex items-center mb-4">
            <AlertCircle className="w-6 h-6 text-yellow-500 mr-2" />
            <span className="text-lg font-semibold text-yellow-500">
              No Live Stream
            </span>
          </div>
          <p className="text-gray-600">
            The channel is not currently streaming. Check back later for new
            live content!
          </p>
        </Card>
      ) : null}

      {/* User's NFTs section */}
      {activeAccount && (
        <Card className="p-6 bg-white shadow-lg rounded-xl mt-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">
            Your Stream Memento NFTs
          </h3>
          {userNFTs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {userNFTs.map((nft) => (
                <div key={nft.id} className="bg-gray-100 p-4 rounded-lg">
                  <img
                    src={nft.imageUrl}
                    alt={nft.title}
                    className="w-full h-40 object-cover rounded-md mb-2"
                  />
                  <p className="text-sm font-semibold text-gray-700">
                    {nft.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    Token ID: {Number(nft.id)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">
              You dont have any Stream Memento NFTs yet.
            </p>
          )}
        </Card>
      )}

      {/* Error Modal */}
      <Dialog open={isErrorModalOpen} onOpenChange={setIsErrorModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
          </DialogHeader>
          <div className="text-gray-700 whitespace-pre-line">{error}</div>
          <Button onClick={() => setIsErrorModalOpen(false)}>Close</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};
