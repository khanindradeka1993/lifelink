import { W3SSdk } from "@circle-fin/w3s-pw-web-sdk";

// ==========================================
// 1. CONTRACT ADDRESSES & RPC CONFIGURATION
// ==========================================
const CONTRACT_ADDRESS = "0x80C0E143602DfDaD980adF1ae3cfF9B9153Aa2b7";
const HEALTHCARE_CONTRACT_ADDRESS = "0xE32313e236784f57a7479a830E4a9c0ce22d0761";
const EMERGENCY_CONTRACT_ADDRESS = "0x8d1183f802b5688e5244a493Ea965e856150c2Ef";
const PAYMENT_CONTRACT_ADDRESS = "0x0CA164a6FE7FfEA47945761748D77cd0aa16Afb1";
const EXPLORER = "https://testnet.arcscan.app";
const ARC_RPC_URL = "https://rpc.quicknode.testnet.arc.network";

// ==========================================
// 2. ABIs
// ==========================================
const USDC_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)"
];

const CONTRACT_ABI = [
  {
    "inputs": [
      { "internalType": "string", "name": "_patientName", "type": "string" },
      { "internalType": "string", "name": "_bloodGroup", "type": "string" },
      { "internalType": "string", "name": "_hospital", "type": "string" },
      { "internalType": "string", "name": "_city", "type": "string" },
      { "internalType": "string", "name": "_contact", "type": "string" }
    ],
    "name": "createRequest",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_id", "type": "uint256" }],
    "name": "fulfillRequest",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "_name", "type": "string" },
      { "internalType": "string", "name": "_bloodGroup", "type": "string" },
      { "internalType": "string", "name": "_city", "type": "string" },
      { "internalType": "string", "name": "_phone", "type": "string" },
      { "internalType": "int256", "name": "_latitude", "type": "int256" },
      { "internalType": "int256", "name": "_longitude", "type": "int256" }
    ],
    "name": "registerDonor",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "name": "donors",
    "outputs": [
      { "internalType": "string", "name": "name", "type": "string" },
      { "internalType": "string", "name": "bloodGroup", "type": "string" },
      { "internalType": "string", "name": "city", "type": "string" },
      { "internalType": "string", "name": "phone", "type": "string" },
      { "internalType": "int256", "name": "latitude", "type": "int256" },
      { "internalType": "int256", "name": "longitude", "type": "int256" },
      { "internalType": "address", "name": "wallet", "type": "address" },
      { "internalType": "bool", "name": "available", "type": "bool" }
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
          { "internalType": "string", "name": "name", "type": "string" },
          { "internalType": "string", "name": "bloodGroup", "type": "string" },
          { "internalType": "string", "name": "city", "type": "string" },
          { "internalType": "string", "name": "phone", "type": "string" },
          { "internalType": "int256", "name": "latitude", "type": "int256" },
          { "internalType": "int256", "name": "longitude", "type": "int256" },
          { "internalType": "address", "name": "wallet", "type": "address" },
          { "internalType": "bool", "name": "available", "type": "bool" }
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
          { "internalType": "uint256", "name": "id", "type": "uint256" },
          { "internalType": "string", "name": "patientName", "type": "string" },
          { "internalType": "string", "name": "bloodGroup", "type": "string" },
          { "internalType": "string", "name": "hospital", "type": "string" },
          { "internalType": "string", "name": "city", "type": "string" },
          { "internalType": "string", "name": "contact", "type": "string" },
          { "internalType": "address", "name": "requester", "type": "address" },
          { "internalType": "bool", "name": "fulfilled", "type": "bool" }
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
    "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "name": "requests",
    "outputs": [
      { "internalType": "uint256", "name": "id", "type": "uint256" },
      { "internalType": "string", "name": "patientName", "type": "string" },
      { "internalType": "string", "name": "bloodGroup", "type": "string" },
      { "internalType": "string", "name": "hospital", "type": "string" },
      { "internalType": "string", "name": "city", "type": "string" },
      { "internalType": "string", "name": "contact", "type": "string" },
      { "internalType": "address", "name": "requester", "type": "address" },
      { "internalType": "bool", "name": "fulfilled", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalDonors",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
];

const HEALTHCARE_ABI = [
  {
    "inputs": [
      { "internalType": "string", "name": "_fullName", "type": "string" },
      { "internalType": "string", "name": "_bloodGroup", "type": "string" },
      { "internalType": "string", "name": "_dob", "type": "string" },
      { "internalType": "string", "name": "_gender", "type": "string" },
      { "internalType": "string", "name": "_emergencyContact", "type": "string" },
      { "internalType": "string", "name": "_allergies", "type": "string" },
      { "internalType": "string", "name": "_addressInfo", "type": "string" }
    ],
    "name": "createProfile",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "_user", "type": "address" }],
    "name": "getProfile",
    "outputs": [
      { "internalType": "string", "name": "", "type": "string" },
      { "internalType": "string", "name": "", "type": "string" },
      { "internalType": "string", "name": "", "type": "string" },
      { "internalType": "string", "name": "", "type": "string" },
      { "internalType": "string", "name": "", "type": "string" },
      { "internalType": "string", "name": "", "type": "string" },
      { "internalType": "string", "name": "", "type": "string" },
      { "internalType": "address", "name": "", "type": "address" },
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

const EMERGENCY_ABI = [
  {
    "inputs": [{ "internalType": "uint256", "name": "_id", "type": "uint256" }],
    "name": "completeRequest",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "_patientName", "type": "string" },
      { "internalType": "string", "name": "_pickupLocation", "type": "string" },
      { "internalType": "string", "name": "_hospital", "type": "string" },
      { "internalType": "string", "name": "_contact", "type": "string" },
      { "internalType": "string", "name": "_emergencyLevel", "type": "string" }
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
          { "internalType": "uint256", "name": "id", "type": "uint256" },
          { "internalType": "string", "name": "patientName", "type": "string" },
          { "internalType": "string", "name": "pickupLocation", "type": "string" },
          { "internalType": "string", "name": "hospital", "type": "string" },
          { "internalType": "string", "name": "contact", "type": "string" },
          { "internalType": "string", "name": "emergencyLevel", "type": "string" },
          { "internalType": "address", "name": "requester", "type": "address" },
          { "internalType": "bool", "name": "completed", "type": "bool" }
        ],
        "internalType": "struct LifeLinkEmergency.AmbulanceRequest[]",
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
      { "internalType": "string", "name": "hospitalName", "type": "string" },
      { "internalType": "string", "name": "billId", "type": "string" },
      { "internalType": "address", "name": "hospitalWallet", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "payHospitalBill",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// ==========================================
// 3. GLOBAL READ-ONLY PROVIDERS & CONTRACTS
// ==========================================
const defaultProvider = new ethers.providers.JsonRpcProvider(ARC_RPC_URL);

const readOnlyContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, defaultProvider);
const readOnlyEmergency = new ethers.Contract(EMERGENCY_CONTRACT_ADDRESS, EMERGENCY_ABI, defaultProvider);
const readOnlyHealthcare = new ethers.Contract(HEALTHCARE_CONTRACT_ADDRESS, HEALTHCARE_ABI, defaultProvider);
const readOnlyPayment = new ethers.Contract(PAYMENT_CONTRACT_ADDRESS, PAYMENT_ABI, defaultProvider);

let provider;
let signer;
let contract = readOnlyContract;
// DOM Elements
const connectBtn = document.getElementById("connectBtn");
const disconnectBtn = document.getElementById("disconnectBtn");
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

const circleGoogleBtn = document.getElementById("circleGoogleBtn");
const circleWalletStatus = document.getElementById("circleWalletStatus");

let currentAccount = "";
let explicitWalletConnected = false;

// ==========================================
// 4. HELPER FUNCTIONS
// ==========================================
function isWalletConnected() {
  return explicitWalletConnected;
}

function getActiveWallet() {
   if (!explicitWalletConnected) {
    return null;
   } 
  if (currentAccount) {
    return {
      type: "METAMASK",
      account: currentAccount,
      signer: signer
    };
  }

  const activeType = sessionStorage.getItem("active_wallet_type");
  const circleUserId = sessionStorage.getItem("circle_user_id");
  const circleUserToken = sessionStorage.getItem("circle_user_token");

  if (activeType === "CIRCLE" && circleUserId && circleUserToken) {
    return {
      type: "CIRCLE",
      userId: circleUserId,
      userToken: circleUserToken,
      address: sessionStorage.getItem("circle_wallet_address") || circleUserId
    };
  }

  return null;
}

function enableWalletCopy(address) {
  const copyBtn = document.getElementById("copyWalletBtn");
  if (!copyBtn) return;

  const addrToCopy = address || sessionStorage.getItem("circle_wallet_address") || currentAccount;
  
  if (!addrToCopy) {
    copyBtn.style.display = "none";
    return;
  }

  copyBtn.style.display = "inline-block";
  copyBtn.onclick = () => {async
    navigator.clipboard.writeText(addrToCopy);
    copyBtn.innerText = "✅ Copied!";
    setTimeout(() => {
      copyBtn.innerText = "📋 Copy";
    }, 2000);
  };
}

async function executeCircleTransaction(abiFunction, contractAddress, args) {
  const userToken = sessionStorage.getItem("circle_user_token");
  if (!userToken) throw new Error("Circle session expired. Please sign in again.");

  const response = await fetch("/api/execute-circle-tx", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userToken, functionSignature: abiFunction, contractAddress, args })
  });

  const data = await response.json();

  if (data.userToken && data.encryptionKey) {
    sessionStorage.setItem("circle_user_token", data.userToken);
    sessionStorage.setItem("circle_encryption_key", data.encryptionKey);
  }

  let sdkInstance = window.circleSdk;
  if (!sdkInstance && typeof W3SSdk !== "undefined") {
    const appId = import.meta.env?.VITE_CIRCLE_APP_ID || process.env.VITE_CIRCLE_APP_ID;
    if (appId) {
      sdkInstance = new W3SSdk({ appSettings: { appId } });
      await sdkInstance.getDeviceId();
      window.circleSdk = sdkInstance;
    } else {
      throw new Error("Missing VITE_CIRCLE_APP_ID environment variable.");
    }
  }

  const activeUserToken = sessionStorage.getItem("circle_user_token");
  const activeEncKey = sessionStorage.getItem("circle_encryption_key");

  if (activeUserToken && activeEncKey) {
    sdkInstance.setAuthentication({
      userToken: activeUserToken,
      encryptionKey: activeEncKey
    });
  }

  const challengeId = data.challengeId || data.data?.challengeId;

    if (data.needsWalletSetup && challengeId) {
    alert("First-time setup required. Opening Circle PIN setup...");
    return new Promise((resolve, reject) => {
      sdkInstance.execute(challengeId, async (error) => {
        if (error) return reject(error);
        
        alert("Wallet & PIN created successfully! Processing your transaction...");
        try {
          // Fetch a fresh transaction challenge directly instead of re-running the whole initialization flow
          const txResponse = await fetch("/api/execute-circle-tx", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userToken, functionSignature: abiFunction, contractAddress, args, skipSetup: true })
          });
          const txData = await txResponse.json();
          const newChallengeId = txData.challengeId || txData.data?.challengeId;

          if (!newChallengeId) throw new Error(txData.error || "Failed to create transaction challenge after setup.");

          sdkInstance.execute(newChallengeId, (txErr, sdkResult) => {
            if (txErr) return reject(txErr);

            const resObj = sdkResult || {};
            const finalHash = resObj.txHash || resObj.transactionHash || resObj.data?.txHash || resObj.data?.transactionHash || newChallengeId;

            showExplorerButton(finalHash);

            setTimeout(async () => {
              if (typeof loadDashboardData === "function") await loadDashboardData();
              if (typeof fetchRequests === "function") await fetchRequests();
            }, 4000);

            resolve(finalHash);
          });
        } catch (e) {
          reject(e);
        }
      });
    });
    }


