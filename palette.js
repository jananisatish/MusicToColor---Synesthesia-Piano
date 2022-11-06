// Adding the palettes to the dropdowns
var addingValuesToDropdown = function() {
  dropdown = []
  for (var i = 0; i < Object.keys(cloudgenColours).length; i++) {
    value = Object.keys(cloudgenColours)[i]
    dropdown.push("<option class='options'>"+value+"</option>")
  }
  document.getElementById("palettes").innerHTML = dropdown.join("<br>");
  document.getElementById("selectPalette").innerHTML = "";
  document.getElementById("selectPalette").innerHTML = dropdown.join("<br>")
} 
addingValuesToDropdown();

//Deserializing the current theme and adding it to selectedTheme
var selectedTheme = deserialize("selectedTheme");
if (selectedTheme == null || selectedTheme == "") {
  selectedTheme = Object.keys(cloudgenColours)[0];
  serialize(selectedTheme, "selectedTheme")
}

//Handler for when a key is right clicked
document.getElementById(i+1).addEventListener('contextmenu', function (event) {
  var array = document.getElementsByClassName("colourChange");
  for (var i = 0; i < array.length; i++) {
    array[i].style.display = "block";
  }
  var picker = document.getElementsByClassName("pcr-button")[0]
  picker.style.display = "block";
  document.getElementById("oldColourPreview").style.backgroundColor = cssColours[selectedTheme][event.target.id-1];
  pickr.on('save', (color, instance) => {
    picker.value = color.toRGBA().toString(0);
    cssColours[selectedTheme][event.target.id-1] = picker.value;
    var rgbValues = rgbValuesExtractor(picker.value);
    cloudgenColours[selectedTheme][event.target.id-1] = rgbValues;
    var dictOfRgb = {r:rgbValues[0],g:rgbValues[1],b:rgbValues[2]};
    cloudgenColoursDict[selectedTheme][event.target.id-1] = dictOfRgb;
    serialize(cloudgenColours, "cloudgenColours");
    serialize(cssColours, "cssColours");
    var array = document.getElementsByClassName("colourChange");
    for (var i = 0; i < array.length; i++) {
      array[i].style.display = "none";
    }
  });
});

//Cancel button for colour change menu
document.getElementById("cancelButton").addEventListener("mousedown", function(event) {
  var colourChangers = document.getElementsByClassName("colourChange");
  for (var i = 0; i < colourChangers.length; i++) {
    colourChangers[i].style.display = "none";
  }
});

//Cancel button for palette manager menu
document.getElementById("cancel").addEventListener("mousedown", function(event) {
  var paletteManagers = document.getElementsByClassName("paletteManager");
  for (var i = 0; i < paletteManagers.length; i++) {
    paletteManagers[i].style.display = "none";
  }
});

//Show palette manager button
document.getElementById("managePalettes").addEventListener("mousedown", function(event) {
  var array = document.getElementsByClassName("paletteManager");
  for (var i = 0; i < array.length; i++) {
    array[i].style.display = "block";
  }
})

//Checking to see if a new palette was selected in the dropdown
var checkDropdown = function() {
  if (document.getElementById("palettes").value != selectedTheme) {
      selectedTheme = document.getElementById("palettes").value;
      console.log(selectedTheme); 
  }
  window.setTimeout(function () {
        checkDropdown();
  }, 100)
}

window.setTimeout(function () {
  checkDropdown();
}, 100)

//Remove button on palette manager button
document.getElementById("removeButton").addEventListener("mousedown", function (event) {
  deletedValue = document.getElementById("selectPalette").value;
  delete cloudgenColours[deletedValue];
  delete cssColours[deletedValue];
  delete cloudgenColoursDict[deletedValue];
  serialize(cloudgenColours, "cloudgenColours");
  serialize(cssColours, "cssColours");
  addingValuesToDropdown();
})

//When the new palette textbox is used
document.getElementById("addButton").addEventListener("mousedown", function (event) {
  value = document.getElementById("newPalette").value;
  cloudgenColours[value] = [[0,0,0],[255,193,48],[180,36,7],[30,181,71],[5,176,16],[0,2,184],[250,163,2],[1,133,65],[20,252,101],[201,165,44],[180,180,180],[255,149,26],[0,0,0],[255,193,48],[180,36,7],[30,181,71],[5,176,16],[0,2,184],[250,163,2],[1,133,65],[20,252,101],[201,165,44],[180,180,180],[255,149,26]];
  cssColours[value] = ["rgb(0,0,0)","rgb(255,193,48)", "rgb(180,36,7)", "rgb(30,181,71)", "rgb(5,176,16)", "rgb(0,2,184)", "rgb(250,163,2)", "rgb(1,133,65)", "rgb(20,252,101)", "rgb(201,165,44)", "rgb(180,180,180)", "rgb(255,149,26)", "rgb(0,0,0)","rgb(255,193,48)", "rgb(180,36,7)", "rgb(30,181,71)", "rgb(5,176,16)", "rgb(0,2,184)", "rgb(250,163,2)", "rgb(1,133,65)", "rgb(20,252,101)", "rgb(201,165,44)", "rgb(180,180,180)", "rgb(255,149,26)"]
  cloudgenColoursDict = {};
  updateCloudgenColoursDict();
  serialize(cloudgenColours, "cloudgenColours");
  serialize(cssColours, "cssColours");
  serialize(selectedTheme, "selectedTheme");

  nextId = document.getElementById("selectPalette").length + 1
  dropdown.push("<option class='options' id="+nextId+">"+value+"</option>");
  // document.getElementById("palettes").innerHTML = dropdown.join("<br>");
  document.getElementById("selectPalette").innerHTML = dropdown.join("<br>");
  document.getElementById("newPalette").value = "";
});

//Making list version of cloudgenColours (when the others are dicts)
cloudgenColoursDict = {};
var updateCloudgenColoursDict = function() {
  for (var i = 0; i<Object.keys(cloudgenColours).length;i++) {
    var keyname = Object.keys(cloudgenColours)[i]
    cloudgenColoursDict[keyname] = []
    for (var j = 0;j<cloudgenColours[keyname].length;j++) {
      var dictToPush = {r:cloudgenColours[keyname][j][0],g:cloudgenColours[keyname][j][1],b:cloudgenColours[keyname][j][2]}
      cloudgenColoursDict[keyname].push(dictToPush)
    }
  }  
}