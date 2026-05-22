const accessForm = document.querySelector("#accessForm");
const accessMessage = document.querySelector("#accessMessage");
const accessButton = document.querySelector("#accessButton");
const nameGroup = document.querySelector("#nameGroup");
const phoneGroup = document.querySelector("#phoneGroup");
const accessModes = document.querySelectorAll("input[name='accessMode']");

function getStoredUsers() {
  return JSON.parse(localStorage.getItem("akStoreUsers") || "[]");
}

function saveStoredUsers(users) {
  localStorage.setItem("akStoreUsers", JSON.stringify(users));
}

function getAccessMode() {
  const selectedMode = document.querySelector("input[name='accessMode']:checked");
  return selectedMode ? selectedMode.value : "signup";
}

function updateAccessMode() {
  const isSignup = getAccessMode() === "signup";

  if (nameGroup) {
    nameGroup.classList.toggle("d-none", !isSignup);
  }

  if (phoneGroup) {
    phoneGroup.classList.toggle("d-none", !isSignup);
  }

  if (accessButton) {
    accessButton.textContent = isSignup ? "Create profile" : "Sign in";
  }

  if (accessMessage) {
    accessMessage.textContent = "";
  }
}

accessModes.forEach((mode) => {
  mode.addEventListener("change", updateAccessMode);
});

updateAccessMode();

if (accessForm && accessMessage) {
  accessForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const mode = getAccessMode();
    const formData = new FormData(accessForm);
    const fullName = String(formData.get("fullName") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "").trim();
    const users = getStoredUsers();
    const existingUser = users.find((user) => user.email.toLowerCase() === email.toLowerCase());

    if (!email || !password) {
      accessMessage.textContent = "Please enter your email and password.";
      return;
    }

    if (mode === "signup") {
      if (!fullName) {
        accessMessage.textContent = "Please enter your full name.";
        return;
      }

      if (existingUser) {
        accessMessage.textContent = "This email already has a profile. Choose Returning to sign in.";
        return;
      }

      const newUser = {
        fullName,
        phone,
        email,
        password,
        createdAt: new Date().toISOString()
      };

      users.push(newUser);
      saveStoredUsers(users);
      localStorage.setItem("akStoreCurrentUser", JSON.stringify(newUser));
      localStorage.setItem("akStoreLastAction", "signup");
      accessMessage.textContent = "Profile created. Redirecting...";
    } else {
      if (!existingUser || existingUser.password !== password) {
        accessMessage.textContent = "No matching profile found. Check your details or create a new profile.";
        return;
      }

      localStorage.setItem("akStoreCurrentUser", JSON.stringify(existingUser));
      localStorage.setItem("akStoreLastAction", "login");
      accessMessage.textContent = "Signed in. Redirecting...";
    }

    window.setTimeout(() => {
      window.location.href = "acknowledgement.html";
    }, 700);
  });
}

const ackStatus = document.querySelector("#ackStatus");
const ackMessage = document.querySelector("#ackMessage");

if (ackStatus && ackMessage) {
  const currentUser = JSON.parse(localStorage.getItem("akStoreCurrentUser") || "null");
  const lastAction = localStorage.getItem("akStoreLastAction");

  if (currentUser) {
    ackStatus.textContent = lastAction === "signup" ? "Profile created" : "Signed in";
    ackMessage.textContent = `Thank you, ${currentUser.fullName || currentUser.email}. Your details have been saved. Visit the catalog or contact the store for an appointment.`;
  }
}

const catalogSearch = document.querySelector("#catalogSearch");
const catalogCategory = document.querySelector("#catalogCategory");
const productItems = document.querySelectorAll(".product-item");
const noProductsMessage = document.querySelector("#noProductsMessage");

function filterCatalog() {
  if (!productItems.length) {
    return;
  }

  const searchValue = catalogSearch ? catalogSearch.value.trim().toLowerCase() : "";
  const categoryValue = catalogCategory ? catalogCategory.value : "all";
  let visibleCount = 0;

  productItems.forEach((item) => {
    const name = String(item.dataset.name || "").toLowerCase();
    const category = String(item.dataset.category || "").toLowerCase();
    const matchesSearch = !searchValue || name.includes(searchValue) || category.includes(searchValue);
    const matchesCategory = categoryValue === "all" || category === categoryValue;
    const isVisible = matchesSearch && matchesCategory;

    item.classList.toggle("d-none", !isVisible);

    if (isVisible) {
      visibleCount += 1;
    }
  });

  if (noProductsMessage) {
    noProductsMessage.classList.toggle("d-none", visibleCount !== 0);
  }
}

if (catalogSearch) {
  catalogSearch.addEventListener("input", filterCatalog);
}

if (catalogCategory) {
  catalogCategory.addEventListener("change", filterCatalog);
}