function showExplorerButton(txHash) {
  txHash = typeof txHash === 'object' ? (txHash.txHash || txHash.challengeId || "") : txHash;
  const explorer = `${EXPLORER}/tx/${txHash}`;
  let card = document.getElementById("txCard");

  if (!card) {
    card = document.createElement("div");
    card.id = "txCard";
    card.style.margin = "15px 0";
    if (walletAddress) {
      walletAddress.insertAdjacentElement("afterend", card);
    }
  }

  card.innerHTML = `
  <div style="background:#1E293B;border:1px solid #334155;border-radius:16px;padding:18px;text-align:center;box-shadow:0 8px 20px rgba(0,0,0,.25);">
    <h3 style="color:#ffffff;margin:0 0 12px 0;">📦 Latest Blockchain Transaction</h3>
    <p style="color:#94a3b8;font-size:13px;word-break:break-all;margin-bottom:16px;">${txHash}</p>
    <a href="${explorer}" target="_blank">
      <button style="width:100%;padding:14px;background:linear-gradient(135deg,#2563eb,#3b82f6);color:white;border:none;border-radius:12px;font-size:17px;font-weight:bold;cursor:pointer;">
        🔗 View on ArcScan
      </button>
    </a>
  </div>
  `;
}

function resetDashboardLists() {
  const registeredDonorsList = document.getElementById("registeredDonorsList");
  const donorContainer = registeredDonorsList || donorList;
if (donorContainer) {
  donorContainer.innerHTML = "<p style='color:#94a3b8;padding:10px;'>🔒 Connect wallet to view donors.</p>";
}
  
  const requestList = document.getElementById("requestList");
  if (requestList) requestList.innerHTML = "<p style='color:#94a3b8;padding:10px;'>🔒 Connect wallet to view active SOS requests.</p>";
  
  if (ambulanceList) ambulanceList.innerHTML = "<p style='color:#94a3b8;padding:10px;'>🔒 Connect wallet to view live ambulance requests.</p>";
  if (searchResults) searchResults.innerHTML = "";
  
  const totalReq = document.getElementById("totalRequests");
  const fulfilledReq = document.getElementById("fulfilledRequests");

  if (totalDonors) totalDonors.innerText = "0";
  if (dashboardDonors) dashboardDonors.innerText = "0";
  if (totalReq) totalReq.innerText = "0";
  if (dashboardRequests) dashboardRequests.innerText = "0";
  if (fulfilledReq) fulfilledReq.innerText = "0";
  if (dashboardFulfilled) dashboardFulfilled.innerText = "0";
  if (totalSOS) totalSOS.innerText = "0";
  if (topBloodGroup) topBloodGroup.innerText = "-";
  if (totalCities) totalCities.innerText = "0";
}

