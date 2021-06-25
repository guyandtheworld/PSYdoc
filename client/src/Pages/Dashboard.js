import React, {useEffect, useState} from 'react';
import ERC721Contract from "../contracts/NFTokenMetadataDoc.json"; 
import { Jumbotron, Button, Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Input, Spinner} from 'reactstrap';
import "../Pages-Styling/Dashboard.css"
import Web3 from "web3";

  
const Dashboard = () => {
	let netId;
	// const { balance, address, message, setAddress, setBalance } = useStoreApi();
	const [noOfMinted, setNoOfMinted] = useState(0);
	const [web3, setWeb3] = useState(null);
	const [contract, setContract] = useState(null);
	const [address, setAddress] = useState(null);
	const [tokenIds, setTokenIds] = useState([]);
	const [tokenHash, setTokenHash] = useState(null); 
	const [inviteeAddress, setInviteeAddress] = useState("");
	const [lastClicked, setLastClicked] = useState(null);
	const [tokenInvitees, setTokenInvitees] = useState([]);
	const [tokenSignees, setTokenSignees] = useState([])
	const [dropdownOpen, setDropdownOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [disabled, setIsDisabled] = useState(true);
	const [networkID, setNetworkID] = useState('1337');
	
	const toggle = () => setDropdownOpen(prevState => !prevState);
  	// let web3 = useWeb3();

	useEffect(()=>{
		async function initWeb3(){
			let web3Instance = await getWeb3();
			let addressTemp = await getUserAccount(web3Instance);
			await getData(web3Instance, addressTemp, netId);
			setIsLoading(false);
		}
		initWeb3();
	},[])

	const getWeb3 = async () => {
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
			alert("Please install Metamask to use the app!");
			// fallback on localhost provider
			const provider = new Web3.provider.HttpProvider("http://127.0.0.1:8545");
			instance = new Web3(provider);
		}
		setWeb3(instance);
		netId = await instance.eth.net.getId()
		setNetworkID(netId);
		console.log('getWeb3',instance)
		return instance;
	}

	// get user account on button click
	const getUserAccount = async (web3Instance) => {
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

		return userAddress;
	};

	const getData = async (web3Instance,addressTemp, netId) =>{
		try{
			// await getUserAccount();
			console.log(ERC721Contract.networks[netId]["address"]);
			console.log(addressTemp);
			const contractInstance = new web3Instance.eth.Contract(ERC721Contract.abi,ERC721Contract.networks[netId]["address"]); 
			const res = await contractInstance.methods.balanceOf(addressTemp).call();
			setNoOfMinted(res);
			
			let iter = 0;
			let arr = [];
			while(arr.length < res){
				const idx = await contractInstance.methods.userOwnedTokens(addressTemp, iter).call(); // THIS WILL RETURN AN ARRAY OF TOKEN IDs
				
				if(idx !== 0){
					arr.push(idx);
				}

				iter++;
			}

			setTokenIds(arr);
			
			console.log(JSON.stringify(arr));
			// setNoOfMinted(res);
			setContract(contractInstance);
		} catch(e){
			console.error(e);
		}
	}

	const handleDropClick= (e, tokenIdx)=>{
		let clicked = (e.target.innerHTML).slice(10)
		setLastClicked(clicked);
		console.log(clicked);
		getTokenDetails(clicked);
		setIsDisabled(false);
	}

	const getTokenDetails = async(clicked) => {
		try{
			setIsLoading(true);
			const res = await contract.methods.tokenURI(clicked).call();
			console.log(res);
			setTokenHash(res);

			const invitees = await contract.methods.returnInvitees(clicked).call();
			console.log(invitees);
			setTokenInvitees(invitees);

			const signees = await contract.methods.returnSignees(clicked).call();
			console.log(signees);
			setTokenSignees(signees);
		} catch(e){
			alert("wrong input")
			console.error(e);
		}
		setIsLoading(false);
	}

	const handleSubmission = async() => {
		if((inviteeAddress.length !== 42) || (inviteeAddress.slice(0,2) !== '0x')){
			console.log(inviteeAddress.length, inviteeAddress.slice(0,2));
			alert('Invalid address!');
			return;
		}
		try{
			setIsLoading(true);
			console.log(contract.methods);
			console.log(lastClicked);
			console.log(inviteeAddress);
			console.log(address);
			const res = await contract.methods.setInvitees(lastClicked, inviteeAddress).send({
				from: address
			});
			console.log(networkID);  
			console.log(res);
			getTokenDetails(lastClicked);
		} catch(e){
			alert('Invalid address!');
			console.error(e);
		}
		setInviteeAddress('');
		setIsLoading(false);
	}


	if(isLoading){
		return (
			<div className="dashboard">
				<div className="card-doc loader">
					<h3>Loading...</h3>
					<Spinner style={{ width: '3rem', height: '3rem' }} />
				</div>
			</div>
		)
	}

	else{ 
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
							<DropdownToggle caret color="primary" >
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
							<div className="cardMini">
								<div className="tokenID">
									<p>Token #{lastClicked}</p>
								</div>

								<div className="tokenHash">
									<p>Hash: {tokenHash}</p>
								</div>

								<div className="inviteeSignee">
									<div className="inviteesTable">
										<div className="tableHeading">
											<h5>Invited Addresses</h5>
										</div>

										<div className="tableRows">
											{(tokenInvitees.length===0)?("None"):
												(tokenInvitees.map(inviteesIDX => 
													<div className="indAddress">{inviteesIDX } </div>))}
											{/* {(tokenInvitees==[])?("None"): */}
												{/* ({tokenInvitees.map(inviteesIDX => */}
													{/* <div className="indAddress">{inviteesIDX } </div> */}
												{/* }) */}
											{/* } */} 
											
										</div>
									</div>

			
									<div className="signeesTable">
										<div className="tableHeading">
											<h5>Signed Addresses</h5>
										</div>
										<div className="tableRows">
											{(tokenSignees.length===0)?("None"):
													(tokenSignees.map(signeesIDX => 
														<div className="indAddress">{signeesIDX} </div>))}
											{/* {tokenSignees.map(signeesIDX =>
												<div className="indAddress">{signeesIDX}</div>
											)} */}
										</div>
									</div>
								</div>

							</div>	
						):
						(	
							<div className="placeholderText">
								<p>Select a token to show it's details</p>
							</div>
						)}
					</div>

					<div className="buttonAreaDashboard"> 
						<hr className="my-2" />
						<p className="addressLabel">Invite an address to sign the NFT</p>
						<div className = "inputSubmit">
							<Input value={inviteeAddress} onChange={(e)=> setInviteeAddress(e.target.value)} />
							<Button size="md" color="primary" className="docButtons" disabled={disabled} onClick={()=>handleSubmission()}>Invite</Button>
						</div>
					</div>
				</div>
			</div>
		);
	}
};
  
export default Dashboard;