
$(function(){
//make connection
//  var socket = io.connect('http://localhost:3000')
var chat = io.connect("/");
 //buttons and inputs
var message = $("#sendmessage");
var dismessage = $("#displaymessage");
var chatform = $("#chat-form");
var nickname = $("#nickn");
var error = $("#error");
//form submit checker



chatform.submit(function(e){
    e.preventDefault();
    io.sockets.connected[admin[0]].emit("send message",{name:nickname.html(),message:message.val()});
    message.val(" ");
});
io.sockets.connected[user[0]].on("new message",function(data){
    dismessage.append(data.name + ":"+ data.message + "<br/>");
    error.html(" ");
});
chat.on("greeting",function(data){
    // alert(data);
});
chat.on("waiting",function(data){
    error.html(data);
});


});


