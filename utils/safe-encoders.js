var newlineRegex = /\n/g;

const btoa = typeof btoa !== 'undefined' ? btoa : str => Buffer.from(str, 'binary').toString('base64')
const atob = typeof atob !== 'undefined' ? atob : str => Buffer.from(str, 'base64').toString('binary')

export function b64EncodeUnicode(str) {
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
    return String.fromCharCode('0x' + p1);
  }));
}

export function b64DecodeUnicode(str) {
  // atob on Mobile Safari for iOS 9 will throw an exception if there's a newline.
  var b64Decoded = atob(str.replace(newlineRegex, ''));
  var decodedWithUnicodeHexesRestored = Array.prototype.map.call(
    b64Decoded,
    hexEncodeCharCode
  )
  .join('');

  return decodeURIComponent(decodedWithUnicodeHexesRestored);
}

function hexEncodeCharCode(c) {
  return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
}
