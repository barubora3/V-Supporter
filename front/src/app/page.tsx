"use client";
import React, { useState, ReactNode, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DollarSign,
  Users,
  Ticket,
  Image,
  Twitter,
  Youtube,
  Twitch,
  Copy,
  Check,
  Globe,
  ChevronRight,
  ChevronLeft,
  Video,
} from "lucide-react";
import LoginButton from "@/components/LoginButton";
import { DonateContent } from "./tabs/DonateContent";
import { StreamMementoContent } from "./tabs/StreamMementoContent";

import { fetchUsdcBalance } from "@/lib/usdcUtils";

// Color theme
const theme = {
  primary: "bg-blue-400 hover:bg-blue-500",
  secondary: "bg-white",
  text: "text-blue-800",
  border: "border-blue-300",
  gradient: "from-blue-50 to-blue-100",
};
const dummyData = {
  vtuber: {
    name: "Kakuu Imagine",
    avatar: "/vtuber-icon.png",
    bio: "The ultimate virtual entertainer of the digital realm",
    walletAddress: "0x2e4B8ea28136Eae64FCE57F72a04CD732D7Db7cC",
    socialLinks: {
      twitter: "https://twitter.com/kakuuimagine",
      youtube: "https://youtube.com/kakuuimagine",
      twitch: "https://twitch.tv/kakuuimagine",
      website: "https://google.com",
    },
  },
  crowdfundingCampaigns: [
    {
      title: "New 3D Model Fund",
      description: "Help me upgrade my 3D model for better streams!",
      goal: 10000,
      current: 7500,
      endDate: "2023-12-31",
    },
    {
      title: "Charity Event Gear",
      description:
        "Raising funds for new equipment for our annual charity stream",
      goal: 5000,
      current: 2000,
      endDate: "2023-11-30",
    },
  ],
  predictions: [
    {
      title: "What game will I play next stream?",
      options: ["Minecraft", "Fortnite", "Apex Legends", "Genshin Impact"],
      endDate: "2023-10-15",
    },
    {
      title: "Will I hit 2 million subscribers this month?",
      options: ["Yes", "No"],
      endDate: "2023-10-31",
    },
  ],
};

const cn = (...classes: string[]) => classes.filter(Boolean).join(" ");

const MainPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("1");
  const [copied, setCopied] = useState(false);
  const [usdcBalance, setUsdcBalance] = useState<string>("0");
  const [currentData, setCurrentData] = useState(dummyData);
  const [youtubeData, setYoutubeData] = useState<any>(null);

  const tabData = [
    { name: "Donate", icon: DollarSign },
    { name: "Stream Memento", icon: Video },
    { name: "Crowdfunding", icon: Users },
    { name: "Predictions", icon: Ticket },
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  useEffect(() => {
    const updateUsdcBalance = async () => {
      const balance = await fetchUsdcBalance(dummyData.vtuber.walletAddress);
      setUsdcBalance(balance);
    };

    updateUsdcBalance();
  }, []);

  // useEffect(() => {
  //   if (username) {
  //     const fetchYouTubeData = async () => {
  //       try {
  //         const response = await fetch(`/api/channel?username=${username}`);
  //         const data = await response.json();
  //         setYoutubeData(data);
  //       } catch (error) {
  //         console.error("Failed to fetch YouTube data", error);
  //       }
  //     };

  //     fetchYouTubeData();
  //   }
  // }, [username]);

  return (
    <div className={` bg-gradient-to-b ${theme.gradient}  w-full`}>
      <div
        className={`container mx-auto p-4 max-w-4xl bg-gradient-to-b ${theme.gradient} min-h-screen`}
      >
        <div className="text-end flex justify-end pb-4 pr-4">
          <LoginButton />
        </div>
        <Card
          className={`p-6 ${theme.secondary}/80 backdrop-blur-sm ${theme.border} rounded-2xl shadow-lg mb-6`}
        >
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
            <Avatar className={`w-32 h-32 border-4 ${theme.border}`}>
              <AvatarImage src={dummyData.vtuber.avatar} />
            </Avatar>
            <div className="flex-grow">
              <h1 className={`text-3xl font-bold ${theme.text}`}>
                {dummyData.vtuber.name}
              </h1>
              <p className={`${theme.text} mt-2`}>{dummyData.vtuber.bio}</p>
              <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
                <div className="flex space-x-4">
                  <a
                    href={dummyData.vtuber.socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-600"
                  >
                    <Twitter />
                  </a>
                  <a
                    href={dummyData.vtuber.socialLinks.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-500 hover:text-red-700"
                  >
                    <Youtube />
                  </a>
                  <a
                    href={dummyData.vtuber.socialLinks.twitch}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-500 hover:text-purple-700"
                  >
                    <Twitch />
                  </a>
                  <a
                    href={dummyData.vtuber.socialLinks.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-500 hover:text-green-700"
                  >
                    <Globe />
                  </a>
                </div>
                <div className="flex space-x-4">
                  <div>
                    <span className="text-sm font-semibold text-gray-600">
                      Wallet:
                    </span>
                    <button
                      onClick={() =>
                        copyToClipboard(dummyData.vtuber.walletAddress)
                      }
                      className="text-sm font-mono text-blue-700 flex items-center hover:text-blue-900 transition-colors"
                    >
                      {dummyData.vtuber.walletAddress.slice(0, 6)}...
                      {dummyData.vtuber.walletAddress.slice(-4)}
                      {copied ? (
                        <Check className="w-4 h-4 ml-2 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4 ml-2" />
                      )}
                    </button>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-600">
                      USDC Balance:
                    </span>
                    <span className="text-sm font-mono text-blue-700 pt-1">
                      {usdcBalance} USDC
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList
            className={`grid w-full grid-cols-4 ${theme.secondary}/60 backdrop-blur-sm rounded-full p-1 ${theme.border}`}
          >
            {tabData.map((tab, index) => {
              const IconComponent = tab.icon;
              return (
                <TabsTrigger
                  key={index}
                  value={String(index + 1)}
                  className="rounded-full transition-all flex items-center justify-center"
                >
                  <IconComponent className="w-5 h-5 mr-2" aria-hidden="true" />
                  <span>{tab.name}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value="1">
            <DonateContent />
          </TabsContent>
          <TabsContent value="2">
            <StreamMementoContent />
          </TabsContent>
          <TabsContent value="3">
            <CrowdfundingContent campaigns={dummyData.crowdfundingCampaigns} />
          </TabsContent>
          <TabsContent value="4">
            <PredictionsContent predictions={dummyData.predictions} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

const CrowdfundingContent: React.FC<{ campaigns: CrowdfundingCampaign[] }> = ({
  campaigns,
}) => (
  <div className="p-4 relative">
    <div className="absolute inset-0 bg-gray-200 bg-opacity-75 flex items-center justify-center z-10">
      <Card className="p-6 text-center bg-white">
        <h2 className="text-2xl font-bold mb-4">Crowdfunding Campaigns</h2>
        <p className="text-gray-600 mb-4">
          This feature is currently unavailable.{" "}
        </p>
      </Card>
    </div>

    <h2 className="text-2xl font-bold mb-4">Current Crowdfunding Campaigns</h2>
    {campaigns.map((campaign, index) => (
      <Card key={index} className="p-4 mb-4">
        <h3 className="text-xl font-semibold mb-2">{campaign.title}</h3>
        <p className="text-gray-600 mb-4">{campaign.description}</p>
        <div className="bg-gray-200 rounded-full h-4 mb-4">
          <div
            className="bg-blue-500 rounded-full h-4"
            style={{ width: `${(campaign.current / campaign.goal) * 100}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-600">
          ${campaign.current} raised of ${campaign.goal} goal
        </p>
        <p className="text-sm text-gray-600">Ends on {campaign.endDate}</p>
        <Button className="mt-4 w-full">Contribute</Button>
      </Card>
    ))}
  </div>
);

const PredictionsContent: React.FC<{ predictions: Prediction[] }> = ({
  predictions,
}) => (
  <div className="p-4 relative">
    <div className="absolute inset-0 bg-gray-200 bg-opacity-75 flex items-center justify-center z-10">
      <Card className="p-6 text-center bg-white">
        <h2 className="text-2xl font-bold mb-4">Predictions</h2>
        <p className="text-gray-600 mb-4">
          This feature is currently unavailable
        </p>
      </Card>
    </div>
    <h2 className="text-2xl font-bold mb-4">Active Predictions</h2>
    {predictions.map((prediction, index) => (
      <Card key={index} className="p-4 mb-4">
        <h3 className="text-xl font-semibold mb-2">{prediction.title}</h3>
        <div className="grid grid-cols-2 gap-2 mt-4">
          {prediction.options.map((option, optionIndex) => (
            <Button key={optionIndex} variant="outline" className="w-full">
              {option}
            </Button>
          ))}
        </div>
        <p className="text-sm text-gray-600 mt-4">
          Ends on {prediction.endDate}
        </p>
      </Card>
    ))}
  </div>
);

const FanArtContent: React.FC<{ fanArt: FanArt[] }> = ({ fanArt }) => (
  <div className="p-4">
    <h2 className="text-2xl font-bold mb-4">Fan Art Gallery</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {fanArt.map((art) => (
        <Card key={art.id} className="p-2">
          <img
            src={art.image}
            alt={art.title}
            className="w-full h-48 object-cover rounded"
          />
          <h3 className="text-lg font-semibold mt-2">{art.title}</h3>
          <p className="text-sm text-gray-600">by {art.artist}</p>
        </Card>
      ))}
    </div>
  </div>
);

export default MainPage;
