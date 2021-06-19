import React, {useEffect, useState} from 'react';
import { useStoreApi } from "../context/storeApi";

import Temp from '../screens/Temp';
import useWeb3 from "../context/useWeb3";
import ERC721Contract from "../contracts/NFTokenMetadataDoc.json"; 
import { Jumbotron, Button, Dropdown, DropdownToggle, DropdownMenu, DropdownItem} from 'reactstrap';
import "../Pages-Styling/Dashboard.css"
import Web3 from "web3";

  
const Dashboard = () => {
	// const { balance, address, message, setAddress, setBalance } = useStoreApi();
	const [noOfMinted, setNoOfMinted] = useState(0);
	const [web3, setWeb3] = useState(null);
	const [contract, setContract] = useState(null);
	const [address, setAddress] = useState(null);
	const [tokenIds, setTokenIds] = useState([]);
	const [tokenHash, setTokenHash] = useState(null); 

	const [lastClicked, setLastClicked] = useState(null);

	const [dropdownOpen, setDropdownOpen] = useState(false);

	const toggle = () => setDropdownOpen(prevState => !prevState);
  	// let web3 = useWeb3();

	useEffect(()=>{
		async function initWeb3(){
			let web3Instance = await getWeb3();
			let addressTemp = await getUserAccount(web3Instance);
			await getData(web3Instance, addressTemp);
		}
		initWeb3();
	},[])

	const getWeb3 = async () => {
		console.log(1,"getWeb3");
		var instance;
		if (window.ethereum) {
		  // set up a new provider
			try {
				instance = new Web3(window.ethereum);
			} catch (error) {
				console.error(error);
			}
		} else if (window.web3) {
		  	instance = new Web3(window.web3);
		} else {
			// fallback on localhost provider
			const provider = new Web3.provider.HttpProvider("http://127.0.0.1:8545");
			instance = new Web3(provider);
		}
		console.log(2,"getWeb3");
		setWeb3(instance);
		return instance;
	}

	// get user account on button click
	const getUserAccount = async (web3Instance) => {
		console.log(1,"getUser");
		let userAddress;
		if (window.ethereum) {
			try {
				await window.ethereum.enable();
				let accounts = await web3Instance.eth.getAccounts();
				userAddress = await accounts[0];
				console.log(accounts);
				setAddress(accounts[0]);
				console.log(2,"getUser");
			} catch (error) {
				console.error(error);
			}
		} else {
			alert("Metamask extensions not detected!");
		}

		console.log(3,"getUser",userAddress);
		return userAddress;
	};

	const getData = async (web3Instance,addressTemp) =>{
		console.log(1,"getData");
		// await getUserAccount();
		console.log(ERC721Contract.networks[1337]["address"]);
		console.log(addressTemp);
		const contractInstance = new web3Instance.eth.Contract(ERC721Contract.abi,ERC721Contract.networks[1337]["address"]); 
		const res = await contractInstance.methods.balanceOf(addressTemp).call();
		setNoOfMinted(res);
		
		let iter = 0;
		let arr = [];
		while(arr.length < res){
			const idx = await contractInstance.methods.userOwnedTokens(addressTemp, iter).call(); // THIS WILL RETURN AN ARRAY OF TOKEN IDs
			
			if(idx != 0){
				arr.push(idx);
			}

			iter++;
		}

		setTokenIds(arr);
		
		console.log(JSON.stringify(arr));
		console.log(2,"getData");
		// setNoOfMinted(res);
		setContract(contractInstance);
	}

	const handleDropClick= (e, tokenIdx)=>{
		let clicked = (e.target.innerHTML).slice(10)
		setLastClicked(clicked);
		console.log(clicked);
		getTokenDetails();
	}

	const getTokenDetails = async() => {
		const res = await contract.methods.tokenURI(lastClicked).call();
		console.log(res);
		setTokenHash(res);
	}

  	return (
    	<div className="dashboard">
            <div className="card-doc">
				<div className="docHeadingDashboard">
					<Jumbotron>
						<h1 className="display-3">Documents Minted by you</h1>
						{
							address? 
								(<p className="lead">Address: {address}</p>) : 
								(<Button size="md"  color="primary" className="docButtons" onClick={()=>getData()}>Connect Wallet</Button>)}
						<hr className="my-2" />
					</Jumbotron>
				</div>

				<div className="docNumber"> 
					<p>You have minted {noOfMinted} documents so far.</p>
					<Dropdown isOpen={dropdownOpen} toggle={toggle}>
						<DropdownToggle caret>
							Select the Token ID
						</DropdownToggle>
						<DropdownMenu>
							{tokenIds.map((tokenIdx) => (
								<DropdownItem onClick={(e, tokenIdx) => handleDropClick(e,tokenIdx)}>Token ID: {tokenIdx}</DropdownItem>
							))}
						</DropdownMenu>
					</Dropdown>
				</div>

				<div className="docDetails"> 
					{lastClicked? (
						<div className="card-mini">
							<div>
								<p>Token ID: {lastClicked}</p>
							</div>

							<div>
								<p>Document Hash: {tokenHash}</p>
							</div>
						</div>	
					):
					(	
						<div>
							<p>Select a token to show it's details</p>
						</div>
					)}
				</div>

				<div className="buttonArea"> 
					
				</div>
			</div>
        </div>
  	);
};
  
export default Dashboard;