async function disconnectWallet() {
  currentAccount = "";
  explicitWalletConnected = false;

  provider = null;
  signer = null;
  contract = readOnlyContract;

  sessionStorage.removeItem("active_wallet_type");
  sessionStorage.removeItem("circle_user_token");
  sessionStorage.removeItem("circle_user_id");
  sessionStorage.removeItem("circle_wallet_address");

  if (walletAddress) {
    walletAddress.innerText = "Not Connected";
    walletAddress.style.color = "";
  }

  if (disconnectBtn) {
    disconnectBtn.style.display = "none";
  }

  if (connectBtn) {
    connectBtn.innerText = "Connect Wallet";
    connectBtn.disabled = false;
    connectBtn.style.background = "";
  }

  if (circleWalletStatus) {
    circleWalletStatus.style.display = "none";
  }

  resetDashboardLists();
}

// ==========================================
// 5. DATA LOADERS (STRICT WALLET CHECK)
// ==========================================
async function reloadAppData() {
  if (!isWalletConnected()) {
    resetDashboardLists();
    return;
  }

  await Promise.allSettled([
    loadDonors(),
    loadRequests(),
    loadAmbulanceRequests()
  ]);
}

async function loadDonors() {
  if (!isWalletConnected()) {
    resetDashboardLists();
    return;
  }

  try {
    const activeContract = contract || readOnlyContract;
    if (!activeContract) return;

    const donors = await activeContract.getDonors();
const availableDonors = donors.filter(donor => donor.available);
    
    if (typeof totalDonors !== "undefined" && totalDonors) totalDonors.innerText = availableDonors.length;
    if (typeof dashboardDonors !== "undefined" && dashboardDonors) dashboardDonors.innerText = availableDonors.length;

    const targetList = document.getElementById("registeredDonorsList") || donorList;

    if (targetList) {
      targetList.innerHTML = "";
      availableDonors.forEach((donor) => {
        targetList.innerHTML += `
        <div style="border:1px solid #334155;background:#1E293B;color:#FFFFFF;padding:12px;margin-top:10px;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.2);">
          <strong style="color:#ef4444;">🩸 ${donor.bloodGroup}</strong> - ${donor.name}<br>
          <span style="color:#94a3b8;">📍 City: ${donor.city}</span><br>
          <button onclick="window.location.href='tel:${donor.phone}'" style="margin-top:8px;background:#2563eb;color:white;border:none;padding:6px 12px;border-radius:8px;cursor:pointer;font-weight:bold;font-size:13px;">
            📞 Call Donor
          </button>
        </div>
        `;
      });
    }

    const mapDiv = document.getElementById("map");
    if (mapDiv && window.L) {
      mapDiv.innerHTML = "";

      if (window.donorMap) {
        window.donorMap.remove();
      }

      window.donorMap = L.map("map").setView([26.1443, 91.7362], 11);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(window.donorMap);

      donors.forEach((donor) => {
        if (Number(donor.latitude) !== 0 && Number(donor.longitude) !== 0) {
          L.marker([
            Number(donor.latitude) / 1000000,
            Number(donor.longitude) / 1000000
          ])
          .addTo(window.donorMap)
          .bindPopup(`<b>${donor.name}</b><br>${donor.bloodGroup}<br>${donor.city}`);
        }
      });
    }
  } catch (e) {
    console.error("Error loading donors:", e);
  }
}

