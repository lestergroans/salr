function generalInit() {
   initSettings('General Settings');
   cbSet();
}

function cbSet() {
	try {
		if ( !document.getElementById("toggle_showGoToLastIcon").getAttribute("checked") ) {
			document.getElementById("string_goToLastReadPost").setAttribute("disabled",true);
			document.getElementById("defaultstring_goToLastReadPost").setAttribute("disabled",true);
			document.getElementById("toggle_alwaysShowGoToLastIcon").setAttribute("disabled",true);
		} else {
			document.getElementById("string_goToLastReadPost").removeAttribute("disabled");
			document.getElementById("defaultstring_goToLastReadPost").removeAttribute("disabled");
			document.getElementById("toggle_alwaysShowGoToLastIcon").removeAttribute("disabled");
		}
		
		if ( !document.getElementById("toggle_showUnvisitIcon").getAttribute("checked") ) {
			document.getElementById("string_markThreadUnvisited").setAttribute("disabled",true);
			document.getElementById("defaultstring_markThreadUnvisited").setAttribute("disabled",true);
		} else {
			document.getElementById("string_markThreadUnvisited").removeAttribute("disabled");
			document.getElementById("defaultstring_markThreadUnvisited").removeAttribute("disabled");
		}
	} catch(e) {
		alert("err: "+e);
	}
}

function __dead_code() {
	var qqt = document.getElementById("qqtoggles");
	if ( !document.getElementById("toggle_useQuickQuote").getAttribute("checked") ) {
		var child = qqt.firstChild;
		while (child) {
			child.setAttribute("disabled",true);
			child = child.nextSibling;
		}
	} else {
		var child = qqt.firstChild;
		while (child) {
			child.removeAttribute("disabled");
			child = child.nextSibling;
		}
	}
}