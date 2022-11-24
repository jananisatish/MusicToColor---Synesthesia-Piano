//Sound
var notes = [];
var recordedNotes = [];
var fodderList = [];
var recordStatus = false;
var previousTime = 0;
var fixedWindowWidth = window.innerWidth;

//Necessary functions
var serialize = function(thingToSerialize, keyName) {
  thingToSerialize = JSON.stringify(thingToSerialize)
  window.localStorage.setItem(keyName, thingToSerialize)
}

var urlparam = "";

//List of all the canvases
var canvases = [];

// Which index to find the current colour for the clouds at
var cloudColourIndex = 0;

//Lets animateClouds know if a new key was just pressed
var newlyPressed = false;

//Stuff for the wave
var canvas = document.createElement("canvas");
canvas.style.position = "absolute";
c = canvas.getContext("2d");
canvas.width = innerWidth;
canvas.height = innerHeight * 65 / 100;
canvas.style.top = "5%";

const wave = {
  y: canvas.height / 2,
  length: 0.01,
  amplitude: canvas.height * 65 / 200,
  frequency: 0.01
};

const strokeColor = {
  h: 200,
  s: 50,
  l: 50
};

const backgroundColor = {
  r: 0,
  g: 0,
  b: 0,
  a: 0.01
};

var deserialize = function(keyName) {
  var thingToDeserialize = window.localStorage.getItem(keyName)
  if (typeof thingToDeserialize === "undefined" || thingToDeserialize === null) {
    return null
  }
  else {
    thingToDeserialize = JSON.parse(thingToDeserialize)
  }
  return thingToDeserialize
}

// Defining containers (variables, arrays, dictionaries, etc.)
var cloudgenColours = deserialize("cloudgenColours");
if (cloudgenColours == null) {
  cloudgenColours = [[81, 201, 252], [255, 193, 48], [180, 36, 7], [30, 181, 71], [5, 176, 16], [0, 2, 184], [255, 149, 26], [1, 133, 65], [20, 252, 101], [201, 165, 44], [180, 180, 180], [250, 163, 2], [81, 201, 252], [255, 193, 48], [180, 36, 7], [30, 181, 71], [5, 176, 16], [0, 2, 184], [255, 149, 26], [1, 133, 65], [20, 252, 101], [201, 165, 44], [180, 180, 180], [250, 163, 2]];
}
var cssColours = deserialize("cssColours");
if (cssColours == null) {
  cssColours = ["rgb(81,201,252)", "rgb(255,193,48)", "rgb(180,36,7)", "rgb(30,181,71)", "rgb(5,176,16)", "rgb(0,2,184)", "rgb(255,149,26)", "rgb(1,133,65)", "rgb(20,252,101)", "rgb(201,165,44)", "rgb(180,180,180)", "rgb(250,163,2)", "rgb(81,201,252)", "rgb(255,193,48)", "rgb(180,36,7)", "rgb(30,181,71)", "rgb(5,176,16)", "rgb(0,2,184)", "rgb(255,149,26)", "rgb(1,133,65)", "rgb(20,252,101)", "rgb(201,165,44)", "rgb(180,180,180)", "rgb(250,163,2)"];
}

//Making list version of cloudgenColours
cloudgenColoursDicts = [];
var updateCloudgenColoursDicts = function() {
  for (var i = 0; i < cloudgenColours.length; i++) {
    cloudgenColoursDicts.push({ r: cloudgenColours[i][0], g: cloudgenColours[i][1], b: cloudgenColours[i][2] })
  }
}
updateCloudgenColoursDicts();

//Rendering preparation
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
var pickr = null;

window.onload = function() {
  //Pickr stuffs
  pickr = Pickr.create({
    el: "#newColourPreview",
    theme: 'nano', // or 'monolith', or 'nano'

    components: {
      // Main components
      preview: true,
      opacity: true,
      hue: true,

      // Input / output Options
      interaction: {
        hex: true,
        rgba: true,
        hsla: true,
        hsva: true,
        cmyk: true,
        input: true,
        clear: true,
        save: true
      }
    }
  });
  var picker = document.getElementsByClassName("pcr-button")[0]
  var div = document.getElementsByClassName("pickr")[0]
  div.style.position = "absolute";
  div.style.top = "50%";
  div.style.left = "60%";
  picker.style.display = "none";
  picker.style.zIndex = "12";
  picker.style.width = "100px";
  picker.style.height = "100px";

  //Media query
  function mediaQueries(x) {
    if (x.matches) { // If media query matches
      picker.style.width = "50px";
      picker.style.height = "50px";
    }
  }

  var x = window.matchMedia("(max-height: 451px)")
  mediaQueries(x) // Call listener function at run time
  x.addListener(mediaQueries) // Attach listener function on state changes

  //Local storage stuffs
  serialize(cloudgenColours, "cloudgenColours")
  serialize(cssColours, "cssColours")
}

