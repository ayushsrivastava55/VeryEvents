const hre = require("hardhat");

async function main() {
  console.log("Deploying EventFactory to VERY Chain...");

  const EventFactory = await hre.ethers.getContractFactory("EventFactory");
  const eventFactory = await EventFactory.deploy();

  await eventFactory.waitForDeployment();

  const address = await eventFactory.getAddress();
  console.log(`EventFactory deployed to: ${address}`);
  console.log(`View on VeryScan: https://veryscan.io/address/${address}`);

  // Verify contract (if verification is supported)
  console.log("\nTo verify on VeryScan, run:");
  console.log(`npx hardhat verify --network very ${address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
