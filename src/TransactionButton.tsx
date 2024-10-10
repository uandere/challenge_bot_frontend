import './App.css';
import * as fcl from "@onflow/fcl"; // Import Flow Client Library
import './config/fclConfig.js';
import {useEffect, useState} from "react";

function TransactionButton() {
    useEffect(() => {
        fcl.authenticate().catch(console.error);
    }, []);

    const [transaction, setTransaction] = useState({ sealed: false, id: "" });

    const onClick = async () => {
        try {
            const txId = await fcl.mutate({
                cadence: `
                    import HelloWorld from 0x3ee81941ffd1eee8
    
                    transaction {
                      prepare(acct: &Account) {}
                    
                      execute {
                        log(HelloWorld.hello())
                      }
                    }
              `,
                args: () => [],
                proposer: fcl.currentUser,
                payer: fcl.currentUser,
                authorizations: [fcl.currentUser]
            });

            const tx = await fcl.tx(txId).onceSealed();
            console.log("Success!");
            console.log("Transaction");
            console.log(tx);
            console.log(`Transaction ID: ${txId}`);
            setTransaction({ sealed: true, id: txId });
        } catch (error) {
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

export default TransactionButton;
