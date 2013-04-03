
// LightstreamerClient object
var client = null;

// Subscriptions towards Lightstreamer server
var gBandSubs;
var subsPlayers;
var subsLogon;
var subSrvSide;
var subsDeltaKeys = new Array();
var subsDelta = new Array();
var subsDeltaBU = new Array();
var subsDeltaKeysBU = new Array();

// subsPlayers listeners
var imGrid = null;
var rndrListener = null;

var precision = "bs";
var radioBut = 0;
var matrix = false;
var rendering = false;
var chkSwitchShift = false;
var physicsMod = 0;

// nickname chosen by this page's user; 
var myNick = null;
var myLastWorlds = "";
// logonname random generated, it is used in the
// item name for the subscription logon
var logonName = null;
var myWorld = "Utente";

//document.getElementById("chkTable").onclick=checkTable(this);

function checkCanvas(checkBtn) {
  if ( rndrListener != null ) {
    if (checkBtn.checked == true ) {
      // subsPlayers.removeListener(rndrListener);
      //  document.getElementById("theWorld").hidden = "hidden";
      stopRender();
      document.getElementById("theWorld").style.display = "none";
    } else {
      // subsPlayers.addListener(rndrListener);
      //  document.getElementById("theWorld").hidden = "";
      startRender();
      document.getElementById("theWorld").style.display = "";
    }
  }
}

function stopGrid() {
  console.log("stopGrid.");
  subsPlayers.removeListener(imGrid);
}

function startGrid() {
  imGrid.clean();
  var cubes = getScene();
  if ( cubes != null ) {
    for (var ik=0;ik<cubes.length;ik++) {
      imGrid.updateRow("Custom_list_"+myWorld+"_"+precision +" "+cubes[ik].name, {nick:"."+getNick(ik),
                  posX:cubes[ik].position.x,
                  posY:cubes[ik].position.y,
                  posZ:cubes[ik].position.z,
                  rotX:cubes[ik].quaternion.x,
                  rotY:cubes[ik].quaternion.y,
                  rotZ:cubes[ik].quaternion.z,
                  rotW:cubes[ik].quaternion.w
      });
    }
  }
  console.log("startGrid.");
  subsPlayers.addListener(imGrid);
}

  function subServerSide() {
    require(["Subscription"],function(Subscription) {  
      var tmp = new Subscription("DISTINCT","ServerSide",["fake"]);
          
      tmp.setRequestedSnapshot("no");
      tmp.addListener({
        onSubscriptionError: function(updInfo) {
          // force switch to client side
          document.getElementById("radio_serSide").checked = false;
          document.getElementById("radio_cliSide").checked = true;
          clickCheck();
          
          // alert("Too many server side players, please retry later.");
          document.getElementById("serSideError").innerHTML = "Too many server-side players, please retry later.";
        },
        onSubscription: function() {
          document.getElementById("serSideError").innerHTML = "";
        }
      });
          
      client.subscribe(tmp);
      
      subSrvSide = tmp;
    });
  }
  
  function unsubServerSide() {
    if ( subSrvSide != null ) {
      client.unsubscribe(subSrvSide);
      subSrvSide = null;
    }
  }

  function addDeltaSub(key) {
    var indx;
    
    if (physicsMod == 0) {
      var indx = subsDeltaKeys.indexOf(key);
    } else {
      var indx = subsDeltaKeysBU.indexOf(key);
    }
    
    if ( indx == -1) {
      try {
        require(["Subscription"],function(Subscription) {  
          var tmp = new Subscription("MERGE",key,["dVx", "dVy", "dVz", "dRx", "dRy", "dRz"]);
          
          tmp.setRequestedSnapshot("yes");
          //tmp.setRequestedMaxFrequency("unfiltered");
          tmp.setRequestedMaxFrequency("unlimited");
          tmp.addListener({
            onItemUpdate: function(updInfo) {
              
              if ( updInfo.isValueChanged("dVx") ) {
                updateDinamics2(updInfo.getItemName(), "dVx", updInfo.getValue("dVx"));
                // console.error("Inner2 - addDeltaSub: " + updInfo.getItemName() + "," + updInfo.getValue("dVx"));
              }
              if ( updInfo.isValueChanged("dVy") ) {
                updateDinamics2(updInfo.getItemName(), "dVy", updInfo.getValue("dVy"));
              }
              if ( updInfo.isValueChanged("dVz") ) {
                updateDinamics2(updInfo.getItemName(), "dVz", updInfo.getValue("dVz"));
              }
              if ( updInfo.isValueChanged("dRx") ) {
                updateDinamics2(updInfo.getItemName(), "dRx", updInfo.getValue("dRx"));
              }
              if ( updInfo.isValueChanged("dRy") ) {
                updateDinamics2(updInfo.getItemName(), "dRy",updInfo.getValue("dRy"));
              }
              if ( updInfo.isValueChanged("dRz") ) {
                updateDinamics2(updInfo.getItemName(), "dRz",updInfo.getValue("dRz"));
              }
            }
          });
          
          if (physicsMod == 0) {
            client.subscribe(tmp);
            indx = subsDeltaKeys.push(key) - 1;
            subsDelta[indx] = tmp;
          } else {
            indx = subsDeltaKeysBU.push(key) - 1;
            subsDeltaBU[indx] = tmp;
          }
        });
      } catch(e) {console.error(e);}
    }
  }

  function removeDeltaSub(key) {
    if (physicsMod == 0) { 
      var indx = subsDeltaKeys.indexOf(key);
      if ( indx == -1) {
        return ;
      }
      
      subsDeltaKeys.splice(indx, 1);
      lsClient.unsubscribe(subsDelta[indx]);
      subsDelta.splice(indx, 1);
    } else {
      var indx = subsDeltaKeysBU.indexOf(key);
      if ( indx == -1) {
        return ;
      }
      
      subsDeltaKeysBU.splice(indx, 1);
      subsDeltaBU.splice(indx, 1);
    }
  }
  
  function backUpDeltasKeys() {
    while ( subsDeltaKeys.length > 0 ) {
      subsDeltaKeysBU.push(subsDeltaKeys.pop());
      subsDeltaBU.push(subsDelta.pop());
    }
  }
  
  function unsubDeltas() {
    var tmpSub = null;
  
    while ( subsDeltaKeys.length > 0 ) {
      subsDeltaKeysBU.push(subsDeltaKeys.pop());
      tmpSub = subsDelta.pop();
      subsDeltaBU.push(tmpSub);
      
      client.unsubscribe(tmpSub);
    }
  }
  
  function resubDeltas() {
    var tmpSub = null;
    var keyT = "";
    var indx = 0;
    
    while  ( subsDeltaKeysBU.length > 0 ) {
      keyT = subsDeltaKeysBU.pop();
      tmpSub = subsDeltaBU.pop();
      indx = subsDeltaKeys.push(keyT);
      subsDelta[indx] = tmpSub;
    
      client.subscribe(tmpSub);
    }
  }

