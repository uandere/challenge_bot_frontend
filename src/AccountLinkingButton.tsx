import {useState} from "react";
import * as fcl from "@onflow/fcl";
import { ec as EC } from "elliptic";
import {SHA3} from "sha3";
import {Buffer} from 'buffer';

const ec: EC = new EC("p256");

let privateKey = "";

fetch("challenge_bot.pkey")
    .then((res) => res.text())
    .then((text) => {
        privateKey = text;
        console.log(text);
    })
    .catch((e) => console.error(e));



// Define the hash function using SHA3
const hashMsgHex = (msgHex: string) => {
    const sha = new SHA3(256)
    sha.update(Buffer.from(msgHex, "hex"))
    return sha.digest()
}

function produceSignature(msgHex: string) {
    const key = ec.keyFromPrivate(Buffer.from(privateKey, "hex"))
    const sig = key.sign(hashMsgHex(msgHex));
    const n = 32
    const r = sig.r.toArrayLike(Buffer, "be", n)
    const s = sig.s.toArrayLike(Buffer, "be", n)
    return Buffer.concat([r, s]).toString("hex")
}


const signingFunction = ({
                             message, // The encoded string which needs to be used to produce the signature.
                             addr, // The address of the Flow Account this signature is to be produced for.
                             keyId, // The keyId of the key which is to be used to produce the signature.
                             roles: {
                                 proposer, // A Boolean representing if this signature to be produced for a proposer.
                                 authorizer, // A Boolean representing if this signature to be produced for a authorizer.
                                 payer, // A Boolean representing if this signature to be produced for a payer.
                             },
                             voucher, // The raw transactions information, can be used to create the message for additional safety and lack of trust in the supplied message.
                         }) => {
    console.log("Message");
    console.log(message);
    console.log("Signature");
    console.log(produceSignature(message));
    return {
        addr, // The address of the Flow Account this signature was produced for.
        keyId, // The keyId for which key was used to produce the signature.
        signature: produceSignature(message), // The hex encoded string representing the signature of the message.
    };
};

const authorizationFunction = async (account) => {
    const ADDRESS = "0xcc31d33a54094cb3";
    const KEY_ID = 0;


    console.log(account);


    const acc = {
        ...account, // bunch of defaults in here, we want to overload some of them though
        addr: ADDRESS, // the address of the signatory
        keyId: Number(KEY_ID), // this is the keyId for the accounts registered key that will be used to sign, make extra sure this is a number and not a string
        signingFunction
    };

    console.log(acc);

    // authorization function need to return an account
    return {
        ...account, // bunch of defaults in here, we want to overload some of them though
        addr: ADDRESS, // the address of the signatory
        keyId: Number(KEY_ID), // this is the keyId for the accounts registered key that will be used to sign, make extra sure this is a number and not a string
        signingFunction
    }
}

export default function AccountLinkingButton() {
    const [message, setMessage] = useState("");

    const linkAccount = async () => {
        try {
            const sendLinkTxId = await fcl.mutate({
                cadence: `
                    #allowAccountLinking

                    transaction {
                        prepare(signer: auth(IssueAccountCapabilityController, PublishInboxCapability) &Account) {
                        
                            // Issue a fully-entitled account capability
                            let capability = signer.capabilities
                                .account
                                .issue<auth(Storage, Contracts, Keys, Inbox, Capabilities) &Account>()
                                
                            // Publish the capability for the specified recipient
                            signer.inbox.publish(capability, name: "accountCapA", recipient: 0xcc31d33a54094cb3)
                        }
                    }`
                ,
                args: () => [],
                proposer: fcl.currentUser,
                payer: fcl.currentUser,
                authorizations: [fcl.currentUser]
            });

            const sendLinkTxStatus = await fcl.tx(sendLinkTxId).onceSealed();
            console.log(sendLinkTxStatus);

            const receiveLinkTxId = await fcl.mutate({
                cadence: `
                    transaction {
                        prepare(signer: auth(ClaimInboxCapability) &Account) {
                            let capabilityName = "accountCapA"
                            let providerAddress = 0xcc31d33a54094cb3
                            // Claim the capability published by the account cc31d33a54094cb3
                            let capability = signer.inbox
                                .claim<auth(Storage, Contracts, Keys, Inbox, Capabilities) &Account>(
                                    capabilityName,
                                    provider: providerAddress
                                ) ?? panic(
                                    "Capability with name ".concat(capabilityName)
                                    .concat(" from provider ").concat(providerAddress.toString())
                                    .concat(" not found")
                                )
                            // Simply borrowing an Account reference here for demonstration purposes
                            let accountRef = capability.borrow()!
                        }
                    }`
                ,
                args: () => [],
                proposer: authorizationFunction,
                payer: authorizationFunction,
                authorizations: [authorizationFunction]
            });

            console.log("HERE");

            const receiveLinkTxStatus = await fcl.tx(receiveLinkTxId).onceSealed();
            console.log(receiveLinkTxStatus);

            setMessage(`Account linked successfully. Transaction ID: ${receiveLinkTxId}`);
        } catch (error) {
            console.error("Error linking account: ", error);
            setMessage("Error linking account.");
        }
    };

    return (
        <div>
            <button onClick={linkAccount}>Link Account for Signing</button>
            <p>{message}</p>
        </div>
    );
}
