/*
  Copyright (c) Lightstreamer Srl

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
*/
   

//////////////// Base 64 encoding

function checkZero(data) {
  for (var k=0; k<7; k++) {
    if (data[k] != 0) {
      return false;
    }
  }
  
  return true;
}

function checkfZero(data) {
  for (var k=0; k<4; k++) {
    if (data[k] != 0) {
      return false;
    }
  }
  
  return true;
}

function getMyFloat(data) {
  var sign = 1;
  var exp = 0;
  var man = 1;
  
  if ( checkfZero(data) == true ) {
    return 0;
  }
  
  if (data[0] > 128) {
    sign = -1;
  }

  var uno = data[0];
  var due = data[1];

  if ( uno > 128 ) {
     uno = uno % 128;
  }  
  for (var k = 6; k >= 0; k--) {
      if ( uno >= Math.pow(2, k) ) {
        exp += Math.pow(2, k+1);
        uno = uno % Math.pow(2, k);
      }
    }
/*
  if (uno >= 64) {
    exp += 128;
    uno = uno % 64;
  }
  if (uno >= 32) {
    exp += 64;
    uno = uno % 32;
  }
  if (uno >= 16) {
    exp += 32;
    uno = uno % 16;
  }
  if (uno >= 8) {
    exp += 16;
    uno = uno % 8;
  }
  if (uno >= 4) {
    exp += 8;
    uno = uno % 4;
  }
  if (uno >= 2) {
    exp += 4;
    uno = uno % 2;
  }
  if (uno >= 1) {
    exp += 2;
  }*/
  if (due >= 128) {
    exp += 1;
    due = due % 128;
  }

  due = due % 128;
  if (due >= 64) {
    man += 0.5;
    due = due % 64;
  }
  if (due >= 32) {
    man += 0.25;
    due = due % 32;
  }
  if (due >= 16) {
    man += 0.125;
    due = due % 16;
  }
  if (due >= 8) {
    man += 0.0625;
    due = due % 8;
  }
  if (due >= 4) {
    man += 1/32;
    due = due % 4;
  }
  if (due >= 2) {
    man += 1/64;
    due = due % 2;
  }
  if (due >= 1) {
    man += 1/128;
  }
  
  var w = 8;
  var mantiss = man;
  for (var i = 2; i < 4; i++) {
    var b = data[i];
    for (var j = 7; j >= 0; j--) {
      if ( b >= Math.pow(2, j) ) {
        mantiss += 1/Math.pow(2, w);
        b = b % Math.pow(2, j);
        //console.log("Mantissa Alt: " + mantiss + ", w: " + w + ", div: " + Math.pow(2, w) + "," + 1/Math.pow(2, w) + " i:" + i + " j:" + j + " b:" + b);
      }
      w++;
    }
  }
  
  return sign * Math.pow(2, (exp-127)) * mantiss;
}

function getMyDouble(data) {

  var sign = 1;
  var exp = 0;
  var man = 1;
  
  if ( checkZero(data) == true ) {
    return 0;
  }
  
  if (data[0] > 128) {
    sign = -1;
  }

  var uno = data[0];
  var due = data[1];
  
  if ( uno > 128 ) {
     uno = uno % 128;
  }
  if (uno >= 64) {
    exp += 1024;
    uno = uno % 64;
  }
  if (uno >= 32) {
    exp += 512;
    uno = uno % 32;
  }
  if (uno >= 16) {
    exp += 256;
    uno = uno % 16;
  }
  if (uno >= 8) {
    exp += 128;
    uno = uno % 8;
  }
  if (uno >= 4) {
    exp += 64;
    uno = uno % 4;
  }
  if (uno >= 2) {
    exp += 32;
    uno = uno % 2;
  }
  if (uno >= 1) {
    exp += 16;
  }
  if (due >= 128) {
    exp += 8;
    due = due % 128;
  }
  if (due >= 64) {
    exp += 4;
    due = due % 64;
  }
  if (due >= 32) {
    exp += 2;
    due = due % 32;
  }
  if (due >= 16) {
    exp += 1;
    due = due % 16;
  }
  
  due = due % 16;
  if (due >= 8) {
    man += 0.5;
    due = due % 8;
  }
  if (due >= 4) {
    man += 0.25;
    due = due % 4;
  }
  if (due >= 2) {
    man += 0.125;
    due = due % 2;
  }
  if (due >= 1) {
    man += 0.0625;
  }
  
  var w = 5;
  var mantiss = man;
  for (var i = 2; i < 8; i++) {
    var b = data[i];
    for (var j = 7; j >= 0; j--) {
      if ( b >= Math.pow(2, j) ) {
        mantiss += 1/Math.pow(2, w);
        b = b % Math.pow(2, j);
        //console.log("Mantissa Alt: " + mantiss + ", w: " + w + ", div: " + Math.pow(2, w) + "," + 1/Math.pow(2, w) + " i:" + i + " j:" + j + " b:" + b);
      }
      w++;
    }
  }
  
  return sign * Math.pow(2, (exp-1023)) * mantiss;
}

