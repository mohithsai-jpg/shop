// ==========================================
// INSERT WHOLESALER - JAVASCRIPT
// ==========================================

// Check login
if (sessionStorage.getItem("isLoggedIn") !== "true") {
    window.location.href = "index.html";
}


// ==========================================
// GET ELEMENTS
// ==========================================

const purchaseForm = document.getElementById("purchaseForm");
const backButton = document.getElementById("backButton");

const generateProducts = document.getElementById("generateProducts");
const productCount = document.getElementById("productCount");
const productsContainer = document.getElementById("productsContainer");

const costSection = document.getElementById("costSection");
const costContainer = document.getElementById("costContainer");

const productTotal = document.getElementById("productTotal");
const transportCharge = document.getElementById("transportCharge");
const finalTotal = document.getElementById("finalTotal");

const billPhotos = document.getElementById("billPhotos");
const photoPreview = document.getElementById("photoPreview");


// ==========================================
// BACK BUTTON
// ==========================================

if (backButton) {
    backButton.addEventListener("click", function () {
        window.location.href = "dashboard.html";
    });
}


// ==========================================
// PHOTO STORAGE
// ==========================================

let selectedPhotos = [];


// ==========================================
// PHOTO UPLOAD
// ==========================================

billPhotos.addEventListener("change", function () {

    const files = Array.from(this.files);

    files.forEach(function (file) {

        // Only JPG/JPEG
        if (
            file.type !== "image/jpeg" &&
            file.type !== "image/jpg"
        ) {
            alert("Only JPG/JPEG images are allowed.");
            return;
        }

        // Compress image automatically
        compressImage(file)
            .then(function (compressedImage) {

                selectedPhotos.push(compressedImage);

                displayPhotoPreview();

            })
            .catch(function (error) {

                console.error("Image compression error:", error);

                alert("Unable to process the image.");
            });
    });

    // Allow selecting the same image again
    this.value = "";
});


// ==========================================
// COMPRESS IMAGE
// ==========================================

function compressImage(file) {

    return new Promise(function (resolve, reject) {

        const reader = new FileReader();

        reader.onload = function (event) {

            const img = new Image();

            img.onload = function () {

                // Maximum image size
                const MAX_WIDTH = 1000;
                const MAX_HEIGHT = 1000;

                let width = img.width;
                let height = img.height;


                // Resize large images
                if (width > MAX_WIDTH || height > MAX_HEIGHT) {

                    const ratio = Math.min(
                        MAX_WIDTH / width,
                        MAX_HEIGHT / height
                    );

                    width = Math.round(width * ratio);
                    height = Math.round(height * ratio);
                }


                // Create canvas
                const canvas = document.createElement("canvas");

                canvas.width = width;
                canvas.height = height;


                const ctx = canvas.getContext("2d");

                ctx.drawImage(
                    img,
                    0,
                    0,
                    width,
                    height
                );


                // Compress to JPEG
                const compressedImage = canvas.toDataURL(
                    "image/jpeg",
                    0.6
                );


                resolve(compressedImage);
            };


            img.onerror = function () {
                reject("Unable to load image.");
            };


            img.src = event.target.result;
        };


        reader.onerror = function () {
            reject("Unable to read image.");
        };


        reader.readAsDataURL(file);
    });
}


// ==========================================
// DISPLAY PHOTO PREVIEW
// ==========================================

function displayPhotoPreview() {

    photoPreview.innerHTML = "";

    selectedPhotos.forEach(function (photo, index) {

        const item = document.createElement("div");

        item.className = "preview-item";

        item.innerHTML = `
            <img src="${photo}" alt="Bill Photo">

            <button
                type="button"
                class="remove-photo"
                data-index="${index}">
                ×
            </button>
        `;

        photoPreview.appendChild(item);
    });


    // Remove photo buttons
    document.querySelectorAll(".remove-photo").forEach(function (button) {

        button.addEventListener("click", function () {

            const index = Number(this.dataset.index);

            selectedPhotos.splice(index, 1);

            displayPhotoPreview();
        });
    });
}


