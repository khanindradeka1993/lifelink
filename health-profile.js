// Keep this available globally.
window.healthcareContract = null;


// ============================================================
// DOM READY
// ============================================================

function initializeHealthProfile() {
  const saveProfileBtn =
    document.getElementById("saveProfileBtn");

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

  const status =
    document.getElementById("profileStatus");

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

  if (typeof ethers === "undefined") {

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


  // ==========================================================
  // DETECT ACTIVE WALLET
  // ==========================================================

  let activeWallet = null;

  try {

    if (typeof getActiveWallet === "function") {
      activeWallet = getActiveWallet();
    }

  } catch (walletError) {

    console.error(
      "❌ Could not determine active wallet:",
      walletError
    );
  }


  // Fallback for MetaMask if getActiveWallet()
  // is not available for some reason.
  if (!activeWallet && window.ethereum) {

    const accounts =
      await window.ethereum.request({
        method: "eth_accounts"
      });

    if (accounts && accounts.length > 0) {

      activeWallet = {
        type: "METAMASK",
        account: accounts[0]
      };
    }
  }


  if (!activeWallet) {

    setProfileStatus(
      "❌ Wallet not connected."
    );

    alert(
      "Please connect your wallet first."
    );

    return;
  }


  console.log(
    "🔗 Active Health Profile wallet:",
    activeWallet
  );


  // ==========================================================
  // CONTRACT ARGUMENTS
  // ==========================================================

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


  // Exact Solidity function signatures
  // for the verified Health Profile contract.
  const CREATE_PROFILE_SIGNATURE =
    "createProfile(string,string,string,string,string,string,string,string)";

  const UPDATE_PROFILE_SIGNATURE =
    "updateProfile(string,string,string,string,string,string,string,string)";


  // ==========================================================
  // CIRCLE WALLET
  // ==========================================================

  if (activeWallet.type === "CIRCLE") {

    console.log(
      "🟣 Circle Wallet detected."
    );


    if (
      typeof executeCircleTransaction !== "function"
    ) {

      setProfileStatus(
        "❌ Circle transaction system is not available."
      );

      alert(
        "Circle transaction system is not loaded. Please refresh the page."
      );

      return;
    }


    try {

      // ------------------------------------------------------
      // Read existing profile using the Arc RPC.
      // This is a VIEW call, so no wallet signature is needed.
      // ------------------------------------------------------

      const readProvider =
        new ethers.providers.JsonRpcProvider(
          typeof ARC_RPC_URL !== "undefined"
            ? ARC_RPC_URL
            : undefined
        );


      const readOnlyHealthcare =
        new ethers.Contract(
          window.HEALTHCARE_CONTRACT_ADDRESS,
          window.HEALTHCARE_ABI,
          readProvider
        );


      let profileExists = false;


      try {

        const existingProfile =
          await readOnlyHealthcare.getProfile(
            activeWallet.address
          );


        console.log(
          "🔎 Existing Circle Health Profile:",
          existingProfile
        );


        // getProfile() returns timestamp at index 9.
        if (
          existingProfile &&
          existingProfile[9] &&
          existingProfile[9].toString() !== "0"
        ) {

          profileExists = true;
        }


        // Fallback: check full name.
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
          "ℹ️ Could not read existing Circle profile. Will use createProfile().",
          readError
        );

        profileExists = false;
      }


      console.log(
        "🔎 Circle profile already exists:",
        profileExists
      );


      // ------------------------------------------------------
      // CREATE PROFILE THROUGH EXISTING CIRCLE HELPER
      // ------------------------------------------------------

      if (!profileExists) {

        setProfileStatus(
          "⏳ Saving health profile with Circle Wallet..."
        );


        alert(
          "⏳ Saving Health Profile with Circle Wallet..."
        );


        console.log(
          "🟣 Circle → createProfile()"
        );


        const finalHash =
          await executeCircleTransaction(
            CREATE_PROFILE_SIGNATURE,
            window.HEALTHCARE_CONTRACT_ADDRESS,
            args
          );


        console.log(
          "✅ Circle Health Profile transaction:",
          finalHash
        );


        setProfileStatus(
          "✅ Health Profile saved on blockchain"
        );


        alert(
          "✅ Health Profile saved successfully on Arc Testnet!"
        );


        if (
          typeof window.showExplorerButton === "function"
        ) {

          window.showExplorerButton(
            finalHash
          );
        }


        return;
      }


      // ------------------------------------------------------
      // UPDATE PROFILE THROUGH EXISTING CIRCLE HELPER
      // ------------------------------------------------------

      setProfileStatus(
        "⏳ Updating health profile with Circle Wallet..."
      );


      alert(
        "⏳ Updating Health Profile with Circle Wallet..."
      );


      console.log(
        "🟣 Circle → updateProfile()"
      );


      const finalHash =
        await executeCircleTransaction(
          UPDATE_PROFILE_SIGNATURE,
          window.HEALTHCARE_CONTRACT_ADDRESS,
          args
        );


      console.log(
        "✅ Circle Health Profile update:",
        finalHash
      );


      setProfileStatus(
        "✅ Health Profile updated on blockchain"
      );


      alert(
        "✅ Health Profile updated successfully on Arc Testnet!"
      );


      if (
        typeof window.showExplorerButton === "function"
      ) {

        window.showExplorerButton(
          finalHash
        );
      }


      return;

    } catch (error) {

      console.error(
        "❌ Circle Health Profile transaction failed:",
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


      setProfileStatus(
        "❌ " + message
      );


      alert(
        "❌ Health Profile Error:\n\n" +
        message
      );


      return;
    }
  }


  // ==========================================================
  // METAMASK
  // ==========================================================

  if (activeWallet.type === "METAMASK") {

    try {

      if (!window.ethereum) {

        throw new Error(
          "MetaMask provider is not available."
        );
      }


      setProfileStatus(
        "⏳ Preparing health profile transaction..."
      );


      const provider =
        new ethers.providers.Web3Provider(
          window.ethereum
        );


      const signer =
        provider.getSigner();


      const healthcareContract =
        new ethers.Contract(
          window.HEALTHCARE_CONTRACT_ADDRESS,
          window.HEALTHCARE_ABI,
          signer
        );


      // Keep the contract globally available.
      window.healthcareContract =
        healthcareContract;


      console.log(
        "✅ Healthcare contract initialized:",
        window.HEALTHCARE_CONTRACT_ADDRESS
      );


      // ------------------------------------------------------
      // Check whether profile already exists
      // ------------------------------------------------------

      let profileExists = false;


      try {

        const existingProfile =
          await healthcareContract.getProfile(
            activeWallet.account
          );


        console.log(
          "🔎 Existing MetaMask profile:",
          existingProfile
        );


        if (
          existingProfile &&
          existingProfile[9] &&
          existingProfile[9].toString() !== "0"
        ) {

          profileExists = true;
        }


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
        "🔎 MetaMask profile already exists:",
        profileExists
      );


      // ------------------------------------------------------
      // CREATE
      // ------------------------------------------------------

      if (!profileExists) {

        setProfileStatus(
          "⏳ Saving health profile on Arc Testnet..."
        );


        alert(
          "⏳ Saving Health Profile on Arc Testnet..."
        );


        console.log(
          "🚀 MetaMask → createProfile()"
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


        if (
          typeof window.showExplorerButton === "function"
        ) {

          window.showExplorerButton(
            tx.hash
          );
        }


        return;
      }


      // ------------------------------------------------------
      // UPDATE
      // ------------------------------------------------------

      setProfileStatus(
        "⏳ Updating health profile on Arc Testnet..."
      );


      alert(
        "⏳ Updating Health Profile on Arc Testnet..."
      );


      console.log(
        "🚀 MetaMask → updateProfile()"
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


      if (
        typeof window.showExplorerButton === "function"
      ) {

        window.showExplorerButton(
          tx.hash
        );
      }


    } catch (error) {

      console.error(
        "❌ MetaMask Health Profile transaction failed:",
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


    return;
  }


  // ==========================================================
  // UNKNOWN WALLET
  // ==========================================================

  setProfileStatus(
    "❌ Unsupported wallet type."
  );


  alert(
    "Unsupported wallet type. Please reconnect your wallet."
  );
}


// ============================================================
// EXPOSE FUNCTION GLOBALLY
// ============================================================

window.saveHealthProfile =
  saveHealthProfile;
