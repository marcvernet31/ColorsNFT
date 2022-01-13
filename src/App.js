import * as React from 'react';
import { useState, useEffect } from 'react';

import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import SaveIcon from '@mui/icons-material/Save';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import LoadingButton from '@mui/lab/LoadingButton';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';

import { ethers } from "ethers";

import ColorNft from './utils/ColorNFT.json';
const CONTRACT_ADDRESS = "0x0e6eA75ca4D4bFEb6Ef059db27b3f95C9442F5Ac";

function Copyright() {
  return (
    <Typography variant="body2" color="text.secondary" align="center">
      {'Copyright © '}
      <Link color="inherit" href="https://github.com/marcvernet31">
        marcvernet31
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const Hero = () => {
  return(
    <Container>
      <Box sx={{ p: 5}} textAlign="center">
        <img
          width="250" 
          src="title.png"
          alt="title"
          loading="lazy"
        />
      </Box>
      <Box sx={{ p: 1}} textAlign="center">
        <img
          width="250" 
          src="img.gif"
          alt="title"
          loading="lazy"
        />
      </Box>
    </Container>
  )
}

const Footer = () => {
  return(
    <Box sx={{ bgcolor: 'background.paper', p: 5 }} component="footer">
    <Typography
      variant="subtitle1"
      align="center"
      color="text.secondary"
      component="p"
    >
      Made with love by <Link href="https://github.com/marcvernet31"> @marcvernet31</Link>
    </Typography>
    <Copyright />
  </Box>
  )
}

const theme = createTheme({
  status: {
    danger: '#e53e3e',
  },
  palette: {
    primary: {
      main: '#a423d5',
      darker: '#053e85',
    },
    neutral: {
      main: '#64748B',
      contrastText: '#fff',
    },
    success: {
      main: '#c46de5',
      darker: '#bc6adb'
    }
  },
});

export default function App() {
  const [loading, setLoading] = useState(false)
  const [isMinted, setIsMinted] = useState(false)
  const [currentAccount, setCurrentAccount] = useState("");
  const [mintedTokenId, setMintedTokenId] = useState(0)

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      // Request access to account
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
      setupEventListener()
    } catch (error) {
      console.log(error)
    }
  }

  // Setup our listener.
  const setupEventListener = async () => {
    // Most of this looks the same as our function askContractToMintNft
    try {
      const { ethereum } = window;

      if (ethereum) {
        // Same stuff again
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, ColorNft.abi, signer);

        // THIS IS THE MAGIC SAUCE.
        // This will essentially "capture" our event when our contract throws it.
        // If you're familiar with webhooks, it's very similar to that!
        connectedContract.on("ColorNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber())
          setMintedTokenId(tokenId.toNumber())
          console.log("mintedTokenId", mintedTokenId)
          console.log("tokenId.toNumber()", tokenId.toNumber())
        });

        console.log("Setup event listener!")

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const checkIfWalletIsConnected = async () => {

    const { ethereum } = window;

    if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
    } else {
        console.log("We have the ethereum object", ethereum);
    }

    // Check if we're authorized to access the user's wallet
    const accounts = await ethereum.request({ method: 'eth_accounts' });

    // User can have multiple authorized accounts, we grab the first one if its there!
    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account)
      setupEventListener()
    } else {
      console.log("No authorized account found")
    }
  }

  const mintNFT = async() => {
    try {
      const { ethereum } = window;
      if(ethereum) {
        setLoading(true)
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, ColorNft.abi, signer);

        console.log("Going to pop wallet now to pay gas...")
        let nftTxn = await connectedContract.createNFT();

        console.log("Mining...please wait.")
        await nftTxn.wait();

        console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);
        console.log(`https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/INSERT_TOKEN_ID_HERE`)
        setIsMinted("minted")
        setLoading(false)
      } else {
        console.log("Ethereum object doesn't exists");
      }

    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <main>
        <Box
          sx={{
            bgcolor: 'background.paper',
            pt: 2 ,
            pb: 6,
          }}
        >
          <Container >
            <Box textAlign="right">
              <Button variant="outlined" size="large" href={"https://testnets.opensea.io/collection/colornft-3niatckth9"}> 
                View Collection 
              </Button>
            </Box>
          </Container>

          <Container maxWidth="sm">
            <Hero/>
            <Box sx={{ p: 4}} textAlign="center">
              {currentAccount !== '' ? (
                <div> 
                  {loading ? (
                    <LoadingButton
                      loading
                      loadingPosition="start"
                      startIcon={<SaveIcon />}
                      variant="outlined"
                      size="large"
                    >
                      Minting
                    </LoadingButton>
                  ) : (
                    <Button 
                      variant="contained" 
                      size="large"
                      onClick={mintNFT}
                    > 
                      Mint 
                    </Button>
                  )}
                </div>
              ):(
                <Button 
                  variant="contained" 
                  size="large"
                  onClick={connectWallet}
                  color="primary"
                > 
                  Connect Wallet 
                </Button>
              )}
            </Box>
            {isMinted && (
              <Box sx={{ p: 4}} >
                <Alert severity="success">
                  <AlertTitle> <strong> NFT minted </strong></AlertTitle>
                  <Link href={`https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${mintedTokenId}`}><strong>Check out in OpenSea</strong></Link> 
                </Alert>
              </Box>
            )}
          </Container>
        </Box>
      </main>
      <Footer/>
    </ThemeProvider>
  );
}


