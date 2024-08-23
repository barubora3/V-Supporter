"use client";
import React, { useState, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, Users, Ticket, Image, Wallet } from "lucide-react";

const MainPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("1");

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-4">
        <div className="flex items-center space-x-4">
          <Avatar src="/vtuber-avatar.png" />
          <div>
            <h1 className="text-2xl font-bold">VTuber Name</h1>
            <p className="text-gray-500">Short bio or tagline</p>
          </div>
        </div>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="1">
            <DollarSign className="inline-block mr-2" />
            Donate
          </TabsTrigger>
          <TabsTrigger value="2">
            <Users className="inline-block mr-2" />
            Crowdfunding
          </TabsTrigger>
          <TabsTrigger value="3">
            <Ticket className="inline-block mr-2" />
            Predictions
          </TabsTrigger>
          <TabsTrigger value="4">
            <Image className="inline-block mr-2" />
            Fan Art
          </TabsTrigger>
        </TabsList>

        <TabsContent value="1">
          <DonateContent />
        </TabsContent>
        <TabsContent value="2">
          <CrowdfundingContent />
        </TabsContent>
        <TabsContent value="3">
          <PredictionsContent />
        </TabsContent>
        <TabsContent value="4">
          <FanArtContent />
        </TabsContent>
      </Tabs>

      <Button
        icon={<Wallet />}
        className="mt-4"
        onClick={() => {
          /* Wallet connect logic */
        }}
      >
        Connect Wallet
      </Button>
    </div>
  );
};

const DonateContent: React.FC = () => (
  <div className="p-4">
    <h2 className="text-xl font-bold mb-4">Donate to VTuber</h2>
    {/* Donation form components */}
  </div>
);

const CrowdfundingContent: React.FC = () => (
  <div className="p-4">
    <h2 className="text-xl font-bold mb-4">Current Crowdfunding Campaigns</h2>
    {/* Crowdfunding campaign list and details */}
  </div>
);

const PredictionsContent: React.FC = () => (
  <div className="p-4">
    <h2 className="text-xl font-bold mb-4">Active Predictions</h2>
    {/* Predictions list and participation form */}
  </div>
);

const FanArtContent: React.FC = () => (
  <div className="p-4">
    <h2 className="text-xl font-bold mb-4">Fan Art Gallery</h2>
    {/* Fan art grid or list */}
  </div>
);

export default MainPage;
