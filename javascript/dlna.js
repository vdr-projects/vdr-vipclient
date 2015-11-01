//
// Note to self : root directory : ./minidlnad -v -d -p 999 -f minidlna.conf 
//
var cdsService;
var operationManager;
var resultData;
var resultObjects;
var Dlna_serverId; // = new Array();

// Load DLNA plugin into browser
function initDLNAPlugin() {
  var dlnaPlugin = document.createElement("embed");
  dlnaPlugin.type = "application/x-motorola-toi-dlna";
  dlnaPlugin.setAttribute("hidden", "true");
  document.body.appendChild(dlnaPlugin);
}

// Get mediaserver
function find_dlna() {
	Dlna_serverId = toi.dlnaService.getMediaServers();
	alert(Dlna_serverId[0]);

}



// Create content directory service in order to communicate with the DMS
function setup(serverUuid) {
  cdsService =  toi.dlnaService.createContentDirectoryInstance(serverUuid);
  operationManager = cdsService.getCdsOperationManager();
  // Register callback function
  operationManager.addEventListener(operationManager.ON_OPERATION_RESULT, onOperationResult);
}

// Callback reciever for ON_OPERATION_RESULT events
function onOperationResult(event) {
  if (event.operation.state == toi.consts.ToiOperationManager.OPERATION_PENDING) {
    // Wait for all objects, but it is also possible to instead show incremental results
    return;
  }
  else if (event.operation.state == toi.consts.ToiOperationManager.OPERATION_FAILED) {
    alert("DLNA operation failed.");
    operationManager.releaseOperation(event.operation.id);
  }
  else if (event.operation.state == toi.consts.ToiOperationManager.OPERATION_COMPLETED &&
           event.operation.userData == "browse") {
    // This is the complete result of a browse operation, get the result objects
    resultObjects = new Array();
    var maxCount = 0;
    // Fetch all objects
    while (true) {
      resultData = cdsService.getOperationObjectResult(event.operation.id, maxCount);
      var objectCount = resultObjects.length;
      // Store fetched objects in local array
      for (var i = 0; i < resultData.objects.length; i++) {
        resultObjects[objectCount + i] =
        resultData.objects[i];
      }
      // Break loop if all objects are fetched
      if (!resultData.hasMore) {
	alert(i);
        break;
      }
    }
    operationManager.releaseOperation(event.operation.id);
  }
}

// Initiate a browse operation on a CDS container
function browse(containerId) {
  var operationId = operationManager.createOperation("browse");

  // Create property filter which will include title and resource URL
  var propertyFilter = new Array(cdsService.PROPERTY_TITLE, cdsService.PROPERTY_RES);

  // Create a sort criteria that will sort by title
  var sortCriteria = new Array();
  sortCriteria[0] = cdsService.PROPERTY_TITLE;

  // Browse the given container, start with first item and get all items
  cdsService.browse(operationId, containerId, propertyFilter, sortCriteria, 0, 0);

}

// Open an item from the resultObjects array assigned in onOperationResult()
function openItem(itemIndex) {
  // Get the requested item
  var item = resultObjects[itemIndex];
  var url_dlna = "";

  // Get the value for PROPERTY_RES
  for (var i = 0; i< item.properties.length; i++) {
alert(item.properties[i]);
alert(item.properties[i].id);
alert(item.properties[i].value);

    if (item.properties[i].id == cdsService.PROPERTY_RES) {
      url_dlna = item.properties[i].value;
    }
  }

  // Divide class string in order to find media type
  var classTypes=item.objectClass.split(".");

  // Check what type item is
  if (classTypes[2] == "audioItem") {
    // Play the item url
    try {
//      player.open(url_dlna);
//      player.play(1000);
    }
    catch(e) {
      alert("error: " + e);
    }
  }
  else if (classTypes[2] == "imageItem") {
    // Add code to load image in browser window
  } else {
    alert("Item cannot be opened");
  }
}
