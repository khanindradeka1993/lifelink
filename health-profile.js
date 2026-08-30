// ============================================================
// LifeLink - Health Profile
// ============================================================

window.HEALTHCARE_CONTRACT_ADDRESS =
  "0xA3483f9B44d749F60e4061a99bbd6f5795B6c5C5";

window.HEALTHCARE_ABI = [
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
        "name": "_medicalHistory",
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
        "name": "_medicalHistory",
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

// Keep this available globally.
window.healthcareContract = null;


// ============================================================
// DOM READY
// ============================================================

function initializeHealthProfile() {
  const saveProfileBtn = document.getElementById("saveProfileBtn");

  if (!saveProfileBtn) {
    console.error("❌ saveProfileBtn was not found.");
    return;
  }

  // Prevent duplicate event listeners.
  if (saveProfileBtn.dataset.healthProfileBound === "true") {
    return;
  }

  saveProfileBtn.dataset.healthProfileBound = "true";

  saveProfileBtn.addEventListener("click", function (event) {
    event.preventDefault();

    console.log("❤️ Save Health Profile button clicked.");

    saveHealthProfile();
  });

  console.log("✅ Health Profile button initialized.");
}


// The script is loaded near the end of index.html,
// but this also works if the script is loaded earlier.
if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    initializeHealthProfile,
    { once: true }
  );
} else {
  initializeHealthProfile();
}


// ============================================================
// GET FORM DATA
// ============================================================

function getHealthProfileData() {
  const fullNameElement =
    document.getElementById("profileName");

  const bloodGroupElement =
    document.getElementById("profileBloodGroup");

  const dobElement =
    document.getElementById("profileDOB");

  const genderElement =
    document.getElementById("profileGender");

  const emergencyElement =
    document.getElementById("profileEmergency");

  const allergiesElement =
    document.getElementById("profileAllergies");

  const medicalHistoryElement =
    document.getElementById("profileMedicalHistory");

  const addressElement =
    document.getElementById("profileAddress");


  if (
    !fullNameElement ||
    !bloodGroupElement ||
    !dobElement ||
    !genderElement ||
    !emergencyElement ||
    !allergiesElement ||
    !medicalHistoryElement ||
    !addressElement
  ) {
    throw new Error(
      "One or more Health Profile fields are missing from index.html."
    );
  }


  return {
    fullName: fullNameElement.value.trim(),
    bloodGroup: bloodGroupElement.value.trim(),
    dob: dobElement.value.trim(),
    gender: genderElement.value.trim(),
    emergency: emergencyElement.value.trim(),
    allergies: allergiesElement.value.trim(),
    medicalHistory: medicalHistoryElement.value.trim(),
    addressInfo: addressElement.value.trim()
  };
}


// ============================================================
// STATUS HELPER
// ============================================================

function setProfileStatus(message) {
  const status = document.getElementById("profileStatus");

  if (status) {
    status.innerHTML = message;
  }

  console.log(message);
}


// ============================================================
// SAVE HEALTH PROFILE
// ============================================================

