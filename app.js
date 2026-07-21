const CONTRACT_ADDRESS =
"0x3e4c9Ec9598A507707d08Fd847Fe9909F2bb91AB";
const HEALTHCARE_CONTRACT_ADDRESS =
"0xE32313e236784f57a7479a830E4a9c0ce22d0761";
const EMERGENCY_CONTRACT_ADDRESS =
"0x8d1183f802b5688e5244a493Ea965e856150c2Ef";
const PAYMENT_CONTRACT_ADDRESS =
"0x0CA164a6FE7FfEA47945761748D77cd0aa16Afb1";
const USDC_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)"
];
const CONTRACT_ABI =
[
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_patientName",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_bloodGroup",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_hospital",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_city",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_contact",
        "type": "string"
      }
    ],
    "name": "createRequest",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_id",
        "type": "uint256"
      }
    ],
    "name": "fulfillRequest",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_bloodGroup",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_city",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_phone",
        "type": "string"
      },
      {
        "internalType": "int256",
        "name": "_latitude",
        "type": "int256"
      },
      {
        "internalType": "int256",
        "name": "_longitude",
        "type": "int256"
      }
    ],
    "name": "registerDonor",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "donors",
    "outputs": [
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "bloodGroup",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "city",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "phone",
        "type": "string"
      },
      {
        "internalType": "int256",
        "name": "latitude",
        "type": "int256"
      },
      {
        "internalType": "int256",
        "name": "longitude",
        "type": "int256"
      },
      {
        "internalType": "address",
        "name": "wallet",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "available",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getDonors",
    "outputs": [
      {
        "components": [
          {
            "internalType": "string",
            "name": "name",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "bloodGroup",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "city",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "phone",
            "type": "string"
          },
          {
            "internalType": "int256",
            "name": "latitude",
            "type": "int256"
          },
          {
            "internalType": "int256",
            "name": "longitude",
            "type": "int256"
          },
          {
            "internalType": "address",
            "name": "wallet",
            "type": "address"
          },
          {
            "internalType": "bool",
            "name": "available",
            "type": "bool"
          }
        ],
        "internalType": "struct LifeLinkDonor.Donor[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getRequests",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "id",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "patientName",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "bloodGroup",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "hospital",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "city",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "contact",
            "type": "string"
          },
          {
            "internalType": "address",
            "name": "requester",
            "type": "address"
          },
          {
            "internalType": "bool",
            "name": "fulfilled",
            "type": "bool"
          }
        ],
        "internalType": "struct LifeLinkDonor.BloodRequest[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "requests",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "patientName",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "bloodGroup",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "hospital",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "city",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "contact",
        "type": "string"
      },
      {
        "internalType": "address",
        "name": "requester",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "fulfilled",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalDonors",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
]
const HEALTHCARE_ABI = [
{
"inputs": [
{
"internalType": "string",
"name": "_fullName",
"type": "string"
},
{
"internalType": "string",
"name": "_bloodGroup",
"type": "string"
},
{
"internalType": "string",
"name": "_dob",
"type": "string"
},
{
"internalType": "string",
"name": "_gender",
"type": "string"
},
{
"internalType": "string",
"name": "_emergencyContact",
"type": "string"
},
{
"internalType": "string",
"name": "_allergies",
"type": "string"
},
{
"internalType": "string",
"name": "_addressInfo",
"type": "string"
}
],
"name": "createProfile",
"outputs": [],
"stateMutability": "nonpayable",
"type": "function"
},
{
"anonymous": false,
"inputs": [
{
"indexed": true,
"internalType": "address",
"name": "user",
"type": "address"
}
],
"name": "ProfileCreated",
"type": "event"
},
{
"anonymous": false,
"inputs": [
{
"indexed": true,
"internalType": "address",
"name": "user",
"type": "address"
}
],
"name": "ProfileUpdated",
"type": "event"
},
{
"inputs": [
{
"internalType": "string",
"name": "_fullName",
"type": "string"
},
{
"internalType": "string",
"name": "_bloodGroup",
"type": "string"
},
{
"internalType": "string",
"name": "_dob",
"type": "string"
},
{
"internalType": "string",
"name": "_gender",
"type": "string"
},
{
"internalType": "string",
"name": "_emergencyContact",
"type": "string"
},
{
"internalType": "string",
"name": "_allergies",
"type": "string"
},
{
"internalType": "string",
"name": "_addressInfo",
"type": "string"
}
],
"name": "updateProfile",
"outputs": [],
"stateMutability": "nonpayable",
"type": "function"
},
{
"inputs": [
{
"internalType": "address",
"name": "_user",
"type": "address"
}
],
"name": "getProfile",
"outputs": [
{
"internalType": "string",
"name": "",
"type": "string"
},
{
"internalType": "string",
"name": "",
"type": "string"
},
{
"internalType": "string",
"name": "",
"type": "string"
},
{
"internalType": "string",
"name": "",
"type": "string"
},
{
"internalType": "string",
"name": "",
"type": "string"
},
{
"internalType": "string",
"name": "",
"type": "string"
},
{
"internalType": "string",
"name": "",
"type": "string"
},
{
"internalType": "address",
"name": "",
"type": "address"
},
{
"internalType": "uint256",
"name": "",
"type": "uint256"
}
],
"stateMutability": "view",
"type": "function"
}
];
const EMERGENCY_ABI = [
{
"anonymous": false,
"inputs": [
{
"indexed": true,
"internalType": "uint256",
"name": "id",
"type": "uint256"
}
],
"name": "AmbulanceCompleted",
"type": "event"
},
{
"anonymous": false,
"inputs": [
{
"indexed": true,
"internalType": "uint256",
"name": "id",
"type": "uint256"
},
{
"indexed": true,
"internalType": "address",
"name": "requester",
"type": "address"
}
],
"name": "AmbulanceRequested",
"type": "event"
},
{
"inputs": [
{
"internalType": "uint256",
"name": "_id",
"type": "uint256"
}
],
"name": "completeRequest",
"outputs": [],
"stateMutability": "nonpayable",
"type": "function"
},
{
"anonymous": false,
"inputs": [
{
"indexed": true,
"internalType": "uint256",
"name": "id",
"type": "uint256"
},
{
"indexed": true,
"internalType": "address",
"name": "payer",
"type": "address"
}
],
"name": "HospitalBillPaid",
"type": "event"
},
{
"inputs": [
{
"internalType": "string",
"name": "_hospitalName",
"type": "string"
},
{
"internalType": "string",
"name": "_billId",
"type": "string"
},
{
"internalType": "uint256",
"name": "_amount",
"type": "uint256"
}
],
"name": "payHospitalBill",
"outputs": [],
"stateMutability": "nonpayable",
"type": "function"
},
{
"inputs": [
{
"internalType": "string",
"name": "_patientName",
"type": "string"
},
{
"internalType": "string",
"name": "_pickupLocation",
"type": "string"
},
{
"internalType": "string",
"name": "_hospital",
"type": "string"
},
{
"internalType": "string",
"name": "_contact",
"type": "string"
},
{
"internalType": "string",
"name": "_emergencyLevel",
"type": "string"
}
],
"name": "requestAmbulance",
"outputs": [],
"stateMutability": "nonpayable",
"type": "function"
},
{
"inputs": [],
"name": "getAmbulanceRequests",
"outputs": [
{
"components": [
{
"internalType": "uint256",
"name": "id",
"type": "uint256"
},
{
"internalType": "string",
"name": "patientName",
"type": "string"
},
{
"internalType": "string",
"name": "pickupLocation",
"type": "string"
},
{
"internalType": "string",
"name": "hospital",
"type": "string"
},
{
"internalType": "string",
"name": "contact",
"type": "string"
},
{
"internalType": "string",
"name": "emergencyLevel",
"type": "string"
},
{
"internalType": "address",
"name": "requester",
"type": "address"
},
{
"internalType": "bool",
"name": "completed",
"type": "bool"
}
],
"internalType": "struct LifeLinkEmergency.AmbulanceRequest[]",
"name": "",
"type": "tuple[]"
}
],
"stateMutability": "view",
"type": "function"
},
{
"inputs": [],
"name": "getPayments",
"outputs": [
{
"components": [
{
"internalType": "uint256",
"name": "id",
"type": "uint256"
},
{
"internalType": "string",
"name": "hospitalName",
"type": "string"
},
{
"internalType": "string",
"name": "billId",
"type": "string"
},
{
"internalType": "uint256",
"name": "amount",
"type": "uint256"
},
{
"internalType": "address",
"name": "payer",
"type": "address"
},
{
"internalType": "uint256",
"name": "timestamp",
"type": "uint256"
}
],
"internalType": "struct LifeLinkEmergency.HospitalPayment[]",
"name": "",
"type": "tuple[]"
}
],
"stateMutability": "view",
"type": "function"
}
];
const PAYMENT_ABI = [
{
"inputs": [
{
"internalType": "address",
"name": "usdcAddress",
"type": "address"
}
],
"stateMutability": "nonpayable",
"type": "constructor"
},
{
"anonymous": false,
"inputs": [
{
"indexed": true,
"internalType": "address",
"name": "payer",
"type": "address"
},
{
"indexed": true,
"internalType": "address",
"name": "hospitalWallet",
"type": "address"
},
{
"indexed": false,
"internalType": "uint256",
"name": "amount",
"type": "uint256"
},
{
"indexed": false,
"internalType": "string",
"name": "billId",
"type": "string"
}
],
"name": "HospitalBillPaid",
"type": "event"
},
{
"inputs": [
{
"internalType": "string",
"name": "hospitalName",
"type": "string"
},
{
"internalType": "string",
"name": "billId",
"type": "string"
},
{
"internalType": "address",
"name": "hospitalWallet",
"type": "address"
},
{
"internalType": "uint256",
"name": "amount",
"type": "uint256"
}
],
"name": "payHospitalBill",
"outputs": [],
"stateMutability": "nonpayable",
"type": "function"
},
{
"inputs": [
{
"internalType": "uint256",
"name": "index",
"type": "uint256"
}
],
"name": "getPayment",
"outputs": [
{
"components": [
{
"internalType": "string",
"name": "hospitalName",
"type": "string"
},
{
"internalType": "string",
"name": "billId",
"type": "string"
},
{
"internalType": "address",
"name": "hospitalWallet",
"type": "address"
},
{
"internalType": "uint256",
"name": "amount",
"type": "uint256"
},
{
"internalType": "address",
"name": "payer",
"type": "address"
},
{
"internalType": "uint256",
"name": "timestamp",
"type": "uint256"
}
],
"internalType": "struct LifeLinkPaymentV3.Payment",
"name": "",
"type": "tuple"
}
],
"stateMutability": "view",
"type": "function"
},
{
"inputs": [],
"name": "paymentCount",
"outputs": [
{
"internalType": "uint256",
"name": "",
"type": "uint256"
}
],
"stateMutability": "view",
"type": "function"
},
{
"inputs": [],
"name": "usdc",
"outputs": [
{
"internalType": "contract IERC20",
"name": "",
"type": "address"
}
],
"stateMutability": "view",
"type": "function"
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
const totalDonors = document.getElementById("totalDonors");
const dashboardDonors = document.getElementById("dashboardDonors");
const dashboardRequests = document.getElementById("dashboardRequests");
const dashboardFulfilled = document.getElementById("dashboardFulfilled");
const topBloodGroup = document.getElementById("topBloodGroup");
const totalCities = document.getElementById("totalCities");
const totalSOS = document.getElementById("totalSOS");
const payBillBtn = document.getElementById("payBillBtn");
const billStatus = document.getElementById("billStatus");
const ambulanceBtn = document.getElementById("ambulanceBtn");
const ambulanceStatus = document.getElementById("ambulanceStatus");
const ambulanceList = document.getElementById("ambulanceList");
const searchPatientBtn = document.getElementById("searchPatientBtn");
const doctorWallet = document.getElementById("doctorWallet");
const doctorStatus = document.getElementById("doctorStatus");

const patientProfileCard = document.getElementById("patientProfileCard");

const viewName = document.getElementById("viewName");
const viewBlood = document.getElementById("viewBlood");
const viewDOB = document.getElementById("viewDOB");
const viewGender = document.getElementById("viewGender");
const viewEmergency = document.getElementById("viewEmergency");
const viewAllergies = document.getElementById("viewAllergies");
const viewAddress = document.getElementById("viewAddress");

let currentAccount = "";
const EXPLORER = "https://testnet.arcscan.app";

// Wallet Connect
connectBtn.addEventListener("click", async () => {

    if (!window.ethereum) {
        alert("Please install MetaMask");
        return;
    }

    try {

const ARC_CHAIN_ID = "0x4ceaf2"; // 5042002 in hexadecimal

const chainId = await window.ethereum.request({
  method: "eth_chainId"
});

if (chainId !== ARC_CHAIN_ID) {
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: ARC_CHAIN_ID }]
    });
  } catch (error) {
    if (error.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [{
          chainId: ARC_CHAIN_ID,
          chainName: "Arc Network Testnet",
          nativeCurrency: {
            name: "USDC",
            symbol: "USDC",
            decimals: 6
          },
          rpcUrls: ["https://rpc.quicknode.testnet.arc.network"],
          blockExplorerUrls: ["https://testnet.arcscan.app"]
        }]
      });
    } else {
      throw error;
    }
  }
}      
        const accounts = await ethereum.request({
            method: "eth_requestAccounts"
        });

        currentAccount = accounts[0];

        provider =
            new ethers.providers.Web3Provider(window.ethereum);

        signer = provider.getSigner();

        contract = new ethers.Contract(
            CONTRACT_ADDRESS,
            CONTRACT_ABI,
            signer
        );
