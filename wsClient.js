var W3CWebSocket = require('websocket').w3cwebsocket;
 var rest = require('restler');
var client = new W3CWebSocket('ws://192.168.1.100:1337/', 'echo-protocol');
 
client.onerror = function() {
    console.log('Connection Error');
};
 
client.onopen = function() {
    console.log('WebSocket Client Connected');
    client.send('{"register":"M01"}');
   /* function sendNumber() {
        if (client.readyState === client.OPEN) {
            var number = Math.round(Math.random() * 0xFFFFFF);
            client.send(number.toString());
            //setTimeout(sendNumber, 1000);
        }
    }
    sendNumber();*/
};
 
client.onclose = function() {
    console.log('echo-protocol Client Closed');
};
 
client.onmessage = function(e) {
    if (typeof e.data === 'string') {
        console.log("Received: '" + e.data + "'");
       var recievedData=eval("(" + e.data + ")");
        if( !!recievedData.to  && !!recievedData.from){
        		  recievedData.to="client";
      			  recievedData.from="M01";


      			  	rest.get('http://nytest.menusifu.com:8666/storage/US00000002/products/store.json?v=20150006', {}).on('complete', function(data, response) {
        if (data instanceof Error) return next(data);
         var test=[];
         for(var i=0;i<150;i++){
         	test[i]=[{"catgroupname":"Lunch Special","businesshours":"11:00-15:30"}];
         }
         recievedData.data=test;
         console.log("--------------------");
         console.log(JSON.stringify(recievedData));
         console.log("--------------------");
                 client.send(JSON.stringify(recievedData));	
    });

      	//		  recievedData.data={"xxx":"中国家机关","yyyy":["xxx","中国家机关"],"zzz":{"sss":[{"xx":"中国家机关"}]}};
      			  

      			  
          
        }
        
    }
};

   function toUnicode(s){ 
        return s.replace(/([\u4E00-\u9FA5]|[\uFE30-\uFFA0])/g,function(){
          return "\\u" + RegExp["$1"].charCodeAt(0).toString(16);
        });
      }

