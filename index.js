const fs = require("fs");
const input = fs.readFileSync("./print_obfuscated.lua", "utf8");
const matched = input.match(/\w+\(\w+\('(.*)','(.*)'\)/i);
const bytestring = matched[1];
const charset = matched[2];
const smartBuffer = require("smart-buffer").SmartBuffer;
const { spawn } = require("child_process");
const names = [
    "MOVE", "LOADK", "LOADBOOL", "LOADNIL",
    "GETUPVAL", "GETGLOBAL", "GETTABLE",
    "SETGLOBAL", "SETUPVAL", "SETTABLE",
    "NEWTABLE", "SELF",
    "ADD", "SUB", "MUL", "DIV",
    "MOD", "POW", "UNM", "NOT",
    "LEN", "CONCAT", "JMP",
    "EQ", "LT", "LE", "TEST",
    "TESTSET", "CALL", "TAILCALL",
    "RETURN", "FORLOOP", "FORPREP",
    "TFORLOOP", "SETLIST", "CLOSE",
    "CLOSURE", "VARARG"
];
const instructionType = [
    'ABC', 'ABx', 'ABC', 'ABC',
    'ABC', 'ABx', 'ABC', 'ABx',
    'ABC', 'ABC', 'ABC', 'ABC',
    'ABC', 'ABC', 'ABC', 'ABC',
    'ABC', 'ABC', 'ABC', 'ABC',
    'ABC', 'ABC', 'AsBx', 'ABC',
    'ABC', 'ABC', 'ABC', 'ABC',
    'ABC', 'ABC', 'ABC', 'AsBx',
    'AsBx', 'ABC', 'ABC', 'ABC',
    'ABx', 'ABC',
];

(async() => {
    (new Promise(async(res, rej) => {
        /* decode bytestring -> */ fs.writeFileSync(`./decoder.lua`, `local a, b = "${bytestring}", "${charset}"local c,d=pcall(function()local e,f=#b,{}local g={}for h=1,e do g[b:sub(h,h)]=h-1 end;for i in a:gmatch("[^x]+")do local j=0;for h=1,#i do j=j*e+g[i:sub(h,h)]end;f[#f+1]=string.char(j)end;io.open("./out","wb"):write(table.concat(f,""))end)local k,l=pcall(function()local e={}for f=0,255 do e[string.char(f)]=f end;local function g(h,i)i=i or 1;local j=h:sub(i,i)return e[j]end;local m,n=#b,{}local o={}for f=1,m do o[b:sub(f,f)]=f-1 end;for p in a:gmatch("([^_]+)")do local q=0;for f=1,#p do q=q*m+o[p:sub(f,f)]end;n[#n+1]=string.char(q)end;local r={}for s in table.concat(n):gmatch("(.?)\\\\")do if#s>0 then r[#r+1]=s end end;io.open("./out","wb"):write(table.concat(r,""))end)`)
        spawn("lua51", ["./decoder.lua"]).on("exit", res);
    })).then(() => {
        const buffer = smartBuffer.fromBuffer(fs.readFileSync("./out"));

        function decodeChunk() {
            const chunk = {
                upvalueCount: buffer.readUInt8(),
                parameterCount: buffer.readUInt8(),
                maxStackSize: buffer.readUInt8(),
            }
        
            const instructionCount = buffer.readUInt32LE();
            const instructions = [];
        
            for (let i = 0; i < instructionCount; i++) {
                const Data = buffer.readUInt32LE();
                buffer.readUInt8();
                const Type = buffer.readUInt8();
        
                buffer.readUInt16LE();
                buffer.readUInt8();
                buffer.readUInt8();
                
                if (Type == 1) {
                    buffer.readUInt32LE();
                } else if (Type == 2) {
                    buffer.readUInt32LE();
                } else if (Type == 3) {
                    buffer.readUInt32LE();
                }
                
                const instruction = {};
                instruction.value = Data;
                instruction.opcode = Data & 0x3f;
                instruction.name = names[instruction.opcode];
                instruction.a = (Data >> 6) & 0xff;
                instruction.type = instructionType[instruction.opcode];

                switch (instruction.type) {
                    case "ABC": {
                        instruction.B = (Data >> 23) & 0x1FF;
                        instruction.C = (Data >> 14) & 0x1FF;
                        break;
                    }
                    case "ABx": {
                        instruction.B = (Data >> 14) & 0x3FFFF;
                        break;
                    }
                    case "AsBx": {
                        instruction.B = ((Data >> 14) & 0x3FFFF) - 131071;
                        break;
                    }
                }
        
                instructions.push(instruction);
            }
        
            const constantCount = buffer.readUInt32LE();
            const constants = [];
            
            for (let i = 0; i < constantCount; i++) {
                const type = buffer.readUInt8();
                const constant = {};
        
                if (type == 1) {
                    constant.data = buffer.readUInt8();
                    constant.type = 1;
                } else if (type == 3) {
                    constant.data = buffer.readDoubleLE();
                    constant.type = 3;
                } else if (type == 4) {
                    const length = buffer.readUInt32LE();
                    constant.data = buffer.readString(length);
                    constant.type = 4;
                }
        
            }
        
            const prototypeCount = buffer.readUInt32LE();
            const prototypes = [];
            for (let i = 0; i < prototypeCount; i++) {
                prototypes.push(decodeChunk());
            }
        
            chunk.instructions = instructions;
            chunk.constants = constants;
            chunk.prototypes = prototypes;
        
            return chunk;
        }
        
        const chunk = decodeChunk();
        const writer = new (smartBuffer)();

        let top = true;
        function serialize(chunk) {
            let hasVararg = false;
            for (let i = 0; i < chunk.instructions.length; i++) {
                const instruction = chunk.instructions[i];
                if (instruction.Opcode == 37) { 
                    hasVararg = true;
                    break;
                }
            }
        
            if (hasVararg) {
                chunk.varargFlag = 3;
            } else {
                chunk.varargFlag = 2;
            }
        
            writer.writeString("\x1bLua"); // Signature
            writer.writeUInt8(0x51); // Version (0x51 -> 5.1)
            writer.writeUInt8(0); // Format (0 -> Official)
            writer.writeUInt8(1); // Endianness (0 -> Big Endian, 1 -> Little Endian)
            writer.writeUInt8(4); // SizeInt
            writer.writeUInt8(4); // SizeT
            writer.writeUInt8(4); // Instruction size
            writer.writeUInt8(8); // lua_Number size 
            writer.writeUInt8(0); // Integral Flag
        
            function writeChunk(chunk) {
                if (top) {
                    chunk.name = "This bytecode is generated from deobfuscated Hercules"
                    writer.writeUInt32LE(chunk.name.length + 1); // Length of Name
                    writer.writeStringNT(chunk.name); // Name
                } else {
                    writer.writeUInt32LE(0); // name (skip)
                }    
        
                writer.writeUInt32LE(0); // Line
                writer.writeUInt32LE(0) // last line
                writer.writeUInt8(chunk.upvalueCount);
                writer.writeUInt8(chunk.parameterCount);
                writer.writeUInt8(chunk.varargFlag);
                writer.writeUInt8(chunk.maxStackSize);
            }
        
            function serializeChunk(chunk) {
                writeChunk(chunk);
        
                writer.writeUInt32LE(chunk.instructions.length);
                for (let i = 0; i < chunk.instructions.length; i++) {
                    writer.writeUInt32LE(chunk.instructions[i].value);
                }
            
                writer.writeUInt32LE(chunk.constants.length);
                for (let i = 0; i < chunk.constants.length; i++) {
                    const constant = chunk.constants[i];
                    
                    writer.writeUInt8(constant.type);
            
                    switch (constant.type) {
                        case 1: {
                            writer.writeUInt8(constant.data);
                            break;
                        }
                        case 3: {
                            writer.writeDoubleLE(constant.data);
                            break;
                        }
                        case 4: {
                            writer.writeUInt32LE(constant.data.length + 1);
                            writer.writeStringNT(constant.data);
                            break;
                        }
                    }
                }
        
                writer.writeUInt32LE(chunk.prototypes.length);
                for (let i = 0; i < chunk.prototypes.length; i++) {
                    top = false;
                    serializeChunk(chunk.prototypes[i]);
                }
        
                writer.writeUInt32LE(0); // Lines
                writer.writeUInt32LE(0) // Locals (Names)
                writer.writeUInt32LE(0); // Upvalues (Names)
            }
        
            serializeChunk(chunk);
            return writer.toBuffer();
        }
        
        const serialized = serialize(chunk);
        fs.writeFileSync("./luac.out", serialized);    
        console.log(`Hercules input has been deobfuscated and saved as bytecode to ${__dirname}\\luac.out`)
    })
})();