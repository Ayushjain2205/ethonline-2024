import axios from "axios";

// Base function for making requests to the Sign Protocol Indexing Service
async function makeAttestationRequest(endpoint, options) {
  const url = `https://testnet-rpc.sign.global/api/${endpoint}`;
  const res = await axios.request({
    url,
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
    },
    ...options,
  });
  // Throw API errors
  if (res.status !== 200) {
    throw new Error(JSON.stringify(res));
  }
  // Return original response
  return res.data;
}

// Schema query helper function
async function querySchema(schemaId, options = {}) {
  const endpoint = `v1/schemas/${schemaId}`;

  try {
    const response = await makeAttestationRequest(endpoint, {
      method: "GET",
      ...options,
    });

    return response;
  } catch (error) {
    console.error(`Error querying schema ${schemaId}:`, error.message);
    throw error;
  }
}

async function queryPredictionMarketSchema() {
  const SCHEMA_ID = "SPS_IVX4aYDdyZrT22o6dfHsc";

  try {
    const schemaData = await querySchema(SCHEMA_ID);
    console.log("Prediction Market Schema data:", schemaData);

    if (schemaData && schemaData.schema) {
      console.log("Schema Name:", schemaData.schema.name);
      console.log("Schema Description:", schemaData.schema.description);
      console.log("Schema Structure:", schemaData.schema.structure);
    }
  } catch (error) {
    console.error("Failed to query Prediction Market schema:", error);
  }
}

export { makeAttestationRequest, querySchema, queryPredictionMarketSchema };
