var SmartBuffer = function(size){
    this.size = size || SmartBuffer.defaultSize;
    this.buffer = new Buffer(this.size);
    //append from here
    this.cursor = 0;
    //actually used size
    this.validSize = 0;
}
SmartBuffer.defaultSize = 1024*4;
//up to 2GB
SmartBuffer.maxSize = 1024*1024*1024*2+1;
//write buffer at current cursor position;
SmartBuffer.prototype.append = function(content,encodeOrLength){
    if(typeof content == "string"){
	var byteLength = Buffer.byteLength(content,encodeOrLength|| "utf8");
	if(this.cursor+byteLength>this.size){
	    this.realloc(this.cursor+byteLength);
	    this.append(content,encodeOrLength);
	    return;
	}else{
	    this.buffer.write(content,this.cursor,byteLength);
	    this.validSize += byteLength;
	    this.cursor = this.validSize;
	    return;
	}
    }
    if(Buffer.isBuffer(content)){
	var appendLength = (encodeOrLength||content.length);
	if(this.cursor+appendLength>=this.size){
	    this.realloc(this.cursor+appendLength);
	    this.append(content,appendLength);
	    return;
	}
	content.copy(this.buffer,this.cursor,0,appendLength);
	this.validSize += appendLength;
	this.cursor = this.validSize;
	return;
    }
}
//NOTE:newSize is not exactly,realloc will alloc more than newSize
//it will by 2^n the minimal n that 2^n > newSize;
SmartBuffer.prototype.realloc = function(newSize){
    if(newSize<this.size){
	throw "realloc only increase size of buffer";
	return this;
    }
    var newSize = newSize || this.size; 
    newSize = parseInt(Math.pow(2,Math.ceil(Math.log(newSize)/Math.log(2)))); 
    if(newSize>SmartBuffer.maxSize){
	console.trace();
	throw "buffer is biffer than max size"+SmartBuffer.maxSize+",fail to alloc";
    }
    var newBuffer = new Buffer(newSize);
    this.buffer.copy(newBuffer,0,0);
    this.buffer = null;
    this.buffer = newBuffer;
    this.size = newSize;
    return this;
}
SmartBuffer.prototype.clear = function(){
    this.cursor = 0;
    this.validSize = 0;
}
SmartBuffer.prototype.getFixedBuffer = function(){
    var buffer = new Buffer(this.validSize);
    this.buffer.copy(buffer,0,0,this.validSize);
    return buffer;
} 
exports.SmartBuffer = SmartBuffer;
