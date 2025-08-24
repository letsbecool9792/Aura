import { defaultConfig } from "@reown/appkit-ethers-react-native";

export const projectId = "YOUR_PROJECT_ID";

export const metadata = {
  name: "Aura Patient App",
  description: "Decentralized Healthcare Platform",
  url: "https://aura-health.com",
  icons: ["https://your-icon-url.com"],
  redirect: {
    native: "aura://",
  },
};

export const config = defaultConfig({ metadata });

export const chains = [
  {
    chainId: 1,
    name: "Ethereum",
    currency: "ETH",
    explorerUrl: "https://etherscan.io",
    rpcUrl: "https://cloudflare-eth.com",
  },
  {
    chainId: 137,
    name: "Polygon",
    currency: "MATIC",
    explorerUrl: "https://polygonscan.com",
    rpcUrl: "https://polygon-rpc.com",
  },
];
