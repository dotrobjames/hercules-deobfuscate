node-smartbuffer
================

An auto realloc buffer 

#Note
* buffer will auto realloc with buffer.append method when overflowed.
* realloc step by power of 2
  for example smartbuffer 
  **  [1,_,_].realloc() make [1,_,_,_]  (default is next power of 2)
  **  [1,_,_].realloc(5) make [1_,_,_,_,_,_,_]


#usage
```javascript
SmartBuffer = require("smartbuffer").SmartBuffer;
var buf = new SmartBuffer(5);
buf.append("123"); // make ['1','2','3',_,_]  
buf.getFixedBuffer(); // get buffer ['1','2','3'] 
buffer.append("456"); // auto realloc and make ['1','2','3','4','5','6',_,_]
```