function checkTable(obj) {
  if (obj.id == "matrix" ) {
    if ( imGrid != null ) {
      if (matrix) {
        stopGrid();
        matrix = false;
        //document.getElementById("message_scroll").style.display="none";
      } else {
        startGrid();
        matrix = true;
        //document.getElementById("message_scroll").style.display="";
      }
    }
  } else if (obj.id == "rendering" ) {
    //rendering = (window.getComputedStyle(document.getElementById("rendering"),null).getPropertyValue("color") == "rgb(255, 255, 255)");
    if ( rendering  == true ) {
      stopRender();
      rendering = false;
    } else {
      startRender();
      rendering = true;
    }
  }
}

function enableButton() {
  
}

function changePrecision() {
  if (document.getElementById("radio_f").checked) {
    document.getElementById("decimalInput").style.visibility = "visible";  
    precision = "s"+document.getElementById("nowDecimals").innerHTML;
    reSubscribe();
  } else if (document.getElementById("radio_d").checked) {
    precision = "bd";
    reSubscribe();
    document.getElementById("decimalInput").style.visibility = "hidden"; 
  } else {
    precision = "bs";
    reSubscribe();
    document.getElementById("decimalInput").style.visibility = "hidden";  
  }
}

//////////////// Connect to push.lightstreamer.com and configure a StatusWidget
  //  define("lsClient",["LightstreamerClient","StatusWidget"],function(LightstreamerClient,StatusWidget) {
  define("lsClient",["LightstreamerClient","StatusWidget"],function(LightstreamerClient,StatusWidget) {
    var protocolToUse = document.location.protocol != "file:" ? document.location.protocol : "http:";
    var lsClient = new LightstreamerClient("http://localhost:8080","DEMOMOVE3D");
    lsClient.connectionSharing.enableSharing("Move3dDemo", "ATTACH", "CREATE");
    //lsClient.connectionOptions.setForcedTransport("WS-POLLING");
    lsClient.connectionOptions.setXDomainStreamingEnabled(false);
   
    lsClient.addListener(new StatusWidget("left", "0px", true));
    lsClient.addListener({onServerError: function(errorCode, errorMsg) {
        //document.getElementById("subscriptionError").innerHTML = "Game over for inactivity. Please refresh the page to resume."
        $( "#dialog" ).dialog( "open" );
      }
    });
    
    lsClient.connect();
    return lsClient;
  });
  
  function reSubscribe() {
    try {
      client.unsubscribe(subsPlayers);
      unsubDeltas();
    
      subsPlayers.setItems(["Custom_list_"+myWorld+"_"+precision]);
      
      client.subscribe(subsPlayers);
      clearScene();
    } catch (x) {
    
    }
  }
  
  function switchShift() {
    
    if ( chkSwitchShift == true ) {
      chkSwitchShift = false;
      // document.getElementById("lblcheckRot").innerHTML = "Position";
      $( "#checkRot" ).button( "option", "label", "Position" );
    } else {
      // document.getElementById("lblcheckRot").innerHTML = "Rotation";
      $( "#checkRot" ).button( "option", "label", "Rotation" );
      chkSwitchShift = true;
    }
    
    return ;
  }
  
  addEvent("keyup", KeyCheck, true); 
  addEvent("click", clickCheck, true);
  addEvent("resize", onWindowResize, true);
  addEvent("hashchange", get_hash, true);
  
  //window.attachEvent("onkeyup", KeyCheck);
  //document.addEventListener(document.onkeyup, KeyCheck, false);

  function addEvent(evnt, handler, noDoc){ 
    if (typeof window.addEventListener != "undefined") {
      window.addEventListener(evnt, handler, false);
      return true;
      
    } else if (typeof document.addEventListener != "undefined" && !noDoc) {
      //W3C
      document.addEventListener(evnt, handler, false);
      return true;
      
    } else if (typeof window.attachEvent != "undefined") {
      return window.attachEvent("on" + evnt, handler);
      
    } else {
      return false;
    }
  }
  
  function KeyCheck(e) {
    var keyId = (window.event) ? event.keyCode : e.keyCode;
    var shift = (window.event) ? event.shiftKey : e.shiftKey;
    
    /*console.log("Key ID:" + keyId);
    
    if ( (keyId == 38) || (keyId == 40) || (keyId == 37) || (keyId == 39) || (keyId == 96) || (keyId == 97) || (keyId == 35) || (keyId == 45) ) {
      if ( client != null ) {
        if ( shift ) {
           msg = "10" + keyId;
        } else {
          if ( keyId == 35 ) {
            msg = "1096";
          } else if ( keyId == 45 ) {
            msg = "1097";
          } else {
            msg = keyId;
          }
        }
    */
    
    if (keyId == 13) {
      // Return
      if ( myNick != document.getElementById("user_nick").value) {
        submitNick();
      } 
      if (myLastWorlds != document.getElementById("user_msg").value) {
        submitMsg();
      }
    }
    
    if ( (keyId == 87) || (keyId == 65) || (keyId == 83) || (keyId == 49) || (keyId == 50) || (keyId == 68) ) {
      if ( client != null ) {
        if ( shift ) {
           msg = "10" + keyId;
        } else {
          msg = keyId;
        }
      
        client.sendMessage(msg, "InputKey", 30000, {
          onAbort: function(originalMex, snt) {
            if ( !snt ) {
              alert("Error on send command.");
            }
          },
          onDeny: function(originalMex, code, nbr) {
            alert("Command send deny: " + code + ".");
          },
          onDiscarded: function(originalMex) {
            alert("Command send discarded.");
          },
          onError: function(originalMex) {
            alert("Error on send command.");
          },
          onProcessed: function(originalMex) {
            // OK.
          }
        });
        
      //  updateDinamics(logonName+"_bs", msg);
      } 
    }
  }

  function submitKey(key) {
    if ( client != null ) {
      client.sendMessage(key, "InputKey", 30000, {
        onAbort: function(originalMex, snt) {
          if ( !snt ) {
            alert("Error on send command.");
          }
        },
        onDeny: function(originalMex, code, nbr) {
          alert("Command send deny: " + code + ".");
        },
        onDiscarded: function(originalMex) {
          alert("Command send discarded.");
        },
        onError: function(originalMex) {
          alert("Error on send command.");
        },
        onProcessed: function(originalMex) {
          // OK.
        }
      });
    }
  }
  
  function submitKeySmall(key) {
    if ( client != null ) {
      if ( chkSwitchShift == true ) {
        key = "10"+key;
      } 
      client.sendMessage(key, "InputKey", 30000, {
        onAbort: function(originalMex, snt) {
          if ( !snt ) {
            alert("Error on send command.");
          }
        },
        onDeny: function(originalMex, code, nbr) {
          alert("Command send deny: " + code + ".");
        },
        onDiscarded: function(originalMex) {
          alert("Command send discarded.");
        },
        onError: function(originalMex) {
          alert("Error on send command.");
        },
        onProcessed: function(originalMex) {
          // OK.
        }
      });
    }
  }
  
  function clickCheck(e) {
    
    if ( (physicsMod == 0) &&  document.getElementById("radio_serSide").checked ) {
      // Passare in modalità server side physics calculation.
      console.log("Start Server physics calculation.");
      // backUpDeltasKeys();
      subServerSide();
      unsubDeltas();
      stopPhysics();
      physicsMod = 1;
      
      subsPlayers.setRequestedMaxFrequency(33.0);
      // Reset frequency slider
      $( "#freqslider" ).slider( "option", "min", 1 );
      $( "#freqslider" ).slider( "option", "max", 100 );
      $( "#freqslider" ).slider( "option", "step", 1 );
      $( "#freqslider" ).slider( "option", "values", [33.0]);
      document.getElementById("FreqName").width = 195;
      document.getElementById("FreqName").innerHTML = "Max frequency (for each player)";
      document.getElementById("um").innerHTML = " updates/second per item";
      document.getElementById("maxFreq").style.display = "none";
      document.getElementById("maxFreqS").style.display = "";
      document.getElementById("radio_string").disabled = false;
      document.getElementById("radio_binary").disabled = false;
      document.getElementById("radio_d").disabled = false;
      document.getElementById("radio_s").disabled = false;
      document.getElementById("radio_f").disabled = false;
      $( "#decslider" ).slider( "option", "disabled", false );
    } 
    if ( (physicsMod == 1) &&  document.getElementById("radio_cliSide").checked ) {
      // Passare in modalità client side physics calculation.
      console.log("Start Client physics calculation.");
      unsubServerSide();
      resubDeltas();
      startPhysics();
      physicsMod = 0;
      
      // Fisso Binary Single precision.
      document.getElementById("radio_string").checked = false;
      document.getElementById("radio_binary").checked = true;
      document.getElementById("radio_f").checked = false;
      document.getElementById("radio_s").checked = true;
      document.getElementById("radio_d").checked = false;
      
      subsPlayers.setRequestedMaxFrequency(0.5);
      // Reset frequency slider
      $( "#freqslider" ).slider( "option", "min", 0.05 );
      $( "#freqslider" ).slider( "option", "max", 1.0 );
      $( "#freqslider" ).slider( "option", "step", 0.05 );
      $( "#freqslider" ).slider( "option", "values", [0.5]);
      document.getElementById("FreqName").width = 145;
      document.getElementById("FreqName").innerHTML = "Resynchronization every ";
      document.getElementById("um").innerHTML = " seconds";
      //$( "#maxFreq" ).qtip( "option", "content", "Interval between full resynchronizations sent by the server." );
      document.getElementById("maxFreq").style.display = "";
      document.getElementById("maxFreqS").style.display = "none";
      document.getElementById("radio_string").disabled = true;
      document.getElementById("radio_binary").disabled = true;
      document.getElementById("radio_d").disabled = true;
      document.getElementById("radio_s").disabled = true;
      document.getElementById("radio_f").disabled = true;
      $( "#decslider" ).slider( "option", "disabled", true );
    }
    
    if (document.getElementById("radio_string").checked) {
      document.getElementById("radio_d").disabled = true;
      document.getElementById("radio_s").disabled = true;
      
      document.getElementById("radio_d").style.display = "none";
      document.getElementById("radio_s").style.display = "none";
      document.getElementById("binary_sDesc").style.display = "none";
      document.getElementById("binary_dDesc").style.display = "none";
      
      // document.getElementById("stringDesc").style.display = "";
      // document.getElementById("radio_f").style.display = "";
      
      if (physicsMod != 0 ) {
        document.getElementById("radio_f").disabled = false;
      }
      
      document.getElementById("radio_f").checked = true;
      document.getElementById("radio_s").checked = false;
      document.getElementById("radio_d").checked = false;
      
      radioBut = 0;
      
       if (document.getElementById("radio_f").checked  && !precision.indexOf("s") == 0) {
         precision = "s"+document.getElementById("nowDecimals").innerHTML;
         reSubscribe();
         document.getElementById("decimalInput").style.visibility = "";
      }
      
    } else {
      document.getElementById("radio_d").style.display = "";
      document.getElementById("radio_s").style.display = "";
      document.getElementById("binary_dDesc").style.display = "";
      document.getElementById("binary_sDesc").style.display = "";
      
      document.getElementById("stringDesc").style.display = "none";
      document.getElementById("radio_f").style.display = "none";
    
      if (physicsMod != 0 ) {
        document.getElementById("radio_d").disabled = false;
        document.getElementById("radio_s").disabled = false;
      }
      document.getElementById("radio_f").disabled = true;
      
      if ( radioBut == 0 ) {
        document.getElementById("radio_f").checked = false;
        document.getElementById("radio_s").checked = true;
        document.getElementById("radio_d").checked = false;
      }
      
      radioBut = 1
      
      if (document.getElementById("radio_d").checked  && precision != "bd") {
         precision = "bd";
         reSubscribe();
         document.getElementById("decimalInput").style.visibility = "hidden";
      } else if (document.getElementById("radio_s").checked  && precision != "bs") {
         precision = "bs";
         reSubscribe();
         document.getElementById("decimalInput").style.visibility = "hidden";
      }
    }
    
  }
  
  function sendNickMsg(nick) {
    var msg = "n|" + nick;
    client.sendMessage(msg, "ChangeNick", 30000, {
      onAbort: function(originalMex, snt) {
        if ( !snt ) {
          alert("Error on send command.");
        }
      },
      onDeny: function(originalMex, code, nbr) {
        alert("Command send deny: " + code + ".");
      },
      onDiscarded: function(originalMex) {
        alert("Command send discarded.");
      },
      onError: function(originalMex) {
        alert("Error on send command.");
      },
      onProcessed: function(originalMex) {
        // OK.
        //updateNick(logonName+"_"+precision, nick);
      }
    });
  }
  
  function sendMyMsg(txt) {
    var msg = "m|" + txt;
    client.sendMessage(msg, "sendMyMsg", 30000, {
      onAbort: function(originalMex, snt) {
        if ( !snt ) {
          alert("Error on send command.");
        }
      },
      onDeny: function(originalMex, code, nbr) {
        alert("Command send deny: " + code + ".");
      },
      onDiscarded: function(originalMex) {
        alert("Command send discarded.");
      },
      onError: function(originalMex) {
        alert("Error on send command.");
      },
      onProcessed: function(originalMex) {
        // OK.
        // updateLastMsg(logonName+"_"+precision, txt);
      }
    });
  }
  
  function submitWorld() {
    if (document.getElementById("user_world")) {
      var text = document.getElementById("user_world").value;
      
      if ( text.indexOf(" ") == -1 ) {
        if (text != myWorld ) {
          myWorld = text;
          
          client.unsubscribe(subsPlayers);
          unsubDeltas();
          client.unsubscribe(subsLogon);
          
          subsPlayers.setItems(["Custom_list_"+myWorld+"_"+precision]);
          //subsPlayers.addListener({onSubscription: function(){
          //    subsLogon.setItemGroup("c_logon_"+myWorld+"_"+logonName);
          //    client.subscribe(subsLogon);
          //  }
          //});
          client.subscribe(subsPlayers);
          
          clearScene();
        }
      } else {
        alert("World name not valid.");
        document.getElementById("user_world").value = myWorld;
      }
    } 
  }
  
  function submitNick() {
    if (document.getElementById("user_nick")) {
      var text = document.getElementById("user_nick").value;
      if (!text) {
        alert("Please choose a nickname");
      } else if (text == myNick) {
        // alert("nickname doesn't change! (" + text + "," + myNick +").");
      } else if (text.indexOf(".") == 0) {
        alert(". as first character not valid!");
      } else {
        myNick = text;
        sendNickMsg(myNick);
      }
    }
  }

  function submitMsg() {
    if (document.getElementById("user_msg")) {
      var text = new String(document.getElementById("user_msg").value, "UTF_8");
      
      text = text.replace(/à/g, "a");
      text = text.replace(/è/g, "e");
      text = text.replace(/é/g, "e");
      text = text.replace(/ì/g, "i");
      text = text.replace(/ò/g, "o");
      text = text.replace(/ù/g, "u");
      
      if (!text) {
        alert("Please type a message.");
      } else if (text.indexOf(".") == 0) {
        alert(". as first character not valid!");
      } else {
        sendMyMsg(text);
        myLastWorlds = text;
      }
    }
  } 
  
  // define a random default nickname
  var userNickField = document.getElementById("user_nick");
  if (userNickField) {
    userNickField.value = "Guest" + Math.ceil(Math.random() * 10000);
    if ( location.hash != "" ) {
      get_hash(false);
    }
    logonName = userNickField.value;
    myNick = userNickField.value;
  } else {
    logonName = "Basic" + Math.ceil(Math.random() * 10000);
    myNick = "Basic" + Math.ceil(Math.random() * 10000);
  }
  
  var userMsg = document.getElementById("user_msg");
  userMsg.value = "";
  
  var userWorldField = document.getElementById("user_world");
  if (userWorldField) {
    userWorldField.value = "Default";
    if ( location.hash != "" ) {
      get_hash(false);
    }
    myWorld = userWorldField.value;
  } else {
    myWorld = "Default";
  }
  
  createMessageGrid();
  createBuddyTable();
  
  matrix = false;
  // checkTable(document.getElementById("chkTable"));
  
  function get_hash(change) {
    var fragments = location.hash.substring(1).split("&");
    for (var ij = 0; ij < fragments.length; ij++) {
      if ( fragments[ij].indexOf("user_world") == 0 ) {
        if (userWorldField) {
          userWorldField.value = fragments[ij].split("=")[1];
          if (change) {
            submitWorld();
          }
        }
      }
      if ( fragments[ij].indexOf("user_nick") == 0) {
        if (userNickField) {
          userNickField.value = fragments[ij].split("=")[1];
          if (change) {
            submitNick();
          }
        }
      }
    }
  }
  
