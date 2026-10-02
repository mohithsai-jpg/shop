// ================================
// EDIT WHOLESALER PURCHASE
// ================================

// Check login
if (sessionStorage.getItem("isLoggedIn") !== "true") {
    window.location.href = "index.html";
}

// Get elements
const wholesalerNameDisplay = document.getElementById("wholesalerNameDisplay");
const purchaseDate = document.getElementById("purchaseDate");
const billPhotos = document.getElementById("billPhotos");
const photoPreview = document.getElementById("photoPreview");

const productCount = document.getElementById("productCount");
const generateProducts = document.getElementById("generateProducts");
const productsContainer = document.getElementById("productsContainer");

const costSection = document.getElementById("costSection");
const costContainer = document.getElementById("costContainer");
const productTotal = document.getElementById("productTotal");

const transportCharge = document.getElementById("transportCharge");
const finalTotal = document.getElementById("finalTotal");

const paidDate = document.getElementById("paidDate");
const saveChanges = document.getElementById("saveChanges");
const backButton = document.getElementById("backButton");

// Storage references
const wholesalerKey = sessionStorage.getItem("editingWholesaler");
const purchaseId = sessionStorage.getItem("editingPurchaseId");

// Photos currently attached to this purchase
let selectedPhotos = [];

// Existing purchase data
let currentPurchase = null;


// ================================
// LOAD DATABASE
// ================================

function getDatabase() {
    try {
        return JSON.parse(localStorage.getItem("wholesalerDatabase")) || {};
    } catch (error) {
        return {};
    }
}

const database = getDatabase();


// ================================
// CHECK EDITING DATA
// ================================

if (!wholesalerKey || !purchaseId) {
    alert("No purchase selected for editing.");
    window.location.href = "wholesaler-database.html";
}

if (!database[wholesalerKey]) {
    alert("Wholesaler not found.");
    window.location.href = "wholesaler-database.html";
}

currentPurchase = database[wholesalerKey].purchases.find(
    purchase => purchase.id === purchaseId
);

if (!currentPurchase) {
    alert("Purchase record not found.");
    window.location.href = "wholesaler-database.html";
}


// ================================
// DISPLAY WHOLESALER
// ================================

wholesalerNameDisplay.textContent = database[wholesalerKey].displayName;


// ================================
// FORMAT MONEY
// ================================

function formatMoney(amount) {
    return "₹" + Number(amount || 0).toFixed(2);
}


// ================================
// COMPRESS IMAGE
// ================================

function compressImage(file) {
    return new Promise((resolve, reject) => {

        const reader = new FileReader();

        reader.onload = function (event) {

            const img = new Image();

            img.onload = function () {

                const maxSize = 1000;

                let width = img.width;
                let height = img.height;

                if (width > maxSize || height > maxSize) {

                    if (width > height) {
                        height = height * (maxSize / width);
                        width = maxSize;
                    } else {
                        width = width * (maxSize / height);
                        height = maxSize;
                    }
                }

                const canvas = document.createElement("canvas");

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext("2d");

                ctx.drawImage(img, 0, 0, width, height);

                const compressedImage = canvas.toDataURL(
                    "image/jpeg",
                    0.6
                );

                resolve(compressedImage);
            };

            img.onerror = reject;

            img.src = event.target.result;
        };

        reader.onerror = reject;

        reader.readAsDataURL(file);
    });
}


// ================================
// DISPLAY PHOTOS
// ================================

function displayPhotos() {

    photoPreview.innerHTML = "";

    selectedPhotos.forEach((photo, index) => {

        const previewItem = document.createElement("div");

        previewItem.className = "preview-item";

        const img = document.createElement("img");

        img.src = photo;
        img.alt = "Bill Photo";

        const removeButton = document.createElement("button");

        removeButton.type = "button";
        removeButton.className = "remove-photo";
        removeButton.textContent = "×";
        removeButton.title = "Remove photo";

        removeButton.addEventListener("click", function () {

            selectedPhotos.splice(index, 1);

            displayPhotos();
        });

        previewItem.appendChild(img);
        previewItem.appendChild(removeButton);

        photoPreview.appendChild(previewItem);
    });
}


// ================================
// ADD NEW PHOTOS
// ================================

billPhotos.addEventListener("change", async function () {

    const files = Array.from(billPhotos.files);

    if (files.length === 0) {
        return;
    }

    for (const file of files) {

        const fileName = file.name.toLowerCase();

        if (
            !fileName.endsWith(".jpg") &&
            !fileName.endsWith(".jpeg")
        ) {
            alert("Only JPG and JPEG images are allowed.");
            continue;
        }

        try {

            const compressedPhoto = await compressImage(file);

            selectedPhotos.push(compressedPhoto);

        } catch (error) {

            alert("Unable to process one of the images.");
        }
    }

    displayPhotos();

    // Allow selecting the same file again
    billPhotos.value = "";
});


