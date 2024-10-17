import { useEffect, useState } from "react";
import * as fcl from "@onflow/fcl";
import AccountLinkingButton from "./AccountLinkingButton";
import TransactionButton from "./TransactionButton";

export default function App() {
    const [user, setUser] = useState({ loggedIn: false, addr: "" });

    // Keep user logged in even after page refresh
    useEffect(() => {
        fcl.currentUser.subscribe(setUser);
    }, []);

    return (
        <div className="App">
            <button onClick={fcl.authenticate}>Log In</button>
            <button onClick={fcl.unauthenticate}>Log Out</button>
            <p>{user.loggedIn ? `Welcome, ${user.addr}!` : "Please log in."}</p>

            {/* Account Linking Button */}
            {user.loggedIn && <AccountLinkingButton />}

            {/* Transaction Button */}
            {user.loggedIn && <TransactionButton />}
        </div>
    );
}
