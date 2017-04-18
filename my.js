var merchantJson={
    "name": "AllJoynJS"
};
var url = window.location.href;var qparts = url.split("#")[0];qparts = qparts.split("/");qparts=qparts[qparts.length-1];if(!!merchantJson[qparts]==true){document.getElementById("merchantId").value=merchantJson[qparts];}