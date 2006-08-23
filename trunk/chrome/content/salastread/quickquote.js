var persistObject = Components.classes["@evercrest.com/salastread/persist-object;1"]
                      .createInstance(Components.interfaces.nsISupports).wrappedJSObject;

var hasSpellCheck = false;

var attachedFileName = "";

var imageShackResult = null;
var isDetached = false;

var quoteWaitString = "[[ Please wait, retrieving post quote... ]]";

function detachFromDocument() {
   isDetached = true;
   document.getElementById("submit-swap").disabled = true;
   document.getElementById("submit-normal").disabled = true;
   document.getElementById("previewbtn").disabled = true;
   document.getElementById("submit-swap").setAttribute("label","Detached");
   document.getElementById("submit-normal").setAttribute("label","Detached");
}

function doWaffleImages() {
   imageShackResult = null;
   openDialog("chrome://salastread/content/waffleimages/waffleimages.xul", "_blank",
                               "chrome, titlebar, modal");
   if (imageShackResult) {
      insertTextAtCursor(imageShackResult);
   }
}

function recoverLastPost() {
   if ( persistObject.__quickreply__lastpost ) {
      var res = confirm("Do you want to replace the contents of this Quick Reply "+
         "window with the text of the last reply you attempted to submit? "+
         "The text of the current reply will be lost.");
      if ( res ) {
         document.getElementById("messagearea").value = persistObject.__quickreply__lastpost;
      }
   } else {
      alert("There is no last post to recover.");
   }
}

function checkKeys(e) {
   if ( e.ctrlKey ) {
      if ( (e.charCode==119 || e.charCode==87) ) {   // "w"
         releaseVars();
         window.close();
      }
   }
}

function addQuoteText(txt) {
   //if (txt=="") {
   //}
   document.getElementById("messagearea").value += "\n" + txt;
}

function grabComplete() {
   alert("got it");
}

//var emotRe = /^.*?<tr align="center">.*?<td.*?size="2">(.*?)<\/font><\/td>.*?<td.*?<\/td>.*?<td.*?><img src="(.*?)".*?<\/tr>(.*)$/i;
var emotRe = /<tr.*?<\/tr>(.*)$/i;

function getEmoticonsFromServer() {
   try {
      var xht = new XMLHttpRequest();
      xht.open("GET", "http://forums.somethingawful.com/misc.php?s=&action=showsmilies", false);
      xht.send(null);
      var restext = xht.responseText;
      restext = restext.substring( restext.indexOf("Graphic That Will Appear")+30 );
      restext = restext.substring(0, restext.indexOf("</table>"));
      restext = restext.replace(/[\n\r]/g,"");

      //document.getElementById("messagearea").value = restext; //return;
      
      //var emots = "Emoticons:\n";
      persistObject.emoticons = new Array();
      var minfo = restext.match(emotRe);
      while ( restext.indexOf("</tr>")!=-1 ) {
         var thisrow = restext.substring(0, restext.indexOf("</tr>"));
         thisrow = thisrow.substring( thisrow.indexOf("size=\"2\">")+9 );
         var emotcode = thisrow.substring(0, thisrow.indexOf("</"));
         thisrow = thisrow.substring( thisrow.indexOf("</td>")+5 );
         thisrow = thisrow.substring( thisrow.indexOf("src=\"")+5 );
         var emoturl = thisrow.substring(0, thisrow.indexOf("\""));
         persistObject.emoticons.push( new Array(emotcode, emoturl) );
         restext = restext.substring(restext.indexOf("</tr>")+5);
         //emots += emotcode+" "+emoturl+"\n";
         //minfo = restext.match(emotRe);
      }
      //alert(emots);
      //alert("done");
   }
   catch (e) {
      alert("getEmoticonsFromServer() error:\n" + e);
      persistObject.emoticons = null;
   }
}

var pageGetter = null;
var getter_isquote = 0;
var getter_getFormKeyOnly = true;

var sa_formkey = (persistObject.__cachedFormKey && persistObject.__cachedFormKey!="") ? persistObject.__cachedFormKey : "";

function showDebugData(event) {
   if (event.button == 2) {
      alert("threadid = "+window.opener.__salastread_quotethreadid+"\nformkey = "+ sa_formkey);
   }
}