async function loadRequests() {
  if (!isWalletConnected()) {
    resetDashboardLists();
    return;
  }

  try {
    const activeContract = contract || readOnlyContract;
    if (!activeContract) return;

    const requests = await activeContract.getRequests();

    const activeRequests = requests.filter(r => !r.fulfilled);
    const fulfilledRequests = requests.filter(r => r.fulfilled);

    // 1. Hospital Dashboard Counters
    const totalReq = document.getElementById("totalRequests");
    if (totalReq) totalReq.innerText = activeRequests.length;
    
    if (typeof dashboardRequests !== "undefined" && dashboardRequests) {
      dashboardRequests.innerText = activeRequests.length;
    }
    
    const fulfilledElem = document.getElementById("dashboardFulfilled");
    if (fulfilledElem) fulfilledElem.innerText = fulfilledRequests.length;

    // 2. Analytics Dashboard Calculations
    const bloodGroupCounts = {};
    const citiesSet = new Set();

    requests.forEach(r => {
      if (r.bloodGroup) {
        const bg = r.bloodGroup.trim();
        bloodGroupCounts[bg] = (bloodGroupCounts[bg] || 0) + 1;
      }
      if (r.city && r.city.trim() !== "") {
        citiesSet.add(r.city.trim().toLowerCase());
      }
    });

    let mostNeeded = "-";
    let maxCount = 0;
    for (const [bg, count] of Object.entries(bloodGroupCounts)) {
      if (count > maxCount) {
        maxCount = count;
        mostNeeded = bg;
      }
    }

    // 3. Analytics Dashboard UI Updates
    const topBgElem = document.getElementById("topBloodGroup") || document.getElementById("analyticsMostNeeded");
    const citiesElem = document.getElementById("totalCities") || document.getElementById("analyticsTotalCities");
    const sosElem = document.getElementById("totalSOS") || document.getElementById("analyticsTotalSOS");

    if (topBgElem) topBgElem.innerText = mostNeeded;
    if (citiesElem) citiesElem.innerText = citiesSet.size;
    if (sosElem) sosElem.innerText = requests.length;

    // 4. Render Active SOS Cards
    const requestList = document.getElementById("requestList");
    if (!requestList) return;
    requestList.innerHTML = "";

    const reversedRequests = [...requests].reverse();
    reversedRequests.forEach((req) => {
      if (req.fulfilled) return;

      requestList.innerHTML += `
      <div style="border-left:4px solid #dc2626;background:#1E293B;color:#FFFFFF;border:1px solid #334155;border-radius:12px;padding:12px;margin-top:10px;">
        <h3 style="color:#f87171;margin:0;">🚨 ${req.bloodGroup}</h3>
        <div style="color:#e2e8f0;">
          👤 <strong>${req.patientName}</strong><br>
          🏥 ${req.hospital}<br>
          📍 ${req.city}<br>
        </div>
        <div style="margin-top:8px;display:flex;gap:8px;">
          <button onclick="window.location.href='tel:${req.contactNumber}'" style="background:#dc2626;color:white;border:none;padding:6px 12px;border-radius:8px;cursor:pointer;font-weight:bold;">
            📞 Call Patient
          </button>
          <button onclick="window.fulfillRequest(${req.id})" style="background:#16a34a;color:white;border:none;padding:6px 12px;border-radius:8px;cursor:pointer;font-weight:bold;">
            ❤️ I'm Coming to Donate
          </button>
        </div>
      </div>
      `;
    });
  } catch (e) {
    console.error("Error loading requests:", e);
  }
}

