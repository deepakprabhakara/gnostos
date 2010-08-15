var sys = require("sys"),
    http = require("http"),
    path = require("path"),
    fs = require("fs"),
    url = require('url'),
    events = require("events");

var debug = true;
function debuglog(message) {
	if(debug)
		sys.log(message);
}

function load_static_file(uri, response, emailid, username) {
	debuglog("load_static_file");
	var filename = path.join(process.cwd(), uri);
	path.exists(filename, function(exists) {
		if(!exists) {
			response.writeHead(404, {"Content-Type": "text/plain"});
			response.write("404 Not Found\n");
			response.end();
			return;
		}
		
		fs.readFile(filename, "binary", function(err, file) {
			if(err) {
				response.writeHead(500, {"Content-Type": "text/plain"});
				response.write(err + "\n");
				response.close();
				return;
			}

			var index = file.indexOf("// INSERT EMAILID/USERNAME HERE");
			var part1 = file.substring(0, index);
			var part2 = file.substring(index + "// INSERT EMAILID/USERNAME HERE".length);
			
			response.writeHead(200);
			response.write(part1, "binary");
			response.write("var emailid='"+emailid+"';", "binary");
			response.write("var username='"+username+"';", "binary");
			response.write(part2, "binary");
			response.close();
		});
	});
}

var friendfeed_emitter = new events.EventEmitter();

function get_friendfeed(email, name) {
	debuglog("get_friendfeed");
	var friendfeed_client = http.createClient(80, "friendfeed.com");
	var request = friendfeed_client.request("GET", "/api/feed/user?emails="+email+"&format=xml&num=2", {"host": "friendfeed.com"});

	request.socket.addListener('error', function(connectionException){
		debuglog("get_friendfeed.request.socket.addListener.'error'");
		friendfeed_emitter.emit("friendfeed", "No data found");
	    debuglog(connectionException);
	});
	
	request.addListener("response", function(response) {
		debuglog("get_friendfeed.request.addListener.'response'");
		var body = "";
		response.addListener("data", function(data) {
			body += data;
		});
		
		response.addListener("end", function() {
			debuglog("get_friendfeed.request.addListener.'end'");
			var friendfeed = body;

			if(friendfeed.length <= 0) {
				friendfeed = "No data found";
			}
			friendfeed_emitter.emit("friendfeed", friendfeed);
		});
				
	});
		
	request.end();
}

http.createServer(function(request, response) {
	debuglog("\n\n\nhttp.createServer - "+request.url);
	
    var uri = url.parse(request.url).pathname;
    if(uri === "/stream")
    {
		var requrlparsed = url.parse(request.url, true);
		var emailid = requrlparsed.query.email;
		var username = requrlparsed.query.name;

		if(username == null)
			username = "";
		
		debuglog("stream: "+ emailid);
		debuglog("stream: "+ username);
		
		var friendfeed_listener = function(friendfeed) 
		{
			debuglog("http.createServer.friendfeed_listener");
			response.writeHead(200, { "Content-Type" : "text/xml" });
			response.write(friendfeed);
			response.close();
			
			clearTimeout(timeout);
			
			friendfeed_emitter.removeListener("friendfeed", friendfeed_listener);
		}; 
		
		friendfeed_emitter.addListener("friendfeed", friendfeed_listener);
		
		var timeout = setTimeout(function() {
			debuglog("http.createServer.setTimeout");
			response.writeHead(200, { "Content-Type" : "text/plain" });
			response.write("No data found");
			response.close();
			
			friendfeed_emitter.removeListener("friendfeed", friendfeed_listener);
		}, 10000);
	    
		get_friendfeed(requrlparsed.query.email, requrlparsed.query.name);
    }
    else if(uri === "/friendfeed_streamer.html")
    {
		var requrlparsed = url.parse(request.url, true);
		var emailid = requrlparsed.query.email;
		var username = requrlparsed.query.name;
		
		if(username == null)
			username = "";
				
		debuglog("friendfeed_streamer: "+ emailid);
		debuglog("friendfeed_streamer: "+ username);
    	
    	load_static_file(uri, response, emailid, username);
    }  
}).listen(8080);

sys.puts("Server running at http://localhost:8080/");
