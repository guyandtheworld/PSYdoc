import React from 'react';
import {Jumbotron, Button } from 'reactstrap';
import celebrate from "../images/success.gif";
import "../screens-styling/Doc.css";
  
const SuccessSign = (props) => {

	const handleSubmission = (e) => {
		e.preventDefault();
		props.jumpToMint();
	}

  	return (
		<div className="card-doc"> 
			<div className="docHeading">
				<Jumbotron>
					<h1 className="display-3">There we go!</h1>
					<p className="lead">You have signed the document!</p>
					<hr className="my-2" />
				</Jumbotron>
			</div>

			<div className ="uploadDeetsArea-success">
				<img src={celebrate} className="success-gif" alt="gif"/>
			</div>

			<div className="uploadArea-success">
				<h4>You can mint your own document!</h4>
				<Button outline size="lg" color="success" className="docButtons" onClick={(e)=> handleSubmission(e)}>
					Let's go!
				</Button>
			</div>
				
			

			<div className="buttonArea">
				<Button outline  size="lg" color="primary" className="docButtons" onClick={()=> props.beforeScreen()}>Before</Button>
			</div>
		
		</div>
  	);
};
  
export default SuccessSign;