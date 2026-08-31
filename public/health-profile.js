window.HEALTHCARE_CONTRACT_ADDRESS =
  "0xA3483f9B44d749F60e4061a99bbd6f5795B6c5C5";

window.HEALTHCARE_ABI = [
  {
    "inputs": [
      {"internalType":"string","name":"_fullName","type":"string"},
      {"internalType":"string","name":"_bloodGroup","type":"string"},
      {"internalType":"string","name":"_dob","type":"string"},
      {"internalType":"string","name":"_gender","type":"string"},
      {"internalType":"string","name":"_emergencyContact","type":"string"},
      {"internalType":"string","name":"_allergies","type":"string"},
      {"internalType":"string","name":"_medicalHistory","type":"string"},
      {"internalType":"string","name":"_addressInfo","type":"string"}
    ],
    "name":"createProfile","outputs":[],"stateMutability":"nonpayable","type":"function"
  },
  {
    "anonymous":false,
    "inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"}],
    "name":"ProfileCreated","type":"event"
  },
  {
    "anonymous":false,
    "inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"}],
    "name":"ProfileUpdated","type":"event"
  },
  {
    "inputs": [
      {"internalType":"string","name":"_fullName","type":"string"},
      {"internalType":"string","name":"_bloodGroup","type":"string"},
      {"internalType":"string","name":"_dob","type":"string"},
      {"internalType":"string","name":"_gender","type":"string"},
      {"internalType":"string","name":"_emergencyContact","type":"string"},
      {"internalType":"string","name":"_allergies","type":"string"},
      {"internalType":"string","name":"_medicalHistory","type":"string"},
      {"internalType":"string","name":"_addressInfo","type":"string"}
    ],
    "name":"updateProfile","outputs":[],"stateMutability":"nonpayable","type":"function"
  },
  {
    "inputs":[{"internalType":"address","name":"_user","type":"address"}],
    "name":"getProfile",
    "outputs":[
      {"internalType":"string","name":"","type":"string"},
      {"internalType":"string","name":"","type":"string"},
      {"internalType":"string","name":"","type":"string"},
      {"internalType":"string","name":"","type":"string"},
      {"internalType":"string","name":"","type":"string"},
      {"internalType":"string","name":"","type":"string"},
      {"internalType":"string","name":"","type":"string"},
      {"internalType":"string","name":"","type":"string"},
      {"internalType":"address","name":"","type":"address"},
      {"internalType":"uint256","name":"","type":"uint256"}
    ],
    "stateMutability":"view","type":"function"
  }
];

window.healthcareContract = null;

document.addEventListener("DOMContentLoaded", () => {
  const saveProfileBtn = document.getElementById("saveProfileBtn");
  if (!saveProfileBtn) {
    console.warn("LifeLink: saveProfileBtn not found.");
    return;
  }
  saveProfileBtn.addEventListener("click", saveHealthProfile);
});

async function saveHealthProfile() {
  const statusEl = document.getElementById("profileStatus");

  if (!window.healthcareContract) {
    if (statusEl) statusEl.innerHTML = "❌ Please connect your wallet first.";
    alert("Please connect your wallet first.");
    return;
  }

  const fullName = document.getElementById("profileName")?.value?.trim() || "";
  const bloodGroup = document.getElementById("profileBloodGroup")?.value || "";
  const dob = document.getElementById("profileDOB")?.value || "";
  const gender = document.getElementById("profileGender")?.value || "";
  const emergency = document.getElementById("profileEmergency")?.value?.trim() || "";
  const allergies = document.getElementById("profileAllergies")?.value?.trim() || "";
  const medicalHistory =
    document.getElementById("profileMedicalHistory")?.value?.trim() ||
    allergies;
  const addressInfo = document.getElementById("profileAddress")?.value?.trim() || "";

  try {
    if (statusEl) statusEl.innerHTML = "⏳ Saving profile to blockchain...";

    const tx = await window.healthcareContract.createProfile(
      fullName, bloodGroup, dob, gender, emergency,
      allergies, medicalHistory, addressInfo
    );

    if (statusEl) statusEl.innerHTML = "⏳ Waiting for blockchain confirmation...";
    await tx.wait();

    if (statusEl) statusEl.innerHTML = "✅ Health Profile saved on blockchain.";
    return tx;
  } catch (createErr) {
    console.warn("createProfile failed, attempting updateProfile...", createErr);

    try {
      if (statusEl) {
        statusEl.innerHTML = "⏳ Profile already exists. Updating existing profile...";
      }

      const tx = await window.healthcareContract.updateProfile(
        fullName, bloodGroup, dob, gender, emergency,
        allergies, medicalHistory, addressInfo
      );

      if (statusEl) statusEl.innerHTML = "⏳ Waiting for blockchain confirmation...";
      await tx.wait();

      if (statusEl) statusEl.innerHTML = "✅ Health Profile updated on blockchain.";
      return tx;
    } catch (updateErr) {
      console.error("Failed to create/update profile:", updateErr);

      if (statusEl) statusEl.innerHTML = "❌ Failed to save profile.";

      alert(
        "Error saving profile: " +
        (updateErr?.reason || updateErr?.message || "Unknown error")
      );
    }
  }
}

window.saveHealthProfile = saveHealthProfile;