function startPostTextGrab(getFormKeyOnly, postid) {
   pageGetter = new XMLHttpRequest();
   getter_isquote = 1;
   getter_getFormKeyOnly = getFormKeyOnly;
   if (!postid) {
      postid = window.opener.__salastread_quotepostid;
   }
   var targeturl = "http://forums.somethingawful.com/newreply.php?s=&action=newreply&postid=" + postid;
   if ( postid==null ) {
      getter_isquote = 0;
      targeturl = "http://forums.somethingawful.com/newreply.php?s=&action=newreply&threadid=" + window.opener.__salastread_quotethreadid;
   }
   //alert("targeturl = "+targeturl);
   pageGetter.open("GET", targeturl, true);
   pageGetter.onreadystatechange = postTextGrabCallback;
   pageGetter.send(null);
}

function postTextGrabCallback() {
   try {
      if (pageGetter.readyState==2) {
         if (pageGetter.status != 200) {
            alert("Failed to communicate with forums.somethingawful.com");
            pageGetter.abort();
         }
      }
      else if (pageGetter.readyState==4) {
         var respText = pageGetter.responseText;
         finalizeTextGrab(respText);
      }
   }
   catch (ex) {
   }
}

function __old__() {
   //try{
   var isquote = 1
   var targeturl = "http://forums.somethingawful.com/newreply.php?s=&action=newreply&postid=" + window.opener.__salastread_quotepostid;
   if ( window.opener.__salastread_quotepostid==null ) {
      //alert("isquote = 0");
      isquote = 0;
      targeturl = "http://forums.somethingawful.com/newreply.php?s=&action=newreply&threadid=" + window.opener.__salastread_quotethreadid;
   }
   var xht = new XMLHttpRequest();
   xht.open("GET", targeturl, false);
   xht.send(null);
   var restext = xht.responseText;
   var fkeygettext = xht.responseText;
}

function getQuoteIntroText() {
   var astr = persistObject.string_quoteIntroText;
   if ( astr.indexOf("|")!=-1 ) {
      var qits = astr.split("|");
      var qnum = Math.floor( Math.random() * qits.length );
      return qits[qnum];
   } else {
      return astr;
   }
}

function replaceQuoteIntroText(restext,postid) {
/*
   if ( restext.match(/had this to say about the Jewish conspiracy:/) ) {
      var qumatch = restext.match(/\[QUOTE\]\[i\](.*?) had this to say about the Jewish conspiracy:/);
      if (qumatch) {
         var xstr = getQuoteIntroText();
         xstr = xstr.replace(/\[who\]/g, qumatch[1]);
         return restext.replace("[QUOTE][i]"+qumatch[1]+" had this to say about the Jewish conspiracy:",
                   "[QUOTE][i][PL="+postid+"]"+xstr+"[/PL]");
      }
   } else {
      var qumatch = restext.match(/\[QUOTE\]\[i\](.*?) came out of the closet to say: /);
      if (qumatch) {
         var xstr = getQuoteIntroText();
         xstr = xstr.replace(/\[who\]/g, qumatch[1]);
         return restext.replace("[QUOTE][i]"+qumatch[1]+" came out of the closet to say: ",
                   "[QUOTE][i][PL="+postid+"]"+xstr+"[/PL]");
      }
   }
*/

   var re = new RegExp("^\\[quote=(.+)\\]$", "m");
   var qm = restext.match(re);
   if (qm) {
      var qwho = qm[1];
      qwho = qwho.replace("&", "&amp;");
      qwho = qwho.replace("[", "&#91;");
      qwho = qwho.replace("]", "&#93;");
      qwho = qwho.replace("\"", "&quot;");
      qwho = qwho.replace("'", "&#39;");
      qwho = qwho.replace("<", "&lt;");
      qwho = qwho.replace(">", "&gt;");
      restext = restext.replace(re, "[quote="+qwho+"]");
   }
   return restext;
}