// ================================
// LOAD EXISTING PURCHASE
// ================================

function loadPurchaseData() {

    purchaseDate.value = currentPurchase.purchaseDate || "";

    paidDate.value = currentPurchase.paidDate || "";

    transportCharge.value = currentPurchase.transportCharge || 0;

    // Load existing photos
    selectedPhotos = Array.isArray(currentPurchase.photos)
        ? [...currentPurchase.photos]
        : [];

    displayPhotos();

    // Load products
    const products = Array.isArray(currentPurchase.products)
        ? currentPurchase.products
        : [];

    productCount.value = products.length;

    generateProductFields(products);
}


// ================================
// GENERATE PRODUCT FIELDS
// ================================

function generateProductFields(existingProducts = []) {

    const count = parseInt(productCount.value);

    productsContainer.innerHTML = "";
    costContainer.innerHTML = "";

    if (!count || count < 1) {

        costSection.style.display = "none";

        calculateTotals();

        return;
    }

    // Product name + quantity fields
    for (let i = 0; i < count; i++) {

        const product = existingProducts[i] || {};

        const row = document.createElement("div");

        row.className = "product-row";

        row.innerHTML = `
            <div class="product-number">${i + 1}</div>

            <div class="product-fields">

                <div class="input-group">
                    <label>Product Name</label>
                    <input
                        type="text"
                        class="product-name"
                        value="${escapeAttribute(product.name || "")}"
                        placeholder="Enter product name"
                        required
                    >
                </div>

                <div class="input-group">
                    <label>Quantity</label>
                    <input
                        type="number"
                        class="product-quantity"
                        value="${product.quantity || ""}"
                        min="0"
                        step="0.01"
                        placeholder="Enter quantity"
                        required
                    >
                </div>

            </div>
        `;

        productsContainer.appendChild(row);
    }

    // Generate price fields
    for (let i = 0; i < count; i++) {

        const product = existingProducts[i] || {};

        const costRow = document.createElement("div");

        costRow.className = "cost-row";

        costRow.innerHTML = `
            <div class="cost-product-info">

                <span class="cost-number">${i + 1}</span>

                <div>
                    <strong class="cost-product-name">
                        ${escapeHTML(product.name || "Product " + (i + 1))}
                    </strong>
                    <small class="cost-quantity">
                        Qty: ${product.quantity || 0}
                    </small>
                </div>

            </div>

            <div class="amount-input">
                <span>₹</span>
                <input
                    type="number"
                    class="product-price"
                    value="${product.unitPrice || ""}"
                    min="0"
                    step="0.01"
                    placeholder="Unit price"
                    required
                >
            </div>

            <div class="product-total-display">
                ₹0.00
            </div>
        `;

        costContainer.appendChild(costRow);
    }

    costSection.style.display = "block";

    attachProductListeners();

    calculateTotals();
}


// ================================
// ESCAPE HTML
// ================================

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function escapeAttribute(value) {
    return escapeHTML(value);
}


// ================================
// PRODUCT LISTENERS
// ================================

function attachProductListeners() {

    const names = document.querySelectorAll(".product-name");
    const quantities = document.querySelectorAll(".product-quantity");
    const prices = document.querySelectorAll(".product-price");

    names.forEach((input, index) => {

        input.addEventListener("input", function () {

            const costName =
                document.querySelectorAll(".cost-product-name")[index];

            if (costName) {
                costName.textContent =
                    input.value.trim() || "Product " + (index + 1);
            }
        });
    });


    quantities.forEach((input, index) => {

        input.addEventListener("input", function () {

            const costQuantity =
                document.querySelectorAll(".cost-quantity")[index];

            if (costQuantity) {
                costQuantity.textContent =
                    "Qty: " + (input.value || 0);
            }

            calculateTotals();
        });
    });


    prices.forEach(input => {

        input.addEventListener("input", function () {

            calculateTotals();
        });
    });
}


// ================================
// GENERATE BUTTON
// ================================

generateProducts.addEventListener("click", function () {

    const count = parseInt(productCount.value);

    if (!count || count < 1) {

        alert("Please enter the number of products.");

        productCount.focus();

        return;
    }

    // Keep existing values when possible
    const existingProducts = getCurrentProducts();

    generateProductFields(existingProducts);
});


// ================================
// GET CURRENT PRODUCTS
// ================================

