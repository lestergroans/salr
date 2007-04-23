// <script> This line added because my IDE has problems detecting JS ~ 0330 ~ duz

var needToShowChangeLog = false;

var THREAD_ICON_COUNT = 2;

//var expireMinAge = 7;  // how many days old must a thread entry be before it's deleted?

// WARNING WARNING WARNING WARNING
// Changing the following value, or any of the code that enforces the delay,
// you may get banned from the forums. This delay is here at radium's command!
var minMyThreadRefreshInterval = 60;

var initialDocShellPrepared = false;
var thisWindowPageTimers = new Array();

//////////////////////////////////////////////

var persistObject = null;

function GetCurrentLPDateTime() {
   var now = new Date();
   var day = "00" + now.getDate();
   var month = "00" + (now.getMonth()+1);
   var year = "00" + (now.getYear()+1900);
   var hour = "00" + now.getHours();
   var minute = "00" + now.getMinutes();
   day = day.substring(day.length-2,day.length);
   month = month.substring(month.length-2,month.length);
   year = year.substring(year.length-4,year.length);
   hour = hour.substring(hour.length-2,hour.length);
   minute = minute.substring(minute.length-2,minute.length);
   return year + month + day + hour + minute;
}

function ConvertLPDateTimeToNum(lpdate, lptime) {
   // Jun 05, 2006    14:46
   // 012345678901    01234
   var monthstr = lpdate.substring(0,3);  // "Jun"
   var day = lpdate.substring(4,6);       // "05"
   var year = lpdate.substring(8,12);     // "2006"
   var hour = lptime.substring(0,2);      // "14"
   var minute = lptime.substring(3,6);    // "46"
   var month = "00";
   if (monthstr == "Jan") month = "01";
   if (monthstr == "Feb") month = "02";
   if (monthstr == "Mar") month = "03";
   if (monthstr == "Apr") month = "04";
   if (monthstr == "May") month = "05";
   if (monthstr == "Jun") month = "06";
   if (monthstr == "Jul") month = "07";
   if (monthstr == "Aug") month = "08";
   if (monthstr == "Sep") month = "09";
   if (monthstr == "Oct") month = "10";
   if (monthstr == "Nov") month = "11";
   if (monthstr == "Dec") month = "12";
   return year + month + day + hour + minute;
}

function SALR_GetCurrentDT() {
   return GetCurrentLPDateTime();
}

function SALRHexToNumber(hex) {
   var res = 0;
   for (var i=0; i<hex.length; i++) {
      res = res * 16;
      switch (hex[i]) {
         case "0": res += 0; break;
         case "1": res += 1; break;
         case "2": res += 2; break;
         case "3": res += 3; break;
         case "4": res += 4; break;
         case "5": res += 5; break;
         case "6": res += 6; break;
         case "7": res += 7; break;
         case "8": res += 8; break;
         case "9": res += 9; break;
         case "a": case "A": res += 10; break;
         case "b": case "B": res += 11; break;
         case "c": case "C": res += 12; break;
         case "d": case "D": res += 13; break;
         case "e": case "E": res += 14; break;
         case "f": case "F": res += 15; break;
      }
   }
   return res;
}

function SALR_MakeShowThreadCSS() {
   var csstxt = "";
   csstxt += "table.salastread_seenpost.salastread_odd tr { background-color: "+persistObject.getPreference('seenPostDark')+" !important; }\n\n";
   csstxt += "table.salastread_seenpost.salastread_even tr { background-color: "+persistObject.getPreference('seenPostLight')+" !important; }\n\n";
   //csstxt += "table.salastread_unseenpost.salastread_odd tr { background-color: "+persistObject.getPreference('unseenPostDark')+" !important; }\n\n";
   //csstxt += "table.salastread_unseenpost.salastread_even tr { background-color: "+persistObject.getPreference('unseenPostLight')+" !important; }\n\n";
   if ( persistObject.getPreference('hideTitle') ) {
      csstxt += "dd.title * { display: none; }\n\n";
   } else if ( persistObject.getPreference('resizeCustomTitleText') ) {
      csstxt += "dd.title * { font-size: 8pt; }\n\n";
   }

   if ( persistObject.getPreference('hideSignature'))
   {
	   //So yeah firefox comes up with a pretty unique way of
	   //interpretting SA's invalid HTML......
      csstxt += ".signature + p + div { display: none; }\n\n"
   }

   // HEREHERE
   return csstxt;
}

function SALR_MakeForumDisplayCSS() {
   var sub = function(cls, isdark, basecolor, highlightcolor) {
      var res = "";
      if (isdark) {
         res += "tr."+cls+" td.icon,";
         res += "tr."+cls+" td.author,";
         res += "tr."+cls+" td.views,";
         res += "tr."+cls+" td.lastpost";
      } else {
         res += "tr."+cls+" td.title,";
         res += "tr."+cls+" td.replies,";
         res += "tr."+cls+" td.rating";
      }
      res += " { background-repeat: repeat-x !important; background-color: "+basecolor + " !important";
      if (highlightcolor && !persistObject.getPreference('disableGradients')) {
         res += "; background-image: url(x-salr-gradientpng:" +
                    SALRHexToNumber(highlightcolor.substring(1,3)) + "," +
                    SALRHexToNumber(highlightcolor.substring(3,5)) + "," +
                    SALRHexToNumber(highlightcolor.substring(5,7)) + "," +
                    "33) !important";
      }
      res += "; }\n\n";

      res += "tr.salastread_postedinthread td.replies { background-repeat: repeat-x !important; background-color: "+
                    persistObject.getPreference('postedInThreadRe') + " !important";
      if (persistObject.getPreference('postedInThreadReHighlight') && !persistObject.getPreference('disableGradients')) {
         var highlightcolor = persistObject.getPreference('postedInThreadReHighlight');
         res += "; background-image: url(x-salr-gradientpng:" +
                    SALRHexToNumber(highlightcolor.substring(1,3)) + "," +
                    SALRHexToNumber(highlightcolor.substring(3,5)) + "," +
                    SALRHexToNumber(highlightcolor.substring(5,7)) + "," +
                    "33) !important";
      }
      res += "; }\n\n";

      return res;
   };

   var csstext = "";
   csstext += sub("salastread_readthread", true, persistObject.getPreference('readDark'), persistObject.getPreference('readDarkHighlight'));
   csstext += sub("salastread_readthread", false, persistObject.getPreference('readLight'), persistObject.getPreference('readLightHighlight'));
   csstext += sub("salastread_readwithnewthread", true, persistObject.getPreference('readWithNewDark'), persistObject.getPreference('readWithNewDarkHighlight'));
   csstext += sub("salastread_readwithnewthread", false, persistObject.getPreference('readWithNewLight'), persistObject.getPreference('readWithNewLightHighlight'));
   //csstext += sub("salastread_unreadthread", true, persistObject.getPreference('unreadDark'), persistObject.getPreference('unreadDarkHighlight'));
   //csstext += sub("salastread_unreadthread", false, persistObject.getPreference('unreadLight'), persistObject.getPreference('unreadLightHighlight'));
   csstext += "td.replies { white-space: nowrap; }\n\n";
   csstext += ".salastread_newreplycount { font-weight: normal !important; }\n\n";

   return csstext;
}

function changeBGColorsFromTo(doc, context, xpathbase, bgfrom, bgto, bgtohighlight) {
   var xarray = persistObject.selectNodes(doc, context, xpathbase+"[@bgcolor='"+bgfrom+"']");
   for (var x=0; x<xarray.length; x++) {
      xarray[x].style.backgroundColor = bgto;
      if ( bgtohighlight && !persistObject.getPreference('disableGradients') ) {
         xarray[x].style.backgroundRepeat = "repeat-x";
         xarray[x].style.backgroundImage = "url(x-salr-gradientpng:"+
              SALRHexToNumber( bgtohighlight.substring(1,3) ) + "," +
              SALRHexToNumber( bgtohighlight.substring(3,5) ) + "," +
              SALRHexToNumber( bgtohighlight.substring(5,7) ) + "," +
               "33)";
      }
   }
   return xarray;
}

function SAmenuitemCommand2(event,el,etype) {
   var target = "none";
   if ( etype=="command" ) {
      target = "current";
   }
   if ( etype=="click" ) {
      if ( event.button == 2 || event.button == 1 ) {
         target = "newtab";
      }
   }

   if (target != "none") {
      SAmenuitemGoto(event,"http://forums.somethingawful.com/forumdisplay.php?s=&forumid="+el.getAttribute("forumnum"),target);
   }
}

function SAmenuitemCommandGoToLastPost(event, el, etype, threadid) {
	try {
		var postid = persistObject.getLastPostID(threadid);

		if(postid != 0) {
			SAmenuitemCommandURL2(event, "http://forums.somethingawful.com/showthread.php?s=&postid=" + postid + "#post" + postid, etype);
		} else {
			SAmenuitemCommandURL2(event, "http://forums.somethingawful.com/showthread.php?s=&threadid=" + threadid, etype);
		}
	} catch(e) {
		Components.utils.reportError("Couldn't find thread id: " + threadid);
	}
}

function SAmenuitemCommandURL2(event,el,etype) {
   var target = "none";
   if ( etype=="command" ) {
      target = "current";
   }
   if ( etype=="click" ) {
      if ( event.button == 2 || event.button == 1 ) {
         target = "newtab";
      }
   }

   var targeturl = "";
   if ( typeof(el) == "string" ) {
      targeturl = el;
   } else {
      targeturl = el.getAttribute("targeturl");
   }

   if (target != "none") {
      SAmenuitemGoto(event,targeturl,target);
   }
}

function SAmenuitemGoto(event,url,target) {
   if (target=="newtab") {
      getBrowser().addTab(url);
   }
   else if (target=="current") {
      loadURI(url);
   }
}

function grabForumList(doc, selectnode) {
   var optionlist = persistObject.selectNodes(doc, selectnode, "OPTION");
   var oDomParser = new DOMParser();
   var forumsDoc = oDomParser.parseFromString("<?xml version=\"1.0\"?>\n<forumlist></forumlist>", "text/xml");
   var targetEl = forumsDoc.documentElement;
   var oldForumXml = persistObject.forumListXml;
   for (var i=0; i<optionlist.length; i++) {
      var thisopt = optionlist[i];
      var thisopttext = thisopt.firstChild.nodeValue;
      if ( thisopttext.substring(0,2)=="--" && thisopt.getAttribute("value")!="-1" ) {
         var fel = forumsDoc.createElement("forum");
         var myid = thisopt.getAttribute("value");
         fel.setAttribute("id", myid);

         // Carry over sticky attributes
         if ( oldForumXml ) {
            var oldEl = persistObject.selectSingleNode(oldForumXml, oldForumXml, "//forum[@id='"+myid+"']");
            if (oldEl) {
               if ( oldEl.hasAttribute("mods") ) {
                  fel.setAttribute("mods", oldEl.getAttribute("mods"));
               }
               if ( oldEl.hasAttribute("modnames") ) {
                  fel.setAttribute("modnames", oldEl.getAttribute("modnames"));
               }
            }
         }

         var catname = "sub";
         var xtext = thisopttext.substring(2);
         while ( xtext.substring(0,2)=="--" ) {
             catname += "-sub";
             xtext = xtext.substring(2);
         }
         xtext = xtext.substring(1);
         fel.setAttribute("name", xtext);
         fel.setAttribute("cat", catname);

         targetEl.appendChild(fel);
         targetEl.insertBefore(forumsDoc.createTextNode("\n"), fel);
      } else if (thisopt.getAttribute("value")!="-1" ) {
         var fel;
         if ( thisopt.getAttribute("value").match(/\D/) ) {
            fel = forumsDoc.createElement("util");
         } else {
            fel = forumsDoc.createElement("cat");
            targetEl = fel;
         }
         if(thisopttext.substring(0,1)  == " ") {
            fel.setAttribute("name", thisopttext.substring(1));
         } else {
            fel.setAttribute("name", thisopttext);
         }
         fel.setAttribute("id", thisopt.getAttribute("value"));
         forumsDoc.documentElement.appendChild(fel);
         forumsDoc.documentElement.insertBefore(forumsDoc.createTextNode("\n"), fel);
      }
   }
   persistObject.forumListXml = forumsDoc;
   if ( persistObject.getPreference('showSAForumMenu') ) {
      buildSAForumMenu();
   }
}

