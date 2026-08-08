// Circle Wallet Stack - isolated test
import { W3SSdk } from "@circle-fin/w3s-pw-web-sdk";

console.log("✅ Circle W3SSdk module loaded successfully");

const circleSdk = new W3SSdk();

window.circleSdk = circleSdk;

console.log("✅ Circle SDK initialized");
