/** @type import('hardhat/config').HardhatUserConfig */

require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.24",
  networks: {
    amoy: {
      url: "https://polygon-amoy.infura.io/v3/da431f74f7b44cf9820fee6601f01d7f",   // <-- Infura Amoy endpoint
      accounts: [process.env.PRIVATE_KEY]    // <-- YOUR new wallet private key from .env
    },
  },
};
