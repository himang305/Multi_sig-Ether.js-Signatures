const provider = new ethers.providers.Web3Provider(window.ethereum, "any");

const NFT = {
  address: "0xcaf2660831301b52497dD092D4F4aC9947Ba751F",
  abi: [
    "function safeMint(address to, string memory uri, uint price) external",
    "function buyNFT(uint _tokenId) public payable",
    "function getHashMessage(string calldata,uint) public pure returns(bytes32)" 
  ]
};

async function mintNFT() {
  /*=======
    CONNECT TO METAMASK
    =======*/
  await provider.send("eth_requestAccounts", []);
  const signer = provider.getSigner();
  let userAddress = await signer.getAddress();
  document.getElementById("userAddress").innerText =
  userAddress.slice(0, 8) + "...";

  /*======
    INITIALIZING CONTRACT
    ======*/
  const nftContract = new ethers.Contract(NFT.address, NFT.abi, signer);

  var nftPrice = ethers.utils.parseEther("0.0001");
  var nftTokenURI = "nft_image_link";
  var nftOwnerAddress = "0x3ED87449591524deF3A2f9aeA247dcD3BD38687f";

  const tx = await nftContract.safeMint(nftOwnerAddress, nftTokenURI, nftPrice);
  console.log(`Transaction hash: ${tx.hash}`);

  const receipt = await tx.wait();
  var nftId = BigInt(receipt.events[0].topics[1]).toString();
  console.log("NFT ID minted = ",nftId);

}

async function buyNFT() {
  /*=======
    CONNECT TO METAMASK
    =======*/
  await provider.send("eth_requestAccounts", []);
  const signer = provider.getSigner();
  let userAddress = await signer.getAddress();
  document.getElementById("userAddress").innerText =
  userAddress.slice(0, 8) + "...";

  /*======
    INITIALIZING CONTRACT
    ======*/
  const nftContract = new ethers.Contract(NFT.address, NFT.abi, signer);

  var nftPrice = ethers.utils.parseEther("0.0001");
  var nftID = 0;

  const tx = await nftContract.buyNFT(nftID,{value:nftPrice});
  console.log(`Transaction hash: ${tx.hash}`);

  const receipt = await tx.wait();
  console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
  console.log(`Gas used: ${receipt.gasUsed.toString()}`);

}

async function buyNFTwLazyMint() {
  /*=======
    CONNECT TO METAMASK
    =======*/
  await provider.send("eth_requestAccounts", []);
  const signer = provider.getSigner();
  let userAddress = await signer.getAddress();
  document.getElementById("userAddress").innerText =
  userAddress.slice(0, 8) + "...";

  /*======
    INITIALIZING CONTRACT
    ======*/
  const nftContract = new ethers.Contract(NFT.address, NFT.abi, signer);

  var nftPrice = ethers.utils.parseEther("0.0001");
  var nftURI = "Image_Link_details";
  
  const tx = await nftContract.buyNFTwLazyMint(nftURI,nftPrice,{value:nftPrice});
  console.log(`Transaction hash: ${tx.hash}`);

  const receipt = await tx.wait();
  console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
  console.log(`Gas used: ${receipt.gasUsed.toString()}`);

}

const signMessage = async () => {

  await provider.send("eth_requestAccounts", []);
  const signer = provider.getSigner();
  let userAddress = await signer.getAddress();

  const nftContract = new ethers.Contract(NFT.address, NFT.abi, signer);
  
  const message = await nftContract.getHashMessage("yes",10);

  console.log('message: ' + message);

      const signature = await signer.signMessage(ethers.utils.arrayify(message));
      const address = await signer.getAddress();
      console.log(signature);
      console.log(address);
    
 
};
