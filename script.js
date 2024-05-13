var map;
var markerLayer = L.layerGroup();
var waypoints = [];
var userLocationMarker; // Holds the user's location marker

document.addEventListener('DOMContentLoaded', function() {
    map = L.map('map').setView([51.505, -0.09], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    markerLayer.addTo(map);

    map.locate({setView: true, maxZoom: 16, watch: true}); // Continuously watch for changes in position

    map.on('click', function(e) {
        updateCoordinates(e.latlng);
        addClickLocationMarker(e.latlng); // Add marker on map where user clicks
    });
    map.on('locationfound', function(e) {
        updateCoordinates(e.latlng);
        updateUserLocationMarker(e.latlng);
    });
});

function updateCoordinates(latlng) {
    document.getElementById('latitude').value = latlng.lat.toFixed(5);
    document.getElementById('longitude').value = latlng.lng.toFixed(5);
}

function updateUserLocationMarker(latlng) {
    if (userLocationMarker) {
        map.removeLayer(userLocationMarker); // Remove the previous marker if it exists
    }
    userLocationMarker = L.circle(latlng, {
        color: 'blue',
        fillColor: '#30f',
        fillOpacity: 0.5,
        radius: 50
    }).addTo(map);
}

function addClickLocationMarker(latlng) {
    var marker = L.marker([latlng.lat, latlng.lng]).addTo(markerLayer);
    marker.bindPopup("Coordinates: " + latlng.lat.toFixed(5) + ", " + latlng.lng.toFixed(5)).openPopup();
}

function addWaypoint() {
    var lat = document.getElementById('latitude').value;
    var lng = document.getElementById('longitude').value;
    var description = document.getElementById('description').value;

    if (!lat || !lng || !description) {
        alert('Please ensure all fields are filled and a location is selected on the map.');
        return;
    }

    var marker = L.marker([parseFloat(lat), parseFloat(lng)]).addTo(markerLayer);
    marker.bindPopup(description).openPopup();
    waypoints.push({ latitude: lat, longitude: lng, description: description });
    document.getElementById('description').value = ''; // Clear the textarea after submitting
}

function downloadWaypoints() {
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(waypoints));
    var dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "waypoints.json");
    dlAnchorElem.click();
}
function uploadWaypoints() {
    var fileInput = document.getElementById('uploadJson');
    var file = fileInput.files[0];
    if (file) {
        var reader = new FileReader();
        reader.onload = function (event) {
            try {
                var uploadedWaypoints = JSON.parse(event.target.result);
                uploadedWaypoints.forEach(function(wp) {
                    addWaypointFromData(wp.latitude, wp.longitude, wp.description);
                });
            } catch (e) {
                alert('Error parsing JSON!');
            }
        };
        reader.readAsText(file);
    } else {
        alert('Please select a file to upload.');
    }
}

function addWaypointFromData(lat, lng, description) {
    var marker = L.marker([parseFloat(lat), parseFloat(lng)]).addTo(markerLayer);
    marker.bindPopup(description).openPopup();
    waypoints.push({ latitude: lat, longitude: lng, description: description });
}

document.addEventListener('DOMContentLoaded', function() {
    // Existing initialization code
});

var cameraEnabled = false;
var localStream = null;

document.getElementById('toggleCamera').addEventListener('click', function() {
    if (!cameraEnabled) {
        enableCamera();
    } else {
        disableCamera();
    }
});

function enableCamera() {
    var video = document.getElementById('video');
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(function(stream) {
                video.srcObject = stream;
                localStream = stream;
                video.style.display = 'block';
                document.getElementById('capture').style.display = 'inline';
                document.getElementById('toggleCamera').textContent = 'Disable Camera';
                cameraEnabled = true;
            })
            .catch(function(error) {
                console.log("Something went wrong when accessing the camera!");
            });
    }
}

function disableCamera() {
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
    }
    var video = document.getElementById('video');
    video.style.display = 'none';
    document.getElementById('capture').style.display = 'none';
    document.getElementById('toggleCamera').textContent = 'Enable Camera';
    cameraEnabled = false;
}

document.getElementById('capture').addEventListener('click', function() {
    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');
    var video = document.getElementById('video');
    context.drawImage(video, 0, 0, 640, 480);
    document.getElementById('savePhoto').style.display = 'inline';
});

document.getElementById('savePhoto').addEventListener('click', function() {
    var canvas = document.getElementById('canvas');
    var image = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    var lat = document.getElementById('latitude').value;
    var lng = document.getElementById('longitude').value;
    var description = "Photo taken at: " + lat + ", " + lng;

    var marker = L.marker([parseFloat(lat), parseFloat(lng)]).addTo(markerLayer);
    marker.bindPopup("<img src='" + image + "' style='width:200px;'>").openPopup();
    waypoints.push({ latitude: lat, longitude: lng, description: description, image: image });
    document.getElementById('savePhoto').style.display = 'none';
});

// Listen for device orientation events
window.addEventListener('deviceorientation', function(event) {
    var alpha = event.alpha;
    rotateCompass(alpha);
}, false);

function rotateCompass(heading) {
    var needle = document.getElementById('compassNeedle');
    // Rotate the compass needle
    needle.style.transform = 'rotate(' + (-heading) + 'deg)';
}

document.addEventListener('DOMContentLoaded', function() {
    // Initialize map
    var map = L.map('map').setView([51.505, -0.09], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Compass functionality
    const compassCircle = document.querySelector(".compass-circle");
    const startBtn = document.querySelector(".start-btn");

    // Check if DeviceOrientationEvent is available
    if (window.DeviceOrientationEvent) {
        // Request permission for iOS 13+ devices
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
            startBtn.onclick = function() {
                DeviceOrientationEvent.requestPermission()
                    .then(permissionState => {
                        if (permissionState === 'granted') {
                            window.addEventListener('deviceorientation', updateCompass);
                        } else {
                            alert("Permission to access orientation was denied.");
                        }
                    })
                    .catch(console.error);
                this.remove(); // Remove button after permission is requested
            };
        } else {
            // Non-iOS devices or iOS < 13
            window.addEventListener('deviceorientation', updateCompass);
            startBtn.remove(); // Remove button since it's not needed
        }
    } else {
        alert("Your device does not support orientation events.");
        startBtn.remove();
    }

    function updateCompass(event) {
        var alpha = event.alpha;
        var browserOrUserCompass = Math.abs(event.webkitCompassHeading || alpha); // iOS uses webkitCompassHeading
        var compassDirection = browserOrUserCompass ? 360 - browserOrUserCompass : 0; // Correct the direction
        compassCircle.style.transform = `rotate(${compassDirection}deg)`;
    }
});

