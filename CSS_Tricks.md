# Introduction #

Here's some CSS you can add to your userContent.css file in order to get the most out of the forums when using SALR.


# Details #


**Hide edit buttons for posts that are not yours**
```
.somethingawfulforum_showthread_php img[src="http://fi.somethingawful.com/images/sa-edit.gif"], 
.somethingawfulforum_showthread_php img[src="chrome://salastread/content/button-quickedit.png"],
.somethingawfulforum_showthread_php img[src="chrome://salastread/content/button-normaledit.png"] {
  display: none !important;
}

.somethingawfulforum_postby_USERNAME img[src="http://fi.somethingawful.com/images/sa-edit.gif"], 
.somethingawfulforum_postby_USERNAME img[src="chrome://salastread/content/button-quickedit.png"],
.somethingawfulforum_postby_USERNAME img[src="chrome://salastread/content/button-normaledit.png"] {
  display: inline !important;
}
```

**Remove report and quote buttons from your own posts**
```
.somethingawfulforum_postby_USERNAME img[src="http://fi.somethingawful.com/images/button-report.gif"],
.somethingawfulforum_postby_USERNAME img[src="http://forumimages.somethingawful.com/images/button-report.gif"],
.somethingawfulforum_postby_USERNAME img[src="chrome://salastread/content/button-quickquote.png"],
.somethingawfulforum_postby_USERNAME img[src="chrome://salastread/content/button-normalquote.png"],
.somethingawfulforum_showthread_php img[src="http://fi.somethingawful.com/images/forum-post.gif"] ,
.somethingawfulforum_showthread_php img[src="http://forumimages.somethingawful.com/images/forum-post.gif"],
.somethingawfulforum_showthread_php img[src="chrome://salastread/content/button-normalpost.png"],
.somethingawfulforum_showthread_php img[src="chrome://salastread/content/button-quickpost.png"] {
  display: none !important;
}
```

**Highlight OP's entire post, instead of just their name**
```
.somethingawfulforum_postbyOP td {
	background-color: #fdd !important;
}
```

