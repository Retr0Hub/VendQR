const choices = document.getElementById("choices");
const cart = document.getElementById("cart");
const main = document.getElementById("main");
const pickedChoicesamount = [];
const options = [];
let menu;

const MINUSSVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="2" fill="none" viewBox="0 0 10 2"><path fill="#fff" d="M0 .375h10v1.25H0V.375Z"/></svg>';
const PLUSSVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="none" viewBox="0 0 10 10"><path fill="#fff" d="M10 4.375H5.625V0h-1.25v4.375H0v1.25h4.375V10h1.25V5.625H10v-1.25Z"/></svg>';
const TABLETMEDIA = "(min-width: 64rem)";
const DESKTOPMEDIA = "(min-width: 84rem)";

const cartHeader = () => {
  let totalPrice = 0;
  pickedChoicesamount.forEach((quantity, index) => {
    if (quantity > 0) {
      totalPrice += quantity * menu[index].price;
    }
  });

  return createHItem(`Your Cart (₹${totalPrice.toFixed(2)})`, "cartHeader", 2);
};

const createEmptyCart = () => {
  cart.innerHTML = "";

  cart?.appendChild(cartHeader(0));
  cart?.appendChild(
    createImageItem(
      "/images/illustration-empty-cart.svg",
      "emptyCartImage"
    )
  );
  cart?.appendChild(
    createPItem("Your added items will appear here", "emptyCartText")
  );
};

const priceSummary = (id, total = true) => {
  const divItem = createDivItem("priceOrderSummary");
  divItem.appendChild(
    createSpanItem(pickedChoicesamount[id] + "x", "pickedAmount")
  );
  divItem.appendChild(
    createSpanItem("@ ₹" + menu[id].price.toFixed(2), "pickedPrice")
  );
  if (total) {
    divItem.appendChild(
      createSpanItem(
        "₹" + (pickedChoicesamount[id] * menu[id].price).toFixed(2),
        "pickedPriceTotal"
      )
    );
  }
  return divItem;
};

const chosenSummary = (id) => {
  const divItem = createDivItem("productOrderSummary");
  divItem.appendChild(createPItem(menu[id].name, "cartItemName"));
  divItem.appendChild(priceSummary(id));
  return divItem;
};

const removeItem = (id) => {
  pickedChoicesamount[id] = 0;
  turnToCartButton(options[id].button);
  options[id].image.classList.remove("selected");
};

const showSelectedCart = (id) => {
  const divItem = createDivItem("pickedDiv");
  divItem.appendChild(chosenSummary(id));

  const imgItem = createImageItem(
    "/images/icon-remove-item.svg",
    "removeButton"
  );
  imgItem.addEventListener("click", () => {
    removeItem(id);
    updateCartContent();
  });
  divItem.appendChild(imgItem);

  cart?.appendChild(divItem);
  cart?.appendChild(createHrItem("articleSeperator"));
};

const addTotal = (orderconfirmed = false) => {
  let cartTotal = 0;
  pickedChoicesamount.forEach((picked, index) => {
    if (picked > 0) {
      if (!orderconfirmed) {
        showSelectedCart(index);
      }
      cartTotal += picked * menu[index].price;
    }
  });
  const divItem = createDivItem("orderTotal");
  divItem.appendChild(createPItem("Order Total", "orderTotalText"));
  divItem.appendChild(
    createPItem("₹" + cartTotal.toFixed(2), "orderTotalPrice")
  );
  return divItem;
};

const addCarboNeutral = () => {
  const divItem = createDivItem("carbonNeutral");
  divItem.appendChild(
    createImageItem(
      "/images/icon-carbon-neutral.svg",
      "carbonNeutralImage"
    )
  );
  divItem.appendChild(
    createPItem("This is a <b>carbon-neutral</b> delivery", "carbonNeutralText")
  );
  cart?.appendChild(divItem);
};

