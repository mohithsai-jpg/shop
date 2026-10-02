/* =====================================
   DASHBOARD SYSTEM
===================================== */


/* =====================================
   CHECK LOGIN
===================================== */

const isLoggedIn =
    sessionStorage.getItem("isLoggedIn");

if (isLoggedIn !== "true") {
    window.location.href = "index.html";
}


/* =====================================
   GET BUTTONS
===================================== */

const insertWholesaler =
    document.getElementById("insertWholesaler");

const wholesalerDatabase =
    document.getElementById("wholesalerDatabase");

const logoutButton =
    document.getElementById("logoutButton");


/* =====================================
   INSERT WHOLESALER DETAILS
===================================== */

insertWholesaler.addEventListener("click", function () {

    window.location.href =
        "insert-wholesaler.html";

});


/* =====================================
   WHOLESALER DATABASE
===================================== */

wholesalerDatabase.addEventListener("click", function () {

    window.location.href =
        "wholesaler-database.html";

});


/* =====================================
   LOGOUT
===================================== */

logoutButton.addEventListener("click", function () {

    sessionStorage.removeItem("isLoggedIn");

    window.location.href = "index.html";

});