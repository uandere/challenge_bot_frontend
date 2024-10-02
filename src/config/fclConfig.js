import * as fcl from "@onflow/fcl";

// Set up access node (you can use Flow Testnet or Mainnet, depending on your needs)
fcl.config()
  .put("accessNode.api", "https://rest-testnet.onflow.org") // Flow Testnet
  .put("discovery.wallet", "https://fcl-discovery.onflow.org/testnet/authn") // Flow Testnet Wallet
  .put("0xHelloWorld", "0x3ee81941ffd1eee8"); // Replace with your contract address
