
function ExtPrefs() {}

ExtPrefs.prototype = {
	NeedMenuRebuild: false,
	NeedFirefoxRestart: false,
	Preferences: {},
	
	GetSettings: function() {
		var pobj = Components.classes["@evercrest.com/salastread/persist-object;1"]
					.createInstance(Components.interfaces.nsISupports);
		if(!(pobj = pobj.wrappedJSObject))
			throw "Failed to create persistObject.";
		
		var preferences = pobj.preferences.getChildList("", {});
		for(var i in preferences) {
			var pref = preferences[i];
			this.Preferences[pref] = {};
			this.Preferences[pref].value = pobj.getPreference(pref);
			this.Preferences[pref].type  = pobj.preferences.getPrefType(pref);
		}
	},
	
	SetSettings: function() {
		var pobj = Components.classes["@evercrest.com/salastread/persist-object;1"]
					.createInstance(Components.interfaces.nsISupports);
		if(!(pobj = pobj.wrappedJSObject))		
			throw "Failed to create persistObject.";
		
		for(var pref in this.Preferences) {
			if(!pobj.setPreference(pref, this.Preferences[pref].value)) {
				Components.utils.reportError(pref + " :: " + this.Preferences[pref]);
			}
		}
	}
};

//set up header text for each options dialog section
function initPage(pageName) {
	var header = document.getElementById("header");
	header.setAttribute("title", pageName);
}

//change pages in the options dialog
function switchPage(aButtonID) {
	var button = document.getElementById(aButtonID);
	document.getElementById("panelFrame").setAttribute("src", button.getAttribute("url"));
}

//called when "OK" button is clicked on the options dialog
function saveChanges() {
	prefobj.SetSettings();
	if (prefobj.NeedMenuRebuild == true || prefobj.NeedFirefoxRestart == true) {
		alert("Some of the changes you made will require you to restart Firefox to take effect.");
	}
}

//tries to click a button if a command is passed from SA menu (WEIRD)
function onLoad() {
	var fp = window.arguments.length ? window.arguments[0] : false;
	
	if (typeof(fp) == "string" && fp.length > 0 && fp.substring(0, 3) == "cat" ) {
		document.getElementById(fp).focus();
		document.getElementById(fp).click();
	} else {
		document.getElementById("catGeneralButton").focus();
		document.getElementById("catGeneralButton").click();
	}
}

//initialize prefs object and grab settings
try {
	var prefobj = new ExtPrefs();
	prefobj.GetSettings();
} catch(e) {
   alert("err: "+e);
}