// TODO show them their ip address
var url = window.location.origin + '/get';
// var url = 'http://localhost:8080/get';
var ipReq = new XMLHttpRequest();

ipReq.onreadystatechange = function() {
    if(ipReq.readyState == XMLHttpRequest.DONE) {
        document.getElementById('visitor-ip').innerHTML = ipReq.responseText;
    }
}
ipReq.open('GET', url, true);
ipReq.send(null);