function populateForumMenuFrom(nested_menus, target, src, pinnedForumNumbers, pinnedForumElements) {
	var wasutil = 0;
	for(var i = 0; i < src.childNodes.length; i++) {
		var thisforum = src.childNodes[i];

		if (thisforum.nodeName=="util") {
			wasutil = 1;
		}

		else if (wasutil && thisforum.nodeType == 1) {
			if(nested_menus) {
				target.appendChild(document.createElement("menuseparator"));
			}
			wasutil = 0;
		}

		if(thisforum.nodeName == "cat") {
			if(!nested_menus) {
				target.appendChild(document.createElement("menuseparator"));
				populateForumMenuFrom(nested_menus,target,thisforum,pinnedForumNumbers,pinnedForumElements);
			} else {
				var submenu = document.createElement("menu");
					submenu.setAttribute("label", thisforum.getAttribute("name"));

				var submenupopup = document.createElement("menupopup");
				if(persistObject.getPreference('useSAForumMenuBackground')) {
					submenupopup.setAttribute("class", "lastread_menu");
				}

				submenu.appendChild(submenupopup);
				populateForumMenuFrom(nested_menus,submenupopup,thisforum,pinnedForumNumbers,pinnedForumElements);
				target.appendChild(submenu);
			}
		} else if(thisforum.nodeName == "forum" || thisforum.nodeName == "util") {
			var menuel = document.createElement("menuitem");
				menuel.setAttribute("label", thisforum.getAttribute("name"));
				menuel.setAttribute("forumnum", thisforum.getAttribute("id"));
				menuel.setAttribute("onclick", "SAmenuitemCommand2(event,this,'click');");
				menuel.setAttribute("oncommand", "SAmenuitemCommand2(event,this,'command');");

			if(thisforum.getAttribute("cat") && thisforum.getAttribute("cat").substring(0, 3) == "sub") {
				menuel.setAttribute("class", "lastread_menu_" + thisforum.getAttribute("cat"));
			}

			//TODO: access keys
			target.appendChild(menuel);
			if(nested_menus) {
				var thisforumnum = thisforum.getAttribute("id");
				for (var j = 0; j < pinnedForumNumbers.length; j++) {
					if (pinnedForumNumbers[j] == thisforumnum) {
						pinnedForumElements[j] = thisforum;
					}
				}
			}
		}
	}
}

var SALR_DEBUG_pendingUpload = null;
var SALR_DEBUG_pendingDownload = null;

function buildSAForumMenu() {
	try {
		if ( persistObject.getPreference('hideOtherSAMenus') ) {
			var mmb = document.getElementById("main-menubar");
			for (var x=0; x<mmb.childNodes.length; x++) {
				var thischild = mmb.childNodes[x];
				if (thischild.nodeName=="menu") {
					if ( (thischild.getAttribute("label")=="SA" || thischild.label=="SA" || thischild.id=="menu-sa") &&
					thischild.id!="menu_SAforums") {
						mmb.removeChild(thischild);
						x--;
					}
				}
			}
		}
		var menupopup = document.getElementById("menupopup_SAforums");
		if (menupopup==null) {
			var iBefore = document.getElementById("bookmarks-menu");
			if (iBefore) {
				iBefore = iBefore.nextSibling;
			} else {
				iBefore = document.getElementById("main-menubar").lastChild;
			}
			var menuel = document.createElement("menu");
				menuel.id = "menu_SAforums";
				menuel.setAttribute("label", "SA");
				menuel.setAttribute("accesskey","A");
				menuel.style.display = "none";
			menupopup = document.createElement("menupopup");
			menupopup.id = "menupopup_SAforums";
			menupopup.className = "lastread_menu";
			menuel.appendChild(menupopup);
			document.getElementById("main-menubar").insertBefore(menuel, iBefore);
			menupopup.addEventListener("popupshowing", SALR_SAMenuShowing, false);
		}

		if ( persistObject.getPreference('useSAForumMenuBackground') ) {
			menupopup.className = "lastread_menu";
		} else {
			menupopup.className = "";
		}
		while (menupopup.firstChild) {
			menupopup.removeChild(menupopup.firstChild);
		}
		var forumsDoc = persistObject.forumListXml;
		var nested_menus = persistObject.getPreference('nestSAForumMenu');
		var menuel = document.createElement("menuitem");
		var pinnedForumNumbers = new Array();
		var pinnedForumElements = new Array();
		if (nested_menus && persistObject.getPreference('menuPinnedForums')) {
			pinnedForumNumbers = persistObject.getPreference('menuPinnedForums').split(",");
		}
		menuel.setAttribute("label","Something Awful");
		menuel.setAttribute("image", "chrome://salastread/skin/sa.png");
		menuel.setAttribute("onclick", "SAmenuitemCommandURL2(event,'http://www.somethingawful.com','click');");
		menuel.setAttribute("oncommand", "SAmenuitemCommandURL2(event,'http://www.somethingawful.com','command');");
		menuel.setAttribute("class","menuitem-iconic lastread_menu_frontpage");
		menupopup.appendChild(menuel);
		menupopup.appendChild(document.createElement("menuseparator"));

		var lmenuel = document.createElement("menuitem");
			lmenuel.setAttribute("label","Configure SALastRead...");
			lmenuel.setAttribute("oncommand", "SALR_runConfig('command');");

		menupopup.appendChild(lmenuel);

		menupopup.appendChild(document.createElement("menuseparator"));

		populateForumMenuFrom(nested_menus,menupopup,forumsDoc.documentElement,pinnedForumNumbers,pinnedForumElements);

		if(nested_menus && pinnedForumElements.length > 0) {
			menupopup.appendChild(document.createElement("menuseparator"));
			for(var j = 0; j < pinnedForumElements.length || j < pinnedForumNumbers.length; j++) {
				if(pinnedForumElements[j]) {
					var thisforum = pinnedForumElements[j];
					var menuel = document.createElement("menuitem");
					var forumname = thisforum.getAttribute("name");
					while (forumname.substring(0,1)==" ") {
						forumname = forumname.substring(1);
					}
					menuel.setAttribute("label", forumname);
					menuel.setAttribute("forumnum", thisforum.getAttribute("id"));
					menuel.setAttribute("onclick", "SAmenuitemCommand2(event,this,'click');");
					menuel.setAttribute("oncommand", "SAmenuitemCommand2(event,this,'command');");
					menuel.setAttribute("class", "lastread_menu_sub");
					menupopup.appendChild(menuel);
				} else if(pinnedForumNumbers[j]=="sep") {
					menupopup.appendChild(document.createElement("menuseparator"));
				} else if (typeof(pinnedForumNumbers[j]) == "string" && pinnedForumNumbers[j].substring(0, 3) == "URL") {
					var umatch = pinnedForumNumbers[j].match(/^URL\[(.*?)\]\[(.*?)\]$/);
					if(umatch) {
						var menuel = document.createElement("menuitem");
							menuel.setAttribute("label", persistObject.UnescapeMenuURL(umatch[1]));
							menuel.setAttribute("targeturl", persistObject.UnescapeMenuURL(umatch[2]));
							menuel.setAttribute("onclick", "SAmenuitemCommandURL2(event,this,'click');");
							menuel.setAttribute("oncommand", "SAmenuitemCommandURL2(event,this,'command');");
							menuel.setAttribute("class", "lastread_menu_sub");

						menupopup.appendChild(menuel);
					}
				} else if (pinnedForumNumbers[j]=="starred") {
					var menuel = document.createElement("menu");
						menuel.setAttribute("label", "Starred Threads");
						menuel.setAttribute("image", "chrome://salastread/skin/star.png");
						menuel.setAttribute("class", "menu-iconic lastread_menu_starred");

					var subpopup = document.createElement("menupopup");
						subpopup.id = "salr_starredthreadmenupopup";

					menuel.appendChild(subpopup);
					menupopup.appendChild(menuel);

					subpopup.setAttribute("onpopupshowing", "SALR_StarredThreadMenuShowing();");
				}
			}

			if(persistObject.getPreference('showMenuPinHelper')) {
				var ms = document.createElement("menuseparator");
					ms.id = "salr_pinhelper_sep";

				menupopup.appendChild(ms);

				var menuel = document.createElement("menuitem");
					menuel.id = "salr_pinhelper_item";
					menuel.setAttribute("label", "Learn how to pin forums to this menu...");
					menuel.setAttribute("image", "chrome://salastread/skin/eng101-16x16.png");
					menuel.setAttribute("oncommand", "SALR_LaunchPinHelper();");
					menuel.setAttribute("class", "menuitem-iconic lastread_menu_sub");

				menupopup.appendChild(menuel);
			}
		}

		document.getElementById("menu_SAforums").style.display = "-moz-box";
	} catch(e) {
		alert("menuerr: " + e);
	}
}

function SALR_StarredThreadMenuShowing() {
	var menupopup = document.getElementById("salr_starredthreadmenupopup");
	while (menupopup.firstChild != null) {
		menupopup.removeChild(menupopup.firstChild);
	}
	var starred = persistObject.starList;
	for(var id in starred) {
		var title = starred[id];
		var menuel = document.createElement("menuitem");
			menuel.setAttribute("label", title);
			menuel.setAttribute("onclick", "SAmenuitemCommandGoToLastPost(event, this, 'click'," + id + ");");
			menuel.setAttribute("oncommand", "SAmenuitemCommandGoToLastPost(event, this, 'command'," + id + ");");
		menupopup.appendChild(menuel);
	}
}

function SALR_SAMenuShowing() {
   //alert("here - " + persistObject.getPreference('showMenuPinHelper'));
   if ( persistObject.getPreference('showMenuPinHelper') == false ) {
      var ms = document.getElementById("salr_pinhelper_sep");
      var mi = document.getElementById("salr_pinhelper_item");
      if ( ms != null ) {
         ms.parentNode.removeChild(ms);
      }
      if ( mi != null ) {
         mi.parentNode.removeChild(mi);
      }
   }
}

function SALR_LaunchPinHelper() {
   persistObject.setPreference('showMenuPinHelper', false);

   SALR_runConfig("catMenuButton");
   alert("You may return to the menu settings at any time by choosing \"Configure SALastRead...\" from the SA menu, or by "+
         "clicking the \"Configure Last Read Extension\" link in the header of any forum page.");
}

// Do anything needed to the subscribed threads list
function handleSubscriptions(doc) {
	var subForm = persistObject.selectSingleNode(doc, doc, "//FORM[@method='get'][contains(@action,'member2.php')]");
	if (!subForm) {
		return;
	}
	var subTable = subForm.parentNode;
	var threadlist = persistObject.selectNodes(doc, subTable, "TBODY/TR");
	var starredthreads = persistObject.starList, ignoredthreads = persistObject.ignoreList;
	for (i in threadlist)
	{
		if (threadlist[i].getElementsByTagName('td')[0].colSpan > "1")
		{
			// It's part of the header or footer so drop out
			continue;
		}
		threadTitleBox = persistObject.selectSingleNode(doc, threadlist[i], "TD//A[contains(@href,'threadid=')]");
		if (threadTitleBox == null)
		{
			// No subscribed threads listed, should rewrite this to be nicer
			continue;
		}
		else
		{
			threadTitleBox = threadTitleBox.parentNode.parentNode;
		}
		threadId = parseInt(persistObject.selectSingleNode(doc, threadlist[i], "TD//A[contains(@href,'threadid=')]").href.match(/threadid=(\d+)/)[1]);
		threadDetails = persistObject.getThreadDetails(threadId);
		threadRepliesBox = persistObject.selectSingleNode(doc, threadlist[i], "TD//A[contains(@href,'javascript:who(')]").parentNode.parentNode;
		threadRe = parseInt(persistObject.selectSingleNode(doc, threadlist[i], "TD//A[contains(@href,'javascript:who(')]").innerHTML);
		threadLRCount = threadDetails['lastreplyct'];
		// If thread is ignored
		if (threadDetails['ignore'])
		{
			threadlist[i].parentNode.deleteRow(i);
		}
		// So right click star/ignore works
		threadlist[i].className = "salastread_thread_" + threadId;
		// If this thread is in the DB as being read
		if (threadLRCount > -1)
		{
			if (!persistObject.getPreference("dontHighlightThreads"))
			{
				if ((threadRe+1) > threadLRCount) // If there are new posts
				{
					if (!persistObject.getPreference("disableNewReCount"))
					{
						if (persistObject.getPreference("newPostCountUseOneLine"))
						{
							threadRepliesBox.innerHTML += '&nbsp;(' + ((threadRe+1) - threadLRCount) + ')';
						}
						else
						{
							threadRepliesBox.innerHTML += ' (' + ((threadRe+1) - threadLRCount) + ')';
						}
					}
					persistObject.blindColorThread(doc, threadlist[i], persistObject.getPreference("readWithNewLight"), persistObject.getPreference("readWithNewDark"));
				}
				else
				{
					persistObject.blindColorThread(doc, threadlist[i], persistObject.getPreference("readLight"), persistObject.getPreference("readDark"));
				}
				if (!persistObject.getPreference("disableGradients"))
				{
					persistObject.addGradient(threadlist[i]);
				}
				if (persistObject.didIPostHere(threadId))
				{
					threadRepliesBox.style.backgroundColor = persistObject.getPreference("postedInThreadRe");
				}
			}
			if (persistObject.getPreference("showUnvisitIcon") && persistObject.getPreference("swapIconOrder"))
			{
				persistObject.insertUnreadIcon(doc, threadTitleBox, threadId).addEventListener("click", removeThread, false);
			}
			if ((persistObject.getPreference("showGoToLastIcon") && ((threadRe+1) > threadLRCount)) ||
				persistObject.getPreference("alwaysShowGoToLastIcon"))
			{
				persistObject.insertLastIcon(doc, threadTitleBox, threadId, threadLRCount);
			}
			if (persistObject.getPreference("showUnvisitIcon") && !persistObject.getPreference("swapIconOrder"))
			{
				persistObject.insertUnreadIcon(doc, threadTitleBox, threadId).addEventListener("click", removeThread, false);
			}
		}
		if (threadDetails['star'])
		{
			// This is causing errors, disabled for now
			//persistObject.insertStar(doc, threadTitleBox);
		}
	}
}

