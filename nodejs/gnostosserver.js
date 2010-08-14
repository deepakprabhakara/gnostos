var sys = require("sys"),
    http = require("http"),
    events = require("events");

var friendfeed_client = http.createClient(80, "friendfeed.com");
	
var friendfeed_emitter = new events.EventEmitter();

function get_friendfeed(email, name) {
	var request = friendfeed_client.request("GET", "/api/feed/user?emails="+email+"&format=xml&num=2", {"host": "friendfeed.com"});
	
	request.addListener("response", function(response) {
		var body = "";
		response.addListener("data", function(data) {
			body += data;
		});
		
		response.addListener("end", function() {
			var friendfeed = body;
			if(friendfeed.length > 0) {
				friendfeed_emitter.emit("friendfeed", friendfeed);
			}
		});
	});
	
	request.close();
}

http.createServer(function(request, response) {
	sys.puts(request.url);
	var requrlparsed = require('url').parse(request.url, true);
	sys.puts(requrlparsed.query.email);
	sys.puts(requrlparsed.query.name);
    
	var listener = friendfeed_emitter.addListener("friendfeed", function(friendfeed) {
		response.sendHeader(200, { "Content-Type" : "text/plain" });
		response.write(friendfeed);
		response.close();
		
		clearTimeout(timeout);
	});
	
	var timeout = setTimeout(function() {
		response.sendHeader(200, { "Content-Type" : "text/plain" });
		response.write("No data found");
		response.close();
		
		tweet_emitter.removeListener(listener);
	}, 10000);
    
	get_friendfeed(requrlparsed.query.email, requrlparsed.query.name);
	
}).listen(8080);

sys.puts("Server running at http://localhost:8080/");