window.healthcareContract = new ethers.Contract(
    HEALTHCARE_CONTRACT_ADDRESS,
    HEALTHCARE_ABI,
    signer
);
window.emergencyContract = new ethers.Contract(
    EMERGENCY_CONTRACT_ADDRESS,
    EMERGENCY_ABI,
    signer
);
window.paymentContract = new ethers.Contract(
    PAYMENT_CONTRACT_ADDRESS,
    PAYMENT_ABI,
    signer
);
window.usdcContract = new ethers.Contract(
    "0x3600000000000000000000000000000000000000",
    USDC_ABI,
    signer
);      
  
      walletAddress.innerText =
            "Connected: " +
            currentAccount.substring(0, 6) +
            "..." +
            currentAccount.substring(currentAccount.length - 4);
connectBtn.innerText = "✅ Wallet Connected";
connectBtn.style.background = "#16a34a";
connectBtn.disabled = true;
      await loadDonors();
await loadRequests();
await loadAmbulanceRequests();
      
    } catch (error) {
        console.log(error);
    }

});
// Load donors
async function loadDonors() {
    if (!contract) return;

    const donors = await contract.getDonors();

    totalDonors.innerText = donors.length;
    dashboardDonors.innerText = donors.length;

    // Donor List
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
            City: ${donor.city}
        </div>
        `;
    });

    // Donor Map
    const mapDiv = document.getElementById("map");

    if (mapDiv) {
        mapDiv.innerHTML = "";

        if (window.donorMap) {
            window.donorMap.remove();
        }

        window.donorMap = L.map("map").setView([26.1445, 91.7362], 11);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "&copy; OpenStreetMap contributors"
        }).addTo(window.donorMap);

        donors.forEach((donor) => {
            if (Number(donor.latitude) !== 0 && Number(donor.longitude) !== 0) {
                L.marker([
                    Number(donor.latitude) / 1000000,
                    Number(donor.longitude) / 1000000
                ])
                .addTo(window.donorMap)
                .bindPopup(
                    `<b>${donor.name}</b><br>${donor.bloodGroup}<br>${donor.city}`
                );
            }
        });
    }
}

// Register donor
registerBtn.addEventListener("click", async () => {
  const name = document.getElementById("name").value;
  const bloodGroup =
    document.getElementById("bloodGroup").value;
  const city =
    document.getElementById("city").value;

  const phone =
document.getElementById("phone").value;
  if (!name || !bloodGroup || !city || !phone) {
    alert("Please fill all fields");
    return;
  }
let latitude = 0;
let longitude = 0;

try {
    const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
    });

    latitude = Math.round(position.coords.latitude * 1000000);
    longitude = Math.round(position.coords.longitude * 1000000);

} catch (e) {
    alert("Unable to get your location. Please allow GPS access.");
    return;
}
  
  try {

  const tx = await contract.registerDonor(
    name,
    bloodGroup,
    city,
    phone,
    latitude,
    longitude
);

  alert("Transaction submitted ⏳");

  await tx.wait();

showExplorerButton(tx.hash);

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
loadRequests();
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
totalDonors.innerText = donors.length;
  
    const filtered = donors.filter((donor) => {

        return (
            donor.bloodGroup === bloodGroup &&
            donor.city.toLowerCase().includes(city)
        );

    });

    searchResults.innerHTML = "";
if (filtered.length === 0) {

    searchResults.innerHTML =
        "<p>❌ No nearby donors found in this city.</p>";

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
        🩸 <strong>${donor.bloodGroup}</strong><br>
📍 ${donor.city}<br>

            <button
  onclick="window.location.href='tel:${donor.phone}'"
  style="
    margin-top:10px;
    background:#2563eb;
    color:white;
    border:none;
    padding:10px 15px;
    border-radius:8px;
    cursor:pointer;
  ">
  📞 Call Donor
</button>
    </div>
    `;

});

});