// Do anything needed to the post list in a forum
function handleForumDisplay(doc)
{
	var failed, i, e;	// Little variables that'll get reused
	var forumid = persistObject.getForumID(doc);
	// The following forums have special needs that must be dealt with
	var inFYAD = persistObject.inFYAD(forumid);
	var inBYOB = persistObject.inBYOB(forumid);
	var inDump = persistObject.inDump(forumid);
	var inAskTell = persistObject.inAskTell(forumid);
	var inGasChamber = persistObject.inGasChamber(forumid);

	if (!inFYAD || persistObject.getPreference("enableFYAD")) {
		var ourTransaction = false;
		if (persistObject.database.transactionInProgress) {
			ourTransaction = true;
			persistObject.database.beginTransactionAs(persistObject.database.TRANSACTION_DEFERRED);
		}
		// Insert the forums paginator & mouse gestures
		if (persistObject.getPreference("enableForumNavigator"))
		{
			persistObject.addPagination(doc);
		}
		if (persistObject.getPreference("gestureEnable"))
		{
			doc.body.addEventListener('mousedown', SALR_PageMouseDown, false);
			doc.body.addEventListener('mouseup', SALR_PageMouseUp, false);
		}
		// Replace post button
		if (persistObject.getPreference("useQuickQuote") && !inGasChamber)
		{
			var postbutton = persistObject.selectSingleNode(doc, doc, "//A[contains(@href,'action=newthread')]");
			if (postbutton) {
				attachQuickQuoteHandler(undefined,doc,persistObject.turnIntoQuickButton(doc, postbutton, forumid),"",0);
			}
		}

		// Snag Forum Moderators
		// Ignore FYAD and BYOB since idiot kings and deuputies just clog things up
		if (!inFYAD && !inBYOB && !inGasChamber)
		{
			var modarray = doc.getElementById('mods').getElementsByTagName('a');
			var modcount = modarray.length;
			for (i=0; i<modcount; i++)
			{
				userid = modarray[i].href.match(/userid=(\d+)/i)[1];
				username = modarray[i].innerHTML;
				if (!persistObject.isMod(userid))
				{
					persistObject.addMod(userid, username);
				}
			}
		}

		if (!inFYAD && !inGasChamber && !inDump)
		{
			// Capture and store the post icon # -> post icon filename relationship
			var iconNumber, iconFilename;
			var postIcons = persistObject.selectNodes(doc, doc.getElementById("filtericons"), "A[contains(@href,'posticon=')]");
			for (i in postIcons)
			{
				if ((postIcons[i].href.search(/posticon=(\d+)/i) > -1) &&
					(postIcons[i].firstChild.src.search(/posticons\/(.*)/i) > -1))
				{
					iconNumber = parseInt(postIcons[i].href.match(/posticon=(\d+)/i)[1]);
					iconFilename = postIcons[i].firstChild.src.match(/posticons\/(.*)/i)[1];
					persistObject.addIcon(iconNumber, iconFilename);
				}
			}
		}

		// We'll need lots of variables for this
		var threadIconBox, threadTitleBox, threadAuthorBox, threadRepliesBox;
		var threadTitle, threadId, threadOPId, threadRe, threadDetails;
		var threadLRCount, posterColor, posterBG, unvistIcon, lpIcon, lastPostID;
		var userPosterNote;
		var starredthreads = persistObject.starList, ignoredthreads = persistObject.ignoreList;
		var iconlist = persistObject.iconList;
		var table = document.getElementById('forum');
		// Here be where we work on the thread rows
		var threadlist = persistObject.selectNodes(doc, doc, "//TR[@class='thread']");
		for (var i in threadlist)
		{

			var thread = threadlist[i];
			
			threadTitleBox = persistObject.selectSingleNode(doc, thread, "TD[@class='title']");
			if (threadTitleBox.getElementsByTagName('a')[0].href.search(/announcement/i) > -1)
			{
				// It's an announcement so skip the rest
				continue;
			}
			
			threadId = parseInt(threadTitleBox.getElementsByTagName('a')[0].href.match(/threadid=(\d+)/i)[1]);
			threadTitle = threadTitleBox.getElementsByTagName('a')[0].innerHTML;
			threadDetails = persistObject.getThreadDetails(threadId);
			if (threadDetails['ignore'])
			{
				// If thread is ignored might as well remove it and stop now
				thread.parentNode.removeChild(thread);
				// Update the title just incase it doesn't know what it is
				persistObject.setThreadTitle(threadId, threadTitle);
				continue;
			}
			if (!inDump)
			{
				threadIconBox = persistObject.selectSingleNode(doc, thread, "TD[@class='icon']");
			}
			threadAuthorBox = persistObject.selectSingleNode(doc, thread, "TD[@class='author']");
			threadRepliesBox = persistObject.selectSingleNode(doc, thread, "TD[@class='replies']");
			threadLRCount = threadDetails['lastreplyct'];
			threadRe = parseInt(threadRepliesBox.getElementsByTagName('a')[0].innerHTML);
			threadOPId = parseInt(threadAuthorBox.getElementsByTagName('a')[0].href.match(/userid=(\d+)/i)[1]);
			posterColor = false;
			posterBG = false;
			if (threadDetails['mod'])
			{
				posterColor = persistObject.getPreference("modColor");
				posterBG =  persistObject.getPreference("modBackground");
			}
			if (threadDetails['admin'])
			{
				posterColor = persistObject.getPreference("adminColor");
				posterBG =  persistObject.getPreference("adminBackground");
			}
			if (threadDetails['color'])
			{
				posterColor = threadDetails['color'];
			}
			if (threadDetails['background'])
			{
				posterBG = threadDetails['background'];
			}
			// So right click star/ignore works
			thread.className += " salastread_thread_" + threadId;
			// Replace the thread icon with a linked thread icon
			if (!inDump && threadIconBox.firstChild.src.search(/posticons\/(.*)/i) > -1)
			{
				iconFilename = threadIconBox.firstChild.src.match(/posticons\/(.*)/i)[1];
				if (iconlist[iconFilename] != undefined)
				{
					iconGo = doc.createElement("a");
					iconGo.setAttribute("href", "/forumdisplay.php?forumid=" + forumid + "&posticon=" + iconlist[iconFilename]);
					iconGo.appendChild(threadIconBox.firstChild.cloneNode(true));
					iconGo.firstChild.style.border = "none";
					threadIconBox.removeChild(threadIconBox.firstChild);
					threadIconBox.appendChild(iconGo);
				}
			}
			// If this thread is in the DB as being read
			if (threadLRCount > -1)
			{
				if (!threadDetails['title'])
				{
					persistObject.setThreadTitle(threadId, threadTitle);
				}
				if (!threadDetails['op'])
				{
					persistObject.StoreOPData(threadId, threadOPId);
				}
				if (!persistObject.getPreference("dontHighlightThreads"))
				{
					if ((threadRe+1) > threadLRCount) // If there are new posts
					{
						if (!persistObject.getPreference("disableNewReCount"))
						{
							if (persistObject.getPreference("newPostCountUseOneLine"))
							{
								threadRepliesBox.innerHTML += '&nbsp;(' + ((threadRe+1) - threadLRCount) + ')';
							}
							else
							{
								threadRepliesBox.innerHTML += ' (' + ((threadRe+1) - threadLRCount) + ')';
							}
						}
						persistObject.colorThread(doc, thread, forumid, persistObject.getPreference("readWithNewLight"), persistObject.getPreference("readWithNewDark"));
					}
					else
					{
						persistObject.colorThread(doc, thread, forumid, persistObject.getPreference("readLight"), persistObject.getPreference("readDark"));
					}
					if (!persistObject.getPreference("disableGradients"))
					{
						persistObject.addGradient(thread);
					}
					if (threadDetails['posted'])
					{
						threadRepliesBox.style.backgroundColor = persistObject.getPreference("postedInThreadRe");
					}
				}
				if (persistObject.getPreference("showUnvisitIcon") && persistObject.getPreference("swapIconOrder"))
				{
					persistObject.insertUnreadIcon(doc, threadTitleBox, threadId).addEventListener("click", removeThread, false);
				}
				if ((persistObject.getPreference("showGoToLastIcon") && ((threadRe+1) > threadLRCount)) ||
					persistObject.getPreference("alwaysShowGoToLastIcon"))
				{
					persistObject.insertLastIcon(doc, threadTitleBox, threadId, parseInt(threadLRCount));
				}
				if (persistObject.getPreference("showUnvisitIcon") && !persistObject.getPreference("swapIconOrder"))
				{
					persistObject.insertUnreadIcon(doc, threadTitleBox, threadId).addEventListener("click", removeThread, false);
				}
			}
			if (threadDetails['star'])
			{
				persistObject.insertStar(doc, threadTitleBox);
			}
			if (persistObject.getPreference("highlightUsernames"))
			{
				if (posterBG != false)
				{
					threadAuthorBox.style.backgroundColor = posterBG;
				}
				if (posterColor != false)
				{
					threadAuthorBox.getElementsByTagName("a")[0].style.color = posterColor;
					if (!persistObject.getPreference("dontBoldNames"))
					{
						threadAuthorBox.getElementsByTagName("a")[0].style.fontWeight = "bold";
					}
				}
			}
		}
		if (ourTransaction)
		{
			persistObject.database.commitTransaction();
		}
  }
}

function removeThread(evt) {
	//var doc = evt.originalTarget.ownerDocument;
	var threadid = this.id.match(/unread_(\d+)/)[1];
	persistObject.removeThread(threadid);
	for (var i=0;i<this.parentNode.parentNode.childNodes.length;i++)
	{
		if (this.parentNode.parentNode.childNodes[i].nodeName != "#text")
		{
			this.parentNode.parentNode.childNodes[i].style.backgroundColor = "";
			this.parentNode.parentNode.childNodes[i].style.backgroundImage = "";
			this.parentNode.parentNode.childNodes[i].style.backgroundRepeat = "";
		}
	}
	if (this.parentNode.getElementsByTagName('a')[0].id == "jumptolast_"+threadid)
	{
		this.parentNode.removeChild(this.parentNode.getElementsByTagName('a')[0]);
	}
	this.parentNode.removeChild(this);
}

function convertPLTag(message) {
   return message.replace(/\[PL=(.*?)\](.*?)\[\/PL\]/g,"[URL=http://forums.somethingawful.com/showthread.php?s=&postid=$1#post$1]$2[/URL]");
   //return message.replace(/\[PL=(.*?)\](.*?)\[\/PL\]/g,"[URL=http://forums.somethingawful.com/showthread.php?s=&action=showpost&postid=$1]$2[/URL]");
}

