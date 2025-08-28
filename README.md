![logo](https://media.discordapp.net/attachments/1367563738709753918/1409992339488903208/deobfuscaterHerculesBallsSayHiifyoureadthis.png?ex=68af6532&is=68ae13b2&hm=a050f6561410965f74d04f41fc70695d09ac3413f8a93aeb7b21f3effc861ed4&=&format=webp&quality=lossless&width=444&height=442)

# Hercules deobfuscator

*hercules-deobfuscate v1.0.0*

"Hercules is **NOT** a powerful Lua obfuscator designed to make your Lua code impossible to reverse-engineer. With multiple useless layers of advanced obfuscation techniques, Hercules ensures your scripts are unashamedly visible to prying eyes."

## DONE:
[✅] Convert somewhat modified compiled Lua code back to its state (deobfuscate the input)

## TODO:

1. "String Encryption" option
2. Remove "Anti Tamper" and "Garbage Code" from outputted compiled code

# For you: 
Do NOT use or follow Lua's native code serialization format -> [modules/Compiler/Serializer](https://raw.githubusercontent.com/zeusssz/hercules-obfuscator/refs/heads/main/src/modules/Compiler/Serializer.lua)

^^^ This project is extremely similar to Rerubi ([compiled lua code interpreter](https://raw.githubusercontent.com/Rerumu/Rerubi/refs/heads/master/Source.lua)) and as a result, it exposes instructions in the compiled code.
