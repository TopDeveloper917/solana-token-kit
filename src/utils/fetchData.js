export const fetchHotCollections = async (owner) => {
  console.log(owner);
  try {
    const response = await fetch("https://devnet.helius-rpc.com/?api-key=ff11e47b-f217-4498-9cba-0daf7a3e8164", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'my-id',
        method: 'getAssetsByOwner',
        params: {
          ownerAddress: owner,
          page: 1, // Starts at 1
          limit: 1000,
          displayOptions: {
              showFungible: true //return both fungible and non-fungible tokens
          }
        },
      }),
    });
    const { result } = await response.json();
    console.log(result);

    // Process the response to get token data
    const tokens = result.items;
    
    // Sort tokens by balance (as a simple proxy for popularity)
    // const sortedTokens = tokens.sort((a, b) => 
    //   b.token_info.balance - 
    //   a.token_info.balance
    // ).slice(0, 20); // Get top 20 tokens

    return tokens;
  } catch (error) {
    console.error('Error fetching token list data:', error);
    throw error;
  }
};

export const fetchPopularCollections = async () => {
  try {
    const response = await axios.get('https://api-mainnet.magiceden.dev/v2/marketplace/popular_collections?timeRange=1d');
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};



// export const fetchHotCollections = async () => {
//   try {
//     const response = await axiosInstance.post('', {
//       jsonrpc: '2.0',
//       id: 1,
//       method: 'getTokenAccountsByDelegate',
//       params: [
//         'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA', // Token program ID
//         {
//           programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
//         },
//         {
//           encoding: 'jsonParsed',
//           limit: 10
//         }
//       ]
//     });
//     return response.data.result.value;
//   } catch (error) {
//     console.error('Error fetching token list data:', error);
//     throw error;
//   }
// };
