
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

//initialize prefs object and grab settings
try {
	var prefobj = new ExtPrefs();
	prefobj.GetSettings();
} catch(e) {
   alert("err: "+e);
}