// ======================================================
// LifeLink Health Profile
// Healthcare Profile Contract
// ======================================================

window.HEALTHCARE_CONTRACT_ADDRESS =
  "0xE32313e236784f57a7479a830E4a9c0ce22d0761";

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


// ======================================================
// Create the health contract directly from the ABI
// ======================================================

window.healthcareContract = null;

async function getHealthContract() {

  if (!window.ethereum) {
    throw new Error(
      "MetaMask/compatible wallet was not detected. Please connect your wallet."
    );
  }

  if (!window.ethers) {
    throw new Error("Ethers.js failed to load.");
  }

  const provider =
    new ethers.providers.Web3Provider(window.ethereum);

  await provider.send("eth_requestAccounts", []);

  const signer = provider.getSigner();

  const contract = new ethers.Contract(
    window.HEALTHCARE_CONTRACT_ADDRESS,
    window.HEALTHCARE_ABI,
    signer
  );

  // IMPORTANT:
  // Replace any old/incompatible healthcareContract object.
  window.healthcareContract = contract;

  console.log(
    "✅ Health Profile Contract:",
    contract.address
  );

  console.log(
    "✅ updateProfile available:",
    typeof contract.updateProfile === "function"
  );

  return contract;
}


// ======================================================
// Save button
// ======================================================

document.addEventListener("DOMContentLoaded", () => {

  const saveProfileBtn =
    document.getElementById("saveProfileBtn");

  if (!saveProfileBtn) {
    console.warn("⚠️ saveProfileBtn not found.");
    return;
  }

  saveProfileBtn.addEventListener(
    "click",
    saveHealthProfile
  );

});


// ======================================================
// Save / Update Health Profile
// ======================================================

async function saveHealthProfile() {

  const statusEl =
    document.getElementById("profileStatus");

  try {

    if (statusEl) {
      statusEl.innerHTML =
        "⏳ Connecting to health profile contract...";
    }

    // Always create the correct contract here.
    const contract =
      await getHealthContract();

    if (!contract) {
      throw new Error(
        "Health profile contract could not be created."
      );
    }

    if (
      typeof contract.createProfile !== "function"
    ) {
      throw new Error(
        "createProfile is missing from the healthcare contract ABI."
      );
    }

    if (
      typeof contract.updateProfile !== "function"
    ) {
      throw new Error(
        "updateProfile is missing from the healthcare contract ABI."
      );
    }


    // ==================================================
    // Read form values
    // ==================================================

    const fullName =
      document.getElementById("profileName").value.trim();

    const bloodGroup =
      document.getElementById("profileBloodGroup").value;

    const dob =
      document.getElementById("profileDOB").value;

    const gender =
      document.getElementById("profileGender").value;

    const emergency =
      document.getElementById("profileEmergency").value.trim();

    const allergies =
      document.getElementById("profileAllergies").value.trim();

    const addressInfo =
      document.getElementById("profileAddress").value.trim();


    if (!fullName) {
      throw new Error("Please enter your full name.");
    }


    // ==================================================
    // First attempt: create profile
    // ==================================================

    if (statusEl) {
      statusEl.innerHTML =
        "⏳ Saving profile to blockchain...";
    }

    try {

      console.log(
        "🚀 Calling createProfile..."
      );

      const tx =
        await contract.createProfile(
          fullName,
          bloodGroup,
          dob,
          gender,
          emergency,
          allergies,
          addressInfo
        );

      console.log(
        "📤 Create Profile TX:",
        tx.hash
      );

      if (statusEl) {
        statusEl.innerHTML =
          "⏳ Waiting for blockchain confirmation...";
      }

      await tx.wait();

      if (statusEl) {
        statusEl.innerHTML =
          "✅ Health Profile saved on blockchain.";
      }

      console.log(
        "✅ Health profile created:",
        tx.hash
      );

      return;

    } catch (createError) {

      console.warn(
        "⚠️ createProfile failed.",
        createError
      );

      const errorText =
        (
          createError?.reason ||
          createError?.error?.reason ||
          createError?.data?.message ||
          createError?.message ||
          ""
        ).toLowerCase();


      // =================================================
      // Existing profile
      // =================================================

      const alreadyExists =
        errorText.includes("profile already exists") ||
        errorText.includes("already exists") ||
        errorText.includes("profile exists");


      if (!alreadyExists) {

        throw createError;

      }

      console.log(
        "ℹ️ Profile already exists. Switching to updateProfile..."
      );

    }


    // ==================================================
    // Update existing profile
    // ==================================================

    if (statusEl) {
      statusEl.innerHTML =
        "⏳ Existing profile found. Updating...";
    }

    console.log(
      "🚀 Calling updateProfile..."
    );

    const updateTx =
      await contract.updateProfile(
        fullName,
        bloodGroup,
        dob,
        gender,
        emergency,
        allergies,
        addressInfo
      );

    console.log(
      "📤 Update Profile TX:",
      updateTx.hash
    );

    if (statusEl) {
      statusEl.innerHTML =
        "⏳ Waiting for blockchain confirmation...";
    }

    await updateTx.wait();

    if (statusEl) {
      statusEl.innerHTML =
        "✅ Health Profile updated on blockchain.";
    }

    console.log(
      "✅ Health profile updated:",
      updateTx.hash
    );


  } catch (error) {

    console.error(
      "❌ Failed to save/update health profile:",
      error
    );

    if (statusEl) {
      statusEl.innerHTML =
        "❌ Failed to save health profile.";
    }

    alert(
      "Error saving profile: " +
      (
        error?.reason ||
        error?.message ||
        "Unknown error"
      )
    );

  }

}


// ======================================================
// Make function available globally
// ======================================================

window.saveHealthProfile =
  saveHealthProfile;

window.getHealthContract =
  getHealthContract;
