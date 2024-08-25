AKINDOのページにサービスURL書くの忘れてました
下記URLで実際に触れるのでAAでのTx実行をぜひ試してみてください

https://v-supporter.vercel.app/

あと、クレカでの購入フローを一通りやってもUSDCは送られてきません (テスト環境だと代わりにTranzakトークンが送られてきます)
テスト用のUSDCはFaucetから取得できます


# English description transrate from AKINDO

# V Supporter

## What it does
V Supporter is an on-chain tool designed to connect VTubers with their fans, offering various support and engagement features.
What it does
V Supporter provides the following key features:

Donate Function: A tipping system using stablecoins through smart contracts.
Stream Memento Function: NFT minting available only during YouTube live streams, serving as a record of viewership.
Social Login Function: Easy wallet connection through social login.
On-ramp Function: Purchase of stablecoins (USDC) using credit cards.
Gas-less Transaction Function: Gas-less transactions enabled by Account Abstraction (AA).

## The problem it solves

Significantly reduces payment fees compared to existing platforms, improving VTubers' earnings. Fans' support is recorded on-chain.
Allows fans to keep NFT records of watched streams (Stream Mementos), fostering a sense of seniority (similar to YouTube subscription history bragging).
3, 4, 5. Simplifies major barriers for non-crypto users (wallet creation, on-ramping, transaction execution).

## Challenges we ran into

Struggled to select an on-ramp service available in Japan. Many services are restricted in Japan, even in development environments.
Transak's staging environment was usable, but availability of the production environment in Japan remains uncertain.
Attempted to create an oracle to make live stream information obtained from the YouTube API available on-chain for more precise NFT minting.
Encountered difficulties during the deployment of an API3 oracle node and had to abandon its use due to time constraints.

## Technologies we used
Main technologies:

Thirdweb (Smart Wallet, Gas Sponsored Transaction)
Transak (On-ramp solution)
Google API (YouTube data retrieval)

Others (standard dApps development technologies):

Next.js, Tailwind CSS, shadcn/ui, Vercel, viem, Alchemy, Hardhat

## How we built it
1. Donate Function

Created a smart contract for donations.
Fans execute the donateToken function specifying USDC amount and a message.
The function records the message in storage and transfers the donation (minus a fee) to the VTuber's address.
Currently, the fee is set to 0%.
Frontend bundles Approve and donateToken UserOperations for single-transaction execution.

2. Stream Memento Function

Uses YouTube API to fetch current live stream data (title, thumbnail, start time, viewer count, likes).
NFT contract's Mint function is called with live stream data to receive an NFT.
Metadata is stored in the contract's storage.
To prevent unauthorized minting, a signature verification mechanism is implemented using the service operation wallet's private key.

3. Social Login Function
Utilizes Thirdweb's Smart Account feature.
https://portal.thirdweb.com/connect/account-abstraction/how-it-works

4. Stablecoin (USDC) Purchase with Credit Card
Implements Transak for on-ramping.
https://transak.com/

5. Gas-less Transaction Function
Uses Thirdweb's Gas Sponsorship feature.
https://portal.thirdweb.com/connect/account-abstraction/sponsorship-rules

## What we learned

Signature verification and oracles enable interesting NFT minting based on off-chain data.
Thirdweb's wallet features have evolved, simplifying AA wallet issuance and transaction execution via social login.
AA transactions take longer to complete compared to standard transactions, requiring careful UX design.
The ability to create seamless user experiences might increase the risk of asset loss due to user error or scams.
Technical challenges for blockchain adoption without understanding the underlying mechanisms are being addressed.
Remaining challenges for mass adoption in Japan include the popularization of JPY stablecoins and on-ramp service restrictions.

## What's next

Implement VTuber account registration features
Develop VTuber dashboard
Add Predict feature (mimicking Twitch) and crowdfunding functionality
Research and integrate on-ramp services actually available in Japan
