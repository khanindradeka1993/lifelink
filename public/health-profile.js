window.HEALTHCARE_CONTRACT_ADDRESS =
  "0xE32313e236784f57a7479a830E4a9c0ce22d0761";

window.HEALTHCARE_ABI = [
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
      { "internalType": "string", "name": "_fullName", "type": "string" },
      { "internalType": "string", "name": "_bloodGroup", "type": "string" },
      { "internalType": "string", "name": "_dob", "type": "string" },
      { "internalType": "string", "name": "_gender", "type": "string" },
      { "internalType": "string", "name": "_emergencyContact", "type": "string" },
      { "internalType": "string", "name": "_allergies", "type": "string" },
      { "internalType": "string", "name": "_addressInfo", "type": "string" }
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

window.healthcareContract = null;

document.addEventListener("DOMContentLoaded", () => {
  const saveProfileBtn = document.getElementById("saveProfileBtn");

  if (!saveProfileBtn) return;

  saveProfileBtn.addEventListener("click", saveHealthProfile);
});

async function saveHealthProfile() {
  const statusEl = document.getElementById("profileStatus");

  if (!window.healthcareContract) {
    alert("Please connect your wallet first.");
    return;
  }

  const fullName = document.getElementById("profileName").value;
  const bloodGroup = document.getElementById("profileBloodGroup").value;
  const dob = document.getElementById("profileDOB").value;
  const gender = document.getElementById("profileGender").value;
  const emergency =
    document.getElementById("profileEmergency").value;
  const allergies =
    document.getElementById("profileAllergies").value;
  const addressInfo =
    document.getElementById("profileAddress").value;

  try {
    if (statusEl) {
      statusEl.innerHTML =
        "⏳ Saving profile to blockchain...";
    }

    const tx = await window.healthcareContract.createProfile(
      fullName,
      bloodGroup,
      dob,
      gender,
      emergency,
      allergies,
      addressInfo
    );

    await tx.wait();

    if (statusEl) {
      statusEl.innerHTML =
        "✅ Health Profile saved on blockchain";
    }

  } catch (e) {
    console.warn(
      "createProfile failed, attempting updateProfile...",
      e
    );

    try {
      if (statusEl) {
        statusEl.innerHTML =
          "⏳ Updating existing profile on blockchain...";
      }

      const tx =
        await window.healthcareContract.updateProfile(
          fullName,
          bloodGroup,
          dob,
          gender,
          emergency,
          allergies,
          addressInfo
        );

      await tx.wait();

      if (statusEl) {
        statusEl.innerHTML =
          "✅ Health Profile updated on blockchain";
      }

    } catch (updateErr) {
      console.error(
        "Failed to save/update profile:",
        updateErr
      );

      if (statusEl) {
        statusEl.innerHTML =
          "❌ Failed to save profile.";
      }

      alert(
        "Error saving profile: " +
        updateErr.message
      );
    }
  }
}
