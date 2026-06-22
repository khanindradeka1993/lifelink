const CONTRACT_ADDRESS =
"0xe0beA6702B03FBc2eF3A44C2771a7f78B161F955";

const CONTRACT_ABI = [
{
"inputs":[
{"internalType":"string","name":"bloodGroup","type":"string"},
{"internalType":"string","name":"city","type":"string"}
],
"name":"registerDonor",
"outputs":[],
"stateMutability":"nonpayable",
"type":"function"
},
{
"inputs":[],
"name":"getDonors",
"outputs":[
{
"components":[
{"internalType":"string","name":"bloodGroup","type":"string"},
{"internalType":"string","name":"city","type":"string"},
{"internalType":"address","name":"wallet","type":"address"},
{"internalType":"bool","name":"available","type":"bool"}
],
"internalType":"struct LifeLinkDonor.Donor[]",
"name":"",
"type":"tuple[]"
}
],
"stateMutability":"view",
"type":"function"
}
];

let provider;
let signer;
let contract;
const connectBtn = document.getElementById("connectBtn");
const walletAddress = document.getElementById("walletAddress");
const registerBtn = document.getElementById("registerBtn");
const donorList = document.getElementById("donorList");
const searchBtn = document.getElementById("searchBtn");
const searchResults = document.getElementById("searchResults");

let currentAccount = "";

// Wallet Connect
connectBtn.addEventListener("click", async () => {
  if (!window.ethereum) {
    alert("Please install MetaMask");
    return;
  }

  try {
    const accounts = await ethereum.request({
      method: "eth_requestAccounts"
    });

    currentAccount = accounts[0];
provider = new ethers.providers.Web3Provider(window.ethereum);

signer = provider.getSigner();

contract = new ethers.Contract(
  CONTRACT_ADDRESS,
  CONTRACT_ABI,
  signer
); 
    walletAddress.innerText =
      "Connected: " +
      currentAccount.substring(0, 6) +
      "..." +
      currentAccount.substring(currentAccount.length - 4);

  } catch (error) {
    console.log(error);
  }
});

// Load donors
async function loadDonors() {
    if (!contract) return;

    const donors = await contract.getDonors();

    donorList.innerHTML = "";

    donors.forEach((donor) => {
        donorList.innerHTML += `
        <div style="
            border:1px solid #ddd;
            padding:10px;
            margin-top:10px;
            border-radius:10px;
        ">
            <strong>${donor.bloodGroup}</strong><br>
            City: ${donor.city}<br>
            Wallet: ${donor.wallet.substring(0,6)}...
            ${donor.wallet.substring(donor.wallet.length-4)}
        </div>
        `;
    });
}

// Register donor
registerBtn.addEventListener("click", async () => {
  const name = document.getElementById("name").value;
  const bloodGroup =
    document.getElementById("bloodGroup").value;
  const city =
    document.getElementById("city").value;

  if (!name || !bloodGroup || !city) {
    alert("Please fill all fields");
    return;
  }

  try {

  const tx = await contract.registerDonor(
    bloodGroup,
    city
  );

  alert("Transaction submitted ⏳");

  await tx.wait();

const donors = await contract.getDonors();
alert("Total donors on chain: " + donors.length);
await loadDonors();
    
alert("Donor registered on Arc ❤️");

} catch (err) {

  console.log(err);

  alert(err.message);
console.log(err);
}
});

// Show donors when page opens
loadDonors();

searchBtn.addEventListener("click", async () => {

    if (!contract) {
        alert("Please connect wallet first");
        return;
    }

    const bloodGroup =
        document.getElementById("searchBloodGroup").value;

    const city =
        document.getElementById("searchCity").value.toLowerCase();

    const donors = await contract.getDonors();

    const filtered = donors.filter((donor) => {

        return (
            donor.bloodGroup === bloodGroup &&
            donor.city.toLowerCase().includes(city)
        );

    });

    searchResults.innerHTML = "";

    if (filtered.length === 0) {

        searchResults.innerHTML =
            "<p>No donors found.</p>";

        return;
    }

    filtered.forEach((donor) => {

        searchResults.innerHTML += `
        <div style="
            border:1px solid #ddd;
            padding:10px;
            margin-top:10px;
            border-radius:10px;
        ">
            <strong>${donor.bloodGroup}</strong><br>
            City: ${donor.city}<br>
            Wallet: ${donor.wallet.substring(0,6)}...
            ${donor.wallet.substring(donor.wallet.length - 4)}
        </div>
        `;

    });

});
