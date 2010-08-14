var sys = require("sys"),
    http = require("http"),
    path = require("path"),
    fs = require("fs"),
    url = require('url'),
    events = require("events");

function load_static_file(uri, response) {
	var filename = path.join(process.cwd(), uri);
	path.exists(filename, function(exists) {
		if(!exists) {
			response.sendHeader(404, {"Content-Type": "text/plain"});
			response.write("404 Not Found\n");
			response.close();
			return;
		}
		
		fs.readFile(filename, "binary", function(err, file) {
			if(err) {
				response.sendHeader(500, {"Content-Type": "text/plain"});
				response.write(err + "\n");
				response.close();
				return;
			}
			
			response.sendHeader(200);
			response.write(file, "binary");
			response.close();
		});
	});
}

var friendfeed_emitter = new events.EventEmitter();

function get_friendfeed(email, name) {
	var friendfeed_client = http.createClient(80, "friendfeed.com");	
	var request = friendfeed_client.request("GET", "/api/feed/user?emails="+email+"&format=xml&num=2", {"host": "friendfeed.com"});
	
	request.addListener("response", function(response) {
		var body = "";
		response.addListener("data", function(data) {
			body += data;
		});
		
		response.addListener("end", function() {
			var friendfeed = body;
			sys.puts(friendfeed);
			if(friendfeed.length > 0) {
				friendfeed_emitter.emit("friendfeed", friendfeed);
			}
		});
	});
	
	request.close();
}

http.createServer(function(request, response) {
	sys.puts(request.url);
    var uri = url.parse(request.url).pathname;
    if(uri === "/stream") {
		var requrlparsed = url.parse(request.url, true);
		sys.puts(requrlparsed.query.email);
		sys.puts(requrlparsed.query.name);
	    
		var friendfeed_listener = function(friendfeed) 
		{
			sys.puts(friendfeed);
			response.sendHeader(200, { "Content-Type" : "text/xml" });
			response.write(friendfeed);
			response.close();
			
			clearTimeout(timeout);
		}; 
		
		friendfeed_emitter.addListener("friendfeed", friendfeed_listener);
		
		var timeout = setTimeout(function() {
			response.sendHeader(200, { "Content-Type" : "text/plain" });
			response.write("No data found");
			response.close();
			
			friendfeed_emitter.removeListener("friendfeed", friendfeed_listener);
		}, 10000);
	    
		get_friendfeed(requrlparsed.query.email, requrlparsed.query.name);
    }
   else {
    	load_static_file(uri, response);
    }  
}).listen(8080);

sys.puts("Server running at http://localhost:8080/");
