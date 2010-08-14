var sys = require("sys"),
    http = require("http"),
    path = require("path"),
    fs = require("fs"),
    url = require('url'),
    events = require("events");

function load_static_file(uri, response, emailid, username) {
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

			sys.puts("readFile: "+ file);
			var index = file.indexOf("// INSERT EMAILID/USERNAME HERE");
			sys.puts("readFile: "+ index);
			var part1 = file.substring(0, index);
			sys.puts("readFile:" + part1);
			sys.puts("var emailid='"+emailid+"';");
			sys.puts("var username='"+username+"';");			
			var part2 = file.substring(index + "// INSERT EMAILID/USERNAME HERE".length);
			sys.puts("readFile:" + part2);
			
			response.sendHeader(200);
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
    if(uri === "/stream")
    {
		var requrlparsed = url.parse(request.url, true);
		var emailid = requrlparsed.query.email;
		var username = requrlparsed.query.name;

		if(!username)
			username = "";
		
		sys.puts("stream: "+ emailid);
		sys.puts("stream: "+ username);
		
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
    else if(uri === "/friendfeed_streamer.html")
    {
		var requrlparsed = url.parse(request.url, true);
		var emailid = requrlparsed.query.email;
		var username = requrlparsed.query.name;
		
		if(!username)
			username = "";
				
		sys.puts("friendfeed_streamer: "+ emailid);
		sys.puts("friendfeed_streamer: "+ username);
    	
    	load_static_file(uri, response, emailid, username);
    }  
}).listen(8080);

sys.puts("Server running at http://localhost:8080/");
