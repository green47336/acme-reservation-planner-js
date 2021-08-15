const usersList = document.querySelector("#users-list"); //Targeting a UL tag in our index.html with the ID of users-list and assigning it to a variable for later DOM manipulation
const restaurantsList = document.querySelector("#restaurants-list"); //Targeting a UL tag in our index.html with the ID of restaurants-list and assigning it to a variable for later DOM manipulation
const reservationsList = document.querySelector("#reservations-list"); //Targeting a UL tag in our index.html with the ID of reservations-list and assigning it to a variable for later DOM manipulation

let restaurants, users; //Creating variables to assign things to later

//Our start function will fetch from our routes in server.js some info, store and stringify it, and then invoke our renderUsers, renderRestaurants, and fetchReservations functions
const start = async () => {
  const usersResponse = await fetch("/api/users"); //We're going to scope the scene at /api/users and whatever that returns to us we store in the variable usersResponse
  users = await usersResponse.json(); //Here we take the usersResponse and json stringify it and reassign out users variable
  const restaurantsResponse = await fetch("/api/restaurants"); ////We're going to scope the scene at /api/restaurants and whatever that returns to us we store in the variable restaurantsResponse
  restaurants = await restaurantsResponse.json(); //Here we take the restaurantsResponse and json stringify it and reassign out restaurants variable
  renderUsers(); //Invokes renderUsers which populates our html with all the user names (highlighted if we're currently at their window.location)
  renderRestaurants(); //Invokes rederRestaurants which populates our html with all the retaurant names
  fetchReservations(); //Invokes fetchReservations which populates our html with all reservations for our currently selected user
};

const renderUsers = async () => {
  const hash = window.location.hash.slice(1) * 1; //the hash property sets or returns the anchor part of a URL, including the hash, so we slice it off here
  const html = users //We map over our global user variable which was reassigned the stringified fetch response from /api/users when start was invoked...
    .map(
      (user) =>
        `<li ${
          hash === user.id ? 'style="border: solid 2px orchid"' : "" //...we return an li with the user's name as a link to the #user.id, checking to see if the current page location is this user's id to highlight it...
        }><a href='#${user.id}'>${user.name}</a></li>`
    )
    .join(""); //...and then join it all up...
  usersList.innerHTML = html; //...and finally assign the innerHTML of our selected <ul> in our index.html
};

const renderRestaurants = async () => {
  //Maps over our restaurants global variable which was assigned the fetched response from /api/restaurants in our start function...
  const html = restaurants
    .map((restaurant) => `<li>${restaurant.name}</li>`)
    .join("");
  restaurantsList.innerHTML = html; //...returns li with the current restaurant's name and finally maniputlates our selected DOM ul
};

const fetchReservations = async () => {
  const hash = window.location.hash.slice(1) * 1; //the hash property sets or returns the anchor part of a URL, including the hash, so we slice it off here
  const response = await fetch(`/api/users/${hash}/reservations`); //Fetches the reservation information for the user whose id matches the current window location hash
  const reservations = await response.json(); //Stringifies our reservations
  console.log(reservations); //Logs out our reservations
  const html = reservations
    .map((reservation) => `<li>${reservation.restaurant.name}</li>`) //Maps over and returns list items of our reservations
    .join("");
  reservationsList.innerHTML = html; //Manipulates the DOM to show our list of reservations
};

window.addEventListener("hashchange", renderUsers, renderRestaurants); //Adds an event listener to check if our hash has changed and invokes our renderUsers and renderRestaurants if so

renderUsers(); //Our inital pull of the users so we have something when we first load the page
renderRestaurants(); //Out initial pull of the restaurants so we have something when we first load the page