function finalizeTextGrab(restext) {

	var before = document.getElementById("messagearea").value
	before = before.replace(quoteWaitString, "");

   var el = document.getElementById("replypage").contentDocument.body;
   el.innerHTML = restext;
   var tnode = selectSingleNode(document.getElementById("replypage").contentDocument, el, "//TEXTAREA[@name='message']");
   document.getElementById("messagearea").value = before +  tnode.value;

   var fknode = selectSingleNode(document.getElementById("replypage").contentDocument, el, "//INPUT[@name='formkey']");
   sa_formkey = fknode.value;
   persistObject.__cachedFormKey = sa_formkey;

   if (!isDetached) {
      document.getElementById("submit-swap").disabled = false;
      document.getElementById("submit-normal").disabled = false;
   }
   
   return; 


   var fkeygettext = restext;
   if (getter_isquote==1 && getter_getFormKeyOnly==false) {
      // Why doesn't this work? :(
      //var tamatch = restext.match(/<textarea.*?>(.*?)<\/textarea>/mi)[1];
      restext = restext.substring( restext.indexOf("<textarea")+1 );
      restext = restext.substring( restext.indexOf(">")+1 );
      restext = restext.substring( 0, restext.indexOf("</textarea") );
      restext = restext.replace(/&lt;/ig,"<");
      restext = restext.replace(/&gt;/ig,">");
      restext = restext.replace(/&quot;/ig,"\"");
      restext = restext.replace(/&amp;/ig,"&");
      restext = replaceQuoteIntroText(restext, window.opener.__salastread_quotepostid);
/*
      restext = restext.replace("[QUOTE][i]", "[QUOTE][i][PL="+window.opener.__salastread_quotepostid+"]");
      if ( restext.match(/had this to say about the Jewish conspiracy:/) ) {
         restext = restext.replace("had this to say about the Jewish conspiracy:[/i]", "had this to say about the Jewish conspiracy:[/PL][/i]");
      } else {
         restext = restext.replace("of the closet to say: [/i]", "of the closet to say:[/PL][/i]");
      }
*/
      if ( persistObject.toggle_quickQuoteImagesAsLinks ) {
         restext = restext.replace(/\[IMG\](.*?)\[\/IMG\]/ig,"[URL=$1][image][/URL]");
      }

      var tstr = document.getElementById("messagearea").value;
      tstr = tstr.replace(quoteWaitString, restext+"\n\n");
      document.getElementById("messagearea").value = tstr;
   } else {
      if (getter_getFormKeyOnly==false) {
         document.getElementById("messagearea").value = "";
      }
   }

   if ( fkeygettext.indexOf("name=\"formkey\">")!=-1 ) {
      // FYAD's tag looks different *grumble grumble*
      fkeygettext = fkeygettext.substring( fkeygettext.indexOf("name=\"formkey\">")-50 );
   } else {
      fkeygettext = fkeygettext.substring( fkeygettext.indexOf("<input type=\"hidden\" name=\"formkey\" value=\"")+1 );
   }
   fkeygettext = fkeygettext.substring( fkeygettext.indexOf("value=\"")+7 );
   fkeygettext = fkeygettext.substring( 0, fkeygettext.indexOf("\"") );
   //alert(fkeygettext);
  
   sa_formkey = fkeygettext;
   persistObject.__cachedFormKey = sa_formkey;
   if (!isDetached) {
      document.getElementById("submit-swap").disabled = false;
      document.getElementById("submit-normal").disabled = false;
   }

   return;
}

function addQuoteFromPost(postid) {
   var qstr = document.getElementById("messagearea").value;
   qstr = qstr.replace(/[\r\n]*$/, "");
   document.getElementById("messagearea").value = qstr + "\n\n" + quoteWaitString;

   startPostTextGrab(false, postid);
}

function importData() {
   try {
   if ( persistObject.toggle_quickQuoteSwapPostPreview ) {
      document.getElementById("submit-swap").style.display = "-moz-box";
      document.getElementById("submit-normal").style.display = "none";
   } else {
      document.getElementById("submit-normal").style.display = "-moz-box";
      document.getElementById("submit-swap").style.display = "none";
   }
   if ( !window.opener.__salastread_needretrieval ) {
      document.getElementById("messagearea").value = window.opener.__salastread_quotetext;
      if (sa_formkey=="" || !sa_formkey) {
         // Grab the reply page in the background to get the formkey...
         startPostTextGrab(true);
      } else {
         // using cached form key...
         if ( !isDetached ) {
            document.getElementById("submit-swap").disabled = false;
            document.getElementById("submit-normal").disabled = false;
         }
      }
   } else {
      document.getElementById("messagearea").value = quoteWaitString;
      startPostTextGrab(false);
   }

   document.getElementById("messagearea").focus();
   if ( typeof(opener.sbOverlay) != "undefined" ||
        typeof(Components.classes["@mozilla.org/spellbound;1"]) != "undefined") {
      hasSpellCheck = true;
      document.getElementById("spellcheckbutton").style.display = "-moz-box";
   }
   if ( persistObject.toggle_quickQuoteSubscribeDefault ) {
      document.getElementById("subscribe").setAttribute("checked",true);
   }
   if ( persistObject.toggle_quickQuoteDisableSmiliesDefault ) {
      document.getElementById("disablesmilies").setAttribute("checked",true);
   }
   if ( persistObject.toggle_quickQuoteSignatureDefault && !window.opener.__salastread_alreadypostedinthread ) {
      document.getElementById("signature").setAttribute("checked",true);
   }
   }
   catch (e) { alert(e); }
}

