const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy a mock ERC20 token for testing
  const MockToken = await hre.ethers.getContractFactory("MockToken");
  const mockToken = await MockToken.deploy("Mock USDC", "mUSDC", 6);
  await mockToken.deployed();

  console.log("Mock Token deployed to:", mockToken.address);

  const PredictionMarket = await hre.ethers.getContractFactory(
    "PredictionMarket"
  );
  const predictionMarket = await PredictionMarket.deploy(mockToken.address);
  await predictionMarket.deployed();

  console.log("PredictionMarket deployed to:", predictionMarket.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
