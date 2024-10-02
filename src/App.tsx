import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import * as fcl from "@onflow/fcl"; // Import Flow Client Library
import './config/fclConfig'; // Import Flow configuration

function App() {
	const [greeting, setGreeting] = useState(""); // State to store the greeting

	const onClick = async () => {
		try {
			// Script to call the hello function from the contract
			const result = await fcl.query({
				cadence: `
					import HelloWorld from 0x3ee81941ffd1eee8

					access(all) fun main(): String {
						return HelloWorld.hello()
					}
				`
			});

			console.log("SUCCESS!");
			setGreeting(result); // Set the greeting from the contract
			console.log(result); // Log the result in the console

		} catch (error) {
			console.error("Error fetching greeting: ", error);
		}
	};

	return (
		<div className="App">
			<header className="App-header">
				<img src={logo} className="App-logo" alt="logo" />
				<button onClick={onClick}>Press Me!</button>
				{greeting && <p>{greeting}</p>} {/* Display the greeting */}
			</header>
		</div>
	);
}

export default App;