var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
function fromBase64(dataToConvert) {

      var o1, o2, o3, h1, h2, h3, h4, bits;
      
      var res = [];
      //var fin = new ArrayBuffer(8);

      if (!dataToConvert) {
        return [];
      }

      dataToConvert += "";

      var i = 0;
      do { // unpack four hexets into three octets using index points in b64
        h1 = b64.indexOf(dataToConvert.charAt(i++));
        h2 = b64.indexOf(dataToConvert.charAt(i++));
        h3 = b64.indexOf(dataToConvert.charAt(i++));
        h4 = b64.indexOf(dataToConvert.charAt(i++));

        bits = h1 << 18 | h2 << 12 | h3 << 6 | h4;

        o1 = bits >> 16 & 0xff;
        o2 = bits >> 8 & 0xff;
        o3 = bits & 0xff;
        
        if (h3 == 64) {
          res.push(o1);
        } else if (h4 == 64) {
          res.push(o1);
          res.push(o2);
        } else {
          res.push(o1);
          res.push(o2);
          res.push(o3);
        }
      } while (i < dataToConvert.length);
  /*
      j = 0;
      while ( j < res.length)  {
        fin[j] = res[j];
        j++;
      }
  */
      return res;
  };

var Base64 = {
  // private property
  _keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

  // public method for encoding
  encode : function (input) {
      var output = "";
      var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
      var i = 0;

      input = Base64._utf8_encode(input);

      while (i < input.length) {

          chr1 = input.charCodeAt(i++);
          chr2 = input.charCodeAt(i++);
          chr3 = input.charCodeAt(i++);

          enc1 = chr1 >> 2;
          enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
          enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
          enc4 = chr3 & 63;

          if (isNaN(chr2)) {
              enc3 = enc4 = 64;
          } else if (isNaN(chr3)) {
              enc4 = 64;
          }

          output = output +
          Base64._keyStr.charAt(enc1) + Base64._keyStr.charAt(enc2) +
          Base64._keyStr.charAt(enc3) + Base64._keyStr.charAt(enc4);

      }

      return output;
  },

  // public method for decoding
  decode : function (input) {
      var output = "";
      var chr1, chr2, chr3;
      var enc1, enc2, enc3, enc4;
      var i = 0;

      input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

      while (i < input.length) {

          enc1 = Base64._keyStr.indexOf(input.charAt(i++));
          enc2 = Base64._keyStr.indexOf(input.charAt(i++));
          enc3 = Base64._keyStr.indexOf(input.charAt(i++));
          enc4 = Base64._keyStr.indexOf(input.charAt(i++));

          chr1 = (enc1 << 2) | (enc2 >> 4);
          chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
          chr3 = ((enc3 & 3) << 6) | enc4;

          output = output + String.fromCharCode(chr1);

          if (enc3 != 64) {
              output = output + String.fromCharCode(chr2);
          }
          if (enc4 != 64) {
              output = output + String.fromCharCode(chr3);
          }

      }

      output = Base64._utf8_decode(output);

      return output;

  },

  // private method for UTF-8 encoding
  _utf8_encode : function (string) {
      string = string.replace(/\r\n/g,"\n");
      var utftext = "";

      for (var n = 0; n < string.length; n++) {

          var c = string.charCodeAt(n);

          if (c < 128) {
              utftext += String.fromCharCode(c);
          }
          else if((c > 127) && (c < 2048)) {
              utftext += String.fromCharCode((c >> 6) | 192);
              utftext += String.fromCharCode((c & 63) | 128);
          }
          else {
              utftext += String.fromCharCode((c >> 12) | 224);
              utftext += String.fromCharCode(((c >> 6) & 63) | 128);
              utftext += String.fromCharCode((c & 63) | 128);
          }

      }

      return utftext;
  },

  // private method for UTF-8 decoding
  _utf8_decode : function (utftext) {
      var string = "";
      var i = 0;
      var c = c1 = c2 = 0;

      while ( i < utftext.length ) {

          c = utftext.charCodeAt(i);

          if (c < 128) {
              string += String.fromCharCode(c);
              i++;
          }
          else if((c > 191) && (c < 224)) {
              c2 = utftext.charCodeAt(i+1);
              string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
              i += 2;
          }
          else {
              c2 = utftext.charCodeAt(i+1);
              c3 = utftext.charCodeAt(i+2);
              string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
              i += 3;
          }

      }
      return string;
  }
}