async function loadAmbulanceRequests() {
  if (!isWalletConnected()) {
    resetDashboardLists();
    return;
  }

  try {
    const activeEmergency = window.emergencyContract || readOnlyEmergency;
    if (!activeEmergency) return;

    const requests = await activeEmergency.getAmbulanceRequests();
    const ambList = document.getElementById("ambulanceList");

    if (!ambList) return;
    ambList.innerHTML = "";

    requests.forEach((r) => {
      if (r.completed) return;
      
      ambList.innerHTML += `
      <div style="border:1px solid #334155;background:#1E293B;color:white;padding:15px;margin-top:10px;border-radius:12px;">
        <b>👤 ${r.patientName}</b><br>
        🚨 Level: ${r.emergencyLevel}<br>
        📍 Location: ${r.pickupLocation}<br>
        🏥 Hospital: ${r.hospital}<br><br>
        <a href="tel:${r.contact}">
          <button style="background:#2563eb;color:white;border:none;padding:8px 12px;border-radius:6px;cursor:pointer;">📞 Call Patient</button>
        </a>
        <button onclick="completeAmbulance(${r.id})" style="background:#16a34a;color:white;border:none;padding:8px 12px;border-radius:6px;cursor:pointer;margin-left:8px;">
          ✅ Complete Request
        </button>
      </div>
      `;
    });
  } catch (e) {
    console.error("Error loading ambulance requests:", e);
  }
}

// Force clean state on startup - Data ONLY loads after user explicitly connects wallet
window.addEventListener("DOMContentLoaded", () => {
  resetDashboardLists();
});

window.addEventListener("load", () => {
  resetDashboardLists();
});

// ==========================================
// 6. WALLET CONNECTORS (METAMASK & CIRCLE)
// ==========================================
if (connectBtn) {
  connectBtn.addEventListener("click", async () => {
       if (sessionStorage.getItem("active_wallet_type") === "CIRCLE") {
      alert("Circle Wallet is already connected. Disconnect it first.");
      return;
       } 
    if (!window.ethereum) {
      alert("Please install MetaMask");
      return;
    }

    try {
      const ARC_CHAIN_ID = "0x4cef52"; 
      const chainId = await window.ethereum.request({ method: "eth_chainId" });

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
                nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
                rpcUrls: [ARC_RPC_URL],
                blockExplorerUrls: [EXPLORER]
              }]
            });
          }
        }
      }      

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      currentAccount = accounts[0];
currentAccount = accounts[0];
explicitWalletConnected = true;
      
      sessionStorage.removeItem("active_wallet_type");

      provider = new ethers.providers.Web3Provider(window.ethereum);
      signer = provider.getSigner();

      contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      window.healthcareContract = new ethers.Contract(HEALTHCARE_CONTRACT_ADDRESS, HEALTHCARE_ABI, signer);
      window.emergencyContract = new ethers.Contract(EMERGENCY_CONTRACT_ADDRESS, EMERGENCY_ABI, signer);
      window.paymentContract = new ethers.Contract(PAYMENT_CONTRACT_ADDRESS, PAYMENT_ABI, signer);
      window.usdcContract = new ethers.Contract("0x3600000000000000000000000000000000000000", USDC_ABI, signer);      
  
      walletAddress.innerText = `Connected: ${currentAccount.substring(0, 6)}...${currentAccount.substring(currentAccount.length - 4)}`;
      walletAddress.style.color = "#10B981";
      enableWalletCopy(currentAccount);      
      connectBtn.innerText = "✅ Wallet Connected";
      connectBtn.style.background = "#16a34a";
      connectBtn.disabled = true;
disconnectBtn.style.display = "block";
      
      await reloadAppData();
    } catch (error) {
      console.error("MetaMask connection failed:", error);
    }
  });
}

