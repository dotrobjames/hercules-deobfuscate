var SmartBuffer = require("../lib/smartBuffer").SmartBuffer;
var sbuff = new SmartBuffer(32);
sbuff.append("ABC");
console.log("cursor at %d,valid size %d,realsize %d",sbuff.cursor,sbuff.validSize,sbuff.size);
console.log("fixed text:",sbuff.getFixedBuffer().toString());

console.log("append more");
sbuff.append("DEFGH");

console.log("cursor at %d,valid size %d,realsize %d",sbuff.cursor,sbuff.validSize,sbuff.size);
console.log("fixed text:",sbuff.getFixedBuffer().toString());
var string = "";
console.log("create bytes");
for(var i=0;i<1024*1024*10;i++){
    string += "1234567890";
}
console.log("append %d more bytes",1024*1024*10*10);
sbuff.append(string);
console.log("cursor at %d,valid size %d,realsize %d",sbuff.cursor,sbuff.validSize,sbuff.size);
