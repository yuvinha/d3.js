const form = document.querySelector("form");
const name = document.getElementById("name");
const cost = document.getElementById("cost");
const error = document.getElementById("error");
const btn = document.querySelector("button");

form.addEventListener("submit", (e) => {
  // Prevent the default behavior of submit event
  e.preventDefault();

  // Check if both input fields are filled properly
  if (name.value && cost.value) {
    // Check if the cost field is filled with valid number
    if (!isNaN(cost.value)) {
      // Create a new item with the input values
      const item = {
        name: name.value,
        cost: parseInt(cost.value),
      };

      // Add a new document to the collection in the Firestore
      db.collection("expenses")
        .add(item)
        .then((res) => {
          // Reset the fields and error message
          name.value = "";
          cost.value = "";
          error.textContent = "";
        });
    } else {
      error.textContent = "Please enter a valid number in the Item Cost field";
    }
  } else {
    error.textContent = "Please enter values before submitting";
  }
});

btn.addEventListener("mouseover", function () {
  this.classList.add("darken-1");
});

btn.addEventListener("mouseleave", function () {
  this.classList.remove("darken-1");
});