function releaseVars() {
   window.opener.releaseQuickQuoteVars();
}

function doSubmit(subtype) {
   persistObject.__quickreply__lastpost = document.getElementById("messagearea").value;
   window.opener.quickQuoteSubmit(
      document.getElementById("messagearea").value,
      document.getElementById("parseurl").checked,
      document.getElementById("subscribe").checked,
      document.getElementById("disablesmilies").checked,
      document.getElementById("signature").checked,
      subtype,
      sa_formkey,
      attachedFileName
   );
}

function performSpellCheck() {
   if (!hasSpellCheck) { alert("SpellBound is not installed."); return; }
   try {
      var ma = document.getElementById("messagearea");
      //alert( ma.nodeName.toLowerCase() );
      var args = [];
      args[0] = ma;
      if (typeof(Components.classes["@mozilla.org/spellbound;1"]) != "undefined") {
         var scheck = ma.value;
         args[0] = scheck;
         var results = [];
         window.openDialog("chrome://spellbound/content/SBSpellCheck.xul",
	     			"_blank", "chrome,close,titlebar,modal,resizable", false, true, true, args, results);
         if ( typeof(results[0]) != "undefined" ) {
            ma.value = results[0];
         }
      } else {
         var savedmatext = ma.value;
         window.openDialog("chrome://spellbound/content/EdSpellCheck.xul",
	     			"_blank", "chrome,close,titlebar,modal,resizable", false, true, true, args);
         if ( ma.value == "undefined" || typeof(ma.value)=="undefined" ) {
            ma.value = savedmatext;
         }
      }
      //opener.sbOverlay.openSpellCheck( document.getElementById("messagearea") );
   }
   catch (e) {
      alert(e);
   }
}

function clearChildrenFrom(xid) {
   var xel = document.getElementById(xid).firstChild;
   while (xel.firstChild!=null) {
      xel.removeChild(xel.firstChild);
   }
}

function getEmoticons() {
   try {
      if ( typeof(persistObject.emoticons)=="undefined" || persistObject.emoticons==null ) {
         //alert("here");
         getEmoticonsFromServer();
      }
      clearChildrenFrom("menu_a");
      clearChildrenFrom("menu_d");
      clearChildrenFrom("menu_g");
      clearChildrenFrom("menu_j");
      clearChildrenFrom("menu_m");
      clearChildrenFrom("menu_p");
      clearChildrenFrom("menu_s");
      clearChildrenFrom("menu_v");
      clearChildrenFrom("menu_y");
      var menu = document.getElementById("emoticonmenu");
      //while (menu.firstChild!=null) {
      //   menu.removeChild(menu.firstChild);
      //}
      for (var i=0; i<persistObject.emoticons.length; i++) {
         var thisemot = persistObject.emoticons[i];
         if (thisemot[0]!=null && thisemot[0].length>0) {
            addMenuItem(menu, thisemot[0], thisemot[1]);
         }
      }
   }
   catch (e) {
      alert(e);
   }
}

function addMenuItem(menu, label, image) {
   var targetid = "menu_y";
   var menuch = label.match(/[a-z]/i);
   if (menuch) {
      var mstr = "ABCabc";
      if ( mstr.indexOf(menuch[0])!= -1 ) { targetid = "menu_a"; }
      mstr = "DEFdef";
      if ( mstr.indexOf(menuch[0])!= -1 ) { targetid = "menu_d"; }
      mstr = "GHIghi";
      if ( mstr.indexOf(menuch[0])!= -1 ) { targetid = "menu_g"; }
      mstr = "JKLjkl";
      if ( mstr.indexOf(menuch[0])!= -1 ) { targetid = "menu_j"; }
      mstr = "MNOmno";
      if ( mstr.indexOf(menuch[0])!= -1 ) { targetid = "menu_m"; }
      mstr = "PQRpqr";
      if ( mstr.indexOf(menuch[0])!= -1 ) { targetid = "menu_p"; }
      mstr = "STUstu";
      if ( mstr.indexOf(menuch[0])!= -1 ) { targetid = "menu_s"; }
      mstr = "VWXvwx";
      if ( mstr.indexOf(menuch[0])!= -1 ) { targetid = "menu_v"; }
      mstr = "YZyz";
      if ( mstr.indexOf(menuch[0])!= -1 ) { targetid = "menu_y"; }
   }

   var newel = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul","menuitem");
   newel.className = "menuitem-iconic";
   newel.setAttribute("label", label);
   newel.setAttribute("image", image);

   //menu.appendChild(newel);
   document.getElementById(targetid).firstChild.appendChild(newel);
   newel.addEventListener("command", function() { selectedEmoticon(label); }, true);
}