//////////////// Message Table Management

  function convertDoubleField(field, value) { 
    var r = fromBase64(value);
    var d = getMyDouble(r);
    info.setCellValue(field, d);
  }
    
  // will create a Subscription+DynaGrid when the nickname is available
  function createMessageGrid() {
  
    //require(["lsClient","DynaGrid","StaticGrid","Subscription"],function(lsClient,DynaGrid,StaticGrid,Subscription) {  
    require(["lsClient","DynaGrid","StaticGrid","Subscription"],function(lsClient,DynaGrid,StaticGrid,Subscription) {  
      client = lsClient;
      
      imGrid = new DynaGrid("players",true);
      imGrid.setMaxDynaRows("unlimited"); // the grid will expand with no limits
      imGrid.setAutoScroll("ELEMENT", "message_scroll"); // automatic scrolling for new messages
      imGrid.setAutoCleanBehavior(false, false);
      imGrid.addListener({
        // background colors to associate to identities
        colors: ["#FFFFE0","#FFEBCD","#F0F8FF","#CCFFCC","#FFF5EE","#E0FFFF","#F0FFF0","#F0E68C","#87CEEB","#E6E6FA","#FFB6C1","#F5FFFA","#FFFAFA","#F5F5DC","#F8F8FF","#FFE4E1","#D8BFD8","#FFF0F5","#EEE8AA"],
        next: 0,
        associated: {},
      
        // set visual effects on received messages
        onVisualUpdate: function(key,info,domNode) {
          //console.log("START --------------------------->");
        
          if (info == null) {
            return;
          }
          //var precision = info.getCellValue("precision");
          if ( info.getCellValue("nick").indexOf(".") == 0) {
            info.setCellValue("nick", info.getCellValue("nick").substring(1));
          } else if ( precision == "bd" ) {
            
            info.forEachChangedField(function(fieldName,newValue) {
              if (newValue != null) {
                if ( ( fieldName != "nick" ) && ( fieldName != "msg" ) ) {
                  var r = fromBase64(newValue);
                  var d = getMyDouble(r);
                  info.setCellValue(fieldName,d);
                }
              }
            });
          
          } else if ( precision == "bs" ) {
          
            info.forEachChangedField(function(fieldName,newValue) {
              if (newValue != null) {
                if ( ( fieldName != "nick" ) && ( fieldName != "msg" ) ) {
                  var r = fromBase64(newValue);
                  var f = getMyFloat(r);
                  info.setCellValue(fieldName, f);
                }
              }
            });
          
          } else {
          
            /*
            info.forEachChangedField(function(fieldName,newValue) {
              if (newValue != null) {
                if ( fieldName != "nick" ) {
                  var f = newValue * 1.0;
                  info.setCellValue(fieldName, f);
                }
              }
            });
            */
          }
          
          if (info.getChangedFieldValue("nick") != null ) {
            if ( (info.getCellValue("nick") == myNick) || (info.getCellValue("nick") == (precision+logonName)) || (info.getCellValue("nick") == (logonName))) {
              domNode.style.fontWeight = "700";
              domNode.style.color = "#FF0000";
              domNode.style.backgroundColor = "#E5E5E5";
            } else if ( !info.getCellValue("nick").indexOf("Ghost") == 0) { 
              // domNode.style.backgroundColor = "#00FFFF";
              domNode.style.backgroundColor = "#E5E5E5";
              domNode.style.color = "#0F87FF";
            } else {
              // domNode.style.backgroundColor = "#E5E5E5";
              domNode.style.backgroundColor = "#E5E5E5";
              domNode.style.color = "#000000";
            }
          }
          
          /*
          var narr = key.split(" ");
          if ( key.indexOf(logonName) == -1 ) {
            updateScene(narr[1], info.getCellValue("posX"), info.getCellValue("posY"), info.getCellValue("posZ"), info.getCellValue("rotX"), info.getCellValue("rotY"), info.getCellValue("rotZ"), info.getCellValue("rotW"), false);
          } else {
            updateScene(narr[1], info.getCellValue("posX"), info.getCellValue("posY"), info.getCellValue("posZ"), info.getCellValue("rotX"), info.getCellValue("rotY"), info.getCellValue("rotZ"), info.getCellValue("rotW"), true);
          }*/
          //console.log("STOP ---------------------------<");
        }
      });
      
      subsPlayers = new Subscription("COMMAND","Custom_list_"+myWorld+"_"+precision,["command", "key"]);
      subsPlayers.setRequestedSnapshot("yes");
      // subsPlayers.setCommandSecondLevelFields(["nick", "msg", "lifeSpan","posY", "posZ", "rotX", "rotY", "rotZ", "rotW", "posX", "dVx", "dVy", "dVz", "dRx", "dRy", "dRz"]);
      subsPlayers.setCommandSecondLevelFields(["nick", "msg", "lifeSpan","posY", "posZ", "rotX", "rotY", "rotZ", "rotW", "posX"]);
      //subsPlayers.setRequestedMaxFrequency("unlimited");
      //subsPlayers.setRequestedMaxFrequency(33.0);
      subsPlayers.setRequestedMaxFrequency(0.5);
      //subsPlayers.addListener(imGrid);
      rndrListener = {
        onItemUpdate: function(updateInfo){
          var posX = null;
          var posY = null;
          var posZ = null;
          var rotX = null;
          var rotY = null;
          var rotZ = null;
          var rotW = null;
          var r, d;
          
          //console.log("START ------>");
          
          if ( precision == "bd" ) {
            
            updateInfo.forEachChangedField(function(fieldName,num,newValue) {
              if (newValue != null) {
                if ( ( fieldName != "nick" ) && ( fieldName != "msg" ) && ( fieldName != "dVx" ) && ( fieldName != "dVy" ) && ( fieldName != "dVz" ) && ( fieldName != "dRx" ) && ( fieldName != "dRy" ) && ( fieldName != "dRz" ) ) {
                  r = fromBase64(newValue);
                  d = getMyDouble(r);
                  switch (fieldName) {
                    case "posX":
                      posX = d;
                      break;
                    case "posY":
                      posY = d;
                      break;
                    case "posZ":
                      posZ = d;
                      break;
                    case "rotX":
                      rotX = d;
                      break;
                    case "rotY":
                      rotY = d;
                      break;
                    case "rotZ":
                      rotZ = d;
                      break;
                    case "rotW":
                      rotW = d;
                      break;
                  }
                }
              } 
            });
          
          } else if ( precision == "bs" ) {
          
            updateInfo.forEachChangedField(function(fieldName,num,newValue) {
              if (newValue != null) {
                if ( ( fieldName != "nick" ) && ( fieldName != "msg" ) && ( fieldName != "dVx" ) && ( fieldName != "dVy" ) && ( fieldName != "dVz" ) && ( fieldName != "dRx" ) && ( fieldName != "dRy" ) && ( fieldName != "dRz" ) ) {
                  r = fromBase64(newValue);
                  d = getMyFloat(r);
                  switch (fieldName) {
                    case "posX":
                      posX = d;
                      break;
                    case "posY":
                      posY = d;
                      break;
                    case "posZ":
                      posZ = d;
                      break;
                    case "rotX":
                      rotX = d;
                      break;
                    case "rotY":
                      rotY = d;
                      break;
                    case "rotZ":
                      rotZ = d;
                      break;
                    case "rotW":
                      rotW = d;
                      break;
                  }
                } 
              }
            });
          
          } else {
          
            updateInfo.forEachChangedField(function(fieldName,num,newValue) {
              if (newValue != null) {
                if ( ( fieldName != "nick" ) && ( fieldName != "msg" ) && ( fieldName != "dVx" ) && ( fieldName != "dVy" ) && ( fieldName != "dVz" ) && ( fieldName != "dRx" ) && ( fieldName != "dRy" ) && ( fieldName != "dRz" ) ) {
                  d = (newValue * 1.0);
                  switch (fieldName) {
                    case "posX":
                      posX = d;
                      break;
                    case "posY":
                      posY = d;
                      break;
                    case "posZ":
                      posZ = d;
                      break;
                    case "rotX":
                      if ( (d > -1) && (d <= 1) ) {
                        rotX = d;
                      }
                      break;
                    case "rotY":
                      if ( (d > -1) && (d <= 1) ) {
                        rotY = d;
                      }
                      break;
                    case "rotZ":
                      if ( (d > -1) && (d <= 1) ) {
                        rotZ = d;
                      }
                      break;
                    case "rotW":
                      if ( (d > -1) && (d <= 1) ) {
                        rotW = d;
                      }
                      break;
                  }
                }
              }
            });
          }
          
          var iam = false;
          if ( updateInfo.getValue("command") == "DELETE" ) {
            removeFromScene(updateInfo.getValue("key"));
            removeDeltaSub(updateInfo.getValue("key"));
          } else {  
            //if ( updateInfo.getValue("key").indexOf(logonName) == -1 ) {
            if ( updateInfo.isValueChanged("nick") ) {
              if ( (updateInfo.getValue("nick") == myNick) || (updateInfo.getValue("nick") == (precision+logonName)) || (updateInfo.getValue("nick") == (logonName)) ) {
                iam = true;
              } else {
                iam = false;
              }
            }
            
            if (( posX != 0 ) && (updateInfo.getValue("nick") != null) ) {
              if ( updateScene(updateInfo.getValue("key"), posX, posY, posZ, rotX, rotY, rotZ, rotW, iam, updateInfo.getValue("lifeSpan")) ) {
                addDeltaSub(updateInfo.getValue("key"));
              }
            }
            
            //if ( updateInfo.getValue("command") == "ADD" ) {
            //  addDeltaSub(updateInfo.getValue("key"));
            //}
            
            if ( updateInfo.isValueChanged("nick") ) {
              if ( updateInfo.getValue("nick") != null) {
                updateNick(updateInfo.getValue("key"), updateInfo.getValue("nick"), iam);
              }
            }
              
            if ( updateInfo.isValueChanged("msg") ) {
              if ( updateInfo.getValue("msg") != null ) {
                updateLastMsg(updateInfo.getValue("key"), updateInfo.getValue("msg"));
              }
            }
            
              /*
            if ( updateInfo.getValue("command") == "ADD" ) {
              console.log("posX: " + posX + ", nick: " + updateInfo.getValue("nick"));
              if (( posX != 0 ) && ( posX != null ) && (updateInfo.getValue("nick") != null) ) {
              
              }
            }*/ 
          }
          
          /*
          if (!updateInfo.getValue("key").startsWith("Ghost")) {
            console.log("Player : " + updateInfo.getValue("key") + " -> " + updateInfo.getValue("lifeSpan"));
          }*/
        },
        onUnsubscription: function() {
          clearScene();
          imGrid.clean();
        },
        onSubscription: function(){
          subsLogon.setItemGroup("c_logon_"+myWorld+"_"+logonName+"_"+physicsMod);
          client.subscribe(subsLogon);
        }
      };
      
      subsPlayers.addListener(rndrListener);
      
      lsClient.subscribe(subsPlayers);
      
      
      subsLogon = new Subscription("DISTINCT", "c_logon_"+myWorld+"_"+logonName+"_"+physicsMod, ["Test"]);
      //subsLogon = new Subscription("DISTINCT", "logon_"+logonName, ["Test"]);
      subsLogon.addListener({onSubscription: function(){
          if (myNick != logonName) {
            sendNickMsg(myNick)
          }
          
          document.getElementById("subscriptionError").innerHTML = " ";
        },
        onSubscriptionError: function(code, msg) {
          document.getElementById("subscriptionError").innerHTML = msg;
        }
      });
      // lsClient.subscribe(subsLogon);
      
      var bandGrid = new StaticGrid("band",true);
      bandGrid.addListener({onVisualUpdate: function(key,info,dom) {
          if (info != null) {
            var v = info.getCellValue("currentBandwidth");
            info.setCellValue("currentBandwidth", v.slice(0,-1) + " kbps.");
          }
        }
      });
      gBandSubs = new Subscription("MERGE", "My_Band_"+logonName, ["currentBandwidth"]);
      gBandSubs.addListener(bandGrid);
      gBandSubs.addListener({onUnsubscription: function() {
          bandGrid.updateRow("My_Band_"+logonName, {currentBandwidth:"-.-"});
        } 
      });
      gBandSubs.setRequestedMaxFrequency(0.5);
      lsClient.subscribe(gBandSubs);
    }); 
 }

