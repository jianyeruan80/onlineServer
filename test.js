var fs = require('fs');
var merchantJson={"99favortaste":"M000000186","ruanjy":"M000000406"};
var buffer=['var merchantJson='];
var mydata = { "name" : "AllJoynJS" };
buffer.push(JSON.stringify(mydata, null, 4)+";\n");
buffer.push("var url = window.location.href;");  
buffer.push('var qparts = url.split("#")[0];');
buffer.push('qparts = qparts.split("/");');
buffer.push('qparts=qparts[qparts.length-1];');
buffer.push('if(!!merchantJson[qparts]==true){');
buffer.push('document.getElementById("merchantId").value=merchantJson[qparts];}');
fs.writeFile("my.js", buffer.join(""), function(err) {
    if(err) {
         console.log(err);
     } else {
         console.log("JSON saved to my.json");
     }
});



var dynamicLoading = { 
	var version=new Date().getTime();
	css: function(path)
	{ if(!path || path.length === 0)
    { throw new Error('argument "path" is required !'); } 
	var head = document.getElementsByTagName('head')[0];
	var link = document.createElement('link');
	link.href = path; 
	link.rel = 'stylesheet'; 
	link.type = 'text/css'; head.appendChild(link); },
	js: function(path){ if(!path || path.length === 0)
		{ throw new Error('argument "path" is required !'); }
	var head = document.getElementsByTagName('head')[0];
	var script = document.createElement('script'); 
	script.src = path; script.type = 'text/javascript';
	head.appendChild(script); }
	}
dynamicLoading()