async function handleCircleGoogleLogin() {
    if (currentAccount) {
    alert("MetaMask is already connected. Disconnect it first.");
    return;
    }
  try {
    if (walletAddress) {
      walletAddress.innerText = "Initializing Circle Wallet...";
      walletAddress.style.color = "#FBBF24";
    }

    const response = await fetch("/api/circle-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: "google_user_" + Date.now() })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to generate Circle session");
    }

    const displayAddress = data.walletAddress || data.userId;

    sessionStorage.setItem("active_wallet_type", "CIRCLE");
    sessionStorage.setItem("circle_user_token", data.userToken);
    sessionStorage.setItem("circle_user_id", data.userId);
    if (data.walletAddress) {
      sessionStorage.setItem("circle_wallet_address", data.walletAddress);
    }
explicitWalletConnected = true;
    
    if (walletAddress) {
      walletAddress.innerText = displayAddress.startsWith("0x")
        ? `Connected: ${displayAddress.slice(0, 6)}...${displayAddress.slice(-4)}`
        : `Connected via Circle (${displayAddress.slice(0, 12)}...)`;
      walletAddress.style.color = "#10B981";
    }

    if (circleWalletStatus) {
      circleWalletStatus.style.display = "block";
      circleWalletStatus.innerText = "Circle Wallet Active";
    }

    disconnectBtn.style.display = "block";
    enableWalletCopy(displayAddress);
    await reloadAppData();
    alert("✅ Circle Session Connected Successfully!");

  } catch (err) {
    console.error("Circle Wallet Connection Error:", err);
    if (walletAddress) {
      walletAddress.innerText = "Circle Connection Failed";
      walletAddress.style.color = "#EF4444";
    }
    alert(err.message);
  }
}

if (circleGoogleBtn) {
  circleGoogleBtn.addEventListener("click", handleCircleGoogleLogin);
}
if (disconnectBtn) {
  disconnectBtn.addEventListener("click", disconnectWallet);
}
// ==========================================
// 7. REAL TRANSACTION ACTIONS
// ==========================================

// --- REGISTER DONOR ---
if (registerBtn) {
  registerBtn.addEventListener("click", async () => {
    const wallet = getActiveWallet();
    if (!wallet) {
      alert("Please connect via Connect Wallet or Sign in with Google first.");
      return;
    }

    const name = document.getElementById("name").value;
    const bloodGroup = document.getElementById("bloodGroup").value;
    const city = document.getElementById("city").value;
    const phone = document.getElementById("phone").value;

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
      alert("Unable to get GPS location. Using default location.");
    }

    if (wallet.type === "CIRCLE") {
      try {
        alert("⌛ Submitting transaction to Arc Testnet via Circle Wallet...");
        const txHash = await executeCircleTransaction(
          "registerDonor(string,string,string,string,int256,int256)",
          CONTRACT_ADDRESS,
          [name, bloodGroup, city, phone, latitude.toString(), longitude.toString()]
        );

        showExplorerButton(txHash);
        alert("✅ Donor registered on Arc via Circle Wallet!");
        
        document.getElementById("name").value = "";
        document.getElementById("city").value = "";
        document.getElementById("phone").value = "";

        await reloadAppData();
      } catch (err) {
        console.error("Circle Tx Error:", err);
        alert("Circle Tx Failed: " + err.message);
      }
      return;
    }

    try {
      const tx = await contract.registerDonor(name, bloodGroup, city, phone, latitude, longitude);
      alert("Transaction submitted ⌛");
      await tx.wait();

      showExplorerButton(tx.hash);
      await reloadAppData();
      alert("✅ Donor registered on Arc ❤️");
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  });
}

// --- SEARCH DONORS ---
if (searchBtn) {
  searchBtn.addEventListener("click", async () => {
    if (!isWalletConnected()) {
      alert("Please connect your wallet first.");
      return;
    }

    const activeContract = contract || readOnlyContract;
    const bloodGroup = document.getElementById("searchBloodGroup").value;
    const city = document.getElementById("searchCity").value.toLowerCase();

    const donors = await activeContract.getDonors();
    if (totalDonors) totalDonors.innerText = donors.length;
  
    const filtered = donors.filter((donor) => {
      return (
        donor.bloodGroup === bloodGroup &&
        donor.city.toLowerCase().includes(city)
      );
    });

    if (searchResults) {
      searchResults.innerHTML = "";
      if (filtered.length === 0) {
        searchResults.innerHTML = "<p>❌ No nearby donors found in this city.</p>";
        return;
      }
      
      filtered.forEach((donor) => {
        searchResults.innerHTML += `
        <div style="border:1px solid #ddd;padding:10px;margin-top:10px;border-radius:10px;">
          🩸 <strong>${donor.bloodGroup}</strong> - ${donor.name}<br>
          📍 ${donor.city}<br>
          <button onclick="window.location.href='tel:${donor.phone}'" style="margin-top:10px;background:#2563eb;color:white;border:none;padding:10px 15px;border-radius:8px;cursor:pointer;">
            📞 Call Donor
          </button>
        </div>
        `;
      });
    }
  });
}