var rgbValuesExtractor = function(string) {
  var values = [];
  var placeholder = "";
  var index = 0;
  for (var i = 5; i < string.length - 1; i++) {
    if (string[i] == ",") {
      values[index] = parseInt(placeholder);
      index++;
      placeholder = "";
    }
    else {
      placeholder = placeholder.concat(string[i]);
    }
  }
  return values;
}

var newCanvas = function(opacity) {
  var newCanvas = document.createElement("canvas");
  newCanvas.width = window.innerHeight * 5 / 6;
  newCanvas.height = window.innerHeight * 4 / 5;
  newCanvas.style.position = "absolute";
  newCanvas.style.opacity = opacity;
  document.getElementById("canvases").appendChild(newCanvas);
  canvases.push(newCanvas)
  var newContext = newCanvas.getContext("2d")
  return [newCanvas, newContext]
}

var createCloud = function(x, opacity) {
  var list = newCanvas(opacity);
  list[0].style.left = x + "px";
  $cloudgen.drawCloud(list[1], list[0].width / 2, list[0].height / 2, list[0].height / 3, cloudgenColoursDicts[cloudColourIndex], 1);
}

var identifyPosition = function(object, property) {
  var cssObj = window.getComputedStyle(object, null);
  var leftValue = cssObj.getPropertyValue(property);
  var noPx = leftValue.substring(0, leftValue.length - 2);
  return parseInt(noPx);
}

var animateClouds = function() {
  for (var i = 0; i < canvases.length; i++) {
    var newX = identifyPosition(canvases[i], "left") + 4;
    if (newX > fixedWindowWidth - 180) {
      var cssObj = window.getComputedStyle(canvases[i], null);
      var opacity = cssObj.getPropertyValue("opacity");
      document.getElementById("canvases").removeChild(canvases[i]);
      canvases.splice(i, 1);
      i = i - 1;
      createCloud(0, opacity);
    }
    else if (newlyPressed == true) {
      var canvasesInfo = [];
      while (canvases.length > 0) {
        var position = identifyPosition(canvases[0], "left");
        var cssObj = window.getComputedStyle(canvases[0], null);
        var opacity = cssObj.getPropertyValue("opacity");
        canvasesInfo.push([position, opacity]);
        document.getElementById("canvases").removeChild(canvases[0]);
        canvases.splice(0, 1);
      }
      for (var j = 0; j < canvasesInfo.length; j++) {
        createCloud(canvasesInfo[j][0], canvasesInfo[j][1]);
      }
      newlyPressed = false;
    }
    else {
      canvases[i].style.left = String(newX) + "px";
    }
  }
}

//reactions when the keys get pressed
for (var i = 0; i < 24; i++) {
  var halfOfId = i + 1
  var stringVersion = halfOfId.toString();
  var id = stringVersion + ".mp3"
  var note = new Tone.Player(id).toDestination()
  console.log(id)
  notes.push(note)
  document.getElementById(i + 1).addEventListener("mousedown", function(event) {
    if (event.button == 0) {
      Tone.loaded().then(() => {
        notes[event.target.id - 1].start();
        notes[event.target.id - 1].toDestination();
        cloudColourIndex = event.target.id - 1;
        newlyPressed = true;
      });
      if (recordStatus == true) {
        var newDate = new Date();
        console.log(recordedNotes);
        var time = ((newDate.getMinutes() * 60000) + (newDate.getSeconds() * 1000) + (newDate.getMilliseconds())) - previousTime;
        console.log(time);
        fodderList.push([event.target.id, time]);
        previousTime = previousTime + time;
      }
    }
  })
}

function parsePosition(position) {
  var index = Math.floor(position / 8);
  var bit = 1 << (position % 8);
  return { index, bit };
}

function serializeBits(binaryNotes, position, number, numBits) {
  for (var mask = (1 << (numBits - 1)); mask > 0; mask = mask >> 1) {
    setBit(binaryNotes, position, (number & mask));
    position++;
  }
}

function deserializeBits(binaryNotes, position, numBits) {
  var number = 0;
  for (var mask = (1 << (numBits - 1)); mask > 0; mask = mask >> 1) {
    if (getBit(binaryNotes, position)) {
      number += mask;
    }
    position++;
  }
  return number;
}

function createUrlToShare() {
  var binaryNotes = new Uint8Array(recordedNotes[1].length * 2);
  var bitIndex = 0;
  for (var i = 0; i < recordedNotes[1].length; i++) {
    var newId = parseInt(recordedNotes[1][i][0]);
    serializeBits(binaryNotes, bitIndex, newId, 5);
    bitIndex += 5;

    var newTime = Math.min(Math.floor(recordedNotes[1][i][1] / 10), 1000);
    serializeBits(binaryNotes, bitIndex, newTime, 11);
    bitIndex += 11;
  }
  console.log(binaryNotes);
  var binStr = "";
  for (var i = 0; i < binaryNotes.byteLength; i++) {
    binStr += String.fromCharCode(binaryNotes[i]);
  }
  return "https://musictocolor.com?t=" + recordedNotes[0] + "&v=" + window.btoa(binStr);
}

