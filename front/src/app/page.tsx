"use client";
import React, { useState, ReactNode } from "react";
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
} from "lucide-react";
import LoginButton from "@/components/LoginButton";
import { DonateContent } from "./tabs/DonateContent";

const dummyData = {
  vtuber: {
    name: "Kakuu Imagine",
    avatar: "/vtuber-icon.png",
    bio: "The ultimate virtual entertainer of the digital realm",
    walletAddress: "0xEb9981D68572B0553B98E5AECb920b6a7843733e",
    socialLinks: {
      twitter: "https://twitter.com/kakuuimagine",
      youtube: "https://youtube.com/kakuuimagine",
      twitch: "https://twitch.tv/kakuuimagine",
      website: "https://google.com",
    },
  },
  donations: [
    {
      amount: 5,
      txHash: "0xabcd...1234",
      date: "2023-09-15T14:30:00Z",
      sender: "0x9876...5432",
    },
    {
      amount: 10,
      txHash: "0xefgh...5678",
      date: "2023-09-14T10:15:00Z",
      sender: "CryptoFan123",
    },
  ],
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
  fanArt: [
    {
      id: "1",
      image: "/fanart1.jpg",
      artist: "ArtLover123",
      title: "Kakuu's New Adventure",
    },
    {
      id: "2",
      image: "/fanart2.jpg",
      artist: "DigitalPainter",
      title: "Kakuu in Fantasy World",
    },
    {
      id: "3",
      image: "/fanart3.jpg",
      artist: "VTuberFan",
      title: "Kakuu's Epic Journey",
    },
  ],
};

const cn = (...classes: string[]) => classes.filter(Boolean).join(" ");

const MainPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("1");
  const [copied, setCopied] = useState(false);

  const tabData = [
    { name: "Donate", icon: DollarSign },
    { name: "Crowdfunding", icon: Users },
    { name: "Predictions", icon: Ticket },
    { name: "Fan Art", icon: Image },
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl bg-gradient-to-b from-pink-100 to-purple-100 min-h-screen">
      <div className="text-end flex justify-end pb-4 pr-4">
        <LoginButton />
      </div>
      <Card className="p-6 bg-white/80 backdrop-blur-sm border-2 border-pink-300 rounded-2xl shadow-lg mb-6">
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
          <Avatar className="w-32 h-32 border-4 border-pink-400">
            <AvatarImage src={dummyData.vtuber.avatar} />
          </Avatar>
          <div className="flex-grow">
            <h1 className="text-3xl font-bold text-purple-800">
              {dummyData.vtuber.name}
            </h1>
            <p className="text-pink-600 mt-2">{dummyData.vtuber.bio}</p>
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
              <div className="flex flex-col items-start">
                <span className="text-sm font-semibold text-gray-600">
                  Wallet:
                </span>
                <button
                  onClick={() =>
                    copyToClipboard(dummyData.vtuber.walletAddress)
                  }
                  className="text-sm font-mono text-purple-700 flex items-center hover:text-purple-900 transition-colors"
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
            </div>
          </div>
        </div>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-white/60 backdrop-blur-sm rounded-full p-1 border-2 border-pink-300">
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
          <CrowdfundingContent campaigns={dummyData.crowdfundingCampaigns} />
        </TabsContent>
        <TabsContent value="3">
          <PredictionsContent predictions={dummyData.predictions} />
        </TabsContent>
        <TabsContent value="4">
          <FanArtContent fanArt={dummyData.fanArt} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const CrowdfundingContent: React.FC<{ campaigns: CrowdfundingCampaign[] }> = ({
  campaigns,
}) => (
  <div className="p-4">
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
  <div className="p-4">
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
