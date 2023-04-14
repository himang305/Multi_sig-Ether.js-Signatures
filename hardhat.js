const { expect } = require("chai");
const { ethers, BigNumber } = require("hardhat");
const { upgrades } = require("hardhat");

describe("Initiating Tests", function () {

    let registryContract;
    let registryAddress;
    let factoryContract;
    let factoryAddress;
    let beaconContract;
    let beaconAddress;
    let walletContract;
    let walletAddress;
    let walletProxyContract;
    let walletProxyAddress;
    let tokenContract;
    let tokenAddress;
    let nftContract;
    let nftAddress;

  beforeEach(async function () {
    [admin, user1, user2, social1, social2] = await ethers.getSigners();
})

  describe("Test Wallet Contract", function () {

    it("Deployment",async function () {
      const wallet = await ethers.getContractFactory("UserWallet");
      walletContract = await wallet.deploy();
      await walletContract.deployed();
      walletAddress = walletContract.address;
      console.log("Deployed Wallet Contract: " + walletAddress);
  
      const factory = await ethers.getContractFactory("UserWalletFactory");
      factoryContract = await factory.deploy(walletAddress, [admin.address], 1);
      await factoryContract.deployed();
      factoryAddress = factoryContract.address;
      console.log("Deployed Factory Contract: " + factoryAddress);

      const token = await ethers.getContractFactory("Token");
      tokenContract = await token.deploy();
      await tokenContract.deployed();
      tokenAddress = tokenContract.address;
      console.log("Deployed Token Contract: " + tokenAddress);

      const nft = await ethers.getContractFactory("NFT");
      nftContract = await nft.deploy();
      await nftContract.deployed();
      nftAddress = nftContract.address;
      console.log("Deployed nft Contract: " + nftAddress);

      const Registry = await ethers.getContractFactory("EktaRegistry");
      registryContract = await upgrades.deployProxy(Registry, { initializer: 'initialize', kind: 'uups' })
      registryAddress = registryContract.address;
      console.log("Deployed Registry Contract: " + registryAddress);

    })
  });

  describe("Registry Tests", function () {

    it("Deploy new User wallet, ", async function () {
      console.log(120);

      await registryContract.setWalletFactories(factoryAddress, ethers.constants.AddressZero, ethers.constants.AddressZero);
      await factoryContract.grantRole("0xdfbefbf47cfe66b701d8cfdbce1de81c821590819cb07e71cb01b6602fb0ee27", registryAddress);
      console.log( await registryContract.UFactoryContract());
      await registryContract.CreateUserWallet('ss',[user1.address,user2.address],1,[social1.address,social2.address],1);
      console.log(122);

      walletProxyAddress = await registryContract.getUserWallets(user1.address);
      walletProxyAddress = walletProxyAddress[0];
      console.log("Wallet Address : ", walletProxyAddress);

      walletproxy = await ethers.getContractFactory("UserWallet");
      walletProxyContract = await walletproxy.attach(walletProxyAddress);

    });

    it("Trasnfer NFT to contract, ", async function () {

        await nftContract.safeMint(walletProxyAddress);
        await nftContract.safeMint(walletProxyAddress);
        await nftContract.safeMint(walletProxyAddress);
        expect(await nftContract.ownerOf(0)).to.equal(walletProxyAddress);

    });

    it("Trasnfer NFT to User1 from Wallet, ", async function () {

      let ABI = [
        "function transferFrom(address from, address to, uint tokenId)"
      ];
      let iface = new ethers.utils.Interface(ABI);
      let func = iface.encodeFunctionData("transferFrom", [walletProxyAddress, user1.address, 0])
      console.log("func = ", func);
      let nonce = await walletProxyContract.nonce();
      console.log("nonce = ", nonce);

      let blockNumBefore = await ethers.provider.getBlockNumber();
      let blockBefore = await ethers.provider.getBlock(blockNumBefore);
      let timestampBefore = blockBefore.timestamp + 50000;
      console.log("time : ", timestampBefore);

      let hashdata = await walletProxyContract.getMessageHashed(nftAddress,func,0,nonce,timestampBefore);
      console.log("Hash : ", hashdata);

      let signature = await user1.signMessage(ethers.utils.arrayify(hashdata));
      console.log("sign1 : ", signature);

      await walletProxyContract.multiSigExecute(nftAddress,0,func,timestampBefore,signature);
      expect(await nftContract.ownerOf(0)).to.equal(user1.address);


    });

    it("Inc wallet threshold to 2 , ", async function () {

      ABI = [
        "function changeMultiSigConfig(address[] calldata addOwners, address[] calldata removeOwners, uint256 _ownerThreshold)"
      ];
      iface = new ethers.utils.Interface(ABI);
      func = iface.encodeFunctionData("changeMultiSigConfig", [[], [], 2])
      nonce = await walletProxyContract.nonce();
      console.log("nonce = ", nonce);

      blockNumBefore = await ethers.provider.getBlockNumber();
      blockBefore = await ethers.provider.getBlock(blockNumBefore);
      timestampBefore = blockBefore.timestamp + 60000;

      hashdata = await walletProxyContract.getMessageHashed(walletProxyAddress,func,0,nonce,timestampBefore);

      signature = await user2.signMessage(ethers.utils.arrayify(hashdata));

      await walletProxyContract.multiSigExecute(walletProxyAddress,0,func,timestampBefore,signature);
      expect(await walletProxyContract.ownerThreshold()).to.equal(2);

  });

  it("Trasnfer NFT to User1 from Wallet combining 2 signatures , ", async function () {

    let ABI = [
      "function transferFrom(address from, address to, uint tokenId)"
    ];
    let iface = new ethers.utils.Interface(ABI);
    let func = iface.encodeFunctionData("transferFrom", [walletProxyAddress, user1.address, 1])
    let nonce = await walletProxyContract.nonce();
    console.log("nonce = ", nonce);

    let blockNumBefore = await ethers.provider.getBlockNumber();
    let blockBefore = await ethers.provider.getBlock(blockNumBefore);
    let timestampBefore = blockBefore.timestamp + 70000;

    let hashdata = await walletProxyContract.getMessageHashed(nftAddress,func,0,nonce,timestampBefore);

    let signature1 = await user1.signMessage(ethers.utils.arrayify(hashdata));
    let signature2 = await user2.signMessage(ethers.utils.arrayify(hashdata));

    if(user1.address > user2.address){
      sign = signature2.concat(signature1.slice(2));
    }else{
      sign = signature1.concat(signature2.slice(2));
    }
    await walletProxyContract.multiSigExecute(nftAddress,0,func,timestampBefore,sign);
    expect(await nftContract.ownerOf(1)).to.equal(user1.address);

  });


  })

  
});
