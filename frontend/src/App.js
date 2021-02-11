import React, { useState } from 'react';
import Web3 from 'web3';
import { tunnelwallAbi } from './abi';
import { Navbar, Jumbotron, Form, FormGroup, Button, Alert, Container } from 'react-bootstrap';
import { ReactComponent as Logo } from './logo.svg';
import { ReactComponent as GithubLogo } from './github.svg';
import MessageCard from './MessageCard';
import 'bootstrap/dist/css/bootstrap.css';
import './App.css';

const web3 = new Web3(Web3.givenProvider);  // use the given Provider or instantiate a new websocket provider
const contractAddress = '0x8b4216eCB98f7656b11089570Aa908A49A1b5F9d'; // contract address from Truffle migration to Ganache
const contract = new web3.eth.Contract(tunnelwallAbi, contractAddress);

function App() {
  const [message, setMessage] = useState('');
  const [lastMessage, setLastMessage] = useState('');
  const [uid, setUid] = useState('');
  const [walletAddress, setWalletAddress] = useState('Please connect a wallet with MetaMask')

  const handleWriteMessage = async (e) => {
    e.preventDefault();
    var accounts = await window.ethereum.enable();
    var account = accounts[0];
    setWalletAddress('Connected: ' + account);
    var _message = web3.utils.fromAscii(message.padEnd(32, String.fromCharCode(0)));
    var gas = await contract.methods.write(_message).estimateGas();
    var result = await contract.methods.write(_message).send({ from: account, gas });
    setUid(result.events.Log.returnValues['uid']);
    console.log(result) // debugging
    console.log({ uid }) // debugging
  }

  const handleGetLastMessage = async (e) => {
    e.preventDefault();
    var raw_result = await contract.methods.readLast().call();
    var result = [
      web3.utils.toAscii(raw_result[0]).replaceAll(String.fromCharCode(0),''),
      raw_result[1],
      new Date(parseInt(raw_result[2]) * 1000).toLocaleString()
    ]
    console.log(result) // debugging
    setLastMessage(result);
  }

  return (
    <div>
      <Navbar bg="dark" variant="dark">
        <Container fluid>
          <Navbar.Brand style={{
            paddingBottom: "0"
          }}>
            <Logo style={{
              width: "1.5em",
              height: "1.5em",
              marginBottom: "0.3em"
            }}/>{' '}
            Tunnelwall 
          </Navbar.Brand>
          <span className="navbar-text mr-1">
          { walletAddress }
          </span>
        </Container>
      </Navbar>
      <Jumbotron style={{
        borderRadius: "0",
        backgroundImage: "linear-gradient(120deg, #b721ff 0%, #21d4fd 100%)",
        textAlign: "center"
      }}>
        <h1 className="text-white mt-5">Welcome to the Tunnelwall Project</h1>
        <p className="text-white lead mb-4">
        A virtual wall built on the Ethereum blockchain, on which anyone can write to and read from.
        </p>
        <a 
          href="https://www.github.com"
          style={{
            position: "relative",
            display: "inline-block"
          }} >
          <GithubLogo 
            className="mb-4"
            style={{
              width: "2em",
              height: "2em",
              fill: "#fff"
            }} />
        </a>
      </Jumbotron>
      <Form
        className="text-center mb-5"
        onSubmit={ handleWriteMessage } >
        <FormGroup>
          <Form.Label>Write a message on the wall</Form.Label>
          <Form.Control
            type="text"
            maxLength="32"
            value={ message }
            onChange={ e => setMessage(e.target.value) } />
        </FormGroup>
        <Button
          variant="primary"
          type="submit"
          block >
          Write
        </Button>
      </Form>
      <p className="text-center mb-2">Get most recent message</p>
      <Button
        className="mb-3"
        variant="primary"
        type="button" 
        onClick={ handleGetLastMessage }
        block >
        Request Message
      </Button>
      <Alert variant="secondary" className="text-center py-2 px-3">{ lastMessage[0] }</Alert>
      <Alert variant="secondary" className="text-center py-2 px-3">{ lastMessage[1] }</Alert>
      <Alert variant="secondary" className="text-center py-2 px-3">{ lastMessage[2] }</Alert>
      <MessageCard 
        text={ message }
        uid={ uid } />
    </div>
  );
}

export default App;
