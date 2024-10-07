import * as fcl from "@onflow/fcl";

fcl.config()
    .put('accessNode.api', 'https://rest-testnet.onflow.org')
    .put("discovery.wallet", "https://fcl-discovery.onflow.org/testnet/authn")
    .put("0xHelloWorld", "0x3ee81941ffd1eee8");

fcl.reauthenticate().then(r => console.log(`Authenticated!!! ${r}`))

// fcl.authenticate()