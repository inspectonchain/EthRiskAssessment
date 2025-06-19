// Test script to verify connection analysis
const testAddress = "0x0382F857B2C1eD6fc0C29F5B7fF2F0fbD8c838A4";
const sanctionedAddress = "0xd5ED34b52AC4ab84d8FA8A231a3218bbF01Ed510";

// Mock transaction showing connection
const mockTransaction = {
  hash: "0x1234567890abcdef",
  type: "Received ETH",
  value: "+1.0000 ETH",
  usdValue: "$2426.89",
  timestamp: new Date("2024-01-01T12:00:00Z"),
  from: sanctionedAddress,
  to: testAddress
};

console.log("Test transaction:", mockTransaction);
console.log("Should detect connection between:", testAddress, "and sanctioned:", sanctionedAddress);