// ==========================================
// GENERATE PRODUCT FIELDS
// ==========================================

generateProducts.addEventListener("click", function () {

    const count = Number(productCount.value);

    if (!count || count < 1) {

        alert("Please enter the number of products.");

        productCount.focus();

        return;
    }


    productsContainer.innerHTML = "";

    costContainer.innerHTML = "";

    costSection.style.display = "none";


    // Create product fields
    for (let i = 1; i <= count; i++) {

        const row = document.createElement("div");

        row.className = "product-row";

        row.innerHTML = `

            <div class="product-number">
                ${i}
            </div>

            <div class="product-fields">

                <div class="input-group">

                    <label>
                        Product ${i} Name
                    </label>

                    <input
                        type="text"
                        class="product-name"
                        placeholder="Enter product name"
                        required
                    >

                </div>


                <div class="input-group">

                    <label>
                        Quantity
                    </label>

                    <input
                        type="number"
                        class="product-quantity"
                        min="0.01"
                        step="0.01"
                        placeholder="Enter quantity"
                        required
                    >

                </div>

            </div>
        `;

        productsContainer.appendChild(row);
    }


    createCostFields(count);


    productsContainer.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
});


// ==========================================
// CREATE PRICE FIELDS
// ==========================================

function createCostFields(count) {

    costContainer.innerHTML = "";

    costSection.style.display = "block";


    for (let i = 1; i <= count; i++) {

        const row = document.createElement("div");

        row.className = "cost-row";

        row.innerHTML = `

            <div class="cost-product-info">

                <span class="cost-number">
                    ${i}
                </span>

                <div>

                    <strong>
                        Product ${i}
                    </strong>

                    <small class="cost-product-name">
                        Enter product name above
                    </small>

                </div>

            </div>


            <div class="amount-input">

                <span>₹</span>

                <input
                    type="number"
                    class="product-price"
                    min="0"
                    step="0.01"
                    placeholder="Price per unit"
                    required
                >

            </div>


            <div class="product-total-display">

                Total:
                <strong>₹0.00</strong>

            </div>
        `;

        costContainer.appendChild(row);
    }


    // Product name update
    document.querySelectorAll(".product-name")
        .forEach(function (input, index) {

            input.addEventListener("input", function () {

                const name =
                    document.querySelectorAll(
                        ".cost-product-name"
                    )[index];

                name.textContent =
                    input.value ||
                    "Enter product name above";
            });
        });


    // Price change
    document.querySelectorAll(".product-price")
        .forEach(function (input) {

            input.addEventListener(
                "input",
                calculateTotals
            );
        });


    // Quantity change
    document.querySelectorAll(".product-quantity")
        .forEach(function (input) {

            input.addEventListener(
                "input",
                calculateTotals
            );
        });
}


// ==========================================
// CALCULATE TOTALS
// ==========================================

function calculateTotals() {

    const quantities =
        document.querySelectorAll(
            ".product-quantity"
        );

    const prices =
        document.querySelectorAll(
            ".product-price"
        );

    const displays =
        document.querySelectorAll(
            ".product-total-display strong"
        );


    let total = 0;


    for (let i = 0; i < quantities.length; i++) {

        const quantity =
            Number(quantities[i].value) || 0;

        const price =
            Number(prices[i].value) || 0;


        const productAmount =
            quantity * price;


        total += productAmount;


        if (displays[i]) {

            displays[i].textContent =
                "₹" + productAmount.toFixed(2);
        }
    }


    // Product total
    productTotal.textContent =
        "₹" + total.toFixed(2);


    // Transport
    const transport =
        Number(transportCharge.value) || 0;


    // Final total
    finalTotal.textContent =
        "₹" +
        (total + transport).toFixed(2);
}


// Transport calculation
transportCharge.addEventListener(
    "input",
    calculateTotals
);


// ==========================================
// SAVE PURCHASE
// ==========================================

purchaseForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        // ----------------------------------
        // BASIC DETAILS
        // ----------------------------------

        const wholesalerName =
            document.getElementById(
                "wholesalerName"
            ).value.trim();


        const purchaseDate =
            document.getElementById(
                "purchaseDate"
            ).value;


        const paidDate =
            document.getElementById(
                "paidDate"
            ).value;


        if (!wholesalerName) {

            alert("Please enter wholesaler name.");

            return;
        }


        if (!purchaseDate) {

            alert("Please select purchase date.");

            return;
        }


        // ----------------------------------
        // PRODUCT FIELDS
        // ----------------------------------

        const names =
            document.querySelectorAll(
                ".product-name"
            );


        const quantities =
            document.querySelectorAll(
                ".product-quantity"
            );


        const prices =
            document.querySelectorAll(
                ".product-price"
            );


        if (names.length === 0) {

            alert(
                "Please enter the number of products and click Generate Product Fields."
            );

            return;
        }


        if (
            prices.length !== names.length ||
            quantities.length !== names.length
        ) {

            alert(
                "Please generate the product fields again."
            );

            return;
        }


        // ----------------------------------
        // CREATE PRODUCTS
        // ----------------------------------

        const products = [];

        let total = 0;


        for (
            let i = 0;
            i < names.length;
            i++
        ) {

            const name =
                names[i].value.trim();


            const quantity =
                Number(
                    quantities[i].value
                );


            const price =
                Number(
                    prices[i].value
                );


            if (!name) {

                alert(
                    `Please enter Product ${i + 1} name.`
                );

                names[i].focus();

                return;
            }


            if (
                !quantity ||
                quantity <= 0
            ) {

                alert(
                    `Please enter quantity for Product ${i + 1}.`
                );

                quantities[i].focus();

                return;
            }


            if (
                isNaN(price) ||
                price < 0
            ) {

                alert(
                    `Please enter price for Product ${i + 1}.`
                );

                prices[i].focus();

                return;
            }


            const productAmount =
                quantity * price;


            total += productAmount;


            products.push({

                name: name,

                quantity: quantity,

                price: price,

                total: productAmount

            });
        }


        // ----------------------------------
        // TOTALS
        // ----------------------------------

        const transport =
            Number(
                transportCharge.value
            ) || 0;


        const finalAmount =
            total + transport;


        // ----------------------------------
        // GET DATABASE
        // ----------------------------------

        let database = {};


        try {

            const savedData =
                localStorage.getItem(
                    "wholesalerDatabase"
                );


            if (savedData) {

                database =
                    JSON.parse(savedData);
            }

        } catch (error) {

            console.error(
                "Database read error:",
                error
            );

            database = {};
        }


        // ----------------------------------
        // NORMALIZE WHOLESALER NAME
        // ----------------------------------

        const key =
            wholesalerName
                .toLowerCase()
                .replace(/\s+/g, " ")
                .trim();


        // Create wholesaler if new
        if (!database[key]) {

            database[key] = {

                displayName:
                    wholesalerName,

                purchases: []

            };
        }


        // ----------------------------------
        // PURCHASE RECORD
        // ----------------------------------

        const purchase = {

            id:
                Date.now().toString(),

            purchaseDate:
                purchaseDate,

            photos:
                selectedPhotos,

            products:
                products,

            productTotal:
                total,

            transportCharge:
                transport,

            finalTotal:
                finalAmount,

            paidDate:
                paidDate,

            savedAt:
                new Date().toISOString()
        };


        // Add purchase
        database[key].purchases.push(
            purchase
        );


        // ----------------------------------
        // SAVE DATABASE
        // ----------------------------------

        try {

            localStorage.setItem(
                "wholesalerDatabase",
                JSON.stringify(database)
            );

        } catch (error) {

            console.error(
                "Storage error:",
                error
            );

            alert(
                "Unable to save this purchase. Please try again."
            );

            return;
        }


        // ----------------------------------
        // SUCCESS
        // ----------------------------------

        alert(
            "Purchase record saved successfully!"
        );


        // Go to database
        window.location.href =
            "wholesaler-database.html";
    }
);