async function saveHealthProfile() {

  console.log("❤️ saveHealthProfile() started.");


  // ----------------------------------------------------------
  // Check ethers
  // ----------------------------------------------------------

  if (
    typeof ethers === "undefined"
  ) {
    alert(
      "Ethers.js is not loaded. Please refresh the page."
    );
    return;
  }


  // ----------------------------------------------------------
  // Get form values
  // ----------------------------------------------------------

  let profile;

  try {
    profile = getHealthProfileData();
  } catch (error) {
    console.error(error);

    setProfileStatus(
      "❌ Health Profile form error."
    );

    alert(error.message);

    return;
  }


  // ----------------------------------------------------------
  // Validate required fields
  // ----------------------------------------------------------

  if (!profile.fullName) {
    alert("Please enter your full name.");
    return;
  }

  if (!profile.bloodGroup) {
    alert("Please select your blood group.");
    return;
  }

  if (!profile.dob) {
    alert("Please select your date of birth.");
    return;
  }

  if (!profile.gender) {
    alert("Please select your gender.");
    return;
  }

  if (!profile.emergency) {
    alert("Please enter an emergency contact.");
    return;
  }

  if (!profile.allergies) {
    alert("Please enter allergies.");
    return;
  }

  if (!profile.medicalHistory) {
    alert("Please enter medical history.");
    return;
  }

  if (!profile.addressInfo) {
    alert("Please enter your address.");
    return;
  }


  // ----------------------------------------------------------
  // Check wallet
  // ----------------------------------------------------------

  if (!window.ethereum) {
    alert(
      "Please install MetaMask and connect your wallet first."
    );
    return;
  }


  try {

    setProfileStatus(
      "⏳ Preparing health profile transaction..."
    );


    // --------------------------------------------------------
    // Get current wallet account
    // --------------------------------------------------------

    const accounts =
      await window.ethereum.request({
        method: "eth_accounts"
      });


    if (!accounts || accounts.length === 0) {

      setProfileStatus(
        "❌ Wallet not connected."
      );

      alert(
        "Please connect your wallet first."
      );

      return;
    }


    const account = accounts[0];

    console.log(
      "🔗 Health Profile wallet:",
      account
    );


    // --------------------------------------------------------
    // Create signer directly from MetaMask
    // --------------------------------------------------------

    const provider =
      new ethers.providers.Web3Provider(
        window.ethereum
      );

    const signer =
      provider.getSigner();


    // --------------------------------------------------------
    // Create healthcare contract
    // --------------------------------------------------------

    const healthcareContract =
      new ethers.Contract(
        window.HEALTHCARE_CONTRACT_ADDRESS,
        window.HEALTHCARE_ABI,
        signer
      );


    // Keep the contract globally available too.
    window.healthcareContract =
      healthcareContract;


    console.log(
      "✅ Healthcare contract initialized:",
      window.HEALTHCARE_CONTRACT_ADDRESS
    );


    // --------------------------------------------------------
    // Check whether profile already exists
    // --------------------------------------------------------

    let profileExists = false;

    try {

      const existingProfile =
        await healthcareContract.getProfile(
          account
        );

      console.log(
        "🔎 Existing profile:",
        existingProfile
      );


      /*
       * getProfile() returns:
       *
       * 0  fullName
       * 1  bloodGroup
       * 2  dob
       * 3  gender
       * 4  emergencyContact
       * 5  allergies
       * 6  medicalHistory
       * 7  addressInfo
       * 8  owner/address
       * 9  timestamp
       *
       * A non-zero timestamp means a profile already exists.
       */

      if (
        existingProfile &&
        existingProfile[9] &&
        existingProfile[9].toString() !== "0"
      ) {
        profileExists = true;
      }

      // Some contract implementations may return data
      // without using the timestamp, so also check name.
      if (
        !profileExists &&
        existingProfile &&
        existingProfile[0] &&
        existingProfile[0].toString().trim() !== ""
      ) {
        profileExists = true;
      }

    } catch (readError) {

      console.log(
        "ℹ️ Could not read existing profile. Will try createProfile().",
        readError
      );

      profileExists = false;
    }


    console.log(
      "🔎 Profile already exists:",
      profileExists
    );


    // --------------------------------------------------------
    // Prepare contract arguments
    // --------------------------------------------------------

    const args = [
      profile.fullName,
      profile.bloodGroup,
      profile.dob,
      profile.gender,
      profile.emergency,
      profile.allergies,
      profile.medicalHistory,
      profile.addressInfo
    ];


    // --------------------------------------------------------
    // CREATE PROFILE
    // --------------------------------------------------------

    if (!profileExists) {

      setProfileStatus(
        "⏳ Saving health profile on Arc Testnet..."
      );

      alert(
        "⏳ Saving Health Profile on Arc Testnet..."
      );


      console.log(
        "🚀 Calling createProfile()..."
      );


      const tx =
        await healthcareContract.createProfile(
          ...args
        );


      console.log(
        "📦 Health Profile transaction:",
        tx
      );


      setProfileStatus(
        "⏳ Transaction submitted. Waiting for confirmation..."
      );


      await tx.wait();


      console.log(
        "✅ Health Profile transaction confirmed:",
        tx.hash
      );


      setProfileStatus(
        "✅ Health Profile saved on blockchain"
      );


      alert(
        "✅ Health Profile saved successfully on Arc Testnet!"
      );


      // Show transaction if app.js provides the function.
      if (
        typeof window.showExplorerButton === "function"
      ) {
        window.showExplorerButton(tx.hash);
      }


      return;
    }


    // --------------------------------------------------------
    // UPDATE PROFILE
    // --------------------------------------------------------

    setProfileStatus(
      "⏳ Updating health profile on Arc Testnet..."
    );

    alert(
      "⏳ Updating Health Profile on Arc Testnet..."
    );


    console.log(
      "🚀 Calling updateProfile()..."
    );


    const tx =
      await healthcareContract.updateProfile(
        ...args
      );


    console.log(
      "📦 Health Profile update transaction:",
      tx
    );


    setProfileStatus(
      "⏳ Update submitted. Waiting for confirmation..."
    );


    await tx.wait();


    console.log(
      "✅ Health Profile update confirmed:",
      tx.hash
    );


    setProfileStatus(
      "✅ Health Profile updated on blockchain"
    );


    alert(
      "✅ Health Profile updated successfully on Arc Testnet!"
    );


    // Show transaction if app.js provides the function.
    if (
      typeof window.showExplorerButton === "function"
    ) {
      window.showExplorerButton(tx.hash);
    }


  } catch (error) {

    console.error(
      "❌ Health Profile transaction failed:",
      error
    );


    let message =
      "Failed to save health profile.";


    if (error && error.reason) {
      message = error.reason;
    } else if (
      error &&
      error.data &&
      error.data.message
    ) {
      message = error.data.message;
    } else if (
      error &&
      error.message
    ) {
      message = error.message;
    }


    // Handle user rejection cleanly.
    if (
      error &&
      (
        error.code === 4001 ||
        error.code === "ACTION_REJECTED"
      )
    ) {
      message =
        "Transaction was rejected in your wallet.";
    }


    setProfileStatus(
      "❌ " + message
    );


    alert(
      "❌ Health Profile Error:\n\n" +
      message
    );
  }
}


// ============================================================
// EXPOSE FUNCTION GLOBALLY
// ============================================================

window.saveHealthProfile =
  saveHealthProfile;