const addOrderedProducts = () => {
  const products = createDivItem("orderedProducts");
  pickedChoicesamount.forEach((amount, index) => {
    if (amount > 0) {
      const product = createDivItem("productOrderedSummary");
      product.appendChild(
        createImageItem(menu[index].image.thumbnail, "thumbnail")
      );
      const nameAndPrice = createDivItem("nameAndPrice");
      nameAndPrice.appendChild(
        createPItem(menu[index].name, "nameOrderedProduct")
      );
      nameAndPrice.appendChild(priceSummary(index, false));

      product.appendChild(nameAndPrice);
      product.appendChild(
        createPItem("₹" + (amount * menu[index].price).toFixed(2), "total")
      );

      products.appendChild(product);
      products.appendChild(createHrItem("articleSeperator"));
    }
  });
  products.appendChild(addTotal(true));
  return products;
};

const confirmOrder = () => {
  // Prevent any existing confirmation page from being removed
  setInterval(() => {
    if (!document.getElementById("confirmForm")) {
        console.warn("Something removed the confirmation page!");
    }
  }, 1000);
  
  if (document.getElementById("confirmForm")) return;

  const divItem = createDivItem("confirmBackground");
  divItem.setAttribute("id", "confirmForm");

  const confirmSummary = createDivItem("confirmSummary");
  confirmSummary.appendChild(createImageItem("/images/icon-order-confirmed.svg", "orderConfirmedImage"));

  confirmSummary.appendChild(createHItem("Order Confirmed", "confirmHeader", 1));
  confirmSummary.appendChild(createPItem("We hope you enjoy your food!", "enjoy"));

  // Generate order details
  let orderText = "Order Confirmed\n\n";
  let totalAmount = 0;

  pickedChoicesamount.forEach((amount, index) => {
    if (amount > 0) {
      let itemTotal = amount * menu[index].price;
      totalAmount += itemTotal;
      orderText += `${menu[index].name}\n`;
      orderText += `Quantity: ${amount} @ ₹${menu[index].price.toFixed(2)}\n`;
      orderText += `Total: ₹${itemTotal.toFixed(2)}\n\n`;
    }
  });

  orderText += `Order Total: ₹${totalAmount.toFixed(2)}\n`;

  // Show loading indicator
  const loadingIndicator = document.createElement("div");
  loadingIndicator.innerText = "Generating QR Code...";
  confirmSummary.appendChild(loadingIndicator);
  
  // Send order details to Flask to generate QR
  console.log("Payload being sent:", { order_info: orderText });
  fetch("https://trivially-included-moth.ngrok-free.app/generate-qrcode", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ order_info: orderText }),
  })
  .then(response => response.json())
  .then(data => {
      console.log("Fetch processed data:", data);
      if (data.url) { // Use 'url' from the response
          // Remove loading indicator
          confirmSummary.removeChild(loadingIndicator);
          const qrContainer = document.createElement("div");
          qrContainer.setAttribute("id", "qr-container");
          const qrImage = document.createElement("img");
          qrImage.src = data.url; // Use the URL from the response
          qrImage.alt = "Order QR Code";
          qrImage.style.width = "100%"; // Scale to fit the container
          qrImage.style.height = "auto"; // Maintain aspect ratio
          qrContainer.appendChild(qrImage);
          confirmSummary.appendChild(qrContainer); // Append QR image to the container
      }
  })
  .catch(error => {
      console.error("Fetch error:", error);
      alert("An error occurred: " + error);
  });

  confirmSummary.appendChild(addOrderedProducts());

  const startNewOrder = createDivItem("confirmButton", "Start new Order");
  startNewOrder.addEventListener("click", () => {
    pickedChoicesamount.forEach((amount, index) => {
      if (amount > 0) {
        removeItem(index);
      }
    });
    updateCartContent();
    const orderform = document.getElementById("confirmForm");
    orderform?.remove();
  });

  confirmSummary.appendChild(startNewOrder);
  divItem.appendChild(confirmSummary);
  document.body.appendChild(divItem);
  window.scrollTo(0, 0);

  console.log("Confirmation page added and should remain visible.");
  setInterval(() => {
    if (!document.getElementById("confirmForm")) {
      console.warn("Confirmation page disappeared!");
    }
  }, 1000);
};

