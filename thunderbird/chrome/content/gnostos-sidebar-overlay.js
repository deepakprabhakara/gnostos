var gnostos = { 
	mSideBar: null,
	mAccountEmailAddress: null,
	mAccountDisplayName: null,
	//mSideBarDocumentHead: null,
	//mSideBarDocumentBody: null,
	mEmailAddress: null,
	mDisplayName: null
};

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

	if(gnostos.mSideBar && gnostos.mSideBar.collapsed == false)
	{
		//gnostos.mSideBar.setAttribute('src', "http://localhost/user?emails="+emailAddress+"&format=xml");
		gnostos.mSideBar.setAttribute('src', "http://localhost:8080/user?email="+gnostos.mEmailAddress+"&name="+gnostos.mDisplayName);
	}
};

var messagepane = document.getElementById("messagepane");
messagepane.addEventListener("load", gnostos.onMessagePaneLoad, true);