function parsePLTagsInEdit(tarea) {
   var xtxt = tarea.value;
   tarea.value = convertPLTag(xtxt);
}

var quickquotewin = null;

function releaseQuickQuoteVarsWithClose() {
   quickquotewin.close();
}

function releaseQuickQuoteVars() {
   window.__salastread_quotedoc = null;
   window.__salastread_quotetext = null;
   window.__salastread_quotethreadid = null;
   window.__salastread_quotepostid = null;
   window.__salastread_alreadypostedinthread = null;
   window.__salastread_needretrieval = null;
   quickQuoteSubmitting = false;
   quickquotewin = null;
}

function quickQuoteAddHidden(doc,form,name,value) {
   var newel = doc.createElement("INPUT");
   newel.type = "hidden";
   newel.name = name;
   newel.value = value;
   form.appendChild(newel);
}

function quickQuoteAddFile(doc,form,name,value) {
   var newel = doc.createElement("INPUT");
   newel.type = "file";
   newel.name = name;
   newel.value = value;
   form.appendChild(newel);
}

var quickQuoteSubmitting = false;
var salastread_savedQuickReply = "";
var salastread_savedQuickReplyThreadId = "";

function quickQuoteSubmit(message, parseurl, subscribe, disablesmilies, signature, subtype, formkey, attachfile) {
	try {
		message = convertPLTag(message);
		salastread_savedQuickReply = message;
		salastread_savedQuickReplyThreadId = window.__salastread_quotethreadid;

		var doc = window.__salastread_quotedoc;
		var newform = doc.createElement("FORM");
			newform.style.display = "none";
			newform.action = "http://forums.somethingawful.com/newreply.php";

		if(!window.__salastread_quotethreadid) {
			newform.action = "http://forums.somethingawful.com/newthread.php";
		}

		if (quickquotewin.__salastread_is_edit) {
			newform.action = "http://forums.somethingawful.com/editpost.php";
		}

		newform.method = "post";
		newform.enctype = "multipart/form-data";
		quickQuoteAddHidden(doc,newform,"s","");
		if(window.__salastread_quotethreadid) {
			if(quickquotewin.__salastread_is_edit) {
				quickQuoteAddHidden(doc, newform,"action", "updatepost");
				quickQuoteAddHidden(doc, newform, "postid", window.__salastread_quotepostid);
			} else {
				quickQuoteAddHidden(doc, newform,"action", "postreply");
				quickQuoteAddHidden(doc, newform,"threadid", window.__salastread_quotethreadid);
			}
		} else {
			quickQuoteAddHidden(doc, newform,"action", "postthread");
			quickQuoteAddHidden(doc, newform, "forumid",  quickquotewin.__salastread_quickpost_forumid);
			quickQuoteAddHidden(doc, newform, "iconid", quickquotewin.document.getElementById('posticonbutton').iconid);
			quickQuoteAddHidden(doc, newform, "subject", quickquotewin.document.getElementById('subject').value);
		}

		quickQuoteAddHidden(doc, newform,"parseurl", parseurl ? "yes" : "");
		quickQuoteAddHidden(doc, newform,"email", subscribe ? "yes" : "");
		quickQuoteAddHidden(doc, newform,"disablesmilies", disablesmilies ? "yes" : "");
		quickQuoteAddHidden(doc, newform,"signature", signature ? "yes" : "");
		quickQuoteAddHidden(doc, newform,"message", message);
		quickQuoteAddHidden(doc, newform,"MAX_FILE_SIZE", "2097152");
		quickQuoteAddHidden(doc, newform,"formkey", formkey);

		if (attachfile!="") {
			quickQuoteAddFile(doc, newform,"attachment", attachfile);
		}
		newform.__submit = newform.submit;

		if (window.__salastread_quotethreadid) {
			if (subtype=="submit") {
				quickQuoteAddHidden(doc,newform,"submit","Submit Reply");
				markThreadReplied(window.__salastread_quotethreadid);
			} else {
				quickQuoteAddHidden(doc,newform,"preview","Preview Reply");
			}
		}
		else {
			quickQuoteAddHidden(doc,newform,"preview","Preview Post");
		}
		doc.body.appendChild(newform);
		quickQuoteSubmitting = true;
		newform.__submit();
		quickquotewin.close();
	} catch(e) {
		alert("err: " + e);
	}
}

function salastread_windowOnBeforeUnload(e) {
	if(persistObject._killed == true) { return; }
	if(e.originalTarget == window.__salastread_quotedoc) {
		if(quickQuoteSubmitting) {
			return true;
		}

		if(quickquotewin && !quickquotewin.closed) {
			quickquotewin.detachFromDocument();
		}
		return true;
	}
}

var SALR_PageTimerCount = 0;

function SALR_IncTimer() {
   SALR_PageTimerCount++;
}

function SALR_DecTimer() {
   SALR_PageTimerCount--;
}

function SALR_TimerTick() {
   if ( SALR_PageTimerCount > 0 && persistObject ) {
      persistObject.PingTimer();
   }
}

function SALR_SyncTick(force,trace) {
   var xforce = force ? true : false;
   trace = (trace==true) ? true : false;
   if (persistObject) {
      var res;
      if (trace)
         res = persistObject.PerformRemoteSync(xforce, function(){}, function(a){alert(a);});
      else
         res = persistObject.PerformRemoteSync(xforce, function(){}, function(a){});
      if (xforce) { alert("res.bad = "+res.bad+"\nres.msg = "+res.msg); }
   }
}

function salastread_windowOnUnload(e) {
   if ( persistObject._killed==true ) { return; }
   if ( e.originalTarget == window.__salastread_quotedoc ) {
      //releaseQuickQuoteVarsWithClose();
      releaseQuickQuoteVars();
   }
   if ( e.originalTarget.__salastread_processed ) {
      SALR_DecTimer();
      persistObject.SaveTimerValue();
   }
}

function cleanupLostPageTimers() {
   // because attaching to the unload event dynamically doesn't appear to work ...
   var cont = document.getElementById("content");
   var browsers = cont.browsers;
   var newPageTimers = new Array();
   for (var i=0; i<thisWindowPageTimers.length; i++) {
      var thisTimer = thisWindowPageTimers[i];
      var gotThisOne = 0;
      for (var j=0; j<browsers.length; j++) {
         var thisBrowser = browsers[j];
         if (thisBrowser.contentDocument && thisBrowser.contentDocument.__SALASTREAD_PAGETIMER==thisTimer) {
            gotThisOne = 1;
            newPageTimers.push(thisTimer);
         }
      }
      if (gotThisOne==0) {
         thisTimer.Finalize();
      }
   }
   thisWindowPageTimers = newPageTimers;
}

function quickQuoteButtonClick(evt) {
	var doc = evt.originalTarget.ownerDocument;
	var quotebutton = evt.originalTarget;
	var threadid = quotebutton.__salastread_threadid;
	var forumid = quotebutton.SALR_forumid;
	var postername = quotebutton.__salastread_postername;
	var hasQuote = quotebutton.__salastread_hasQuote;
	var is_edit = quotebutton.is_edit;

	if(persistObject.__QuickQuoteWindowObject && !persistObject.__QuickQuoteWindowObject.closed) {
		quickquotewin = persistObject.__QuickQuoteWindowObject;
	}

	window.__salastread_quotedoc = doc;

	//button pressed on a post (quote/edit)
	if(hasQuote) {
		window.__salastread_quotepostid = quotebutton.__salastread_postid;
	} else {
		window.__salastread_quotetext = "";
		window.__salastread_quotepostid = null;
	}

	window.__salastread_quotethreadid = threadid;

	if(quickquotewin && !quickquotewin.closed) {
		try {
			//try to re-add the quote in case the quickquote window's attachment was lost
			if(hasQuote) {
				quickquotewin.addQuoteFromPost(window.__salastread_quotepostid);
			}
			quickquotewin.focus();
		} catch(ex) {
			quickquotewin = window.open("chrome://salastread/content/quickquote.xul", "quickquote", "chrome, resizable=yes, width=800, height=400");
		}
	} else {
		quickquotewin = window.open("chrome://salastread/content/quickquote.xul", "quickquote", "chrome, resizable=yes, width=800, height=400");
	}

	if (quickquotewin) {
		persistObject.__QuickQuoteWindowObject = quickquotewin;
		quickquotewin.__salastread_quickpost_forumid = forumid;
		quickquotewin.__salastread_is_edit = is_edit;
	}

	return false;
}

function __unused() {
   try {
      var newdiv = doc.createElement("DIV");
      //newdiv.message = "woo woo woo";
      newdiv.style.position = "fixed";
      newdiv.style.top = "2%";
      newdiv.style.left = "2%";
      newdiv.style.width = "96%";
      newdiv.style.height = "50%";
      newdiv.style.zIndex = "13294945";
      newdiv.style.border = "1px solid #c1c1c1";
      newdiv.style.MozBinding = "url('chrome://salastread/content/quickquote.xml#quickquote')";
      doc.body.appendChild(newdiv);
      //newdiv.setAttribute("message", getQuoteCodeFromButton(doc,quotebutton) );
      //newdiv.message = getQuoteCodeFromButton(doc,quotebutton,postername);
   }
   catch (e) {
      alert("err: "+e);
   }
   return false;
}

function attachQuickQuoteHandler(threadid,doc,quotebutton,postername,hasQuote,postid,isedit) {
   quotebutton.__salastread_threadid = threadid;
   quotebutton.__salastread_postid = postid;
   quotebutton.__salastread_postername = postername;
   quotebutton.__salastread_hasQuote = hasQuote;
   if (isedit != undefined)
   {
		quotebutton.is_edit = true;
   }
   quotebutton.addEventListener("click", quickQuoteButtonClick, true);
}

var SALR_debugLog = new Array();
function addInternalDebugLog(msg) {
   SALR_debugLog.push( (new Date()).toString() +": "+msg );
   if ( SALR_debugLog.length > 10 ) {
      SALR_debugLog.shift();
   }
}

