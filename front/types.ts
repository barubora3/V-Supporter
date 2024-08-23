interface VTuber {
  name: string;
  avatar: string;
  bio: string;
}

interface DonationTier {
  amount: number;
  description: string;
}

interface CrowdfundingCampaign {
  title: string;
  description: string;
  goal: number;
  current: number;
  endDate: string;
}

interface Prediction {
  title: string;
  options: string[];
  endDate: string;
}

interface FanArt {
  id: string;
  image: string;
  artist: string;
  title: string;
}