// --- CREATE SOS REQUEST ---
const requestBtn = document.getElementById("requestBtn");
if (requestBtn) {
  requestBtn.addEventListener("click", async () => {
    const wallet = getActiveWallet();
    if (!wallet) {
      alert("Please connect via Connect Wallet or Sign in with Google first.");
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

    if (wallet.type === "CIRCLE") {
      try {
        alert("⌛ Submitting SOS Request via Circle Wallet to Arc Testnet...");
        const txHash = await executeCircleTransaction(
          "createRequest(string,string,string,string,string)",
          CONTRACT_ADDRESS,
          [patientName, bloodGroup, hospital, city, contact]
        );

        showExplorerButton(txHash);

        document.getElementById("patientName").value = "";
        document.getElementById("hospital").value = "";
        document.getElementById("requestCity").value = "";
        document.getElementById("contact").value = "";

        alert("🚨 SOS Request Created on Arc via Circle Wallet!");
        await reloadAppData();
      } catch (err) {
        console.error("Circle SOS Tx Error:", err);
        alert("Circle SOS Failed: " + err.message);
      }
      return;
                             }

    try {
      const tx = await contract.createRequest(patientName, bloodGroup, hospital, city, contact);
      alert("Submitting SOS request...");
      await tx.wait();

      showExplorerButton(tx.hash);
      document.getElementById("patientName").value = "";
      document.getElementById("hospital").value = "";
      document.getElementById("requestCity").value = "";
      document.getElementById("contact").value = "";
      
      alert("🚨 SOS Request Created Successfully!");
      await reloadAppData();
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  });
}

// --- FULFILL SOS REQUEST ---
window.fulfillRequest = async function(id) {
  const wallet = getActiveWallet();
  if (!wallet) {
    alert("Please connect your wallet first");
    return;
  }

  if (wallet.type === "CIRCLE") {
    try {
      alert("⌛ Submitting request fulfillment via Circle Wallet...");
      const txHash = await executeCircleTransaction(
        "fulfillRequest(uint256)",
        CONTRACT_ADDRESS,
        [id.toString()]
      );

      showExplorerButton(txHash);
      alert("❤️ Request marked as fulfilled on Arc via Circle Wallet!");
      await reloadAppData();
    } catch (err) {
      alert("Circle Tx Failed: " + err.message);
    }
    return;
  }

  try {
    const tx = await contract.fulfillRequest(id);
    alert("Updating request...");
    await tx.wait();

    showExplorerButton(tx.hash);
    alert("✅ Request marked as fulfilled!");
    await reloadAppData();
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
};


// --- PAY HOSPITAL BILL ---
if (payBillBtn) {
  payBillBtn.addEventListener("click", async () => {
    const wallet = getActiveWallet();
    if (!wallet) {
      alert("Please connect via Connect Wallet or Sign in with Google first.");
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

    if (wallet.type === "CIRCLE") {
      try {
        if (billStatus) billStatus.innerHTML = "⌛ Processing Hospital Payment via Circle Wallet...";
        const txHash = await executeCircleTransaction(
          "payHospitalBill(string,string,address,uint256)",
          PAYMENT_CONTRACT_ADDRESS,
          [hospital, billId, hospitalWallet, ethers.utils.parseUnits(amount, 6).toString()]
        );

        showExplorerButton(txHash);
        if (billStatus) billStatus.innerHTML = "✅ Hospital bill recorded on blockchain via Circle Wallet.";
        alert("✅ Hospital bill paid via Circle Wallet!");
      } catch (err) {
        if (billStatus) billStatus.innerHTML = "❌ Payment failed";
        alert("Circle Payment Error: " + err.message);
      }
      return;
    }

    try {
      const approveTx = await window.usdcContract.approve(
        PAYMENT_CONTRACT_ADDRESS,
        ethers.utils.parseUnits(amount, 6)
      );

      if (billStatus) billStatus.innerHTML = "⏳ Approving USDC...";
      await approveTx.wait();

      const tx = await window.paymentContract.payHospitalBill(
        hospital,
        billId,
        hospitalWallet,
        ethers.utils.parseUnits(amount, 6)
      );

      if (billStatus) billStatus.innerHTML = "⏳ Waiting for confirmation...";
      await tx.wait();

      showExplorerButton(tx.hash);
      if (billStatus) billStatus.innerHTML = "✅ Hospital bill recorded on blockchain.";
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  });
}

// --- REQUEST AMBULANCE ---
if (ambulanceBtn) {
  ambulanceBtn.addEventListener("click", async () => {
    const wallet = getActiveWallet();
    if (!wallet) {
      alert("Please connect via Connect Wallet or Sign in with Google first.");
      return;
    }

    const patient = document.getElementById("ambPatientName").value.trim();
    const pickup = document.getElementById("pickupLocation").value.trim();
    const hospital = document.getElementById("ambulanceHospital").value.trim();
    const contact = document.getElementById("ambulanceContact").value.trim();
    const level = document.getElementById("emergencyLevel").value;

    if (!patient || !pickup || !hospital || !contact) {
      alert("Please fill all fields");
      return;
    }

    if (wallet.type === "CIRCLE") {
      try {
        if (ambulanceStatus) ambulanceStatus.innerHTML = "🚑 Sending ambulance request via Circle Wallet...";
        const txHash = await executeCircleTransaction(
          "requestAmbulance(string,string,string,string,string)",
          EMERGENCY_CONTRACT_ADDRESS,
          [patient, pickup, hospital, contact, level]
        );

        showExplorerButton(txHash);
        if (ambulanceStatus) ambulanceStatus.innerHTML = "✅ Ambulance request recorded on blockchain via Circle Wallet.";
        alert("🚑 Ambulance requested via Circle Wallet!");
        await loadAmbulanceRequests();
      } catch (err) {
        if (ambulanceStatus) ambulanceStatus.innerHTML = "❌ Ambulance Request Failed";
        alert("Circle Ambulance Error: " + err.message);
      }
      return;
    }

    try {
      if (ambulanceStatus) ambulanceStatus.innerHTML = "🚑 Sending ambulance request...";
      const tx = await window.emergencyContract.requestAmbulance(patient, pickup, hospital, contact, level);
      await tx.wait();

      if (ambulanceStatus) ambulanceStatus.innerHTML = "✅ Ambulance request recorded on blockchain.";
      await loadAmbulanceRequests();
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  });
}

// --- COMPLETE AMBULANCE REQUEST ---
window.completeAmbulance = async function(id) {
  const wallet = getActiveWallet();
  if (!wallet) {
    alert("Connect wallet first");
    return;
  }

  if (wallet.type === "CIRCLE") {
    try {
      if (ambulanceStatus) ambulanceStatus.innerHTML = "⏳ Completing request via Circle Wallet...";
      const txHash = await executeCircleTransaction(
        "completeRequest(uint256)",
        EMERGENCY_CONTRACT_ADDRESS,
        [id.toString()]
      );

      showExplorerButton(txHash);
      if (ambulanceStatus) ambulanceStatus.innerHTML = "✅ Request completed via Circle Wallet.";
      alert("✅ Ambulance request completed via Circle Wallet!");
      await loadAmbulanceRequests();
    } catch (err) {
      if (ambulanceStatus) ambulanceStatus.innerHTML = "❌ Action Failed";
      alert("Circle Action Failed: " + err.message);
    }
    return;
  }

  try {
    if (ambulanceStatus) ambulanceStatus.innerHTML = "⏳ Completing request...";
    const tx = await window.emergencyContract.completeRequest(id);
    await tx.wait();

    if (ambulanceStatus) ambulanceStatus.innerHTML = "✅ Request completed.";
    await loadAmbulanceRequests();
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
};

// --- DOCTOR PATIENT LOOKUP ---
if (searchPatientBtn) {
  searchPatientBtn.addEventListener("click", async () => {
    if (!isWalletConnected()) {
      alert("Please connect your wallet first.");
      return;
    }

    const activeHealthcare = window.healthcareContract || readOnlyHealthcare;
    const wallet = doctorWallet ? doctorWallet.value.trim() : "";

    if (!ethers.utils.isAddress(wallet)) {
      alert("Enter a valid wallet address");
      return;
    }

    try {
      if (doctorStatus) doctorStatus.innerHTML = "🔍 Searching patient...";
      const profile = await activeHealthcare.getProfile(wallet);

      if (viewName) viewName.textContent = profile[0];
      if (viewBlood) viewBlood.textContent = profile[1];
      if (viewDOB) viewDOB.textContent = profile[2];
      if (viewGender) viewGender.textContent = profile[3];
      if (viewEmergency) viewEmergency.textContent = profile[4];
      if (viewAllergies) viewAllergies.textContent = profile[5];
      if (viewAddress) viewAddress.textContent = profile[6];

      if (patientProfileCard) patientProfileCard.style.display = "block";
      if (doctorStatus) doctorStatus.innerHTML = "✅ Patient record loaded.";
    } catch (err) {
      console.error(err);
      if (doctorStatus) doctorStatus.innerHTML = "❌ Patient profile not found.";
      if (patientProfileCard) patientProfileCard.style.display = "none";
    }
  });
}

// --- AI ASSISTANT CHAT ---
const askAIBtn = document.getElementById("askAIBtn");
if (askAIBtn) {
  askAIBtn.addEventListener("click", async () => {
    const questionEl = document.getElementById("aiQuestion");
    const question = questionEl ? questionEl.value.trim() : "";
    const chatBox = document.getElementById("chatBox");

    if (!question || !chatBox) return;

    chatBox.innerHTML += `
    <div style="text-align:right;margin:10px 0;">
      <div style="display:inline-block;background:#2563eb;color:white;padding:10px 15px;border-radius:15px;max-width:80%;">
        ${question}
      </div>
    </div>`;

    chatBox.innerHTML += `
    <div id="loading" style="margin:10px 0;color:#CBD5E1;">🤖 Thinking...</div>`;

    chatBox.scrollTop = chatBox.scrollHeight;

    try {
      const response = await fetch("/api/emergency-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question })
      });

      const data = await response.json();
      document.getElementById("loading")?.remove();

      chatBox.innerHTML += `
      <div style="text-align:left;margin:10px 0;">
        <div style="display:inline-block;background:#1E293B;color:#FFFFFF;padding:10px 15px;border-radius:15px;border:1px solid #475569;max-width:80%;">
          🤖 ${data.reply}
        </div>
      </div>`;

      chatBox.scrollTop = chatBox.scrollHeight;
    } catch (err) {
      document.getElementById("loading")?.remove();
      chatBox.innerHTML += `<div style="color:red;">❌ Failed to contact AI.</div>`;
    }
  });
}

// Quick action navigation
document.querySelectorAll(".quick-action").forEach(button => {
  button.addEventListener("click", () => {
    const target = button.dataset.target;
    const section = document.getElementById(target);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});
        