function handleShowThread(doc) {

	if (doc.getElementById('thread') == null)
	{
		// If there is no thread div then abort since something's not right
		return;
	}
	try
	{
		var forumid = persistObject.getForumID(doc);
	}
	catch(zzzz)
	{
		// Can't get the forum id so abort for now
		return;
	}
	var failed, i, zzzz;	// Little variables that'll get reused
	// The following forums have special needs that must be dealt with
	var inFYAD = persistObject.inFYAD(forumid);
	var inBYOB = persistObject.inBYOB(forumid);
	var inDump = persistObject.inDump(forumid);
	var inAskTell = persistObject.inAskTell(forumid);
	var inGasChamber = persistObject.inGasChamber(forumid);
	var userId = persistObject.userId;

	if (!inFYAD || persistObject.getPreference("enableFYAD"))
	{

		// Insert the forums paginator & mouse gestures
		if (persistObject.getPreference("enablePageNavigator"))
		{
			persistObject.addPagination(doc);
		}

		if (persistObject.getPreference("gestureEnable"))
		{
			doc.body.addEventListener('mousedown', SALR_PageMouseDown, false);
			doc.body.addEventListener('mouseup', SALR_PageMouseUp, false);
		}

		// Grab threads/posts per page
		var perpage = persistObject.selectSingleNode(doc, doc, "//DIV[contains(@class,'pages')]//A[contains(@href,'perpage=')]");
		if (perpage)
		{
			perpage = perpage.href.match(/perpage=(\d+)/i)[1];
			persistObject.setPreference("postsPerPage", perpage);
		}
		else
		{
			perpage = 0;
		}

		var isloggedin = (doc.getElementById("notregistered") == null);

		var pageList = persistObject.selectNodes(doc, doc, "//DIV[contains(@class,'pages')]");
		if (pageList)
		{
			if (pageList.length >  1)
			{
				pageList = pageList[1];
			}
			else
			{
				pageList = pageList[0];
			}
			var numPages = pageList.innerHTML.match(/\((\d+)\)/);
			var curPage = pageList.innerHTML.match(/[^ ][ \[;](\d+)[ \]&][^ ]/);
			if (pageList.childNodes.length > 1) // Are there pages
			{
				numPages = parseInt(numPages[1]);
				curPage = parseInt(curPage[1]);
			}
			else
			{
				numPages = 1;
				curPage = 1;
			}
		}

		// Grab the go to dropdown
		if (!persistObject.gotForumList)
		{
			var selectnode = persistObject.selectSingleNode(doc, doc.body, "//SELECT[@name='forumid']");
			if (selectnode) {
				// TODO: Audit this function
				grabForumList(doc, selectnode);
				persistObject.gotForumList = true;
			}
		}
		doc.__SALR_forumid = forumid;
		doc.body.className += " salastread_forum"+forumid;

		// Figure out the current threadid
		var replybutton = persistObject.selectSingleNode(doc, doc, "//UL[contains(@class,'postbuttons')]//A[contains(@href,'action=newreply&threadid=')]");
		if (replybutton)
		{
			var threadid = replybutton.href.match(/threadid=(\d+)/)[1];
		}
		else
		{
			// If can't figure it out, abort so we don't screw anything up
			return;
		}
		doc.__SALR_threadid = threadid;
		persistObject.iAmReadingThis(threadid);
		var lastReadPostCount = persistObject.getLastReadPostCount(threadid);

		// used by the context menu to allow options for this thread
		doc.body.className += " salastread_thread_"+threadid;

		// Get the original poster and update the database if we don't know it yet
		var threadOP = persistObject.GetOPFromData(threadid);
		if (!threadOP && curPage == 1)
		{
			var opInfo = persistObject.selectSingleNode(doc, doc, "//TABLE[contains(@class,'post')]//A[contains(@href,'action=getinfo&userid=')]");
			if (opInfo)
			{
				persistObject.StoreOPData(threadid, opInfo.href.match(/userid=(\d+)/)[1]);
				threadOP = opInfo.href.match(/userid=(\d+)/)[1];
			}
		}

		// Grab the thread title
		var threadtitle = '';
		var titlematch = doc.title.match(/(.*) \- (.*)/);
		if (titlematch) {
			if (titlematch[1].search(/Something/i) > -1)
			{
				threadtitle = titlematch[2];
			}
			else
			{
				threadtitle = titlematch[1];
			}
			persistObject.setThreadTitle(threadid, threadtitle);
		}

		// Check if the thread is closed
		if (persistObject.selectSingleNode(doc, doc, "//A[contains(@href,'action=newreply&threadid')]//IMG[contains(@src,'closed')]") == null)
		{
			var threadClosed = false;
		}
		else
		{
			var threadClosed = true;
		}

		// Replace post button
		if (persistObject.getPreference("useQuickQuote") && !inGasChamber)
		{
			var postbuttons = persistObject.selectNodes(doc, doc, "//UL[contains(@class,'postbuttons')]//A[contains(@href,'action=newthread')]");
			if (postbuttons.length > 0)
			{
				for (i in postbuttons)
				{
					attachQuickQuoteHandler(undefined,doc,persistObject.turnIntoQuickButton(doc, postbuttons[i], forumid),"",0);
				}
			}
			if (!threadClosed)
			{
				var replybuttons = persistObject.selectNodes(doc, doc, "//UL[contains(@class,'postbuttons')]//A[contains(@href,'action=newreply&threadid')]");
				if (replybuttons.length > 0)
				{
					for (i in replybuttons)
					{
						attachQuickQuoteHandler(threadid,doc,persistObject.turnIntoQuickButton(doc, replybuttons[i], forumid),"",0);
					}
				}
			}
		}

		// Update the last read total
		var editbuttons = persistObject.selectNodes(doc, doc, "//TR[contains(@class,'postbar')]//A[contains(@href,'action=editpost')]");
		var postcount = (perpage * (curPage-1)) + editbuttons.length;
		persistObject.setLastReadPostCount(threadid, postcount);

		var curPostId, colorDark = true, colorOfPost, postIdLink, resetLink, profileLink, posterId, postbody, f;
		var posterColor, posterBG, userNameBox, posterNote, posterImg, posterName, slink, quotebutton, editbutton, reportbutton;
		var userPosterColor, userPosterBG, userPosterNote;

		//group calls to the prefs up here so we aren't repeating them, should help speed things up a bit
		var hideEditButtons = persistObject.getPreference('hideEditButtons');
		var hideReportButtons = persistObject.getPreference('hideReportButtons');
		var useQuickQuote = persistObject.getPreference('useQuickQuote');
		var insertPostLastMarkLink = persistObject.getPreference("insertPostLastMarkLink");
		var insertPostTargetLink = persistObject.getPreference("insertPostTargetLink");

		doc.postlinks = new Array;

		// Loop through each post
		var postlist = persistObject.selectNodes(doc, doc, "//TABLE[contains(@id,'post')]");
		for (i in postlist)
		{
			if (postlist[i].className.search(/ignored/i) > -1)
			{
				// User is ignored by the system so skip doing anything else
				continue;
			}
			curPostId = postlist[i].id.match(/post(\d+)/)[1];
			postcount = (perpage * (curPage-1)) + parseInt(i) + 1;
			profileLink = persistObject.selectSingleNode(doc, postlist[i], "TBODY//TR[contains(@class,'postbar')]//TD//A[contains(@href,'userid=')]");
			posterId = profileLink.href.match(/userid=(\d+)/i)[1];
			if (!inFYAD)
			{
				userNameBox = persistObject.selectSingleNode(doc, postlist[i], "TBODY//TR/TD//DL//DT[contains(@class,'author')]");
			}
			else
			{
				userNameBox = persistObject.selectSingleNode(doc, postlist[i], "TBODY//DIV[contains(@class,'title')]//following-sibling::B");
			}
			titleBox = persistObject.selectSingleNode(doc, postlist[i], "TBODY//TR//TD//DL//DD[contains(@class,'title')]");
			if (titleBox && persistObject.getPreference("resizeCustomTitleText"))
			{
				// Adds a scrollbar if they have a really wide custom title
				titleBox.style.overflow = "auto";
				titleBox.style.width = "159px";
				if (titleBox.getElementsByTagName('font').length > 0)
				{
					// They likely have a large, red custom title
					for(f=0;f<titleBox.getElementsByTagName('font').length;f++)
					{
						titleBox.getElementsByTagName('font')[f].style.fontSize = "10px";
					}
				}
			}
			posterName = userNameBox.textContent.replace(/^\s+|\s+$/, '');
			if (userNameBox.getElementsByTagName('img').length > 0)
			{
				// They have a mod star or something else
				posterImg = userNameBox.getElementsByTagName('img')[0].title;
				if (posterImg == 'Admin')
				{
					persistObject.addAdmin(posterId, posterName);
				}
				if (posterImg == 'Moderator')
				{
					persistObject.addMod(posterId, posterName);
				}
			}
			posterColor = false;
			posterBG = false;
			posterNote = false;
			if (posterId == threadOP)
			{
				posterColor = persistObject.getPreference("opColor");
				posterBG =  persistObject.getPreference("opBackground");
				posterNote = "Thread Poster";
			}
			if (persistObject.isMod(posterId))
			{
				posterColor = persistObject.getPreference("modColor");
				posterBG =  persistObject.getPreference("modBackground");
				posterNote = "Forum Moderator";
			}
			if (persistObject.isAdmin(posterId))
			{
				posterColor = persistObject.getPreference("adminColor");
				posterBG =  persistObject.getPreference("adminBackground");
				posterNote = "Forum Administrator";
			}
			userPosterColor = persistObject.getPosterColor(posterId);
			userPosterBG = persistObject.getPosterBackground(posterId);
			userPosterNote = persistObject.getPosterNotes(posterId);
			if (userPosterColor != false)
			{
				posterColor = userPosterColor;
			}
			if (userPosterBG != false)
			{
				posterBG = userPosterBG;
			}
			if (persistObject.getPreference("highlightUsernames") && posterColor != false)
			{
				userNameBox.style.color = posterColor;
			}
			if (posterNote != false)
			{
				newNoteBox = doc.createElement("p");
				newNoteBox.style.fontSize = "80%";
				newNoteBox.style.margin = "0";
				newNoteBox.style.padding = "0";
				newNoteBox.textContent = posterNote;
				userNameBox.appendChild(newNoteBox);
			}
			if (userPosterNote != false)
			{
				newNoteBox = doc.createElement("p");
				newNoteBox.style.fontSize = "80%";
				newNoteBox.style.margin = "0";
				newNoteBox.style.padding = "0";
				newNoteBox.textContent = userPosterNote;
				userNameBox.appendChild(newNoteBox);
			}
			if (!persistObject.getPreference("dontHighlightPosts"))
			{
				if (posterBG != false)
				{
					persistObject.colorPost(doc, postlist[i], posterBG, forumid);
				}
				else if (postcount <= lastReadPostCount)
				{
					if (colorDark)
					{
						posterBG = persistObject.getPreference("seenPostDark");
					}
					else
					{
						posterBG = persistObject.getPreference("seenPostLight");
					}
					persistObject.colorPost(doc, postlist[i], posterBG, forumid);
				}
			}
			colorDark = !colorDark;
			postIdLink = persistObject.selectSingleNode(doc, postlist[i], "TBODY//TR[contains(@class,'postbar')]//TD//A[contains(@href,'#post')]");
			postid = postIdLink.href.match(/#post(\d+)/i)[1];
			if (insertPostTargetLink)
			{
				slink = doc.createElement("a");
				slink.href = "/showthread.php?action=showpost&postid="+postid;
				slink.title = "Show Single Post";
				slink.innerHTML = "1";
				postIdLink.parentNode.insertBefore(slink, postIdLink);
				postIdLink.parentNode.insertBefore(doc.createTextNode(" "), postIdLink);
			}
			if (insertPostLastMarkLink)
			{
				resetLink = doc.createElement("a");
				resetLink.href = "javascript:void('lr',"+postid+");";
				resetLink.title = "Set \"Last Read\" post in this thread to this post";
				resetLink.threadid = threadid;
				resetLink.postid = postid;
				resetLink.postcount = postcount;
				resetLink.parentpost = postlist[i];
				resetLink.onclick = SALR_ChangeLastReadOnThread;
				resetLink.innerHTML = "<";
				doc.postlinks[doc.postlinks.length] = resetLink;
				postIdLink.parentNode.insertBefore(resetLink, postIdLink);
				postIdLink.parentNode.insertBefore(doc.createTextNode(" "), postIdLink);
			}

			//grab this once up here to avoid repetition
			if(useQuickQuote || hideEditButtons) {
				editbutton = persistObject.selectSingleNode(doc, postlist[i], "TBODY//TR[contains(@class,'postbar')]//TD//A[contains(@href,'action=editpost')]");
			}

			if(hideEditButtons && editbutton) {
				if(posterId != userId) {
					editbutton.parentNode.removeChild(editbutton);
					//so we don't try to add quickquote to non-existant edit buttons
					editbutton = null;
				}
			}

			if (useQuickQuote && !threadClosed)
			{
				quotebutton = persistObject.selectSingleNode(doc, postlist[i], "TBODY//TR[contains(@class,'postbar')]//TD//A[contains(@href,'action=newreply')]");
				if (quotebutton) {
					attachQuickQuoteHandler(threadid, doc, persistObject.turnIntoQuickButton(doc, quotebutton, forumid), posterName, 1, postid);
				}
				if (editbutton) {
					attachQuickQuoteHandler(threadid, doc, persistObject.turnIntoQuickButton(doc, editbutton, forumid), posterName, 1, postid, true);
				}
			}

			if(hideReportButtons) {
				if(posterId == userId) {
					reportbutton = persistObject.selectSingleNode(doc, postlist[i], "TBODY//TR[contains(@class,'postbar')]//TD//A[contains(@href,'modalert.php')]");
					if(reportbutton) {
						reportbutton.parentNode.removeChild(reportbutton);
					}
				}
			}

			postbody = persistObject.selectSingleNode(doc, postlist[i], "TBODY//TD[contains(@class,'postbody')]");
			persistObject.convertSpecialLinks(doc, postbody);
		}

		// Get the last post #
		lastPostId = postIdLink.href.match(/#post(\d+)/i)[1];
		persistObject.setLastPostID(threadid, lastPostId);

	}
	// below hasn't been rewritten
	try {
		try { SALR_InsertThreadKeyboardNavigation(doc); } catch (e) { }

		reanchorThreadToLink(doc);

		doc.__salastread_loading = true;
		window.addEventListener("load", SALR_PageFinishedLoading, true);

		if (persistObject.getPreference('scrollPostEnable')) {
			setTimeout(function () { SALR_CheckScrollPostPosition(doc); }, 1000);
		}
	} catch(e) {
		if (!persistObject.getPreference("suppressErrors")) {
			alert(e);
		}
	}
}

var specialDoc;

function SALR_PageFinishedLoading(e) {
	var doc = e.originalTarget;
	doc.__salastread_loading = false;
}

function SALR_CheckScrollPostPosition(doc) {
	if (doc.__salastread_processed) {
		var scrollpos = doc.defaultView.scrollY + doc.defaultView.innerHeight;
		var i,a;

		for (i = 0; i < doc.postlinks.length; i++) {
			a = doc.postlinks[i];
			if (a.postid && (doc.__salastread_loading || !a.absolutepos)) {
				a.absolutepos = SALR_GetVerticalPos(a.parentpost);
			}

			if (a.absolutepos && scrollpos > a.absolutepos) {
				persistObject.setLastPostID(a.threadid, a.postid, true);
			}
		}
		setTimeout(function () { SALR_CheckScrollPostPosition(doc); }, 5000);
	}
}

function SALR_GetVerticalPos(element) {
	var y = 0;
	var p = element;
	while (p) {
		y += p.offsetTop;
		p = p.offsetParent;
	}

	return y;
}


function SALR_InsertThreadKeyboardNavigation(doc) {
	// XXX: temporarily disabled
	return;

	doc.onkeypress =
	function(e) {
		if(e.which == 32)
		{
			var curTop = doc.body.scrollTop;
			setTimeout(function() { SALR_CheckForSpaceScroll(doc, curTop); }, 50);
		}
	};
}

function SALR_CheckForSpaceScroll(doc, oldTop) {
	var newTop = doc.body.scrollTop;
	if (oldTop == newTop) {
		var bclassmatch = doc.body.className.match(/salastread_thread_(\d+)/);
		if (bclassmatch) {
			var curPage = doc._SALR_curPage;
			var maxPages = doc._SALR_maxPages;
			var threadid = Number(bclassmatch[1]);

			if (maxPages>curPage) {
				doc.location = "http://forums.somethingawful.com/showthread.php?s=&threadid=" + threadid + "&pagenumber=" + (curPage + 1);
				return;
			}

			var postid = persistObject.getLastPostID(threadid);
			if(postid > 0) {
				var nurl = "http://forums.somethingawful.com/showthread.php?s=&postid=" + postid + "#post" + postid;
				if (doc.location.href == nurl) {
					doc.location.reload();
				} else {
					doc.location = nurl;
				}
			}
		}
	}
}

function SALR_DirectionalNavigate(doc, dir) {
	var forumid = doc.location.href.match(/forumid=[0-9]+/);
	var posticon = doc.location.href.match(/posticon=[0-9]+/);
	if (!posticon) posticon = "posticon=0";

   if (dir == "top") {
      var tforum = doc.__SALR_forumid;
	  if (tforum)
		  doc.location = "http://forums.somethingawful.com/forumdisplay.php?s=&forumid="+tforum;
	  else
		  doc.location = "http://forums.somethingawful.com/forumdisplay.php?s=&"+forumid+"&"+posticon;
   }
   else if (dir == "left") {
      var curPage = doc.__SALR_curPage;
      if (curPage > 1) {
         var threadid = doc.__SALR_threadid;
		 if (threadid)
			 doc.location = "http://forums.somethingawful.com/showthread.php?s=&threadid="+threadid+"&perpage=40&pagenumber="+(curPage-1);
		 else
			 doc.location = "http://forums.somethingawful.com/forumdisplay.php?"+forumid+"&daysprune=30&sortorder=desc&sortfield=lastpost&perpage=40&"+posticon+"&pagenumber="+(curPage-1);
      }
   }
   else if (dir == "right") {
      var curPage = doc.__SALR_curPage;
      var maxPage = doc.__SALR_maxPage;
      if (maxPage > curPage) {
         var threadid = doc.__SALR_threadid;
		 if (threadid)
			 doc.location = "http://forums.somethingawful.com/showthread.php?s=&threadid="+threadid+"&perpage=40&pagenumber="+(curPage+1);
		 else
			 doc.location = "http://forums.somethingawful.com/forumdisplay.php?"+forumid+"&daysprune=30&sortorder=desc&sortfield=lastpost&perpage=40&"+posticon+"&pagenumber="+(curPage+1);
      }
   }
}

function SALR_PageMouseUp(event) {
   var targ = event.target;
   var doc = targ.ownerDocument;
   if (targ && targ.SALR_isGestureElement==true) {
      doc.body.addEventListener('contextmenu', SALR_GestureContextMenu, false);
      SALR_DirectionalNavigate(doc, targ.SALR_dir);
      //alert("dir="+targ.SALR_dir);
   }

   var gn = doc.getElementById("salastread_gesturenavtop");
   if (gn) {
      var rx = function(dir) {
         var el = doc.getElementById("salastread_gesturenav"+dir);
         el.parentNode.removeChild(el);
      }
      rx("top");
      rx("left");
      rx("right");
      rx("bottom");
   }
}

function SALR_GestureContextMenu(event) {
   var targ = event.target;
   var doc = targ.ownerDocument;
   doc.body.removeEventListener('contextmenu', SALR_GestureContextMenu, false);
   if (event.preventDefault) {
      event.preventDefault();
   }
   return false;
}

function SALR_PageMouseDown(event) {
   var doc = event.target.ownerDocument;
   var gn = doc.getElementById("salastread_gesturenavtop");
   if (gn) {
      return;
   }
   if (event.button == persistObject.getPreference('gestureButton') && persistObject.getPreference('gestureEnable')) {
      var cx = function(dir, ofsy, ofsx) {
         var el = doc.createElement("IMG");
         el.SALR_dir = ""+dir;
         el.id = "salastread_gesturenav"+dir;
         el.className = "salastread_gesturenav";
         el.src = "chrome://salastread/skin/gesturenav-" + dir + ".png";
         el.style.left = ((event.clientX - 36) + (77 * ofsx)) + "px";
         el.style.top = ((event.clientY - 36) + (77 * ofsy)) + "px";
         doc.body.appendChild(el);
         el.SALR_isGestureElement = true;

         if (dir=="left" && (doc.__SALR_curPage <= 1 || !doc.__SALR_curPage)) {
            el.className += " disab";
         }
         else if (dir=="right" && (doc.__SALR_maxPage <= doc.__SALR_curPage || !doc.__SALR_maxPage)) {
            el.className += " disab";
         }
      };
      cx("top", -1, 0);
      cx("left", 0, -1);
      cx("right", 0, 1);
      cx("bottom", 1, 0);

      if (!doc.__SALR_maxPage) {
	        var ss = doc.createElement("link");
            ss.rel = "stylesheet";
            ss.href = "chrome://salastread/content/pagenavigator-content.css";
            doc.getElementsByTagName('head')[0].appendChild(ss);
      }
   }
}

//handle setting the last read post to a user-defined post
function SALR_ChangeLastReadOnThread(e) {
	try {
		var threadid = e.originalTarget.threadid;
		var postid = e.originalTarget.postid;
		var postcount = e.originalTarget.postcount;

		//first update the last post ID, then post count
		persistObject.setLastPostID(threadid, postid, true);
		persistObject.setLastReadPostCount(threadid, postcount, true);

		//create the little yellow popup (could this be done via CSS?)
		var doc = e.originalTarget.ownerDocument;
		var notel = doc.createElement("div");
			notel.innerHTML = "Last Post reset to this post.";
			notel.style.position = "absolute";
			notel.style.border = "1px solid black";
			notel.style.backgroundColor = "yellow";
			notel.style.color = "black";
			notel.style.padding = "2px 2px 2px 2px";
			notel.style.fontFamily = "Tahoma, Arial, Helvetica, sans-serif";
			notel.style.fontSize = "small";
		var lef = 0;
		var top = 0;
		var tel = e.originalTarget;

		while (tel) {
			lef += tel.offsetLeft;
			top += tel.offsetTop;
			tel = tel.offsetParent;
		}

		notel.style.top = (top + e.originalTarget.offsetHeight) + "px";
		notel.style.left = lef + "px";
		notel.opacity = 100;

		doc.body.appendChild(notel);
		setTimeout( function() { SALR_NoteFade(notel); }, 1000 );
	} catch(e) {
		Components.utils.reportError("Error marking thread: " + e);
	}
}

function SALR_NoteFade(targetEl) {
	targetEl.opacity -= 5;
	targetEl.style.MozOpacity = (targetEl.opacity / 100);
	if (targetEl.opacity > 5) {
		setTimeout( function() { SALR_NoteFade(targetEl); }, 10 );
	} else {
		targetEl.parentNode.removeChild(targetEl);
	}
}

function reanchorThreadToLink(doc) {
	if(persistObject.getPreference('reanchorThreadOnLoad')){
		if (doc.location.href.match(/\#(.*)$/)) {
			var anchorNode = persistObject.selectNodes(doc, doc.body, "//table[@id='"+doc.location.href.match(/\#(.*)$/)[1]+"']")[0];

			if (anchorNode) {
				anchorNode.scrollIntoView(true);
			}
		}
	}
}

function SALR_runConfig(page) {
	var data = "";
	if (typeof(page) == "string") {
		data = page;
	}

	openDialog("chrome://salastread/content/pref.xul","_blank", "chrome,titlebar,modal,resizable", data);
}

function handleEditPost(e) {
   var doc = e.originalTarget;
   var submitbtn = persistObject.selectNodes(doc, doc.body, "//INPUT[@type='submit'][@value='Save Changes']")[0];
   var tarea = persistObject.selectNodes(doc, doc.body, "//TEXTAREA[@name='message']")[0];
   if (submitbtn && tarea) {
      submitbtn.addEventListener("click", function() { parsePLTagsInEdit(tarea); }, true);
      submitbtn.style.backgroundColor = persistObject.getPreference('postedInThreadRe');
   }
}

var salastread_needRegReplyFill = false;

function setRegReplyFillOn() {
   salastread_needRegReplyFill = true;
}

function handleNewReply(e) {
   var doc = e.originalTarget;
   var threadlink = persistObject.selectSingleNode(doc, doc.body, "DIV[contains(@id, 'container')]/TABLE[1]/TBODY[1]/TR[1]/TD[1]/SPAN[1]/B/A[contains(@href,'showthread.php')][contains(@href,'threadid=')]");
   if (threadlink) {
      var tlmatch = threadlink.href.match( /threadid=(\d+)/ );
      if ( tlmatch ) {
         var threadid = tlmatch[1];
         if ( salastread_needRegReplyFill ) {
            var msgEl = persistObject.selectSingleNode(doc, doc.body, "//TEXTAREA[@name='message']");
            if (msgEl) {
               msgEl.value = salastread_savedQuickReply;
            }
            salastread_needRegReplyFill = false;
         }
         var postbtn = persistObject.selectNodes(doc, doc.body, "//FORM[@name='vbform'][contains(@action,'newreply.php')]//INPUT[@type='submit'][@name='submit']")[0];
         if (postbtn) {
            postbtn.addEventListener("click", function() { markThreadReplied(threadid); }, true);
            postbtn.style.backgroundColor = persistObject.getPreference('postedInThreadRe');
         }
      }
   } else {
      if (salastread_savedQuickReply!="") {
         var forgeCheck = persistObject.selectSingleNode(doc, doc.body, "TABLE/TBODY[1]/TR[1]/TD[1]/TABLE[1]/TBODY[1]/TR[1]/TD[1]/TABLE[1]/TBODY[1]/TR[2]/TD[1]/FONT[contains(text(),'have been forged')]");
         if (forgeCheck) {
            persistObject.__cachedFormKey = "";
            var reqMsg = doc.createElement("P");
            reqMsg.style.fontFamily = "Verdana, Arial, Helvetica";
            reqMsg.style.fontSize = "80%";
            reqMsg.style.backgroundColor = "#fcfd99";
            reqMsg.style.border = "1px solid black";
            reqMsg.style.padding = "2px 2px 2px 2px";
            reqMsg.appendChild(
               doc.createTextNode("Message from SA Last Read: " +
                  "Quick Reply appears to have worked incorrectly. To open "+
                  "your reply in a regular forum reply page, click ")
            );
            var regReplyLink = doc.createElement("A");
            regReplyLink.onclick = setRegReplyFillOn;
            regReplyLink.href = "http://forums.somethingawful.com/newreply.php?s=&action=newreply&threadid=" +
               salastread_savedQuickReplyThreadId;
            regReplyLink.innerHTML = "here.";
            reqMsg.appendChild(regReplyLink);
            forgeCheck.parentNode.insertBefore(reqMsg, forgeCheck);
         } else {
            salastread_savedQuickReply = "";
            salastread_savedQuickReplyThreadId = "";
         }
      }
   }
}

function markThreadReplied(threadid) {
	persistObject.iPostedHere(threadid);
}

function handleConfigLinkInsertion(e) {
	var doc = e.originalTarget;
	var usercpnode = persistObject.selectSingleNode(doc, doc.body, "//UL[@id='navigation']/LI/A[contains(@href,'usercp.php?s=')]");
	if (usercpnode) {
		var containerLi = doc.createElement("LI");
		var sep = doc.createTextNode(" - ");
		var newlink = doc.createElement("A");
		containerLi.appendChild(sep);
		containerLi.appendChild(newlink);
		newlink.appendChild( doc.createTextNode("Configure SALR") );
		usercpnode.parentNode.parentNode.insertBefore(containerLi, usercpnode.parentNode.nextSibling);
		newlink.href = "#";
		newlink.addEventListener("click", SALR_runConfig, true);
		return 1;
	} else {
		return 0;
	}
}

function salastread_addUpdateIcon(doc) {
   if ( persistObject._updateURL != "" ) {
      var updlink = doc.createElement("A");
      var updicon = doc.createElement("IMG");
      updlink.href = persistObject._updateURL;
      if ( persistObject._killed==true ) {
         updicon.src = "chrome://salastread/skin/killedicon.png";
         updicon.title = "SA Last Read Update REQUIRED";
      } else {
         updicon.src = "chrome://salastread/skin/updateicon.png";
         updicon.title = "SA Last Read Update Available";
      }
      updicon.style.width = "35px";
      updicon.style.height = "33px";
      updicon.style.border = "none";
      updlink.appendChild(updicon);
      updlink.style.display = "block";
      updlink.style.position = "fixed";
      updlink.style.right = "5px";
      updlink.style.bottom = "5px";
      doc.body.appendChild(updlink);
   }
}

function handleBodyClassing(e) {
   var doc = e.originalTarget;
   var docbody = doc.body;
   var addclass = " somethingawfulforum";
   var phmatch = doc.location.href.match( /\/([^\/]*)\.php/ );
   if (phmatch) {
      addclass += " somethingawfulforum_"+phmatch[1]+"_php";
   }
   docbody.className += addclass;
}

function salastread_hidePageHeader(doc) {
   var hiddenElements = new Array();
   var hideEl = function(id) {
      var el;
      if (typeof id == "string") {
         el = doc.getElementById(id);
      } else {
         el = id;
      }
      if (el) {
         el.SALR_display = el.style.display;
         el.style.display = "none";
         hiddenElements.push(el);
      }
   }

   hideEl("globalmenu");
   hideEl("searchboxes");
   hideEl("navigation");
   var nav = doc.getElementById("navigation");
   if (nav) {
      nav = nav.nextSibling;
      if (nav && nav.nodeName != "DIV") {
         nav = nav.nextSibling;
      }
      if (nav && persistObject.selectSingleNode(doc, nav, "A[@target='_new']/IMG")) {
         hideEl(nav);
      }
   }
   hideEl("copyright");
   var copyright = doc.getElementById("copyright");
   if (copyright) {
      if (copyright) copyright = copyright.previousSibling;
      if (copyright && copyright.nodeName != "DIV") copyright = copyright.previousSibling;
      if (copyright && persistObject.selectSingleNode(doc, copyright, "A[@target='_new']/IMG")) {
         hideEl(copyright);
      }
   }

   if (hiddenElements.length > 0) {
      var togLink = doc.createElement("DIV");
      togLink.className = "salastread_showhideheaderbutton";
      togLink.innerHTML = "[Show Header/Footer]";
      togLink.onclick = function() {
         for (var i=0; i<hiddenElements.length; i++) {
            var tel = hiddenElements[i];
            tel.style.display = tel.SALR_display;
         }
         togLink.style.display = "none";
         return false;
      };
      doc.body.appendChild(togLink);

      var lr = doc.createElement("link");
      lr.rel = "stylesheet";
      lr.type = "text/css";
      lr.href = "chrome://salastread/content/hideshowheaderbutton.css";
      doc.getElementsByTagName('head')[0].appendChild(lr);
   }
}

function SALR_ParamsToUrl(params) {
   var res = "";
   for (var key in params) {
      if (key.indexOf("salr_")==0) {
         res += "&" + escape(key) + "=" + escape(params[key]);
      }
   }
   return res;
}

var SALR_ProfileUserName;

function SALR_HandleProfileInsertion(e) {
   try
   {
      var doc = e.originalTarget;
      var location = doc.location;

      var params = new Object();

      var qstring = location.search;
      if (qstring.substr(0,1)=="?")
         qstring = qstring.substr(1);
      var qsplit = qstring.split("&");
      for (var qn=0; qn<qsplit.length; qn++) {
         var qparams = qsplit[qn].split("=");
         var qname = unescape(qparams[0]);
         var qvalue = unescape(qparams[1]);
         params[qname] = qvalue;
      }

      var capImg = doc.getElementById("captcha");

      if ( capImg && params["salr_addprofilekey"] && params["action"]=="editprofile" ) {
         var ihtmlm = doc.body.innerHTML.match(/">User Control Panel For (.*?)<\/a>/);
         if (!ihtmlm) return;
         SALR_ProfileUserName = ihtmlm[1];
         setTimeout(function() {
            var data = new Object();
            data["captchaUrl"] = capImg.src;
            openDialog("chrome://salastread/content/profileEditConfirm.xul","_blank",
                       "chrome,titlebar,modal,resizable", data);
            if (data["continue"]) {
               var formtag = persistObject.selectSingleNode(doc, doc.body, "//form[@action='member.php']");
               var captext = persistObject.selectSingleNode(doc, doc.body, "//input[@name='captcha']");
               var f1 = persistObject.selectSingleNode(doc, doc.body, "//input[@name='field1']");
               if (formtag && captext && f1) {
                  f1.value = "SALR["+ params["salr_addprofilekey"] +"]";
                  formtag.action = "member.php?salr_profileinsertcontinue=true" + SALR_ParamsToUrl(params);
                  captext.value = data["captchaText"];
                  formtag.submit();
               }
            }
         },1);
         return;
      }
      else if ( params["salr_profileinsertcontinue"]=="true" ) {
         if (doc.body.innerHTML.indexOf("hank you for")!=-1) {
            // Success!!
            alert("Profile successfully updated");
            if (params["salr_onsuccessurl"]) {
               var surl = params["salr_onsuccessurl"];
               if (surl.indexOf("?")!=-1)
                  surl += "&";
               else
                  surl += "?";
               surl += "salr_username=" + SALR_ProfileUserName;
               doc.location = surl;
            }
         } else {
            if (confirm("Your profile did not update correctly. (You may have entered an incorrect validation code.) "+
                        "Press OK to try again.")) {
               doc.location = "http://forums.somethingawful.com/member.php?s=&action=editprofile"+SALR_ParamsToUrl(params);
            }
         }
      }
   } catch (err) { }
}

function SALR_windowOnLoadMini(e) {
   var doc = e.originalTarget;
   var location = doc.location;
   try {
      if (doc.__salastread_processed) {
         if ( persistObject.getPreference('reanchorThreadOnLoad') ) {
            var samatch = location.href.match( /^http:\/\/forums?\.somethingawful\.com\//i );
            samatch = samatch || location.href.match( /^http:\/\/archives?\.somethingawful\.com\//i );
            if (samatch) {
               if ( location.href.indexOf("showthread.php?") != -1 ) {
                  reanchorThreadToLink(doc);
               }
            }
         }
         return;
      }
   }
   catch (ex) { }
}

var SALR_SilenceLoadErrors = false;
var firstLoad = true;
var loadCount = 0;

/*
 *
 *  onload Handler
 *  This function is a clusterfuck of immense proportions.
 *
 */
function salastread_windowOnLoad(e) {
	// This IF statement included to help debugging, change the pref value to disable without restarting FF
	if(Components.classes["@mozilla.org/preferences;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.salastread.").getBoolPref("disabled") == false)
	{
		/*
		alert("e is "+e+"\ne.originalTarget.location.href is "+e.originalTarget.location.href);
		if ( e.originalTarget == "[Object HTMLDocument]" ) {
		   alert("originalTarget is " + e.originalTarget + "\ntypeof = "+typeof(e.originalTarget));
		}
		var doc = window._content.document;
		SALR_UpdateStatusBarIcon();
		*/
		SALR_SilenceLoadErrors = false;

		var doc = e.originalTarget;
		var location = doc.location;
		try {
			if ( location && location.href && !doc.__salastread_processed ) {
				var samatch = location.href.match( /^http:\/\/forums?\.somethingawful\.com\//i );
					samatch = samatch || location.href.match( /^http:\/\/archives?\.somethingawful\.com\//i );
				if (samatch) {
					salastread_addUpdateIcon(doc);
					/*
					Moved below, where it should be
					if (persistObject.getPreference('removeHeaderAndFooter')) {
					   salastread_hidePageHeader(doc);
					}
					*/
				}
			}
		} catch(ex) { }

		if(persistObject._killed == true) {
			if(persistObject._killMessage != "") {
				alert("SA Last Read Message:\n\n" + persistObject._killMessage);
			}

			persistObject._killMessage = "";
			return;
		}

		try {
			loadCount++;
			if (firstLoad) {
				firstLoad = false;
				if(persistObject.getPreference('showSAForumMenu') && persistObject.forumListXml && persistObject.forumListXml != null ) {
					try { buildSAForumMenu(); } catch(e) { alert("buildsaforummenu err:" + e); };
				}

				// DOMContentLoaded test...
				//__TEST__hookupTitleChanged();
				document.getElementById("appcontent").addEventListener("DOMContentLoaded", salastread_windowOnLoad, false);

				//add handler or hide context menu, depending on setting
				if(persistObject.getPreference('enableContextMenu')) {
					document.getElementById("contentAreaContextMenu").addEventListener("popupshowing", SALR_ContextMenuShowing, false);
				} else {
					var cacm = document.getElementById("contentAreaContextMenu");
					var mopt = document.getElementById("salastread-context-menu");
					var moptsep = document.getElementById("salastread-context-menuseparator");

					cacm.removeChild(mopt);
					cacm.removeChild(moptsep);
				}
			}

			if (loadCount == 3) {
				if (needToShowChangeLog == true) {
					needToShowChangeLog = false;
					showChangelogWindow();
				}

				window.removeEventListener('load', salastread_windowOnLoad, true);
				window.addEventListener('load', SALR_windowOnLoadMini, true);
			}

			//var doc = e.originalTarget;
			//var location = doc.location;

			if (doc.__salastread_processed) {
				if(persistObject.getPreference('reanchorThreadOnLoad') ) {
					var samatch = location.href.match( /^http:\/\/forums?\.somethingawful\.com\//i);
						samatch = samatch || location.href.match( /^http:\/\/archives?\.somethingawful\.com\//i);
					if (samatch) {
						if ( location.href.indexOf("showthread.php?") != -1 ) {
							reanchorThreadToLink(doc);
						}
					}
				}
				return;
			}

			if ( location && location.href && !doc.__salastread_processed ) {
				var samatch = location.href.match( /^http:\/\/forums?\.somethingawful\.com\//i);
					samatch = samatch || location.href.match( /^http:\/\/archives?\.somethingawful\.com\//i);
				if (samatch) {
					//            var newPageTimer = persistObject.TimeManager.GetStart();
					//            doc.__SALASTREAD_PAGETIMER = newPageTimer;
					//            thisWindowPageTimers.push(newPageTimer);
					// why the FUCK doesn't this work?
					//doc.addEventListener("unload", function() { alert("a"); doc.__SALASTREAD_PAGETIMER.Finalize(); }, true);
					var hresult = 0;
					if ( location.href.indexOf("forumdisplay.php?") != -1 ) {
						if (doc.getElementById('forum') != null) {
							// Only do if there is a list of posts
							handleForumDisplay(doc);
						}
					} else if ( location.href.indexOf("showthread.php?") != -1) {
					handleShowThread(doc);
					} else if ( location.href.indexOf("newreply.php") != -1) {
						handleNewReply(e);
					} else if ( location.href.indexOf("editpost.php") != -1) {
						handleEditPost(e);
					} else if ( location.href.indexOf("member2.php") != -1 ||
								location.href.indexOf("usercp.php") != -1) {
						handleSubscriptions(doc);
					} else if ( location.href.indexOf("member.php") != -1 &&
								location.href.indexOf("salr_") != -1) {
						SALR_HandleProfileInsertion(e);
					}
					var hcliresult = handleConfigLinkInsertion(e);
					handleBodyClassing(e);
					//salastread_addUpdateIcon(doc);

					doc.__salastread_processed = true;

					// XXX: The unload prevents FF 1.5 from using Quick Back Button.
					//      SALR needs to work with it, but this works to prevent trouble in the meantime.
					if (true) {
						var screl = doc.createElement("SCRIPT");
							screl.setAttribute("language","javascript");
							screl.setAttribute("src","chrome://salastread/content/pageunload.js");
						doc.getElementsByTagName('head')[0].appendChild(screl);

						// Added by duz for testing events
						screl = doc.createElement("SCRIPT");
						screl.setAttribute("language","javascript");
						screl.setAttribute("src","chrome://salastread/content/salrevents.js");
						doc.getElementsByTagName('head')[0].appendChild(screl);
					}
					SALR_IncTimer();
					if(persistObject.getPreference('enableDebugMarkup') ) {
						var dbg = doc.createElement("DIV");
							dbg.innerHTML = SALR_debugLog.join("<br>");
							doc.body.appendChild(dbg);
					}

					if (persistObject.getPreference("removePageTitlePrefix")) {
						var threadtitle = doc.title;
						var titlematch = doc.title.match(/(.*) \- (.*)/);
						if (titlematch) {
							if(titlematch[1].search(/Something/i) > -1) {
								threadtitle = titlematch[2];
							} else {
								threadtitle = titlematch[1];
							}
							doc.title = threadtitle;
						}
					}

					if (persistObject.getPreference('removeHeaderAndFooter')) {
						salastread_hidePageHeader(doc);
					}

					if (persistObject.getPreference('props')) {
						var ssel = doc.createElement("LINK");
							ssel.setAttribute('rel',"STYLESHEET");
							ssel.setAttribute('type',"text/css");
							ssel.setAttribute('href',"chrome://salastread/content/props.css");
							//ssel.setAttribute('href',"file://C|/Documents%20and%20Settings/Tim%20Fries/Desktop/SALastRead/src/jar/content/salastread/props.css");
							//ssel.setAttribute('href','data:text/css,body{background:red;}');
						doc.getElementsByTagName('head')[0].appendChild(ssel);
					}
					//} else {
					//   if ( location.href == "chrome://salastread/content/configuration.html" ) {
					//      doc.persistObject = persistObject;
					//   }
				}
			}
		} catch(ex) {
			if(!e.runSilent || SALR_SilenceLoadErrors) {
				if (typeof(ex) == "object") {
					var errstr = "";
					for ( var tn in ex ) {
						errstr += tn + ": " + ex[tn] + "\n";
					}

					if (!persistObject || !persistObject.getPreference('suppressErrors')) {
						alert("SALastRead application err: "+errstr);
					} else {
						if (!persistObject || !persistObject.getPreference('suppressErrors')) {
							alert("SALastRead application err: "+ex);
						}
					}
				}
			} else {
				throw ex;
			}
		}
		//   cleanupLostPageTimers();
	}
}

function SALR_ShowContextMenuItem(id) {
	var cacm = document.getElementById("contentAreaContextMenu");
	var mopt = document.getElementById("salastread-context-menu");
	var moptsep = document.getElementById("salastread-context-menuseparator");

	cacm.removeChild(mopt);
	cacm.removeChild(moptsep);

	if(persistObject.getPreference('contextMenuOnBottom') ) {
		cacm.appendChild(moptsep);
		cacm.appendChild(mopt);
	} else {
		cacm.insertBefore(moptsep, cacm.firstChild);
		cacm.insertBefore(mopt, moptsep);
	}

	document.getElementById(id).style.display = "-moz-box";
	mopt.style.display = "-moz-box";
	moptsep.style.display = "-moz-box";
}

function SALR_HideContextMenuItems() {
	document.getElementById("salastread-context-menu").style.display = "none";
	document.getElementById("salastread-context-menuseparator").style.display = "none";
	var pu = document.getElementById("salastread-context-menupopup");
	for (var i=0; i < pu.childNodes.length; i++) {
		pu.childNodes[i].style.display = "none";
		pu.childNodes[i].data = "";
	}
}

function SALR_ContextMenuShowing(e) {
	if(e.originalTarget == document.getElementById("contentAreaContextMenu")) {
		SALR_HideContextMenuItems();
		try {
			var doc = document.getElementById("content").mCurrentBrowser.contentDocument;
			if(doc.__salastread_processed == true) {
				SALR_ContextVis_IgnoreThisThread(doc);
				SALR_ContextVis_StarThisThread(doc);
			}
		} catch (e) {}
	}
}

function SALR_ContextVis_IgnoreThisThread(doc) {
	var target = gContextMenu.target;
	var threadid = null;
	while (target) {
		if (target.className) {
			var tidmatch = target.className.match(/salastread_thread_(\d+)/);
			if (tidmatch) {
				threadid = tidmatch[1];

				SALR_ShowContextMenuItem("salastread-context-ignorethread");
				document.getElementById("salastread-context-ignorethread").data = threadid;
				document.getElementById("salastread-context-ignorethread").lpdtvalue = target.lpdtvalue;
				document.getElementById("salastread-context-ignorethread").target = target;
				document.getElementById("salastread-context-ignorethread").label = "Ignore This Thread (" + threadid + ")";
			}
		}

		target = target.parentNode;
	}
}

function SALR_ContextVis_StarThisThread(doc) {
	var target = gContextMenu.target;
	var threadid = null;
	while (target) {
		if (target.className) {
			var tidmatch = target.className.match(/salastread_thread_(\d+)/);
			if (tidmatch) {
				threadid = tidmatch[1];
				SALR_ShowContextMenuItem("salastread-context-starthread");
				document.getElementById("salastread-context-starthread").data = threadid;
				document.getElementById("salastread-context-starthread").lpdtvalue = target.lpdtvalue;
				document.getElementById("salastread-context-starthread").target = target;

				document.getElementById("salastread-context-starthread").label = (persistObject.isThreadStarred(threadid) ? 'Unstar' : 'Star') + " This Thread (" + threadid + ")";
			}
		}
		target = target.parentNode;
	}
}

function SALR_StarThread()
{
	var threadid = document.getElementById("salastread-context-starthread").data;
	var lpdtvalue = document.getElementById("salastread-context-starthread").lpdtvalue;
	var target = document.getElementById("salastread-context-starthread").target;
	if (threadid)
	{
		var starStatus = persistObject.isThreadStarred(threadid);
		persistObject.toggleThreadStar(threadid);
		
		if (target.ownerDocument.location.href.search(/showthread.php/i) == -1)
		{
			target.ownerDocument.location = target.ownerDocument.location;
		}
		else
		{
			var startext = starStatus ? "unstarred" : "starred";
			alert("This thread is now " + startext + ".");
		}
	}
}

function SALR_IgnoreThread()
{
	var threadid = document.getElementById("salastread-context-ignorethread").data;
	var lpdtvalue = document.getElementById("salastread-context-ignorethread").lpdtvalue;
	var target = document.getElementById("salastread-context-ignorethread").target;
	if (threadid)
	{
		if (confirm("Are you sure you want to ignore thread #"+threadid+"?"))
		{
			var ignoreStatus = persistObject.isThreadIgnored(threadid);
			persistObject.toggleThreadIgnore(threadid);
			if (target.ownerDocument.location.href.search(/showthread.php/i) == -1)
			{
				target.parentNode.removeChild(target);
			}
		}
	}
}

function SALR_ThreadWatch() {
   window.open("chrome://salastread/content/threadwatch/threadwatch.xul", "_blank",
               "chrome, centerscreen, titlebar, resizable");
}

function showChangelogWindow() {
	openDialog("chrome://salastread/content/newfeatures/newfeatures.xul", "SALR_newfeatures", "chrome,centerscreen,dialog=no");
}

var killcheckxmlhttp;

function saLastReadKillCheck() {
   persistObject._killChecked = true;
   if ( persistObject.getPreference('dontCheckKillSwitch') ) {
      return;
   }
   killcheckxmlhttp = new XMLHttpRequest();
   killcheckxmlhttp.open("GET","http://static.evercrest.com/www/images2/ext/sa/salastread-kill.xml",true);
   killcheckxmlhttp.onreadystatechange = function() {
      try {
         if (killcheckxmlhttp.readyState==2) {
            if (killcheckxmlhttp.status != 200) {
               //alert("aborting ks xml");
               killcheckxmlhttp.abort();
            }
         }
         else if (killcheckxmlhttp.readyState==4) {
            //alert("processing ks xml ("+killcheckxmlhttp.responseText+")...");
            var xdoc = killcheckxmlhttp.responseXML;
            if ( xdoc!=null ) {
               var xel = xdoc.documentElement;
               if ( xel!=null ) {
                  var before = xel.getAttribute("before");
                  if ( Number(before) > 1912 ) {
                     persistObject._killed = true;
                     persistObject._killMessage = "Please upgrade to a newer version of the SA Last Read extension.\n"+
                                                  "The version you have installed is "+
                                                  "out of date and has been disabled for this browser session.";
                  }
                  for (var x=0; x<xel.childNodes.length; x++) {
                     var thischild = xel.childNodes[x];
                     if (thischild.nodeName == "dev" ) {
                        var currentver = thischild.getAttribute("current");
                        var updateurl = thischild.getAttribute("url");
                        if ( Number(currentver) > 1912 ) {
                           persistObject._updateURL = updateurl;
                        }
                     }
                  }
                  //DELETEME -- Uncomment this to force a killed version
                  //persistObject._killed = true;
                  //persistObject._killMessage = "This should never be released.";
                  return;
               }
            }
            //persistObject._killed = true;
            //persistObject._killMessage = "Failed to get kill switch XML.";
         }
      }
      catch (e) {
         //alert("SALastRead Kill Switch Check Error: "+e);
      }
   };
   killcheckxmlhttp.send(null);
}

try {
	persistObject = Components.classes["@evercrest.com/salastread/persist-object;1"]
					.createInstance(Components.interfaces.nsISupports);
	persistObject = persistObject.wrappedJSObject;
	if(!persistObject) {
		throw "Failed to create persistObject.";
	}

	if(!persistObject._syncTransferObject) {
		persistObject.SetSyncTransferObject(new SALR_FTPTransferObject());
	}

	var isWindows = (navigator.platform.indexOf("Win")!=-1);
	persistObject.ProfileInit(isWindows);

	if(persistObject._starterr) {
		alert( "SALR Startup Error:\n\n"+persistObject._starterr );
	}

	setInterval(SALR_TimerTick, 1000);
	setInterval(function(){SALR_SyncTick(false, false);}, 60 * 1000);
	setTimeout(function(){SALR_SyncTick(false, false);}, 10);
	persistObject._PNGCreator = new PNGMaker();

	if(persistObject._killChecked == false) {
		saLastReadKillCheck();
	}

	if(persistObject && persistObject.LastRunVersion != persistObject.SALRversion) {
		needToShowChangeLog = !persistObject.IsDevelopmentRelease;
		// Here we have to put special cases for specific dev build numbers that require the changelog dialog to appear
		var buildNum = parseInt(persistObject.LastRunVersion.match(/^(\d+)\.(\d+)\.(\d+)$/)[3], 10);
		if (buildNum <= 70418) { // Put the latest build number to need an SQL patch here
			needToShowChangeLog = true;
		}
	}

	if(typeof(persistObject.xmlDoc) != "undefined") {
		window.addEventListener('load', salastread_windowOnLoad, true);
		window.addEventListener('beforeunload', salastread_windowOnBeforeUnload, true);
		window.addEventListener('unload', salastread_windowOnUnload, true);
	} else {
		alert("persistObject._starterr =\n" + persistObject._starterr);
	}
} catch (e) {
	alert("SALastRead init error: "+e);

	if(persistObject) {
		alert("persistObject._starterr =\n" + persistObject._starterr);
	}
}