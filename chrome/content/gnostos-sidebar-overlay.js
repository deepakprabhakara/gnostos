var gnostos = { }

gnostos.onMessagePaneLoad = function()
{
	var expandedfromBox = document.getElementById('expandedfromBox');
	var emailAddresses = expandedfromBox.emailAddresses;
	var firstChild = emailAddresses.firstChild;
	
	var emailAddress = null;
	if(firstChild)
		emailAddress = firstChild.getAttribute("emailAddress");

	var displayName = null;
	if(firstChild)
		displayName = firstChild.getAttribute("displayName");
	
	gDebugger.log("emailAddress=" + emailAddress);
	gDebugger.log("displayName=" + displayName);

	var gnostosSideBar = document.getElementById (gConstants.gnostosSideBarId);
	gnostosSideBar.width = gConstants.sidebarWidth;
	gnostosSideBar.maxwidth = window.innerWidth / 4;

	var gnostosSidebarSplitter = document.getElementById (gConstants.gnostosSideBarSplitterId);

	var msgHeaderView = document.getElementById('msgHeaderView');
	if(msgHeaderView.collapsed == true)
	{
		gnostosSidebarSplitter.collapsed = true;
		gnostosSideBar.collapsed = true;
	}
	else
	{
		gnostosSideBar.collapsed = false;
		gnostosSidebarSplitter.collapsed = false;
	}

	if(gnostosSideBar)
	{		
		var childNode = gnostosSideBar.contentDocument.documentElement;
		gDebugger.log(childNode.innerHTML);
		childNode.innerHTML = "<head><title>Hello</title></head><body>World!</body>"
	}
}

gnostos.onMessagePaneResize = function(aEvent)
{
	var gnostosSideBar = document.getElementById (gConstants.gnostosSideBarId);
	gnostosSideBar.maxwidth = window.innerWidth / 4;
}

gnostos.onContentAreaClick = function(aEvent)
{	
}

var messagepane = document.getElementById("messagepane");
messagepane.addEventListener("load", gnostos.onMessagePaneLoad, true);
