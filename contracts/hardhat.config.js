require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    hardhat: {},
    very: {
      url: process.env.VERY_RPC_URL || "https://rpc.verylabs.io",
      chainId: 4613,
      accounts: (process.env.PRIVATE_KEY && process.env.PRIVATE_KEY.length === 66)
        ? [process.env.PRIVATE_KEY]
        : [],
      timeout: 120000,
      httpHeaders: {
        "Content-Type": "application/json",
      },
      gasPrice: 1000000000, // 1 gwei - set a lower gas price
    },
  },
};
