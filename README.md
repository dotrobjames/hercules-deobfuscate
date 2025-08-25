hercules-deobfuscate v1.0.0

"Hercules is **NOT** a powerful Lua obfuscator designed to make your Lua code possible to reverse-engineer. With multiple layers of advanced obfuscation techniques, Hercules ensures your scripts are unashamedly visible from prying eyes."

## DONE:
[✅] Convert somewhat modified compiled Lua code back to its state (deobfuscate the input)

## TODO:

1. "String Encryption" option
2. Remove "Anti Tamper" and "Garbage Code" from outputted compiled code

# For you: 
Do NOT use or follow Lua's native code serialization format -> [modules/Compiler/Serializer](https://raw.githubusercontent.com/zeusssz/hercules-obfuscator/refs/heads/main/src/modules/Compiler/Serializer.lua)

^^^ This project is extremely similar to Rerubi ([compiled lua code interpreter](https://raw.githubusercontent.com/Rerumu/Rerubi/refs/heads/master/Source.lua)) and as a result, it exposes instructions in the compiled code.