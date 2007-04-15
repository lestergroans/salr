// <script>
var persistObject = Components.classes["@evercrest.com/salastread/persist-object;1"]
	.createInstance(Components.interfaces.nsISupports);
persistObject = persistObject.wrappedJSObject;

var featurePages = new Array(
  { v: 0,    s: "welcomeToSALR/welcomeToSALR.html" },
  { v: 1680, s: "newFeatureWindow/newFeatureWindow.html" },
  { v: 1680, s: "pageNavigator/pageNavigator.html" },
  { v: 1680, s: "imageThumbnails/imageThumbnails.html" }
);

var currentPage = 0;
var showingChangelog = false;

function windowLoad()
{
	var currentVersion = window.arguments[0]["currentVersion"];
	var currentBuild = parseInt(currentVersion.match(/^(\d+)\.(\d+)\.(\d+)$/)[3]);
	var oldVersion = window.arguments[0]["upgradeFromVersion"];
	if (oldVersion == 0)
	{
		// This is their first time running it
		return;
	}
	var oldBuild = parseInt(oldVersion.match(/^(\d+)\.(\d+)\.(\d+)$/)[3]);;
	for (var i=0; i<featurePages.length; i++) {
		if (featurePages[i].v > oldBuild) {
			currentPage = i;
			changeFeature(0);
			return;
		}
	}
	checkForSQLPatches(oldBuild);
	toggleMode();
}

function toggleMode() {
	var btnToggle = document.getElementById("btnToggle");
	var btnPrev = document.getElementById("btnPrev");
	var btnNext = document.getElementById("btnNext");
	showingChangelog = !showingChangelog;
	if (showingChangelog) {
		btnToggle.setAttribute("label", "Show Features");
		btnPrev.style.visibility = "hidden";
		btnNext.style.visibility = "hidden";
		document.getElementById("featureFrame").setAttribute("src",
			"chrome://salastread/content/changelog.html");
	} else {
		btnToggle.setAttribute("label", "Show Changelog");
		btnPrev.style.visibility = "visible";
		btnNext.style.visibility = "visible";
		changeFeature(0);
	}
}

function changeFeature(p) {
   var featureFrame = document.getElementById("featureFrame");
   var btnPrev = document.getElementById("btnPrev");
   var btnNext = document.getElementById("btnNext");

   currentPage += p;
   if (currentPage < 0)
      currentPage = 0;
   if (currentPage >= featurePages.length)
      currentPage = featurePages.length-1;
   var newurl = "chrome://salastread/content/newfeatures/" +
         featurePages[currentPage].s;
   document.getElementById("featureFrame").setAttribute("src",newurl);
   if (currentPage==0)
      btnPrev.setAttribute("disabled", true);
   else
      btnPrev.removeAttribute("disabled");
   if (currentPage==featurePages.length-1)
      btnNext.setAttribute("disabled", true);
   else
      btnNext.removeAttribute("disabled");
}

function checkForSQLPatches(build)
{
	if (build < 70414)
	{
		// Userdata schema changed, let's test to make sure it needs to be changed, just incase
		var statement = persistObject.database.createStatement("SELECT * FROM `userdata` WHERE 1=1");
		statement.executeStep();
		if (statement.getColumnName(4) != 'color')
		{
			statement.reset();
			persistObject.database.executeSimpleSQL("ALTER TABLE `userdata` ADD `color` VARCHAR(8)");
			persistObject.database.executeSimpleSQL("ALTER TABLE `userdata` ADD `background` VARCHAR(8)");
		}
	}
}