// =====================
// SOS Blood Request
// =====================

const requestBtn = document.getElementById("requestBtn");

requestBtn.addEventListener("click", async () => {
  if (!contract) {
    alert("Please connect wallet first");
    return;
  }

  const patientName = document.getElementById("patientName").value;
  const bloodGroup = document.getElementById("requestBloodGroup").value;
  const hospital = document.getElementById("hospital").value;
  const city = document.getElementById("requestCity").value;
  const contact = document.getElementById("contact").value;

  if (!patientName || !hospital || !city || !contact) {
    alert("Please fill all fields");
    return;
  }

  try {
    const tx = await contract.createRequest(
      patientName,
      bloodGroup,
      hospital,
      city,
      contact
    );

    alert("Submitting SOS request...");
    await tx.wait();

showExplorerButton(tx.hash);

await loadRequests();
   document.getElementById("patientName").value = "";
document.getElementById("requestBloodGroup").selectedIndex = 0;
document.getElementById("hospital").value = "";
document.getElementById("requestCity").value = "";
document.getElementById("contact").value = ""; 
    alert("🚨 SOS Request Created Successfully!");
  } catch (err) {
    console.error(err);

    if (err.error && err.error.message) {
        alert(err.error.message);
    } else if (err.reason) {
        alert(err.reason);
    } else {
        alert(JSON.stringify(err, null, 2));
    }
  }
});
// ==========================
// Load SOS Requests
// ==========================

