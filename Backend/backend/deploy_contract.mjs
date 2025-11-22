import fs from "fs";
import { fileURLToPath } from "url";
import path from "path";
import dotenv from "dotenv";
import { ethers } from "ethers";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load compiled artifact
const artifactPath = path.resolve(
  __dirname,
  "../../Blockchain/artifacts/SupplyChain.json"
);

if (!fs.existsSync(artifactPath)) {
  console.error("❌ SupplyChain.json not found:", artifactPath);
  process.exit(1);
}

const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
const abi = artifact.abi;
const bytecode =
  artifact.bytecode ||
  artifact.data?.bytecode?.object ||
  artifact.evm?.bytecode?.object;

if (!abi || !bytecode) {
  console.error("❌ ABI or bytecode missing");
  process.exit(1);
}

const RPC_URL = process.env.RPC_URL;
let PRIVATE_KEY = process.env.PRIVATE_KEY;

if (!PRIVATE_KEY.startsWith("0x")) {
  PRIVATE_KEY = "0x" + PRIVATE_KEY;
}

if (!RPC_URL || !PRIVATE_KEY) {
  console.error("❌ RPC_URL or PRIVATE_KEY missing from .env");
  process.exit(1);
}

async function main() {
  console.log("🔗 Connecting to:", RPC_URL);

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  console.log("📌 Deployer wallet:", wallet.address);

  const factory = new ethers.ContractFactory(abi, bytecode, wallet);

  console.log("🚀 Deploying contract...");
  const contract = await factory.deploy();

  console.log("⏳ Transaction hash:", contract.deploymentTransaction().hash);
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("✅ Contract deployed at:", address);

  // Save metadata
  const out = {
    address,
    abi,
    deployTx: contract.deploymentTransaction().hash,
  };

  fs.writeFileSync(
    path.resolve(__dirname, "deployed_contract.json"),
    JSON.stringify(out, null, 2)
  );

  console.log("📄 Saved deployed_contract.json");
}

main().catch((err) => {
  console.error("❌ Deployment failed:", err);
});
