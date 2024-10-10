import * as fcl from "@onflow/fcl";

import { useEffect, useState } from "react";
import TransactionButton from "./TransactionButton.tsx";


export default function App() {
    const [user, setUser] = useState({ loggedIn: false, addr: "" });

    // So that the user stays logged in
    // even if the page refreshes
    useEffect(() => {
        fcl.currentUser.subscribe(setUser);
    }, []);

    return (
        <div className="App">
            <button onClick={fcl.authenticate}>Log In</button>
            <button onClick={fcl.unauthenticate}>Log Out</button>
            <p>{user.loggedIn ? `Welcome, ${user.addr}!` : "Please log in."}</p>

            <TransactionButton />
        </div>
    );
}