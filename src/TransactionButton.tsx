import './App.css';
import * as fcl from "@onflow/fcl"; // Import Flow Client Library
import './config/fclConfig.js';
import {useEffect, useState} from "react";
import {authorizationFunction, WEB_APP_ADDRESS} from "./AccountLinkingButton.tsx";

export default function TransactionButton() {
    useEffect(() => {
        fcl.authenticate().catch(console.error);
    }, []);

    const [transaction, setTransaction] = useState({sealed: false, id: ""});

    const onClick = async () => {
        try {
            const currentUserAddress = (await fcl.currentUser().snapshot()).addr;
            const FlowAddress = "0x7e60df042a9c0868";
            const FungibleToken = "0x9a0766d93b6608b7";


            const txId = await fcl.mutate({
                cadence: `
                    import FungibleToken from ${FungibleToken}
                    import FlowToken from ${FlowAddress}
                    
    
                    transaction(amount: UFix64, to: Address) {
                        // The Vault resource that holds the tokens that are being transferred
                        let sentVault: @{FungibleToken.Vault}
                    
                        prepare (signer: auth(Capabilities, LoadValue) &Account) {
                            
                            let capability = signer.storage.load<Capability<auth(Storage, Contracts, Keys, Inbox, Capabilities) &Account>>(from: StoragePath(identifier: "${currentUserAddress}")!)!
                            
                            let vaultRef = capability.borrow()!.storage.borrow<auth(FungibleToken.Withdraw) &FlowToken.Vault>(from: /storage/flowTokenVault)!
                            
                            // let vaultRef = capability.borrow<auth(FungibleToken.Withdraw) &FlowToken.Vault>(/storage/flowTokenVault)!

                            self.sentVault <- vaultRef.withdraw(amount: amount)                      
                        }
                        
                        execute {
                            
                            // Get a reference to the recipient's Receiver
                            let receiverRef = getAccount(to)
                                .capabilities
                                .borrow<&{FungibleToken.Receiver}>(/public/flowTokenReceiver) 
                                ?? panic("Could not borrow receiver reference to the recipient's Vault")
                    
                            // Deposit the withdrawn tokens in the recipient's receiver
                            receiverRef.deposit(from: <-self.sentVault)
                        }
                    }
                `,
                args: (arg, t) => [
                    arg(0.5, t.UFix64),
                    arg(WEB_APP_ADDRESS, t.Address),
                ],
                proposer: authorizationFunction,
                payer: authorizationFunction,
                authorizations: [authorizationFunction]
            });

            const tx = await fcl.tx(txId).onceSealed();
            console.log("Success!");
            console.log("Transaction");
            console.log(tx);
            console.log(`Transaction ID: ${txId}`);
            setTransaction({sealed: true, id: txId});
        } catch (error) {
            setTransaction({sealed: false, id: "Transaction failed"});
            console.error("Error while executing transaction: ", error);
        }
    };

    return (
        <div className="Transaction">
            <button onClick={onClick}>Send Transaction!</button>
            <p>Transaction ID: {transaction.id}</p>
            <p>Transaction Sealed: {transaction.sealed ? "Yes" : "No"}</p>
        </div>
    );
}
