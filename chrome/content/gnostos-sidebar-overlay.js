var gnostos = { 
	mSideBar: null,
	mDocumentElement: null,
	mEmailAddress: null,
	mDisplayName: null,
}

gnostos.onMessagePaneLoad = function()
{
	var expandedfromBox = document.getElementById('expandedfromBox');
	var emailAddresses = expandedfromBox.emailAddresses;
	var firstChild = emailAddresses.firstChild;
	
	if(firstChild)
		gnostos.mEmailAddress = firstChild.getAttribute("emailAddress");

	if(firstChild)
		gnostos.mDisplayName = firstChild.getAttribute("displayName");
	
	gDebugger.log("emailAddress=" + gnostos.mEmailAddress);
	gDebugger.log("displayName=" + gnostos.mDisplayName);

	gnostos.mSideBar = document.getElementById (gConstants.gnostosSideBarId);
	gnostos.mSideBar.width = gConstants.sidebarWidth;
	gnostos.mSideBar.maxwidth = window.innerWidth / 4;

	var gnostosSidebarSplitter = document.getElementById (gConstants.gnostosSideBarSplitterId);

	var msgHeaderView = document.getElementById('msgHeaderView');
	if(msgHeaderView.collapsed == true)
	{
		gnostosSidebarSplitter.collapsed = true;
		gnostos.mSideBar.collapsed = true;
	}
	else
	{
		gnostos.mSideBar.collapsed = false;
		gnostosSidebarSplitter.collapsed = false;
	}

	if(gnostos.mSideBar)
	{		
		gnostos.mDocumentElement = gnostos.mSideBar.contentDocument.documentElement;
		gnostos.mDocumentElement.innerHTML = "<head><title></title></head><body>Loading</body>";
		gDebugger.log(gnostos.mDocumentElement.innerHTML);
		if (window.XMLHttpRequest)
		{
			var xmlhttp=new XMLHttpRequest();
			xmlhttp.open("GET","http://friendfeed.com/api/feed/user?emails="+gnostos.mEmailAddress+"&format=xml&num=2",true);
			xmlhttp.onprogress = gnostos.onXHRProgress;
			xmlhttp.onload = gnostos.onXHRLoad;
			xmlhttp.onerror = gnostos.onXHRError;
			xmlhttp.onreadystatechange = gnostos.onXHRReadyStateChange;
			xmlhttp.send();
		}
		//gnostosSideBar.setAttribute('src', "http://friendfeed.com/api/feed/user?emails="+emailAddress+"&format=xml&num=2");
	}
}

gnostos.onXHRProgress = function(e)
{
	var percentComplete = (e.position / e.totalSize)*100;
	gDebugger.log("Progress: " + percentComplete);
	if(percentComplete / 33 == 1)
		gnostos.mDocumentElement.innerHTML = "<head><title></title></head><body>Loading.</body>";
	else if(percentComplete / 33 == 2)
		gnostos.mDocumentElement.innerHTML = "<head><title></title></head><body>Loading..</body>";
	else if(percentComplete / 33 == 3)
		gnostos.mDocumentElement.innerHTML = "<head><title></title></head><body>Loading...</body>";
}

gnostos.onXHRLoad = function(e)
{
	 gDebugger.log(this.responseText);
	 gnostos.mDocumentElement.innerHTML = "<head><title></title></head><body>";
	 //gDebugger.log(this.responseXML);
	 var xmlDoc = this.responseXML;
	 var titleElements = xmlDoc.getElementsByTagName("title");
	 
	 for(var i = 0; i < titleElements.length; ++i)
		 gnostos.mDocumentElement.innerHTML += titleElements[i].childNodes[0].nodeValue;
	 
	 gnostos.mDocumentElement.innerHTML += "</body>";
	 gDebugger.log(gnostos.mDocumentElement.innerHTML);
}

gnostos.onXHRError = function(e)
{
	gDebugger.log("XHR ERROR!! " + e.target.status);
}

gnostos.onReadyStateChange = function()
{
	gDebugger.log(this.readyState);
	 if(this.readyState == 4) {
	 }
}

var messagepane = document.getElementById("messagepane");
messagepane.addEventListener("load", gnostos.onMessagePaneLoad, true);