const totalRequests = document.getElementById("totalRequests");
const requestList = document.getElementById("requestList");

async function loadRequests() {
    if (!contract) return;

    const requests = await contract.getRequests();
const active = requests.filter(r => !r.fulfilled);
totalRequests.innerText = active.length;
dashboardRequests.innerText = active.length;

const fulfilled = requests.filter(r => r.fulfilled);
dashboardFulfilled.innerText = fulfilled.length;

// Analytics
totalSOS.innerText = requests.length;

const bloodCount = {};

requests.forEach((r) => {
    const group = String(r.bloodGroup);

    if (!bloodCount[group]) {
        bloodCount[group] = 0;
    }

    bloodCount[group]++;
});
let topGroup = "-";
let max = 0;

for (const group in bloodCount) {
    if (bloodCount[group] > max) {
        max = bloodCount[group];
        topGroup = group;
    }
}
  
topBloodGroup.innerText = topGroup;

// Count unique cities
const cities = [...new Set(
    requests.map(r => String(r.city).toLowerCase())
)];
totalCities.innerText = cities.length;
  
    requestList.innerHTML = "";

    const reversedRequests = [...requests].reverse();

reversedRequests.forEach((req) => {

        if (req.fulfilled) return;

        requestList.innerHTML += `
        <div style="
    border-left:6px solid #dc3545;
background:#1E293B;
color:#FFFFFF;
border:1px solid #475569;
border-radius:16px;
padding:15px;
margin-top:12px;
box-shadow:0 8px 20px rgba(0,0,0,0.35);
"
">
            <h3 style="color:#ef4444;margin:0;">🚨 ${req.bloodGroup}</h3>

<div style="color:#E2E8F0;">
👤 <strong>${req.patientName}</strong><br>
🏥 ${req.hospital}<br>
📍 ${req.city}<br>
</div>

            <button
                onclick="window.location.href='tel:${req.contact}'"
                style="
                    margin-top:10px;
                    background:#dc3545;
                    color:white;
                    border:none;
                    padding:10px 15px;
                    border-radius:8px;
                    cursor:pointer;
                ">
                📞 Call Patient
            </button>
      <button
    onclick="fulfillRequest(${req.id})"
    style="
        margin-top:10px;
        margin-left:10px;
        background:#16a34a;
        color:white;
        border:none;
        padding:10px 15px;
        border-radius:8px;
        cursor:pointer;
    ">
    ❤️ I'm Coming to Donate
</button>  
        </div>
        `;
    });
}
async function fulfillRequest(id) {

    if (!contract) {
        alert("Please connect wallet first");
        return;
    }

    try {

        const tx = await contract.fulfillRequest(id);

        alert("Updating request...");

        await tx.wait();

showExplorerButton(tx.hash);

alert("✅ Request marked as fulfilled!");

await loadRequests();
await loadDonors();

    } catch (err) {

        console.log(err);
        alert(err.message);

    }

}
// ===============================
// AI Emergency Assistant
// ===============================

