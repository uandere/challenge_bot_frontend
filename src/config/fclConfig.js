import * as fcl from "@onflow/fcl";
import { init } from "@onflow/fcl-wc";

const blocto_project_id = "c36ed857-3d32-4e40-b78f-95db7223c12a";

const fclConfigInfo = {
    testnet: {
        accessNode: "https://rest-testnet.onflow.org",
        // discoveryWallet: `https://wallet-v2-dev.blocto.app/${blocto_project_id}/flow/authn`,
        discoveryWallet: "https://fcl-discovery.onflow.org/testnet/authn",
        discoveryAuthnEndpoint: 'https://fcl-discovery.onflow.org/api/testnet/authn',
    },
    mainnet: {
        accessNode: "https://rest-mainnet.onflow.org",
        discoveryWallet: "https://fcl-discovery.onflow.org/authn",
        discoveryAuthnEndpoint: 'https://fcl-discovery.onflow.org/api/authn',
    }
};

const network = "testnet";
const WALLET_CONNECT_PROJECT_ID = "e3624d56cc1e2e09d8955265c4238290";

fcl.config({
    "app.detail.title": "Test DApp", // the name of your DApp
    "app.detail.icon": "", // your DApps icon
    "flow.network": network,
    "accessNode.api": fclConfigInfo[network].accessNode,
    "discovery.wallet": fclConfigInfo[network].discoveryWallet,
    "discovery.authn.endpoint": fclConfigInfo[network].discoveryAuthnEndpoint,
    "walletconnect.projectId": WALLET_CONNECT_PROJECT_ID
});


// add WalletConnect for mobile apps.
// you must get a wallet connect project id:
// https://cloud.walletconnect.com/sign-in

// if (network === "testnet" || network === "mainnet") {
//     init({
//         projectId: WALLET_CONNECT_PROJECT_ID,
//         metadata: {
//             name: "Challenge bot",
//             description: "Up for a challenge?",
//             url: "https://challengebot-7f5b7.web.app/",
//             icons: ["https://academy.ecdao.org/favicon.png"]
//         },
//         includeBaseWC: true, // makes WalletConnect show up itself
//         wallets: [], // no idea, just leave empty
//         wcRequestHook: null, // literally 0 idea, just leave null
//         pairingModalOverride: null // ???????
//     }).then(({ FclWcServicePlugin }) => {
//         fcl.pluginRegistry.add(FclWcServicePlugin);
//     });
// }
