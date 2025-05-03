console.log("JS loaded");
let data = null;
let city = null;

function isFieldsEmpty(element) {
  return element.value == null || element.value == "";
}


async function getDestination() {
  const arrivalDate = document.getElementById("arrivalDate");
  const departureDate = document.getElementById("departureDate");
  if (isFieldsEmpty(document.getElementById("search")) || isFieldsEmpty(arrivalDate) || isFieldsEmpty(departureDate)) {
    alert("all Values are Required to search a Hotel!");
    return;
  }
  if (arrivalDate.value < (new Date().toJSON().slice(0, 10)) || departureDate.value < (new Date().toJSON().slice(0, 10))) {
    alert("Time travel in past is not allowed while searching for hotel booking!")
    return;
  }
  else if (arrivalDate.value >= departureDate.value) {
    alert("arrival date can not be after the departure Date!");
    return;
  }
  document.getElementById("spinner-box").innerHTML = `<img src="spinner-8565_256.gif" id="spinner" alt="Loading...">`;
  const destination = document.getElementById("search").value;
  const url = `https://booking-com15.p.rapidapi.com/api/v1/hotels/searchDestination?query=${destination}`;
  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': 'ca6860d0d1msh3ed6c79ea7877dbp1b8252jsn28b5c8a6bcbe',
      'x-rapidapi-host': 'booking-com15.p.rapidapi.com'
    }
  };
  try {
    const response = await fetch(url, options);
    const result = await response.json();
    let data = result.data;
    let destId = null;
    
    data.forEach(element => {
      if (element.search_type == "city") {
        destId = element.dest_id;
        city = element.city_name;
      }
    });
    getHotels(destId, city);
  } catch (error) {
    console.error("error in getting destination ID : " + error);
    document.getElementById("spinner-box").innerHTML = "";
    document.getElementById("status").textContent = "No Hotels found.";
  }
}


async function getHotels(destId, city) {
  const arrival_date = document.getElementById("arrivalDate").value;
  const departure_date = document.getElementById("departureDate").value;
  const url = `https://booking-com15.p.rapidapi.com/api/v1/hotels/searchHotels?dest_id=${destId}&search_type=CITY&arrival_date=${arrival_date}&departure_date=${departure_date}&units=metric&temperature_unit=c`;
  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': 'ca6860d0d1msh3ed6c79ea7877dbp1b8252jsn28b5c8a6bcbe',
      'x-rapidapi-host': 'booking-com15.p.rapidapi.com'
    }
  };
  try {
    const response = await fetch(url, options);
    const result = await response.json();
    document.getElementById("spinner-box").innerHTML = "";
    data= result.data.hotels;
    if (response.ok) {
      populateHotels(data);
    }
  } catch (error) {
    console.error(error);
    document.getElementById("spinner-box").innerHTML = "";
    document.getElementById("status").textContent = "No Hotels found.";
  }
}


function populateHotels(hotels) {
  document.getElementsByClassName("hotels")[0].innerHTML = "";
  hotels.forEach(hotel => {
    let hotelUi = document.createElement("div");
    hotelUi.classList.add("hotel");
    hotelUi.innerHTML = `<div class="hotelInfoContainer">
                    <h3 class="name">
                        ${hotel.property.name}
                    </h3>

                    <div class="hotelInfo">
                        <p class="details">
                            ${"City: " + city + ", Coordinates: " + hotel.property.latitude + "," + hotel.property.longitude}
                        </p>
                        <p class="description">
                            ${"Review: " + hotel.property.reviewScore + "/10(" + hotel.property.reviewScoreWord + ") from total reviews: " + hotel.property.reviewCount}
                        </p>
                    </div>
                    </div>
                    <div class="hotelActions">
                        <button onclick="showMap('${hotel.hotel_id}')" class="showMapBtn"  >
                            <img src="map_pin.png" alt="Location">
                        </button>
                        <button onclick="addToFavList('${hotel.hotel_id}')" class="FavBtn">
                            Add to Favourite
                        </button>
                  </div>`
    document.getElementsByClassName("hotels")[0].appendChild(hotelUi);
  })
}


document.addEventListener("DOMContentLoaded", function () {
  populateHotels(data);
});


let map;

function showMap(hotelId) {
  document.getElementById("mapPopup").style.display = "block";
  let selectedHotel = null;
  data.forEach(hotel => {
    if (hotel.hotel_id == hotelId) {
      selectedHotel = hotel;
    }
  });
  if (selectedHotel) {
    populateMap(selectedHotel.property.latitude, selectedHotel.property.longitude);
  }
}


function populateMap(latitude, longitude) {
  if (!map) {
    map = L.map('map').setView([latitude, longitude], 11);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
  } else {
    map.setView([latitude, longitude], 11)
  }

  if (map.marker) {
    map.removeLayer(map.marker);
  }
  map.marker = L.marker([latitude, longitude]).addTo(map);
}


function closeMap() {
  document.getElementById("mapPopup").style.display = "none";
}
document.addEventListener("click", function (event) {
  const popup = document.getElementById("mapPopup")
  const mapBtn = document.getElementsByClassName("showMapBtn");
  let isShowMapBtn = false;
  
  if (!popup.contains(event.target)) {
    for(let i = 0; i<mapBtn.length; i++){
      if(mapBtn[i].contains(event.target)){
         isShowMapBtn = true;
       }
     }
     if(!isShowMapBtn){
      closeMap();
     }
  }
})


let favList = [];
function addToFavList(hotelId){
  
  console.log("add to fav list function");
  data.forEach(hotel => {
    if (hotel.hotel_id == hotelId) {
      if(!favList.includes(hotel)){
        favList.push(hotel);
      }
      
      return;
    }
  });
 
}

function removeFromFavList(hotelId){
  console.log("remove from fav list function");
  const index = favList.findIndex(hotel => hotel.hotel_id === hotelId);

  if (index !== -1) {
    // Remove the hotel from the list if found
    favList.splice(index, 1);
  }
  showFavList()
}

function showFavList(){
  document.getElementsByClassName("favList")[0].innerHTML="";
  favList.forEach(hotel => {
  let hotelUi = document.createElement("div");
  hotelUi.classList.add("hotel");
  hotelUi.innerHTML = `<div class="hotelInfoContainer">
                  <h3 class="name">
                      ${hotel.property.name}
                  </h3>

                  <div class="hotelInfo">
                      <p class="details">
                          ${"City: " + city + ", Coordinates: " + hotel.property.latitude + "," + hotel.property.longitude}
                      </p>
                      
                  </div>
                  </div>
                  <div class="hotelActions">
                      
                      <button onclick="removeFromFavList('${hotel.hotel_id}')" class="FavBtn">
                          Remove from Favourite
                      </button>
                </div>`
  document.getElementsByClassName("favList")[0].appendChild(hotelUi);
})
}





function filterByName(query) {
  const filteredHotels = data.filter(hotel =>
      hotel.property.name.toLowerCase().includes(query.toLowerCase())
  );
  populateHotels(filteredHotels);
}

document.getElementById("filter").addEventListener("input", function () {
  filterByName(this.value);
});