const askAIBtn = document.getElementById("askAIBtn");

if (askAIBtn) {
  askAIBtn.addEventListener("click", async () => {

    const question = document.getElementById("aiQuestion").value.trim();
    const chatBox = document.getElementById("chatBox");

    if (!question) {
  return;
}

chatBox.innerHTML += `
<div style="text-align:right;margin:10px 0;">
  <div style="display:inline-block;background:#2563eb;color:white;padding:10px 15px;border-radius:15px;max-width:80%;">
    ${question}
  </div>
</div>`;

chatBox.innerHTML += `
<div id="loading" style="margin:10px 0;color:#666;">
🤖 Thinking...
</div>`;

chatBox.scrollTop = chatBox.scrollHeight;

try {
  const response = await fetch("/api/emergency-ai", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ question })
  });

  const data = await response.json();

  document.getElementById("loading").remove();

  chatBox.innerHTML += `
<div style="text-align:left;margin:10px 0;">
  <div style="display:inline-block;background:#f1f5f9;padding:10px 15px;border-radius:15px;max-width:80%;">
    🤖 ${data.reply}
  </div>
</div>`;

  chatBox.scrollTop = chatBox.scrollHeight;

} catch (err) {
  document.getElementById("loading").remove();

  chatBox.innerHTML += `
<div style="color:red;">
❌ Failed to contact AI.
</div>`;
}

  });
}
function showExplorerButton(txHash) {

  const explorer = `${EXPLORER}/tx/${txHash}`;

  let card = document.getElementById("txCard");

  if (!card) {

    card = document.createElement("div");
    card.id = "txCard";

    card.style.margin = "15px 0";

    document.getElementById("walletAddress").insertAdjacentElement("afterend", card);

  }

  card.innerHTML = `
<div style="
background:#1E293B;
border:1px solid #334155;
border-radius:16px;
padding:18px;
text-align:center;
box-shadow:0 8px 20px rgba(0,0,0,.25);
">

<h3 style="
color:#ffffff;
margin:0 0 12px 0;
">
📦 Latest Blockchain Transaction
</h3>

<p style="
color:#94a3b8;
font-size:13px;
word-break:break-all;
margin-bottom:16px;
">
${txHash}
</p>

<a href="${explorer}" target="_blank">
<button style="
width:100%;
padding:14px;
background:linear-gradient(135deg,#2563eb,#3b82f6);
color:white;
border:none;
border-radius:12px;
font-size:17px;
font-weight:bold;
cursor:pointer;
">
🔗 View on ArcScan
</button>
</a>

</div>
`;
}
// ===============================
// Hospital Bill Payment
// ===============================

