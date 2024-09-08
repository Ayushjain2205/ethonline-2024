const { Web3Provider } = require("@ethersproject/providers");
const { BigNumber, Contract, ethers } = require("ethers");

async function createPredictionMarketAttestation(
  address,
  question,
  timestamp,
  resolutionTimestamp,
  creator
) {
  let schemaData = ethers.utils.defaultAbiCoder.encode(
    ["string", "string", "string", "string"],
    [question, timestamp, resolutionTimestamp, creator]
  );

  // Standard setup for the contract
  const provider = new ethers.providers.JsonRpcProvider(
    // Get an RPC URL (such as an infura link) to connect to the network
    getProviderUrl(84532)
  );
  // Get the contract address from the Address Book in docs.sign.global
  const contract = new Contract(CONTRACT_ADDRESS(84532), ISPABI.abi, provider);
  // Get the provider from the currently connected wallet
  const library = new Web3Provider(await connector.getProvider());
  // Create writable contract instance
  const instance = contract.connect(library.getSigner());

  // Send the attestation transaction
  try {
    const tx = await instance[
      "attest((uint256,uint256,uint256,uint256,address,uint256,uint8,bool,address[],bytes),string,bytes,bytes)"
    ](
      {
        schema: BigNumber.from("0x34"), // Your schema ID
        time: BigNumber.from(timestamp),
        expirationTime: BigNumber.from(0), // No expiration
        revocationTime: BigNumber.from(0), // Not revoked
        refUID:
          "0x0000000000000000000000000000000000000000000000000000000000000000", // No reference UID
        recipient: ethers.constants.AddressZero, // No specific recipient
        attester: address,
        revocable: true,
        data: schemaData,
      },
      creator.toLowerCase(), // Use creator's address as the indexing key
      "0x", // No fee
      "0x" // No salt
    );

    const receipt = await tx.wait(1);
    console.log("Prediction Market created successfully", receipt);
    const attestationId = receipt.events[0].args.uid;
    console.log("Prediction Market Attestation UID:", attestationId);
    return attestationId;
  } catch (err) {
    console.error(
      "Error in createPredictionMarketAttestation:",
      err?.message || err
    );
    throw err; // Re-throw the error for the caller to handle
  }
}

// Note: You'll need to define or import these functions/variables:
// getProviderUrl, CONTRACT_ADDRESS, ISPABI, connector

module.exports = { createPredictionMarketAttestation };
