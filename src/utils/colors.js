function hashCode(str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
}

// Convert an int to hexadecimal with a max length
// of six characters.
function intToARGB(i) {
    var hex = ((i>>24)&0xFF).toString(16) +
            ((i>>16)&0xFF).toString(16) +
            ((i>>8)&0xFF).toString(16) +
            (i&0xFF).toString(16);
    // Sometimes the string returned will be too short so we 
    // add zeros to pad it out, which later get removed if
    // the length is greater than six.
    hex += '000000';
    return '#' + hex.substring(0, 6);
}

export function pickTextColorBasedOnBgColor(bgColor, lightColor, darkColor) {
    var color = (bgColor.charAt(0) === '#') ? bgColor.substring(1, 7) : bgColor;
    var r = parseInt(color.substring(0, 2), 16); // hexToR
    var g = parseInt(color.substring(2, 4), 16); // hexToG
    var b = parseInt(color.substring(4, 6), 16); // hexToB
    var uicolors = [r / 255, g / 255, b / 255];
    var c = uicolors.map((col) => {
      if (col <= 0.03928) {
        return col / 12.92;
      }
      return Math.pow((col + 0.055) / 1.055, 2.4);
    });
    var L = (0.2126 * c[0]) + (0.7152 * c[1]) + (0.0722 * c[2]);
    return (L > 0.179) ? darkColor : lightColor;
}
export function stringToHex (str) {
    return intToARGB(hashCode(str))
}