if (payBillBtn) {
  payBillBtn.addEventListener("click", async () => {

    if (!window.emergencyContract) {
      alert("Please connect wallet first");
      return;
    }

    const hospital = document.getElementById("hospitalName").value.trim();
    const billId = document.getElementById("billId").value.trim();
  const hospitalWallet = document.getElementById("hospitalWallet").value.trim();
    const amount = document.getElementById("billAmount").value.trim();

    if (!hospital || !billId || !hospitalWallet || !amount) {
    alert("Please fill all fields");
    return;
}

    try {

if (!hospitalWallet) {
  alert("Please enter Hospital Wallet Address");
  return;
}
const approveTx = await window.usdcContract.approve(
    PAYMENT_CONTRACT_ADDRESS,
    ethers.utils.parseUnits(amount, 6)
);

billStatus.innerHTML = "⏳ Approving USDC...";
await approveTx.wait();
const tx = await window.paymentContract.payHospitalBill(
    hospital,
    billId,
    hospitalWallet,
    ethers.utils.parseUnits(amount, 6)
);

      billStatus.innerHTML = "⏳ Waiting for confirmation...";

      await tx.wait();

      showExplorerButton(tx.hash);

      billStatus.innerHTML =
        "✅ Hospital bill recorded on blockchain.";

    } catch (err) {
      console.log(err);
      alert(err.message);
    }

  });
}
// ================================
// Emergency Ambulance
// ================================

