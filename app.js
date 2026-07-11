const CONTRACT_ADDRESS =
"0xa7aFb8345779F26428D0B44e24c47c630cC52791";
const HEALTHCARE_CONTRACT_ADDRESS =
"0xE32313e236784f57a7479a830E4a9c0ce22d0761";
const EMERGENCY_CONTRACT_ADDRESS =
"0x8d1183f802b5688e5244a493Ea965e856150c2Ef";
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
    "inputs": [
      {
        "internalType": "string",
        "name": "_bloodGroup",
        "type": "string"
      }
    ],
    "name": "searchDonors",
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
  },
  {
    "inputs": [],
    "name": "totalRequests",
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
const EMERGENCY_ABI = [
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

let currentAccount = "";
const EXPLORER = "https://testnet.arcscan.app";

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

  try {

  const tx = await contract.registerDonor(
    name,
    bloodGroup,
    city,
    phone
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
    console.log(err);
    alert(err.message);
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
    background:#fff5f5;
    border-radius:12px;
    padding:15px;
    margin-top:12px;
    box-shadow:0 2px 8px rgba(0,0,0,0.08);
">
            <h3 style="color:#dc3545;margin:0;">🚨 ${req.bloodGroup}</h3>

👤 <strong>${req.patientName}</strong><br>
🏥 ${req.hospital}<br>
📍 ${req.city}<br>

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
      background:#f8fafc;
      border:1px solid #cbd5e1;
      border-radius:10px;
      padding:12px;
      text-align:center;
    ">
      <strong>📦 Latest Blockchain Transaction</strong><br><br>

      <a href="${explorer}" target="_blank">
        <button style="
          width:100%;
          padding:12px;
          background:#2563eb;
          color:white;
          border:none;
          border-radius:8px;
          cursor:pointer;
        ">
          🔗 View on ArcScan
        </button>
      </a>
    </div>
  `;
}