function selectedEmoticon(emotlabel) {
   insertTextAtCursor(emotlabel);
}

function insertTextAtCursor(emotlabel) {
   var ebtext = document.getElementById("messagearea").value;
   var selstart = document.getElementById("messagearea").selectionStart;
   var selend = document.getElementById("messagearea").selectionEnd;
   ebtext = ebtext.substring(0,selstart) + emotlabel + ebtext.substring(selend+1);
   document.getElementById("messagearea").focus();
   document.getElementById("messagearea").value = ebtext;
   document.getElementById("messagearea").setSelectionRange(selstart+emotlabel.length, selstart+emotlabel.length);
}

function doAttach() {
   if ( attachedFileName=="" ) {
   var nsIFilePicker = Components.interfaces.nsIFilePicker;
   var fp = Components.classes["@mozilla.org/filepicker;1"]
           .createInstance(nsIFilePicker);
   fp.init(window, "Select an Image to Attach", nsIFilePicker.modeOpen);
   fp.appendFilter("Image Files","*.gif; *.jpg; *.jpeg; *.png"); 
   var res=fp.show();
   if (res==nsIFilePicker.returnOK){
      attachedFileName = fp.file.path;
      document.getElementById("attachbtn").setAttribute("label","Remove");
   }
   } else {
      document.getElementById("attachbtn").setAttribute("label","Attach...");
      attachedFileName = "";
   }
}

function getvBcode(command) {

			//A questo punto widgetTrasferibile contiene il contenuto degli appunti
    
			var str = null;
    
			var theBox = document.getElementById("messagearea");
			var oPosition = theBox.scrollTop;
			var oHeight = theBox.scrollHeight;
    
    
    		//Recupera il testo selezionato e lo memorizza in str
      		var startPos = theBox.selectionStart;
      		var endPos = theBox.selectionEnd;
      		str = theBox.value.substring(startPos, endPos);
						
    		//bbcodextra.insertAtCursorSetup(myCommand, str_clipboard, str, theBox, extraParam);
			var nHeight = theBox.scrollHeight - oHeight;
			theBox.scrollTop = oPosition + nHeight;


		  switch (command) {
        
      		case "img":
        		insertTextAtCursor("[img]" + str + "[/img]");
        	break;

	       	case "urltag":
				var menuch = str.match(/^(http:\/\/)|(https:\/\/)|(ftp:\/\/)/i);
				if(menuch)
				{
					insertTextAtCursor("[url]" + str + "[/url]");
				}
				else 
				{
					var url = prompt('You have selected text that may not be a URL.  Enter a URL to link to with the selected text or press cancel to make the selected text a link.', ' ')
					if(!url)
					{
						insertTextAtCursor("[url]" + str + "[/url]");
					}
					else
					{
						insertTextAtCursor("[url=" + url + "]" + str + "[/url]");
					}
				}
        	break;  

      		case "bold":
        		insertTextAtCursor("[b]" + str + "[/b]");
        	break;

			case "code":
        		insertTextAtCursor("[code]" + str + "[/code]");
        	break;

			case "quote":
        		insertTextAtCursor("[quote]" + str + "[/quote]");
        	break;

      		case "italic":
        		insertTextAtCursor("[i]" + str + "[/i]");
        	break;
        
      		case "underline":
        		insertTextAtCursor("[u]" + str + "[/u]");
        	break;

			case "strike":
        		insertTextAtCursor("[s]" + str + "[/s]");
        	break;

			case "sub":
        		insertTextAtCursor("[sub]" + str + "[/sub]");
        	break;

			case "sub":
        		insertTextAtCursor("[super]" + str + "[/super]");
        	break;
						
      		default : alert("Nessuna opzione selezionata!");
		  }//end switch		
}