//////////////// Buddy Table Management

  // will create a Subscription+DynaGrid after the login
  function createBuddyTable() {

   }
   
   // format a decimal number to a fixed number of decimals
  function formatDecimal(value, decimals, keepZero) {
    if (isNaN(value)) {
      // this server-side demo Data Adapter uses "," as a decimal separator
      value = convertCommaToDot(value);
    }
    var mul = new String("1");
    var zero = new String("0");
    for (var i = decimals; i > 0; i--) {
      mul += zero;
    }
    value = Math.round(value * mul);
    value = value / mul;
    var strVal = new String(value);
    if (!keepZero) {
      return strVal;
    }

    var nowDecimals = 0;
    var dot = strVal.indexOf(".");
    if (dot == -1) {
      strVal += ".";
    } else {
      nowDecimals = strVal.length - dot - 1;
    }
    for (var i = nowDecimals; i < decimals; i++) {
      strVal = strVal + zero;
    }

    return strVal;
  }

  // helper function for onChangingValues event handlers
  function formatNumber(field, info, perc, decimals) {
    var newValue = info.getChangedFieldValue(field);
    if (newValue == null) {
      return;
    }

    formattedVal = newValue;

    if (perc) {
      if (formattedVal > 0) {
        formattedVal = "+" + formattedVal;
      }
      formattedVal += "%";
    }
    info.setCellValue(field,formattedVal);
  }
  
   //////////////// Slider configuration
  
  //Bandwidth slider
  var values = [];
  
  var maxBandVal = 100.5;
  var maxFreqVal = 100.1;
  var maxBandFreqVal = 30;
  var maxDecimals = 15;
  var maxZoom = 500;
  var maxFov = 180;
                
  function updateBWInd(v) {
    if (v == maxBandVal) {
      document.getElementById("nowBandwidth").innerHTML = "unlimited";
      return;
    }

    var txt = v.toString();
    if (txt.indexOf(".5") <= -1) {
      document.getElementById("nowBandwidth").innerHTML = txt + ".0";
    } else {
      document.getElementById("nowBandwidth").innerHTML = v;
    }
  }
  
  function updateFreqInd(v) {
    var txt = v.toString();
    if ( v > 1 ) {
      v+=0.1;
    } else {
      v+=0.001;
    }
    var val = Number(v.toString().substring(0,5));
    if (val == maxFreqVal) {
      val = "unlimited";
      document.getElementById("nowFrequency").innerHTML = val;
    } else {
      if ( physicsMod == 0) {
        document.getElementById("nowFrequency").innerHTML = Math.round(Number((1/v).toString().substring(0,5)))+"";
      } else {
        document.getElementById("nowFrequency").innerHTML = txt;
      }
    }
   
    return val;
  }
  
  function updateBandFreqInd(v) {
    var txt = v.toString();
    document.getElementById("nowBandFrequency").innerHTML = txt;
   
    return Number(txt);
  }
  
  function updateDecimals(v) {
    var txt = v.toString();
    document.getElementById("nowDecimals").innerHTML = txt;
    
    return Number(txt);
  }