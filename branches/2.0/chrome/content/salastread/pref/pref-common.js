//iterate through the settings and apply them to the dialog
function initSettings(pagename) {
	parent.initPage(pagename);
	
	var pobj = Components.classes["@evercrest.com/salastread/persist-object;1"]
				.createInstance(Components.interfaces.nsISupports);
	if(!(pobj = pobj.wrappedJSObject))
		throw "Failed to create persistObject.";
	
	for(var prefName in parent.prefobj.Preferences) {
		var pref = parent.prefobj.Preferences[prefName];
		
		try {
			switch(pref.type) {
				case pobj.preferences.PREF_BOOL:
					setToggleField(prefName, document.getElementById('toggle_' + prefName), pref.value);
					break;
				
				case pobj.preferences.PREF_INT:
					setIntField(prefName, document.getElementById('int_' + prefName), pref.value);
					break;
				
				case pobj.preferences.PREF_STRING:
					//nasty hack for getting default values
					if(prefName.indexOf('default_') == 0) {
						var name = prefName.replace(/default/, 'defaultstring');
						setDefaultStringField(prefName, document.getElementById(name), pref.value);
					} else {	
						setStringField(prefName, document.getElementById('string_' + prefName), pref.value);
					}
					break;
				case this.preferences.PREF_INVALID:
				default:
					prefValue = null;
			}
		} catch (e) { 
			//no-op for now
		}
	}
}

//These next few functions set up fields with values
function setToggleField(field, el, value) {
	if (el.nodeName == "checkbox") {
		if (value) { el.setAttribute("checked", value);	} 
		else { el.removeAttribute("checked"); }

		el.addEventListener("CheckboxStateChange", function() { parent.prefobj.Preferences[field].value = el.getAttribute("checked") ? true : false; setNeeds(el); }, true);
	}
}

function setStringField(field, el, value) {
	if (el.nodeName == "textbox") {
		el.setAttribute("value", value);
		el.addEventListener("change", function() { parent.prefobj.Preferences[field].value = el.value; setNeeds(el); }, true);
	}
}

function setIntField(field, el, value) {
	if (el.nodeName == "textbox") {
		el.setAttribute("value", String(value));
		el.addEventListener("change", function() { try { var j = Number(el.value); parent.prefobj.Preferences[field].value = j; setNeeds(el); } catch (e) { } }, true);
	}
}

//set flags to needing to reboot or rebuild the menu
function setNeeds(el) {
	if(el.getAttribute("salastread_requiremenurebuild") == "yes" ) {
		parent.prefobj.NeedMenuRebuild = true;
	}
	if (el.getAttribute("salastread_requirefirefoxrestart") == "yes" ) {
		parent.prefobj.NeedFirefoxRestart = true;
	}
}

//handle strings with defaults
function setDefaultStringField(field , el, value) {
	if(el.nodeName == "button") {
		el.addEventListener("command", function() { loadDefaultString(field); }, true);
	}
}

function loadDefaultString(field) {
	var id = field.replace(/default/, 'string');
	var el = document.getElementById(id);
	
	if (el.nodeName == "textbox") {
		el.value = parent.prefobj.Preferences[field].value;
	}
	
	setNeeds(el);
}