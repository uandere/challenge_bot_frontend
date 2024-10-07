import './App.css';
import * as fcl from "@onflow/fcl"; // Import Flow Client Library
import './config/fclConfig'; // Import Flow configuration
// import SignInButton from "./SignInButton.tsx";

function App() {
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
                proposer: fcl.currentUser, // optional - default is fcl.authz
                payer: fcl.currentUser, // optional - default is fcl.authz
                authorizations: [fcl.currentUser]
            });

            const transaction = await fcl.tx(txId).onceSealed();
            console.log("Success!");
            console.log(transaction);
        } catch (error) {
            console.error("Error while executing transaction: ", error);
        }
    };

    return (
        <div className="App">
            <header className="App-header">
                {/*<SignInButton/>*/}
                <button onClick={onClick}>Send Transaction!</button>
            </header>
        </div>
    );
}

export default App;
