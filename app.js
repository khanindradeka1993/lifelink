const CONTRACT_ADDRESS =
"0xa7aFb8345779F26428D0B44e24c47c630cC52791";
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

        provider =
            new ethers.providers.Web3Provider(window.ethereum);

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

const requestList = document.getElementById("requestList");

async function loadRequests() {
    if (!contract) return;

    const requests = await contract.getRequests();

    requestList.innerHTML = "";

    requests.reverse().forEach((req) => {

        if (req.fulfilled) return;

        requestList.innerHTML += `
        <div style="
            border:1px solid #ddd;
            padding:10px;
            margin-top:10px;
            border-radius:10px;
        ">
            <strong>🚨 ${req.bloodGroup}</strong><br>
            Patient: ${req.patientName}<br>
            Hospital: ${req.hospital}<br>
            City: ${req.city}<br>

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
        </div>
        `;
    });
}