const addConfirmButton = () => {
  const divItem = createDivItem("confirmButton", "Confirm order");
  divItem.addEventListener("click", (event) => {
    event.preventDefault(); // Stop default form submission
    event.stopPropagation(); // Prevent bubbling up
    confirmOrder();
  });
  cart?.appendChild(divItem);
};

const updateCartContent = () => {
  let total = pickedChoicesamount.reduce((first, last) => {
    return first + last;
  });

  if (total == 0) {
    createEmptyCart();
  } else {
    cart.innerHTML = "";
    cart?.appendChild(cartHeader(total));
    cart?.appendChild(addTotal());
    addCarboNeutral();
    addConfirmButton();
  }
};

const addImage = (image) => {
  let exampleimage = image.mobile;
  if (window.matchMedia(TABLETMEDIA).matches) {
    exampleimage = image.tablet;
  }
  if (window.matchMedia(DESKTOPMEDIA).matches) {
    exampleimage = image.desktop;
  }
  const imgItem = createImageItem(exampleimage, "menuExample");
  imgItem.setAttribute("alt", "menuexample");
  return imgItem;
};

const turnToCartButton = (button) => {
  button.innerHTML = "";
  button.appendChild(
    createImageItem("/images/icon-add-to-cart.svg", "cartImage")
  );
  button.appendChild(createSpanItem("Add to Cart", "addCart"));
  button.classList.remove("amountButton");
  button.classList.add("cartButton");
};

const turnToAmountButton = (button, articleid) => {
  button.innerHTML = "";

  const divminusItem = createDivItem("amountChange");
  divminusItem.innerHTML = MINUSSVG;
  divminusItem.addEventListener("click", () => {
    pickedChoicesamount[articleid]--;
    if (pickedChoicesamount[articleid] == 0) {
      turnToCartButton(options[articleid].button);
      options[articleid].image.classList.remove("selected");
  }  
  });

  button.appendChild(divminusItem);
  button.appendChild(createPItem(pickedChoicesamount[articleid], "amount"));

  const divplusItem = createDivItem("amountChange");
  divplusItem.innerHTML = PLUSSVG;
  divplusItem.addEventListener("click", () => {
    pickedChoicesamount[articleid]++;
  });
  button.appendChild(divplusItem);

  button.classList.remove("cartButton");
  button.classList.add("amountButton");
};

const addButton = (id, recipeimage) => {
  const divItem = createDivItem("button");
  divItem.addEventListener("click", () => {
    if (pickedChoicesamount[id] <= 0) {
      pickedChoicesamount[id]++;
    }
    if (pickedChoicesamount[id] > 0) {
      recipeimage.classList.add("selected");
      turnToAmountButton(divItem, id);
      updateCartContent();
    } else {
      recipeimage.classList.remove("selected");
      turnToCartButton(divItem);
      updateCartContent();
    }
  });
  turnToCartButton(divItem);

  const buttonandimage = {};
  buttonandimage.button = divItem;
  buttonandimage.image = recipeimage;
  options.push(buttonandimage);

  return divItem;
};

const addOption = (option) => {
  const divItem = createDivItem("menuOption");
  const recipeimage = addImage(option.image);
  divItem.appendChild(recipeimage);
  divItem.appendChild(addButton(pickedChoicesamount.length, recipeimage));
  divItem.appendChild(createPItem(option.category, "category"));
  divItem.appendChild(createPItem(option.name, "name"));
  divItem.appendChild(createPItem("₹" + option.price.toFixed(2), "price"));
  choices?.appendChild(divItem);
  pickedChoicesamount.push(0);
};

const addChoices = (ch) => {
  ch.forEach((item) => {
    addOption(item);
  });
};

async function displayChoices() {
  let result = await getData();
  menu = result;
  addChoices(result);
}

displayChoices();

createEmptyCart();