function getCurrentProducts() {

    const names = document.querySelectorAll(".product-name");
    const quantities = document.querySelectorAll(".product-quantity");
    const prices = document.querySelectorAll(".product-price");

    const products = [];

    for (let i = 0; i < names.length; i++) {

        products.push({
            name: names[i].value.trim(),
            quantity: Number(quantities[i].value) || 0,
            unitPrice: Number(prices[i]?.value) || 0
        });
    }

    return products;
}


// ================================
// CALCULATE TOTALS
// ================================

function calculateTotals() {

    const quantities = document.querySelectorAll(".product-quantity");
    const prices = document.querySelectorAll(".product-price");
    const totalDisplays =
        document.querySelectorAll(".product-total-display");

    let total = 0;

    for (let i = 0; i < quantities.length; i++) {

        const quantity = Number(quantities[i].value) || 0;
        const price = Number(prices[i]?.value) || 0;

        const productAmount = quantity * price;

        total += productAmount;

        if (totalDisplays[i]) {
            totalDisplays[i].textContent =
                formatMoney(productAmount);
        }
    }

    const transport =
        Number(transportCharge.value) || 0;

    const finalAmount = total + transport;

    productTotal.textContent = formatMoney(total);

    finalTotal.textContent = formatMoney(finalAmount);
}


// Transport calculation
transportCharge.addEventListener(
    "input",
    calculateTotals
);


// ================================
// SAVE CHANGES
// ================================

saveChanges.addEventListener("click", function () {

    // Validate purchase date
    if (!purchaseDate.value) {

        alert("Please select the purchase date.");

        purchaseDate.focus();

        return;
    }


    // Validate product count
    const count = parseInt(productCount.value);

    if (!count || count < 1) {

        alert("Please enter the number of products.");

        productCount.focus();

        return;
    }


    // Get product fields
    const names = document.querySelectorAll(".product-name");
    const quantities = document.querySelectorAll(".product-quantity");
    const prices = document.querySelectorAll(".product-price");

    const products = [];

    let productTotalAmount = 0;


    for (let i = 0; i < count; i++) {

        const name = names[i]?.value.trim();
        const quantity = Number(quantities[i]?.value);
        const unitPrice = Number(prices[i]?.value);


        if (!name) {

            alert(`Please enter the name for Product ${i + 1}.`);

            names[i].focus();

            return;
        }


        if (
            quantities[i].value === "" ||
            quantity < 0
        ) {

            alert(`Please enter a valid quantity for Product ${i + 1}.`);

            quantities[i].focus();

            return;
        }


        if (
            prices[i].value === "" ||
            unitPrice < 0
        ) {

            alert(`Please enter a valid price for Product ${i + 1}.`);

            prices[i].focus();

            return;
        }


        const total = quantity * unitPrice;

        productTotalAmount += total;


        products.push({
            name: name,
            quantity: quantity,
            unitPrice: unitPrice,
            total: total
        });
    }


    // Transport
    const transport =
        Number(transportCharge.value) || 0;


    // Final total
    const finalAmount =
        productTotalAmount + transport;


    // Update existing purchase
    currentPurchase.purchaseDate =
        purchaseDate.value;

    currentPurchase.photos =
        selectedPhotos;

    currentPurchase.products =
        products;

    currentPurchase.productTotal =
        productTotalAmount;

    currentPurchase.transportCharge =
        transport;

    currentPurchase.finalTotal =
        finalAmount;

    currentPurchase.paidDate =
        paidDate.value;

    currentPurchase.updatedAt =
        new Date().toISOString();


    // Save database
    database[wholesalerKey].purchases =
        database[wholesalerKey].purchases.map(purchase => {

            if (purchase.id === purchaseId) {
                return currentPurchase;
            }

            return purchase;
        });


    try {

        localStorage.setItem(
            "wholesalerDatabase",
            JSON.stringify(database)
        );

        saveChanges.disabled = true;

        saveChanges.innerHTML =
            '<span>✓</span> Saving...';

        setTimeout(function () {

            alert("Purchase record updated successfully!");

            window.location.href =
                "wholesaler-database.html";

        }, 500);

    } catch (error) {

        console.error(error);

        saveChanges.disabled = false;

        saveChanges.innerHTML =
            '<span>💾</span> Save Changes';

        alert(
            "Unable to save changes. Your browser storage may be full."
        );
    }
});


// ================================
// BACK BUTTON
// ================================

backButton.addEventListener("click", function () {

    window.location.href =
        "wholesaler-database.html";
});


// ================================
// INITIAL LOAD
// ================================

loadPurchaseData();