function parseSharedUrl(url) {
  console.log(recordedNotes[0], recordedNotes[1]);

  var typeIndex = url.indexOf("?t=");
  var valIndex = url.indexOf("&v=");
  if (typeIndex == -1 || valIndex == -1) {
    return false;
  }
  recordedNotes[0] = url.substr(typeIndex + 3, valIndex - typeIndex - 3);
  var base64Str = url.substr(valIndex + 3);

  var binStr = window.atob(base64Str);
  var binaryNotes = new Uint8Array(binStr.length);
  for (var i = 0; i < binStr.length; i++) {
    binaryNotes[i] = binStr[i].charCodeAt(0);
  }
  console.log(binaryNotes);

  var keysAndTimes = [];
  var bitIndex = 0;
  for (var i = 0; i < binaryNotes.byteLength / 2; i++) {
    var id = deserializeBits(binaryNotes, bitIndex, 5);
    bitIndex += 5;
    var time = deserializeBits(binaryNotes, bitIndex, 11);
    bitIndex += 11;
    keysAndTimes.push(['' + id, time * 10])
  }
  recordedNotes[1] = keysAndTimes;
  console.log(recordedNotes[0], recordedNotes[1]);
  return true;
}

function setBit(bits, position, on) {
  const { index, bit } = parsePosition(position);
  if (on) {
    bits[index] |= bit;
  } else {
    bits[index] &= 0xFF ^ bit;
  }
}

function getBit(bits, position) {
  const { index, bit } = parsePosition(position);
  return !!(bits[index] & bit);
}

var redrawClouds = function() {
  for (var i = 0; i < canvases.length; i++) {
    if (parseFloat(canvases[i].style.opacity) <= 0) {
      document.getElementById("canvases").removeChild(canvases[i]);
      canvases.splice(i, 1);
      i = i - 1;
    }
    else {
      var alpha = parseFloat(canvases[i].style.opacity) - 0.02;
      canvases[i].style.opacity = alpha;
    }
  }
}

var checkAndChangeWidth = function() {
  if (window.innerWidth < window.innerHeight) {
    var array = document.getElementsByClassName("turnToLandscape");
    for (var i = 0; i < array.length; i++) {
      array[i].style.display = "block";
    }
  }
  else {
    var array = document.getElementsByClassName("turnToLandscape");
    for (var i = 0; i < array.length; i++) {
      array[i].style.display = "none";
    }
  }
}

var RGBToHSL = function(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  var l = Math.max(r, g, b);
  var s = l - Math.min(r, g, b);
  var h = s
    ? l === r
      ? (g - b) / s
      : l === g
        ? 2 + (b - r) / s
        : 4 + (r - g) / s
    : 0;
  return [
    60 * h < 0 ? 60 * h + 360 : 60 * h,
    100 * (s ? (l <= 0.5 ? s / (2 * l - s) : s / (2 - (2 * l - s))) : 0),
    (100 * (2 * l - s)) / 2,
  ];
};

var increment = wave.frequency;
function animate() {
  requestAnimationFrame(animate);
  c.fillStyle = `rgba(${backgroundColor.r}, ${backgroundColor.g}, ${backgroundColor.b}, ${backgroundColor.a})`;
  c.fillRect(0, 0, canvas.width, canvas.height);

  c.beginPath();
  c.moveTo(0, canvas.height / 2);

  for (var i = 0; i < canvas.width; i++) {
    c.lineTo(
      i,
      wave.y + Math.sin(i * wave.length + increment) * wave.amplitude
    );
  }
  var hslValues = RGBToHSL(cloudgenColours[cloudColourIndex][0], cloudgenColours[cloudColourIndex][1], cloudgenColours[cloudColourIndex][2]);
  c.strokeStyle = `hsl(${hslValues[0]}, ${hslValues[1]}%, ${hslValues[2]}%)`;
  c.stroke();
  increment += wave.frequency;
}

document.getElementById("blobButton").addEventListener("mousedown", function() {
  if (document.getElementById("popupWindow5").style.display == "block") {
    document.getElementById("popupWindow5").style.display = "none";
    document.getElementById("blobText").style.display = "none";
  }
  else {
    document.getElementById("popupWindow5").style.display = "block";
    document.getElementById("blobText").style.display = "block";
  }
});

