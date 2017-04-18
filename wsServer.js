var WebSocketServer = require('websocket').server;
var http = require('http');


var registerClient={"M01":"A","M02":"B"};
var clients={};

//var clientsReverse  = {};
var server = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});
server.listen(1337, function() {
    console.log((new Date()) + ' Server is listening on port 1337');
});
 
wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false
});
 
function originIsAllowed(origin) {
  // put logic here to detect whether the specified origin is allowed. 
  return true;
}
 
wsServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
      // Make sure we only accept requests from an allowed origin 
      request.reject();
      console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
      return;
    }
    
    var connection = request.accept('echo-protocol', request.origin);
    console.log((new Date()) + ' Connection accepted.');
    connection.on('message', function(message) {
        console.log('Received Message: ' + message.utf8Data);
        var recievedData=eval("(" + message.utf8Data + ")");
         if(!!recievedData["register"]){
         	   var key=recievedData["register"];
               clients[key]=connection;
         }else if(!!recievedData["customer"]){
            	var key=recievedData["customer"];
            	clients[key]=connection;
          }
          
          if(!!recievedData.from && !!recievedData.to  ){
             if(!clients[recievedData.to]){
             	connection.sendUTF('{"success":"false"}'); 
           }else{
            	 clients[recievedData.to].sendUTF(JSON.stringify(recievedData)); 
            	 connection.sendUTF('{"success":"true"}'); 
           }
            
          }else{
           		connection.sendUTF(message.utf8Data);
           }

    });
    connection.on('close', function(reasonCode, description) {
    	  var keys=Object.keys(clients);
    	   for(var i=0;i<keys.length;i++){
    	   	   if(clients[keys[i]]==connection){
                console.log(keys[i]+"delete");
    	   	   	delete clients[keys[i]];
    	   	   	break;
    	   	   }
    	   
    	   }

    });
});
