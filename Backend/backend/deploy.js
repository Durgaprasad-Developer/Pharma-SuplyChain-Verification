import dotenv from "dotenv";
dotenv.config();

import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ES module path fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
    const provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC);

    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    console.log("Deploying with:", wallet.address);

    const contractJSON = JSON.parse(
        fs.readFileSync(path.join(__dirname, "SupplyChain.json"))
    );

    const abi = contractJSON.abi;
    const bytecode = contractJSON.bytecode;

    const factory = new ethers.ContractFactory(abi, bytecode, wallet);

    console.log("Sending deployment TX...");
    const contract = await factory.deploy();

    console.log("Waiting for confirmation...");
    await contract.deploymentTransaction().wait();

    console.log("🚀 Contract deployed at:", contract.target);

    // Save address
    fs.writeFileSync(
        path.join(__dirname, "deployedAddress.json"),
        JSON.stringify({ address: contract.target }, null, 2)
    );
}

main().catch(console.error);