if (ambulanceBtn) {
  ambulanceBtn.addEventListener("click", async () => {

    if (!window.emergencyContract) {
      alert("Please connect wallet first");
      return;
    }

    const patient = document.getElementById("ambulancePatient").value.trim();
    const pickup = document.getElementById("pickupLocation").value.trim();
    const hospital = document.getElementById("ambulanceHospital").value.trim();
    const contact = document.getElementById("ambulanceContact").value.trim();
    const level = document.getElementById("emergencyLevel").value;

    if (!patient || !pickup || !hospital || !contact) {
      alert("Please fill all fields");
      return;
    }

    try {
      ambulanceStatus.innerHTML = "🚑 Sending ambulance request...";

      const tx = await window.emergencyContract.requestAmbulance(
        patient,
        pickup,
        hospital,
        contact,
        level
      );

      await tx.wait();

      ambulanceStatus.innerHTML = "✅ Ambulance request recorded on blockchain.";

      loadAmbulanceRequests();

    } catch (err) {
      console.log(err);
      alert(err.message);
    }

  });
}

async function loadAmbulanceRequests() {

  if (!window.emergencyContract) return;

  const requests = await window.emergencyContract.getAmbulanceRequests();

  ambulanceList.innerHTML = "";

  requests.forEach((r) => {
if (r.completed) return;
    
  ambulanceList.innerHTML += `
<div class="card" style="margin-top:10px;">

<b>${r.patientName}</b><br>

🚨 ${r.emergencyLevel}<br>
📍 ${r.pickupLocation}<br>
🏥 ${r.hospital}<br><br>

<a href="tel:${r.contact}">
<button>📞 Call Patient</button>
</a>
<button onclick="completeAmbulance(${r.id})">
✅ Complete Request
</button>

</div>
`;
  });

}
async function completeAmbulance(id) {

    if (!window.emergencyContract) {
        alert("Connect wallet first");
        return;
    }

    try {

        ambulanceStatus.innerHTML = "⏳ Completing request...";

        const tx = await window.emergencyContract.completeRequest(id);

        await tx.wait();

        ambulanceStatus.innerHTML = "✅ Request completed.";

        loadAmbulanceRequests();

    } catch (err) {

        console.log(err);
        alert(err.message);

    }

}

if (searchPatientBtn) {
    searchPatientBtn.addEventListener("click", async () => {

        if (!window.healthcareContract) {
            alert("Connect wallet first");
            return;
        }

        const wallet = doctorWallet.value.trim();

        if (!ethers.utils.isAddress(wallet)) {
            alert("Enter a valid wallet address");
            return;
        }

        try {

            doctorStatus.innerHTML = "🔍 Searching patient...";

            const profile =
                await window.healthcareContract.getProfile(wallet);

            viewName.textContent = profile[0];
            viewBlood.textContent = profile[1];
            viewDOB.textContent = profile[2];
            viewGender.textContent = profile[3];
            viewEmergency.textContent = profile[4];
            viewAllergies.textContent = profile[5];
            viewAddress.textContent = profile[6];

            patientProfileCard.style.display = "block";

            doctorStatus.innerHTML =
                "✅ Patient record loaded.";

        } catch (err) {

            console.log(err);

            doctorStatus.innerHTML =
                "❌ Patient profile not found.";

            patientProfileCard.style.display = "none";
        }

    });
}

// ===============================
// Quick Action Navigation
// ===============================

document.querySelectorAll(".quick-action").forEach(button => {
    button.addEventListener("click", () => {
        const target = button.dataset.target;
        const section = document.getElementById(target);

        if (section) {
            section.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }
    });
});