var visualChanged = function() {
  document.getElementById("blobButton").style.display = "none";
  document.getElementById("canvases").innerHTML = "";
  canvases = [];
  if (document.getElementById("visual").value == "Waves") {
    var array = document.getElementsByClassName("blobStuff");
    for (var i = 0; i < array.length; i++) {
      array[i].style.display = "none";
    }
    document.getElementById("canvases").appendChild(canvas);
    document.body.style.backgroundColor = "";
    animate()
  }
  else if (document.getElementById("visual").value == "Clouds") {
    var array = document.getElementsByClassName("blobStuff");
    for (var i = 0; i < array.length; i++) {
      array[i].style.display = "none";
    }
    createCloud(0, "0.7");
    createCloud(window.innerWidth * 5 / 24, "0.2");
    createCloud(window.innerWidth * 5 / 12, "0.7");
    createCloud(window.innerWidth * 5 / 8, "0.2");
    document.body.style.backgroundColor = "black";
  }
  else if (document.getElementById("visual").value == "Blobs") {
    document.getElementById("blobButton").style.display = "block";
    var array = document.getElementsByClassName("blobStuff");
    for (var i = 0; i < array.length; i++) {
      array[i].style.display = "block";
    }
  }
}

document.getElementById("copyLink").addEventListener("mousedown", function() {
  navigator.clipboard.writeText(urlparam);
})

document.getElementById("closeSaveLink").addEventListener("mousedown", function() {
  var array = document.getElementsByClassName("saveLink");
  for (var i = 0; i < array.length; i++) {
    array[i].style.display = "none";
  }
})

var playNote = function(i) {
  var index = parseInt(recordedNotes[1][i][0]) - 1;
  console.log(notes[index], index);
  notes[index].start();
  notes[index].toDestination();
  cloudColourIndex = index;
  newlyPressed = true;
  i++;
  if (i < recordedNotes[1].length) {
    window.setTimeout(function() { playNote(i); }, recordedNotes[1][i][1]);
  }
  else {
    document.getElementById("playButton").style.boxShadow = "";
  }
}

var playback = function() {
  var i = 0;
  // Sometimes people take a few seconds before the first key press.
  // Ignore that and play the first key quickly for good experience.
  recordedNotes[1][0][1] = 500; // milliseconds.
  Tone.loaded().then(() => {
    window.setTimeout(function() {
      playNote(i);
    }, recordedNotes[1][0][1]);
  });
}

var checkBlobs = function() {
  window.setInterval(function() {
    if (newlyPressed == true) {
      var array = document.getElementsByClassName("blob");
      for (var i = 0; i < array.length; i++) {
        array[i].style.backgroundColor = cssColours[cloudColourIndex];
      }
      newlyPressed == false;
    }
  }, 100)
}

window.addEventListener("load", function() {
  if (parseSharedUrl(window.location.href)) {
    console.log("trueeeee");
    document.getElementsByClassName("playOnLoad")[0].style.display = "block";
    document.getElementById("playOnLoadButton").addEventListener("click", function() {
      document.getElementsByClassName("playOnLoad")[0].style.display = "none";
      playback();
    });
  }
  visualChanged();
  window.setInterval(function() {
    checkAndChangeWidth();
    if (document.getElementById("visual").value == "Clouds") {
      animateClouds();
    }
    else if (document.getElementById("visual").value == "Blobs") {
      checkBlobs();
    }
  }, 100);
  document.getElementById("recordButton").addEventListener("mousedown", function() {
    if (recordStatus == false) {
      recordStatus = true;
      var newDate = new Date();
      previousTime = (newDate.getMinutes() * 60000) + (newDate.getSeconds() * 1000) + (newDate.getMilliseconds());
      console.log(previousTime);
      document.getElementById("recordingOn").style.display = "inline";
      document.getElementById("recordButton").style.boxShadow = "0px 0px 15px 10px #ff0000";
      document.getElementById("playButton").style.opacity = "25%";
    }
    else if (recordStatus == true) {
      recordStatus = false;
      document.getElementById("recordingOn").style.display = "none";
      document.getElementById("recordButton").style.boxShadow = "";
      document.getElementById("playButton").style.opacity = "";
      if (fodderList.length > 0) {
        recordedNotes = [document.getElementById("visual").value, fodderList];
        console.log(recordedNotes);
        fodderList = [];
        urlparam = createUrlToShare();
        var array = document.getElementsByClassName("saveLink");
        for (var i = 0; i < array.length; i++) {
          array[i].style.display = "block";
        }
        document.getElementById("link").value = urlparam;
      }
    }
  });
  document.getElementById("playButton").addEventListener("mousedown", function() {
    if (recordedNotes.length > 0) {
      document.getElementById("playButton").style.boxShadow = "0px 0px 15px 10px #ff0000";
      playback();
    } else {
      window.alert("Record a tune first, then click Play.");
    }
  })
});