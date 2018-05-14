export function bin2dec(bin = Array(8).fill(0)) {
    // Return decimal representation of binary array as int
    let dec = Array.from(bin).join(''); // Convert the argument to an actual array, because we cannot call join() on arguments (the argument object is not an array)
    return parseInt(dec, 2); 
}


export function dec2bin(dec = 0, asArray = true) {
    // Return zero padded binary value of 0 to 255 as a String or Array

    let bin = (dec > 255 ? 255 : dec).toString(2);
    let bitString = "00000000".substr(bin.length) + bin
    
    if(asArray) {
        bitString = Array.from(bitString).map(val => parseInt(val, 10));
    }

    return bitString;
}