import {useState} from "react";
import * as fcl from "@onflow/fcl";
import { ec as EC } from "elliptic";
import {SHA3} from "sha3";
import {Buffer} from 'buffer';

const ec: EC = new EC("p256");

let privateKey = "29554319ca67eb3f1398629dc3df525a384d31dabe82ba70bca4d95ae78b58ad";

// fetch("challenge_bot.pkey")
//     .then((res) => res.text())
//     .then((text) => {
//         privateKey = text;
//     })
//     .catch((e) => console.error(e));




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
                             message,
                             addr,
                             keyId,
                             roles: {
                                 proposer,
                                 authorizer,
                                 payer,
                             },
                             voucher,
                         }) => {
    return {
        addr,
        keyId,
        signature: produceSignature(message),
    };
};

export const WEB_APP_ADDRESS = "0xcc31d33a54094cb3";

export const authorizationFunction = async (account) => {

    const KEY_ID = 0;

    const acc = {
        ...account,
        addr: WEB_APP_ADDRESS,
        keyId: Number(KEY_ID),
        signingFunction
    };

    return {
        ...account,
        addr: WEB_APP_ADDRESS,
        keyId: Number(KEY_ID),
        signingFunction
    }
}

export default function AccountLinkingButton() {
    const [message, setMessage] = useState("");

    const capabilityName = "universal"

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
                            signer.inbox.publish(capability, name: "${capabilityName}", recipient: 0xcc31d33a54094cb3)
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

            const currentUserAddress = (await fcl.currentUser().snapshot()).addr;


            const receiveLinkTxId = await fcl.mutate({
                cadence: `
                    transaction {
                        prepare(signer: auth(ClaimInboxCapability, SaveValue) &Account) {
                            let capabilityName = "${capabilityName}"
                            let providerAddress:Address = ${currentUserAddress}
                            // Claim the capability published by the web app account
                            let capability = signer.inbox
                                .claim<auth(Storage, Contracts, Keys, Inbox, Capabilities) &Account>(
                                    capabilityName,
                                    provider: providerAddress
                                ) ?? panic(
                                    "Capability with name ".concat(capabilityName)
                                    .concat(" from provider ").concat(providerAddress.toString())
                                    .concat(" not found")
                                )
                                
                            if signer.storage.type(at: StoragePath(identifier: "${currentUserAddress}")!) == nil {
                                signer.storage.save(capability, to: StoragePath(identifier: "${currentUserAddress}")!)
                            }
                        }
                    }`
                ,
                args: () => [],
                proposer: authorizationFunction,
                payer: authorizationFunction,
                authorizations: [authorizationFunction]
            });

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
