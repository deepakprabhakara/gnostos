if(gConstants.debug)
{
	var gDebugger = 
	{
		mConsoleService: Components.classes["@mozilla.org/consoleservice;1"].
	    getService(Components.interfaces.nsIConsoleService),
	}
	
	gDebugger.log = function(message)
	{
		this.mConsoleService.logStringMessage(message + "\n");	
	}
}
else
{
	var gDebugger = { }
	gDebugger.log = function(message) { }
}
