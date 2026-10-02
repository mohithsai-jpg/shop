// ================================
// WHOLESALER DATABASE
// ================================

// Check login
if (sessionStorage.getItem("isLoggedIn") !== "true") {
    window.location.href = "index.html";
}


// ================================
// GET ELEMENTS
// ================================

const wholesalerList = document.getElementById("wholesalerList");
const wholesalerCount = document.getElementById("wholesalerCount");

const purchaseSection = document.getElementById("purchaseSection");
const purchaseList = document.getElementById("purchaseList");
const wholesalerTitle = document.getElementById("wholesalerTitle");

const backButton = document.getElementById("backButton");
const backToWholesalers = document.getElementById("backToWholesalers");


// ================================
// GET DATABASE
// ================================

function getDatabase() {
    try {
        return JSON.parse(
            localStorage.getItem("wholesalerDatabase")
        ) || {};
    } catch (error) {
        return {};
    }
}


// ================================
// FORMAT DATE
// ================================

function formatDate(dateString) {

    if (!dateString) {
        return "-";
    }

    const date = new Date(dateString + "T00:00:00");

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}


// ================================
// FORMAT MONEY
// ================================

function formatMoney(amount) {

    return "₹" + Number(amount || 0).toFixed(2);
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


// ================================
// DISPLAY WHOLESALERS
// ================================

function displayWholesalers() {

    const database = getDatabase();

    wholesalerList.innerHTML = "";

    const wholesalerKeys = Object.keys(database);

    wholesalerCount.textContent = wholesalerKeys.length;


    if (wholesalerKeys.length === 0) {

        wholesalerList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📦</div>
                <h3>No wholesalers yet</h3>
                <p>Add your first wholesaler purchase to see it here.</p>
            </div>
        `;

        return;
    }


    wholesalerKeys.forEach(function (key) {

        const wholesaler = database[key];

        const button = document.createElement("button");

        button.type = "button";
        button.className = "wholesaler-button";

        button.innerHTML = `
            <div class="wholesaler-icon">🏪</div>

            <div class="wholesaler-info">
                <strong>
                    ${escapeHTML(wholesaler.displayName)}
                </strong>

                <span>
                    ${wholesaler.purchases.length}
                    Purchase${wholesaler.purchases.length === 1 ? "" : "s"}
                </span>
            </div>

            <div class="wholesaler-arrow">→</div>
        `;


        button.addEventListener("click", function () {

            showPurchases(key);

        });


        wholesalerList.appendChild(button);

    });
}


// ================================
// SHOW PURCHASES
// ================================

function showPurchases(wholesalerKey) {

    const database = getDatabase();

    const wholesaler = database[wholesalerKey];

    if (!wholesaler) {
        return;
    }


    // Hide wholesaler list
    document.querySelector(".database-card").style.display = "none";


    // Show purchase section
    purchaseSection.style.display = "block";


    wholesalerTitle.textContent =
        wholesaler.displayName;


    purchaseList.innerHTML = "";


    if (
        !wholesaler.purchases ||
        wholesaler.purchases.length === 0
    ) {

        purchaseList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📦</div>
                <h3>No purchase records</h3>
                <p>This wholesaler has no purchase records.</p>
            </div>
        `;

        return;
    }


    wholesaler.purchases.forEach(function (purchase) {

        const card =
            createPurchaseCard(
                wholesalerKey,
                purchase
            );

        purchaseList.appendChild(card);

    });
}


// ================================
// CREATE PURCHASE CARD
// ================================

function createPurchaseCard(
    wholesalerKey,
    purchase
) {

    const card = document.createElement("div");

    card.className = "purchase-card";


    // ============================
    // PHOTOS
    // ============================

    let photosHTML = "";

    if (
        purchase.photos &&
        purchase.photos.length > 0
    ) {

        photosHTML = `
            <div class="purchase-photos">
                ${purchase.photos.map(function (photo) {

                    return `
                        <img
                            src="${photo}"
                            alt="Bill Photo"
                            class="bill-image"
                        >
                    `;

                }).join("")}
            </div>
        `;
    }


    // ============================
    // PRODUCTS
    // ============================

    let productsHTML = "";

    if (
        purchase.products &&
        purchase.products.length > 0
    ) {

        productsHTML = `
            <div class="products-table-wrapper">

                <table class="products-table">

                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Qty</th>
                            <th>Unit Cost</th>
                            <th>Total</th>
                        </tr>
                    </thead>

                    <tbody>

                        ${purchase.products.map(function (product) {

                            return `
                                <tr>

                                    <td>
                                        ${escapeHTML(product.name)}
                                    </td>

                                    <td>
                                        ${product.quantity}
                                    </td>

                                    <td>
                                        ${formatMoney(product.unitPrice)}
                                    </td>

                                    <td>
                                        ${formatMoney(product.total)}
                                    </td>

                                </tr>
                            `;

                        }).join("")}

                    </tbody>

                </table>

            </div>
        `;
    }


    // ============================
    // PURCHASE CARD HTML
    // ============================

    card.innerHTML = `

        <div class="purchase-top">

            <div>
                <span class="purchase-label">
                    PURCHASE DATE
                </span>

                <h3>
                    ${formatDate(purchase.purchaseDate)}
                </h3>
            </div>

            <div class="purchase-actions">

                <button
                    type="button"
                    class="edit-purchase-button"
                >
                    ✏️ Edit
                </button>

                <button
                    type="button"
                    class="delete-purchase-button"
                >
                    🗑️ Delete
                </button>

            </div>

        </div>


        ${photosHTML}


        <div class="purchase-details">

            ${productsHTML}


            <div class="purchase-summary">

                <div class="summary-row">

                    <span>
                        Product Total Cost
                    </span>

                    <strong>
                        ${formatMoney(purchase.productTotal)}
                    </strong>

                </div>


                <div class="summary-row">

                    <span>
                        Transport Charge
                    </span>

                    <strong>
                        ${formatMoney(purchase.transportCharge)}
                    </strong>

                </div>


                <div class="summary-row final-summary">

                    <span>
                        Final Total
                    </span>

                    <strong>
                        ${formatMoney(purchase.finalTotal)}
                    </strong>

                </div>

            </div>


            <div class="paid-date">

                <span>
                    Bill Paid Date
                </span>

                <strong>
                    ${formatDate(purchase.paidDate)}
                </strong>

            </div>

        </div>
    `;


    // ============================
    // EDIT BUTTON
    // ============================

    const editButton =
        card.querySelector(".edit-purchase-button");


    editButton.addEventListener("click", function () {

        sessionStorage.setItem(
            "editingWholesaler",
            wholesalerKey
        );

        sessionStorage.setItem(
            "editingPurchaseId",
            purchase.id
        );

        window.location.href =
            "edit-wholesaler.html";

    });


    // ============================
    // DELETE BUTTON
    // ============================

    const deleteButton =
        card.querySelector(
            ".delete-purchase-button"
        );


    deleteButton.addEventListener(
        "click",
        function () {

            const confirmed = confirm(
                "Are you sure you want to delete this purchase record?\n\nThis action cannot be undone."
            );


            if (!confirmed) {
                return;
            }


            deletePurchase(
                wholesalerKey,
                purchase.id
            );

        }
    );


    // ============================
    // BILL IMAGE CLICK
    // ============================

    const billImages =
        card.querySelectorAll(".bill-image");


    billImages.forEach(function (image) {

        image.addEventListener(
            "click",
            function () {

                openImageViewer(
                    image.src
                );

            }
        );

    });


    return card;
}


// ================================
// DELETE PURCHASE
// ================================

function deletePurchase(
    wholesalerKey,
    purchaseId
) {

    const database = getDatabase();


    if (!database[wholesalerKey]) {

        alert("Wholesaler not found.");

        return;
    }


    // Remove only the selected purchase
    database[wholesalerKey].purchases =
        database[wholesalerKey].purchases.filter(
            function (purchase) {

                return purchase.id !== purchaseId;

            }
        );


    // Save updated database
    localStorage.setItem(
        "wholesalerDatabase",
        JSON.stringify(database)
    );


    // Refresh the purchase list
    showPurchases(wholesalerKey);
}


// ================================
// IMAGE VIEWER
// ================================

function openImageViewer(imageSrc) {

    const viewer =
        document.createElement("div");

    viewer.style.position = "fixed";
    viewer.style.top = "0";
    viewer.style.left = "0";
    viewer.style.width = "100%";
    viewer.style.height = "100%";
    viewer.style.background =
        "rgba(0,0,0,0.9)";
    viewer.style.display = "flex";
    viewer.style.alignItems = "center";
    viewer.style.justifyContent = "center";
    viewer.style.zIndex = "9999";
    viewer.style.padding = "20px";
    viewer.style.cursor = "pointer";


    const image =
        document.createElement("img");

    image.src = imageSrc;

    image.style.maxWidth = "95%";
    image.style.maxHeight = "95%";
    image.style.objectFit = "contain";
    image.style.borderRadius = "12px";


    viewer.appendChild(image);

    document.body.appendChild(viewer);


    viewer.addEventListener(
        "click",
        function () {

            viewer.remove();

        }
    );
}


// ================================
// BACK BUTTONS
// ================================

backButton.addEventListener(
    "click",
    function () {

        window.location.href =
            "dashboard.html";

    }
);


backToWholesalers.addEventListener(
    "click",
    function () {

        purchaseSection.style.display = "none";

        document.querySelector(
            ".database-card"
        ).style.display = "block";

        displayWholesalers();

    }
);


// ================================
// INITIAL LOAD
// ================================

displayWholesalers();