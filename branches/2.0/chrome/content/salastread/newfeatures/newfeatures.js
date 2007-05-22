// <script>
var persistObject = Components.classes["@evercrest.com/salastread/persist-object;1"]
	.createInstance(Components.interfaces.nsISupports);
persistObject = persistObject.wrappedJSObject;

function windowLoad()
{
	var currentVersion = persistObject.SALRversion;
	var currentBuild = parseInt(currentVersion.match(/^(\d+)\.(\d+)\.(\d+)$/)[3], 10);
	var oldVersion = persistObject.LastRunVersion;
	persistObject.LastRunVersion = persistObject.SALRversion;
	if (oldVersion == "0.0.0") // This is their first time running it
	{
		return;
	}
	var oldBuild = parseInt(oldVersion.match(/^(\d+)\.(\d+)\.(\d+)$/)[3], 10);
	if (oldVersion < "1.99") // When the 2.0 rewrite started
	{
		importOldData();
	}
	checkForSQLPatches(oldBuild);
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

// Use this function to apply any needed SQL schema updates and similar changes
function checkForSQLPatches(build)
{
	var statement;
	if (build < 70414)
	{
		// Userdata schema changed, let's test to make sure it needs to be changed, just incase
		statement = persistObject.database.createStatement("SELECT * FROM `userdata` WHERE 1=1");
		statement.executeStep();
		if (statement.getColumnName(4) != 'color')
		{
			statement.reset();
			persistObject.database.executeSimpleSQL("ALTER TABLE `userdata` ADD `color` VARCHAR(8)");
			persistObject.database.executeSimpleSQL("ALTER TABLE `userdata` ADD `background` VARCHAR(8)");
		}
	}
	if (build < 70418)
	{
		// Not setting a default value makes things harder so let's fix that
		statement = persistObject.database.executeSimpleSQL("UPDATE `threaddata` SET `star` = 0 WHERE `star` IS NULL");
		statement = persistObject.database.executeSimpleSQL("UPDATE `threaddata` SET `ignore` = 0 WHERE `ignore` IS NULL");
		statement = persistObject.database.executeSimpleSQL("UPDATE `threaddata` SET `posted` = 0 WHERE `posted` IS NULL");
		statement = persistObject.database.executeSimpleSQL("UPDATE `userdata` SET `color` = 0 WHERE `color` IS NULL");
		statement = persistObject.database.executeSimpleSQL("UPDATE `userdata` SET `background` = 0 WHERE `background` IS NULL");
	}
}

// Convert the old 1.0 preferences and thread data to the new 2.0 format
function importOldData()
{
	persistObject.setPreference("postedInThreadRe", persistObject.pref.getCharPref("salastread.color.postedInThreadRe"));
	persistObject.setPreference("readDark", persistObject.pref.getCharPref("salastread.color.readDark"));
	persistObject.setPreference("readLight", persistObject.pref.getCharPref("salastread.color.readLight"));
	persistObject.setPreference("readWithNewDark", persistObject.pref.getCharPref("salastread.color.readWithNewDark"));
	persistObject.setPreference("readWithNewLight", persistObject.pref.getCharPref("salastread.color.readWithNewLight"));
	persistObject.setPreference("seenPostDark", persistObject.pref.getCharPref("salastread.color.seenPostDark"));
	persistObject.setPreference("seenPostDarkFYAD", persistObject.pref.getCharPref("salastread.color.seenPostDarkFYAD"));
	persistObject.setPreference("seenPostLight", persistObject.pref.getCharPref("salastread.color.seenPostLight"));
	persistObject.setPreference("seenPostLightFYAD", persistObject.pref.getCharPref("salastread.color.seenPostLightFYAD"));
	persistObject.setPreference("unreadDark", persistObject.pref.getCharPref("salastread.color.unreadDark"));
	persistObject.setPreference("unreadDarkFYAD", persistObject.pref.getCharPref("salastread.color.unreadDarkFYAD"));
	persistObject.setPreference("unreadLight", persistObject.pref.getCharPref("salastread.color.unreadLight"));
	persistObject.setPreference("unreadLightFYAD", persistObject.pref.getCharPref("salastread.color.unreadLightFYAD"));
	persistObject.setPreference("unseenPostDark", persistObject.pref.getCharPref("salastread.color.unseenPostDark"));
	persistObject.setPreference("unseenPostDarkFYAD", persistObject.pref.getCharPref("salastread.color.unseenPostDarkFYAD"));
	persistObject.setPreference("unseenPostLight", persistObject.pref.getCharPref("salastread.color.unseenPostLight"));
	persistObject.setPreference("unseenPostLightFYAD", persistObject.pref.getCharPref("salastread.color.unseenPostLightFYAD"));
	persistObject.setPreference("expireMinAge", persistObject.pref.getIntPref("salastread.int.expireMinAge"));
	persistObject.setPreference("gestureButton", persistObject.pref.getIntPref("salastread.int.gestureButton"));
	persistObject.setPreference("timeSpentOnForums", persistObject.pref.getIntPref("salastread.int.timeSpentOnForums"));
	persistObject.setPreference("forumListStoragePath", persistObject.pref.getCharPref("salastread.string.forumListStoragePath"));
	persistObject.setPreference("menuPinnedForums", persistObject.pref.getCharPref("salastread.string.menuPinnedForums"));
	persistObject.setPreference("persistStoragePath", persistObject.pref.getCharPref("salastread.string.persistStoragePath"));
	persistObject.setPreference("remoteSyncStorageUrl", persistObject.pref.getCharPref("salastread.string.remoteSyncStorageUrl"));
	persistObject.setPreference("threadIconOrder", persistObject.pref.getCharPref("salastread.string.threadIconOrder"));
	persistObject.setPreference("alwaysShowGoToLastIcon", persistObject.pref.getBoolPref("salastread.toggle.alwaysShowGoToLastIcon"));
	persistObject.setPreference("contextMenuOnBottom", persistObject.pref.getBoolPref("salastread.toggle.contextMenuOnBottom"));
	persistObject.setPreference("convertTextToImage", persistObject.pref.getBoolPref("salastread.toggle.convertTextToImage"));
	persistObject.setPreference("disableGradients", persistObject.pref.getBoolPref("salastread.toggle.disableGradients"));
	persistObject.setPreference("dontHighlightPosts", persistObject.pref.getBoolPref("salastread.toggle.dontHighlightPosts"));
	persistObject.setPreference("dontHighlightThreads", persistObject.pref.getBoolPref("salastread.toggle.dontHighlightThreads"));
	persistObject.setPreference("dontTextToImageIfMayBeNws", persistObject.pref.getBoolPref("salastread.toggle.dontTextToImageIfMayBeNws"));
	persistObject.setPreference("dontTextToImageInSpoilers", persistObject.pref.getBoolPref("salastread.toggle.dontTextToImageInSpoilers"));
	persistObject.setPreference("enableDebugMarkup", persistObject.pref.getBoolPref("salastread.toggle.enableDebugMarkup"));
	persistObject.setPreference("enableForumNavigator", persistObject.pref.getBoolPref("salastread.toggle.enableForumNavigator"));
	persistObject.setPreference("enablePageNavigator", persistObject.pref.getBoolPref("salastread.toggle.enablePageNavigator"));
	persistObject.setPreference("gestureEnable", persistObject.pref.getBoolPref("salastread.toggle.gestureEnable"));
	persistObject.setPreference("hideOtherSAMenus", persistObject.pref.getBoolPref("salastread.toggle.hideOtherSAMenus"));
	persistObject.setPreference("insertPostLastMarkLink", persistObject.pref.getBoolPref("salastread.toggle.insertPostLastMarkLink"));
	persistObject.setPreference("insertPostTargetLink", persistObject.pref.getBoolPref("salastread.toggle.insertPostTargetLink"));
	persistObject.setPreference("nestSAForumMenu", persistObject.pref.getBoolPref("salastread.toggle.nestSAForumMenu"));
	persistObject.setPreference("highlightUsernames", persistObject.pref.getBoolPref("salastread.toggle.props"));
	persistObject.setPreference("quickQuoteDisableSmiliesDefault", persistObject.pref.getBoolPref("salastread.toggle.quickQuoteDisableSmiliesDefault"));
	persistObject.setPreference("quickQuoteImagesAsLinks", persistObject.pref.getBoolPref("salastread.toggle.quickQuoteImagesAsLinks"));
	persistObject.setPreference("quickQuoteLivePreview", persistObject.pref.getBoolPref("salastread.toggle.quickQuoteLivePreview"));
	persistObject.setPreference("quickQuoteSignatureDefault", persistObject.pref.getBoolPref("salastread.toggle.quickQuoteSignatureDefault"));
	persistObject.setPreference("quickQuoteSubscribeDefault", persistObject.pref.getBoolPref("salastread.toggle.quickQuoteSubscribeDefault"));
	persistObject.setPreference("quickQuoteSwapPostPreview", persistObject.pref.getBoolPref("salastread.toggle.quickQuoteSwapPostPreview"));
	persistObject.setPreference("reanchorThreadOnLoad", persistObject.pref.getBoolPref("salastread.toggle.reanchorThreadOnLoad"));
	persistObject.setPreference("removeHeaderAndFooter", persistObject.pref.getBoolPref("salastread.toggle.removeHeaderAndFooter"));
	persistObject.setPreference("removePageTitlePrefix", persistObject.pref.getBoolPref("salastread.toggle.removePageTitlePrefix"));
	persistObject.setPreference("resizeCustomTitleText", persistObject.pref.getBoolPref("salastread.toggle.resizeCustomTitleText"));
	persistObject.setPreference("scrollPostEnable", persistObject.pref.getBoolPref("salastread.toggle.scrollPostEnable"));
	persistObject.setPreference("showGoToLastIcon", persistObject.pref.getBoolPref("salastread.toggle.showGoToLastIcon"));
	persistObject.setPreference("showMenuPinHelper", persistObject.pref.getBoolPref("salastread.toggle.showMenuPinHelper"));
	persistObject.setPreference("showSAForumMenu", persistObject.pref.getBoolPref("salastread.toggle.showSAForumMenu"));
	persistObject.setPreference("showUnvisitIcon", persistObject.pref.getBoolPref("salastread.toggle.showUnvisitIcon"));
	persistObject.setPreference("shrinkTextToImages", persistObject.pref.getBoolPref("salastread.toggle.shrinkTextToImages"));
	persistObject.setPreference("suppressErrors", persistObject.pref.getBoolPref("salastread.toggle.suppressErrors"));
	persistObject.setPreference("thumbnailAllImages", persistObject.pref.getBoolPref("salastread.toggle.thumbnailAllImages"));
	persistObject.setPreference("thumbnailQuotedImagesInThreads", persistObject.pref.getBoolPref("salastread.toggle.thumbnailQuotedImagesInThreads"));
	persistObject.setPreference("useQuickQuote", persistObject.pref.getBoolPref("salastread.toggle.useQuickQuote"));
	persistObject.setPreference("useRemoteSyncStorage", persistObject.pref.getBoolPref("salastread.toggle.useRemoteSyncStorage"));
	persistObject.setPreference("useSAForumMenuBackground", persistObject.pref.getBoolPref("salastread.toggle.useSAForumMenuBackground"));
	persistObject.pref.deleteBranch("salastread.color");
}