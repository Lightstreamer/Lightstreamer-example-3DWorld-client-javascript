/*
  Copyright 2013 Weswit s.r.l.

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


// LightstreamerClient object
var client = null;

// Subscriptions towards Lightstreamer server
var gBandSubs;
var subsPlayers;
var oldSubsPlayers = null;
var oldSubsLogon = null;
var subsDyns;
var subsLogon;
var subSrvSide;
var subsDeltaKeys = new Array();
var subsDelta = new Array();
var subsDeltaBU = new Array();
var subsDeltaKeysBU = new Array();
var subsDynsKeys = new Array();
var subsDyns = new Array();
var nicks = new Array();
var msgs = new Array();

// subsPlayers listeners
var imGrid = null;
var rndrListener = null;

var precision = "bs";
var radioBut = 0;
var matrix = false;
var rendering = false;
var chkSwitchShift = false;
var iamWatcher = false;
var chkDebug = false;
var noCmds = false;
var physicsMod = 0;
var freqDyns = 0.5;

var keyCount_a = 0;
var keyCount_w = 0;
var keyCount_d = 0;
var keyCount_s = 0;
var keyCount_1 = 0;
var keyCount_2 = 0;

var keyCount_sa = 0;
var keyCount_sw = 0;
var keyCount_sd = 0;
var keyCount_ss = 0;
var keyCount_s1 = 0;
var keyCount_s2 = 0;

// nickname chosen by this page's user; 
var myNick = null;
var whoIam = "";
var myLastWords = "";
// logonname random generated, it is used in the
// item name for the subscription logon
var logonName = null;
var myWorld = "Utente";
var myOldWorld = "Utente";

function checkCanvas(checkBtn) {
  if ( rndrListener != null ) {
    if (checkBtn.checked == true ) {
      stopRender();
      document.getElementById("theWorld").style.display = "none";
    } else {
      startRender();
      document.getElementById("theWorld").style.display = "";
    }
  }
}

function stopGrid() {
  console.log("stopGrid.");
  //subsPlayers.removeListener(imGrid);
  var ik = 0
  while ( subsDyns.length > ik ) {
    subsDyns[ik].removeListener(imGrid);
    ik++
  }
}

function startGrid() {
  imGrid.clean();
  var cubes = getScene();
  if ( cubes != null ) {
    for (var ik=0;ik<cubes.length;ik++) {
      //imGrid.updateRow("Custom_list_"+myWorld+"_"+precision +" "+cubes[ik].name, {nick:"."+getNick(ik),
      imGrid.updateRow(cubes[ik].name, {nick:"."+getNick(ik),
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
  //subsPlayers.addListener(imGrid);
  var ik = 0
  while ( subsDyns.length > ik ) {
    subsDyns[ik].addListener(imGrid);
    ik++
  }
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

  function unsubDyns() {
    var tmp;
    
    while (subsDyns.length > 0) {
      tmp = subsDyns.pop();
      if ( tmp.isActive() == true ) {
        client.unsubscribe(tmp);
      }
    }
    
    while (subsDynsKeys.length > 0) {
      subsDynsKeys.pop();
    }
  }
  
  function updFrequencyDyns(rv) {
    var indx = 0;
    
    freqDyns = rv;
    while (indx < subsDyns.length ) {
      if (subsDyns[indx].isActive() == false) {
        subsDyns[indx].setRequestedMaxFrequency(rv);
        client.subscribe(subsDyns[indx]);
      } else {
        if ( rv < 0.001 ) {
          client.unsubscribe(subsDyns[indx]);
        } else {
          subsDyns[indx].setRequestedMaxFrequency(rv);
        }
      }
      indx++
    }
  }
  
  function removeDynsSub(key) {
    var indx = subsDynsKeys.indexOf(key);
    
    if ( indx != -1 ) {
      var tmp = subsDyns[indx];
      
      if ( tmp.isActive() == true ) {
        client.unsubscribe(tmp);
      }
      subsDynsKeys.splice(indx, 1);
      subsDyns.splice(indx, 1);
      if ( matrix == true ) {
        imGrid.removeRow(key);
        tmp.removeListener(imGrid);
      }
    }
  }
  
  function addDynsSub(key) {
    var indx = subsDynsKeys.indexOf(key);
    
    if ( indx == -1 ) {
      try {
        require(["Subscription"],function(Subscription) {  
          var tmp;
          if ( chkDebug == true ) {
            tmp = new Subscription("MERGE",key,["posX", "posY", "posZ", "rotX", "rotY", "rotZ", "rotW", "lifeSpan"]);
          } else {
            tmp = new Subscription("MERGE",key,["posX", "posY", "posZ", "rotX", "rotY", "rotZ", "rotW"]);
          }
          
          tmp.setRequestedSnapshot("yes");
          if (freqDyns >= 0.0001 ) {
            tmp.setRequestedMaxFrequency(freqDyns);
          } else {
            tmp.setRequestedMaxFrequency(1);
          }
          
          tmp.addListener({
            
            itemKey: key,
          
            onEndOfSnapshot: function(key, itemPos) {
              //if (freqDyns < 0.0001 ) {
              //  client.unsubscribe(subsDyns[subsDynsKeys.indexOf(key)]);
              //}
            },
            onItemUpdate: function(updateInfo){
              var posX = null;
              var posY = null;
              var posZ = null;
              var rotX = null;
              var rotY = null;
              var rotZ = null;
              var rotW = null;
              var r, d;
              
              if ( subsDynsKeys.indexOf(updateInfo.getItemName()) == -1 ) {
                return ;
              }
              
              if ( precision == "bd" ) {
                
                updateInfo.forEachChangedField(function(fieldName,num,newValue) {
                  if (newValue != null) {
                    if ( ( fieldName != "nick" ) ) {
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
                    if ( ( fieldName != "nick" ) ) {
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
                    if ( ( fieldName != "nick" ) ) {
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
              if ( whoIam == updateInfo.getItemName() ) {
                iam = true;
              } else {
                iam = false;
              }
              
              var nn = nicks[updateInfo.getItemName()];
              var mm = msgs[updateInfo.getItemName()];
              if ( chkDebug == true ) {
                if ( updateScene(updateInfo.getItemName(), posX, posY, posZ, rotX, rotY, rotZ, rotW, iam, updateInfo.getValue("lifeSpan")) ) {
                  if ( nn != null ) {
                    updateNick(updateInfo.getItemName(), nn, iam);
                  }
                  if ( mm != null ) {
                    updateLastMsg(updateInfo.getItemName(), mm);
                  }
                  addDeltaSub(updateInfo.getItemName());
                  if ((freqDyns < 0.0001) && (posX != null)) {
                    client.unsubscribe(subsDyns[subsDynsKeys.indexOf(updateInfo.getItemName())]);
                  }
                }
              } else {
                if ( updateScene(updateInfo.getItemName(), posX, posY, posZ, rotX, rotY, rotZ, rotW, iam, 0) ) {
                  if ( nn != null ) {
                    updateNick(updateInfo.getItemName(), nn, iam);
                  }
                  if ( mm != null ) {
                    updateLastMsg(updateInfo.getItemName(), mm);
                  }
                  addDeltaSub(updateInfo.getItemName());
                }
                if ( (freqDyns < 0.0001) && (posX != null) ) {
                  client.unsubscribe(subsDyns[subsDynsKeys.indexOf(updateInfo.getItemName())]);
                }
              }
            },
            onUnsubscription: function() {
              //if ( whoIam == this.itemKey ) {
              //  clearKeyCounts();
              //}
            }
          });
          
          if ( matrix ) {
            tmp.addListener(imGrid);
          }
          client.subscribe(tmp);
          var indy = subsDynsKeys.push(key) - 1;
          subsDyns[indy] = tmp;
          
          });
      } catch(e) {console.error(e);}
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
          var tmp = new Subscription("MERGE",key,["Vx", "Vy", "Vz", "momx", "momy", "momz"]);
          
          tmp.setRequestedSnapshot("yes");
          tmp.setRequestedMaxFrequency("unlimited");
          tmp.addListener({
            onItemUpdate: function(updInfo) {
              var parent = null;
              
              if ( updInfo.isValueChanged("Vx") ) {
                updateDinamics2(updInfo.getItemName(), "Vx", updInfo.getValue("Vx"));
                /*if ( updInfo.isSnapshot() && (updInfo.getItemName() == whoIam) ) {
                  if (updInfo.getValue("Vx")>0) {
                    parent = document.getElementById("dic");
                    updateImp_Counter(parent, "impcounter_d", updInfo.getValue("Vx"));
                  } else {
                    parent = document.getElementById("aic");
                    updateImp_Counter(parent, "impcounter_a", updInfo.getValue("Vx"));
                  }
                }*/
              }
              if ( updInfo.isValueChanged("Vy") ) {
                updateDinamics2(updInfo.getItemName(), "Vy", updInfo.getValue("Vy"));
              }
              if ( updInfo.isValueChanged("Vz") ) {
                updateDinamics2(updInfo.getItemName(), "Vz", updInfo.getValue("Vz"));
              }
              if ( updInfo.isValueChanged("momx") ) {
                updateDinamics2(updInfo.getItemName(), "momx", updInfo.getValue("momx"));
              }
              if ( updInfo.isValueChanged("momy") ) {
                updateDinamics2(updInfo.getItemName(), "momy",updInfo.getValue("momy"));
              }
              if ( updInfo.isValueChanged("momz") ) {
                updateDinamics2(updInfo.getItemName(), "momz",updInfo.getValue("momz"));
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
      client.unsubscribe(subsDelta[indx]);
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
      
      indx = subsDeltaKeys.indexOf(keyT);
      if ( indx == -1 ) {
        indx = subsDeltaKeys.push(keyT);
        subsDelta[indx] = tmpSub;
        client.subscribe(tmpSub);
      }
    }
  }
  
  function resubPlayers() {
    client.unsubscribe(subsPlayers);
    client.subscribe(subsPlayers);
  }

function checkTable(obj) {
  if (obj.id == "matrix" ) {
    if ( imGrid != null ) {
      if (matrix) {
        stopGrid();
        matrix = false;
      } else {
        startGrid();
        matrix = true;
      }
    }
  } else if (obj.id == "rendering" ) {
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
  $( "#world_button" ).button( "option", "disabled", false );
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
  
  function reSubscribe() {
    try {
      oldSubsPlayers = subsPlayers;
      oldSubsPlayers.removeListener(rndrListener);
      
      unsubDeltas();
      unsubDyns();
      
      subsDeltaKeys.splice(0, subsDeltaKeys.length);
      subsDeltaKeysBU.splice(0, subsDeltaKeysBU.length);
      subsDyns.splice(0, subsDeltaKeys.length);
      subsDynsKeys.splice(0, subsDeltaKeys.length);
      if (matrix) {
        imGrid.clean();
      }
    
      require(["Subscription"],function(Subscription) {
        subsPlayers = new Subscription("COMMAND","Custom_list_"+myWorld+"_"+precision,["command", "key", "nick", "msg"]);

        subsPlayers.setRequestedSnapshot("yes");
        subsPlayers.addListener(rndrListener);

        client.subscribe(subsPlayers);
      });
      if (myNick != logonName) {
        setTimeout(function(){sendNickMsg(myNick)},50);
      }

      clearScene();
    } catch (x) {
      console.error("Re-subscribe procedure for precision changes failed", e);
    }
  }
  
  function clearKeyCounts() {
    var parent = null;
    
    keyCount_a = 0;
    parent = document.getElementById("aic");
    updateImp_Counter(parent, "impcounter_a",  keyCount_a);
    
    keyCount_w = 0;
    parent = document.getElementById("wic");
    updateImp_Counter(parent, "impcounter_w",  keyCount_w);
    
    keyCount_d = 0;
    parent = document.getElementById("dic");
    updateImp_Counter(parent, "impcounter_d",  keyCount_d);
    
    keyCount_s = 0;
    parent = document.getElementById("sic");
    updateImp_Counter(parent, "impcounter_s",  keyCount_s);
    
    keyCount_1 = 0;
    parent = document.getElementById("1ic");
    updateImp_Counter(parent, "impcounter_1",  keyCount_1);
    
    keyCount_2 = 0;
    parent = document.getElementById("2ic");
    updateImp_Counter(parent, "impcounter_2",  keyCount_2);

    keyCount_sa = 0;
    parent = document.getElementById("aic");
    updateImp_Counter(parent, "impcounter_sa",  keyCount_sa);
    
    keyCount_sw = 0;
    parent = document.getElementById("wic");
    updateImp_Counter(parent, "impcounter_sw",  keyCount_sw);
    
    keyCount_sd = 0;
    parent = document.getElementById("dic");
    updateImp_Counter(parent, "impcounter_sd",  keyCount_sd);
    
    keyCount_ss = 0;
    parent = document.getElementById("sic");
    updateImp_Counter(parent, "impcounter_ss",  keyCount_ss);
    
    keyCount_s1 = 0;
    parent = document.getElementById("1ic");
    updateImp_Counter(parent, "impcounter_s1",  keyCount_s1);
    
    keyCount_s2 = 0;
    parent = document.getElementById("2ic");
    updateImp_Counter(parent, "impcounter_s2",  keyCount_s2);
  }
  
  function switchShift() {
    var parent = null;
    
    if ( chkSwitchShift == true ) {
      chkSwitchShift = false;
      $( "#checkRot" ).button( "option", "label", "Position" );
      
      if ( document.getElementById("impcounter_w") != null ) {
        document.getElementById("impcounter_w").style.display = "";
      }
      parent = document.getElementById("wic");
      updateImp_Counter(parent, "impcounter_w",  keyCount_w);
      
      if ( document.getElementById("impcounter_s") != null ) {
        document.getElementById("impcounter_s").style.display = "";
      }
      parent = document.getElementById("sic");
      updateImp_Counter(parent, "impcounter_s",  keyCount_s);
      
      if ( document.getElementById("impcounter_a") != null ) {
        document.getElementById("impcounter_a").style.display = "";
      }
      parent = document.getElementById("aic");
      updateImp_Counter(parent, "impcounter_a",  keyCount_a);
      
      if ( document.getElementById("impcounter_d") != null ) {
        document.getElementById("impcounter_d").style.display = "";
      }
      parent = document.getElementById("dic");
      updateImp_Counter(parent, "impcounter_d",  keyCount_d);
      
      if ( document.getElementById("impcounter_2") != null ) {
        document.getElementById("impcounter_2").style.display = "";
      }
      parent = document.getElementById("2ic");
      updateImp_Counter(parent, "impcounter_2",  keyCount_2);
      
      if ( document.getElementById("impcounter_1") != null ) {
        document.getElementById("impcounter_1").style.display = "";
      }
      parent = document.getElementById("1ic");
      updateImp_Counter(parent, "impcounter_1",  keyCount_1);
      
      if ( document.getElementById("impcounter_sw") != null ) {
        document.getElementById("impcounter_sw").style.display = "none";
      }
      if ( document.getElementById("impcounter_ss") != null ) {
        document.getElementById("impcounter_ss").style.display = "none";
      }
      if ( document.getElementById("impcounter_sa") != null ) {
        document.getElementById("impcounter_sa").style.display = "none";
      }
      if ( document.getElementById("impcounter_sd") != null ) {
        document.getElementById("impcounter_sd").style.display = "none";
      }
      if ( document.getElementById("impcounter_s2") != null ) {
        document.getElementById("impcounter_s2").style.display = "none";
      }
      if ( document.getElementById("impcounter_s1") != null ) {
        document.getElementById("impcounter_s1").style.display = "none";
      }
    } else {
      $( "#checkRot" ).button( "option", "label", "Rotation" );
      chkSwitchShift = true;
      
      if ( document.getElementById("impcounter_w") != null ) {
        document.getElementById("impcounter_w").style.display = "none";
      }
      if ( document.getElementById("impcounter_s") != null ) {
        document.getElementById("impcounter_s").style.display = "none";
      }
      if ( document.getElementById("impcounter_a") != null ) {
        document.getElementById("impcounter_a").style.display = "none";
      }
      if ( document.getElementById("impcounter_d") != null ) {
        document.getElementById("impcounter_d").style.display = "none";
      }
      if ( document.getElementById("impcounter_2") != null ) {
        document.getElementById("impcounter_2").style.display = "none";
      }
      if ( document.getElementById("impcounter_1") != null ) {
        document.getElementById("impcounter_1").style.display = "none";
      }

      if ( document.getElementById("impcounter_sw") != null ) {
        document.getElementById("impcounter_sw").style.display = "";
      }
      parent = document.getElementById("wic");
      updateImp_Counter(parent, "impcounter_sw",  keyCount_sw);
      
      if ( document.getElementById("impcounter_ss") != null ) {
        document.getElementById("impcounter_ss").style.display = "";
      }
      parent = document.getElementById("sic");
      updateImp_Counter(parent, "impcounter_ss",  keyCount_ss);
      
      if ( document.getElementById("impcounter_sa") != null ) {
        document.getElementById("impcounter_sa").style.display = "";
      }      
      parent = document.getElementById("aic");
      updateImp_Counter(parent, "impcounter_sa",  keyCount_sa);
      
      if ( document.getElementById("impcounter_sd") != null ) {
        document.getElementById("impcounter_sd").style.display = "";
      }      
      parent = document.getElementById("dic");
      updateImp_Counter(parent, "impcounter_sd",  keyCount_sd);
      
      if ( document.getElementById("impcounter_s2") != null ) {
        document.getElementById("impcounter_s2").style.display = "";
      }
      parent = document.getElementById("2ic");
      updateImp_Counter(parent, "impcounter_s2",  keyCount_s2);
      
      if ( document.getElementById("impcounter_s1") != null ) {
        document.getElementById("impcounter_s1").style.display = "";
      }
      parent = document.getElementById("1ic");
      updateImp_Counter(parent, "impcounter_s1",  keyCount_s1);
      
    }
    
    return ;
  }
  
  addEvent("keyup", KeyCheck, true); 
  addEvent("click", clickCheck, true);
  addEvent("resize", onWindowResize, true);
  addEvent("hashchange", get_hash, true);
  
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
  
  function setFocus(obj) {
    noCmds = true;
  }
  
  function unFocus(obj) {
    noCmds = false;
  }
  
  function updateImp_Counter(parent, idDiv, count) {
    var div = null;
    var div = document.getElementById(idDiv);
    
    if ( div == null ) {
      var div = document.createElement('div');
      div.id = idDiv;
    
      div.style.position = 'absolute';
      div.style.left = (parent.style.left + 29)+'px';
      div.style.top = (parent.style.top + 20)+'px';
      div.style.fontSize = '5pt';
      div.style.zIndex = "50";
    
      parent.appendChild(div);
    }
    if ( count > 0 ) {
      div.innerHTML = "" + count;
    } else {
      div.innerHTML = "";
    }
  }
  
  function impulsesCounter(keyId) {
    if ( keyId == 87 ) {
      if (keyCount_s > 0) {
        keyCount_s--;
        if ( chkSwitchShift == false ) {
          var parent = document.getElementById("sic");
          updateImp_Counter(parent, "impcounter_s",  keyCount_s);
        }
      } else {
        keyCount_w++;
        if ( chkSwitchShift == false ) {
          var parent = document.getElementById("wic");
          updateImp_Counter(parent, "impcounter_w",  keyCount_w);
        }
      }
    }
    if ( keyId == 83 ) {
      if (keyCount_w > 0) {
        keyCount_w--;
        if ( chkSwitchShift == false ) {
          var parent = document.getElementById("wic");
          updateImp_Counter(parent, "impcounter_w",  keyCount_w);
        }
      } else {
        keyCount_s++;
        if ( chkSwitchShift == false ) {
          var parent = document.getElementById("sic");
          updateImp_Counter(parent, "impcounter_s",  keyCount_s);
        }
      }
    }
    if ( keyId == 65 ) {
      if (keyCount_d > 0) {
        keyCount_d--;
        if ( chkSwitchShift == false ) {
          var parent = document.getElementById("dic");
          updateImp_Counter(parent, "impcounter_d",  keyCount_d);
        }
      } else {
        keyCount_a++;
        if ( chkSwitchShift == false ) {
          var parent = document.getElementById("aic");
          updateImp_Counter(parent, "impcounter_a",  keyCount_a);
        }
      }
    }
    if ( keyId == 68 ) {
      if (keyCount_a > 0) {
        keyCount_a--;
        if ( chkSwitchShift == false ) {
          var parent = document.getElementById("aic");
          updateImp_Counter(parent, "impcounter_a",  keyCount_a);
        }
      } else {
        keyCount_d++;
        if ( chkSwitchShift == false ) {
          var parent = document.getElementById("dic");
          updateImp_Counter(parent, "impcounter_d",  keyCount_d);
        }
      }
    }
    if ( keyId == 49 ) {
      if (keyCount_2 > 0) {
        keyCount_2--;
        if ( chkSwitchShift == false ) {
          var parent = document.getElementById("2ic");
          updateImp_Counter(parent, "impcounter_2",  keyCount_2);
        }
      } else {
        keyCount_1++;
        if ( chkSwitchShift == false ) {
          var parent = document.getElementById("1ic");
          updateImp_Counter(parent, "impcounter_1",  keyCount_1);
        }
      }
    }
    if ( keyId == 50 ) {
      if (keyCount_1 > 0) {
        keyCount_1--;
        if ( chkSwitchShift == false ) {
          var parent = document.getElementById("1ic");
          updateImp_Counter(parent, "impcounter_1",  keyCount_1);
        }
      } else {
        keyCount_2++;
        if ( chkSwitchShift == false ) {
          var parent = document.getElementById("2ic");
          updateImp_Counter(parent, "impcounter_2",  keyCount_2);
        }
      }
    }
  }

  function impulsesShiftCounter(keyId) {
    if ( keyId == 87 ) {
      if (keyCount_ss > 0) {
        keyCount_ss--;
        if ( chkSwitchShift == true ) {
          var parent = document.getElementById("sic");
          updateImp_Counter(parent, "impcounter_ss",  keyCount_ss);
        }
      } else {
        keyCount_sw++;
        if ( chkSwitchShift == true ) {
          var parent = document.getElementById("wic");
          updateImp_Counter(parent, "impcounter_sw",  keyCount_sw);
        }
      }
    }
    if ( keyId == 83 ) {
      if (keyCount_sw > 0) {
        keyCount_sw--;
        if ( chkSwitchShift == true ) {
          var parent = document.getElementById("wic");
          updateImp_Counter(parent, "impcounter_sw",  keyCount_sw);
        }
      } else {
        keyCount_ss++;
        if ( chkSwitchShift == true ) {
          var parent = document.getElementById("sic");
          updateImp_Counter(parent, "impcounter_ss",  keyCount_ss);
        }
      }
    }
    if ( keyId == 65 ) {
      if (keyCount_sd > 0) {
        keyCount_sd--;
        if ( chkSwitchShift == true ) {
          var parent = document.getElementById("dic");
          updateImp_Counter(parent, "impcounter_sd",  keyCount_sd);
        }
      } else {
        keyCount_sa++;
        if ( chkSwitchShift == true ) {
          var parent = document.getElementById("aic");
          updateImp_Counter(parent, "impcounter_sa",  keyCount_sa);
        }
      }
    }
    if ( keyId == 68 ) {
      if (keyCount_sa > 0) {
        keyCount_sa--;
        if ( chkSwitchShift == true ) {
          var parent = document.getElementById("aic");
          updateImp_Counter(parent, "impcounter_sa",  keyCount_sa);
        }
      } else {
        keyCount_sd++;
        if ( chkSwitchShift == true ) {
          var parent = document.getElementById("dic");
          updateImp_Counter(parent, "impcounter_sd",  keyCount_sd);
        }
      }
    }
    if ( keyId == 49 ) {
      if (keyCount_s2 > 0) {
        keyCount_s2--;
        if ( chkSwitchShift == true ) {
          var parent = document.getElementById("2ic");
          updateImp_Counter(parent, "impcounter_s2",  keyCount_s2);
        }
      } else {
        keyCount_s1++;
        if ( chkSwitchShift == true ) {
          var parent = document.getElementById("1ic");
          updateImp_Counter(parent, "impcounter_s1",  keyCount_s1);
        }
      }
    }
    if ( keyId == 50 ) {
      if (keyCount_s1 > 0) {
        keyCount_s1--;
        if ( chkSwitchShift == true ) {
          var parent = document.getElementById("1ic");
          updateImp_Counter(parent, "impcounter_s1",  keyCount_s1);
        }
      } else {
        keyCount_s2++;
        if ( chkSwitchShift == true ) {
          var parent = document.getElementById("2ic");
          updateImp_Counter(parent, "impcounter_s2",  keyCount_s2);
        }
      }
    }
  }
 
  function KeyCheck(e) {
    var keyId = (window.event) ? event.keyCode : e.keyCode;
    var shift = (window.event) ? event.shiftKey : e.shiftKey;
    
    if (keyId == 13) {
      // Return
      if ( myNick != document.getElementById("user_nick").value) {
        submitNick();
        document.getElementById("user_nick").blur();
      } 
      if (myLastWords != document.getElementById("user_msg").value) {
        submitMsg();
        document.getElementById("user_msg").blur();
      }
    }
    
    if ( noCmds == true ) {
      return ;
    }
    
    if ( (keyId == 87) || (keyId == 65) || (keyId == 83) || (keyId == 49) || (keyId == 50) || (keyId == 68) ) {
      if ( client != null ) {
        if ( shift ) {
          impulsesShiftCounter(keyId);
          msg = "10" + keyId;
        } else {
          impulsesCounter(keyId);
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
      } 
    }
  }

  function submitKey(key) {
    if ( client != null ) {
      if ( (""+key).indexOf("10") > -1 ) {
        impulsesShiftCounter((""+key).substr(2,2));
      } else {
        impulsesCounter(key);
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
  
  function submitKeySmall(key) {
    if ( client != null ) {
      if ( chkSwitchShift == true ) {
        impulsesShiftCounter(key);
        key = "10"+key;
      } else {
        impulsesCounter(key);
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
  
  function disableAllCommands() {
    document.getElementById("radio_string").disabled = true;
    document.getElementById("radio_binary").disabled = true;
    document.getElementById("radio_d").disabled = true;
    document.getElementById("radio_s").disabled = true;
    document.getElementById("radio_f").disabled = true;
    document.getElementById("radio_serSide").disabled = true;
    document.getElementById("user_nick").disabled = true;
    document.getElementById("user_msg").disabled = true;
    
    $( "#decslider" ).slider( "option", "disabled", true );
    $( "#freqslider" ).slider( "option", "disabled", true );
    $( "#feedslider" ).slider( "option", "disabled", true );
    $( "#bwslider" ).slider( "option", "disabled", true );
    
    if ( physicsMod != 0 ) {
      // force switch to client side
      document.getElementById("radio_serSide").checked = false;
      document.getElementById("radio_cliSide").checked = true;
      clickCheck();
    }
  }
  
  function enableAllCommands() {
  
    if ( iamWatcher ) {
      document.getElementById("radio_string").disabled = true;
      document.getElementById("radio_binary").disabled = true;
      document.getElementById("radio_d").disabled = true;
      document.getElementById("radio_s").disabled = true;
      document.getElementById("radio_f").disabled = true;
      document.getElementById("radio_serSide").disabled = false;
      document.getElementById("user_nick").disabled = false;
      document.getElementById("user_msg").disabled = false;
      
      $( "#decslider" ).slider( "option", "disabled", true );
      $( "#freqslider" ).slider( "option", "disabled", true );
      $( "#feedslider" ).slider( "option", "disabled", false );
      $( "#bwslider" ).slider( "option", "disabled", false );
    }
    
    iamWatcher = false;
  }
  
  function clickCheck(e) {
    
    if ( (physicsMod == 0) &&  document.getElementById("radio_serSide").checked ) {
      // Passare in modalità server side physics calculation.
      subServerSide();
      unsubDeltas();
      //resubPlayers();
      stopPhysics();
      physicsMod = 1;
      
      //subsPlayers.setRequestedMaxFrequency(33.0);
      updFrequencyDyns(33.0);
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
      unsubServerSide();
      resubDeltas();
      startPhysics();
      physicsMod = 0;
      
      // Fix Binary Single precision.
      document.getElementById("radio_string").checked = false;
      document.getElementById("radio_binary").checked = true;
      document.getElementById("radio_f").checked = false;
      document.getElementById("radio_s").checked = true;
      document.getElementById("radio_d").checked = false;
      
      //subsPlayers.setRequestedMaxFrequency(0.5);
      updFrequencyDyns(0.5);
      // Reset frequency slider
      $( "#freqslider" ).slider( "option", "min", 0.0 );
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
      }
    });
  }
  
  function isNotAlphanumeric(val){
    return (! val.match(/^[a-zA-Z0-9]+$/));
  } 
  
  function checkAlphanum() {
    var text = document.getElementById("user_world").value ;
    if ( text != "" ) {
      if (isNotAlphanumeric(text)) {
        //$( "#world_button" ).button( "option", "disabled", true );
        //alert("Only alphanumeric please.");
        document.getElementById("user_world").value = myOldWorld;
      } else {
        myOldWorld = text;
      }
    }
  }

  function submitWorld() {
    if (document.getElementById("user_world")) {
      var text = document.getElementById("user_world").value;
      
      if ( (text.indexOf(" ") == -1) && (!isNotAlphanumeric(text)) ) {
        if (text != myWorld ) {
          myWorld = text;
          
          oldSubsPlayers = subsPlayers;
          oldSubsPlayers.removeListener(rndrListener);
          
          //client.unsubscribe(subsPlayers);
          unsubDeltas();
          unsubDyns();
          
          oldSubsLogon = subsLogon;
          //oldSubsLogon.removeListener(rndrListener);
          //client.unsubscribe(subsLogon);
          
          subsDeltaKeys.splice(0, subsDeltaKeys.length);
          subsDeltaKeysBU.splice(0, subsDeltaKeysBU.length);
          subsDyns.splice(0, subsDeltaKeys.length);
          subsDynsKeys.splice(0, subsDeltaKeys.length);
          if (matrix) {
            imGrid.clean();
          }
          
          require(["Subscription","js/LogonListener"],function(Subscription,LogonListener) {
            subsPlayers = new Subscription("COMMAND","Custom_list_"+myWorld+"_"+precision,["command", "key", "nick", "msg"]);
          
            subsPlayers.setRequestedSnapshot("yes");
            subsPlayers.addListener(rndrListener);
            
            client.subscribe(subsPlayers);
            
            subsLogon = new Subscription("DISTINCT", "c_logon_", ["Test"]);
            subsLogon.addListener(new LogonListener(oldSubsPlayers,oldSubsLogon,document.getElementById("subscriptionError")));
          });
          
          //document.getElementById("user_msg").value = "";
          clearScene();
          
          var myUrl = document.URL;
          var indx = myUrl.indexOf("user_world");
          if ( indx != -1 ) {
            var oldWorld = myUrl.substring(indx);
            var nindx = oldWorld.indexOf("&");
            if (nindx != -1 ) {
              oldWorld = oldWorld.substring(0, nindx);
              var url = myUrl.substring(0, indx);
              var hashf = myUrl.substring(indx);
              window.location.replace(url+hashf.replace(oldWorld.substring(11), myWorld));
            } else {
              var url = myUrl.substring(0, indx);
              var hashf = myUrl.substring(indx);
              window.location.replace(url+hashf.replace(oldWorld.substring(11), myWorld));
            }
          } else {
            window.location.replace(myUrl+"#user_world="+myWorld);
          }
        }
      } else {
        alert("World name not valid.");
        document.getElementById("user_world").value = myWorld;
      }
      
      document.getElementById("user_world").blur();
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
    var text = null;
    
    if (document.getElementById("user_msg")) {
      text = new String(document.getElementById("user_msg").value, "UTF_8");
      
      text = text.replace(/à/g, "a");
      text = text.replace(/è/g, "e");
      text = text.replace(/é/g, "e");
      text = text.replace(/ì/g, "i");
      text = text.replace(/ò/g, "o");
      text = text.replace(/ù/g, "u");
    } else {
      text = " ";
    }
    
    if (text.indexOf(".") == 0) {
      alert(". as first character not valid!");
    } else if (myLastWords != text) {
        myLastWords = text;
        sendMyMsg(text);
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
      if ( fragments[ij].indexOf("debug_lifespan") == 0) {
        chkDebug = true;
      }
    }
  }
  
//////////////// Message Table Management

  function convertDoubleField(field, value) { 
    var r = fromBase64(value);
    var d = getMyDouble(r);
    info.setCellValue(field, d);
  }
    
  function createMessageGrid() {
   
    require(["js/lsClient","js/LogonListener","DynaGrid","StaticGrid","Subscription"],function(lsClient,LogonListener,DynaGrid,StaticGrid,Subscription) {
      client = lsClient;
      
      lsClient.addListener({onServerError: function(errorCode, errorMsg) {
          $( "#dialog" ).dialog( "open" );
        }
      });
      
      imGrid = new DynaGrid("players",true);
      imGrid.setMaxDynaRows("unlimited"); // the grid will expand with no limits
      imGrid.setAutoScroll("ELEMENT", "message_scroll"); // automatic scrolling for new messages
      imGrid.setAutoCleanBehavior(false, false);
      imGrid.addListener({
        // set visual effects on received messages
        onVisualUpdate: function(key,info,domNode) {
                
          if (info == null) {
            return;
          }
         

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
            // Skip.
          }
          
          if ( (key == myNick) || (key == (logonName+"_"+precision)) || (info.getCellValue("nick") == (logonName))) {
            domNode.style.fontWeight = "700";
            domNode.style.color = "#FF0000";
            domNode.style.backgroundColor = "#E5E5E5";
          } else if ( !key.indexOf("Ghost") == 0) {
            domNode.style.backgroundColor = "#E5E5E5";
            domNode.style.color = "#0F87FF";
          } else {
            domNode.style.backgroundColor = "#E5E5E5";
            domNode.style.color = "#000000";
          }
        }
      });
      
      subsPlayers = new Subscription("COMMAND","Custom_list_"+myWorld+"_"+precision,["command", "key", "nick", "msg"]);
      subsPlayers.setRequestedSnapshot("yes");

      rndrListener = {
        onItemUpdate: function(updateInfo){
          var iam = false;
          
          if ( updateInfo.getValue("command") == "ADD" ) {
            
            if ( (updateInfo.getValue("key") == myNick) || (updateInfo.getValue("key") == (logonName+"_"+precision)) || (updateInfo.getValue("key") == (logonName)) ) {
              iam = true;
              whoIam = updateInfo.getValue("key");
            } else {
              iam = false;
            }
            
            addDynsSub(updateInfo.getValue("key"));
          } else if ( updateInfo.getValue("command") == "DELETE" ) {
            removeFromScene(updateInfo.getValue("key"));
            removeDynsSub(updateInfo.getValue("key"));
            removeDeltaSub(updateInfo.getValue("key"));
          } 
            
          if ( updateInfo.getValue("command") != "DELETE" ) {
            if ( updateInfo.isValueChanged("nick") ) {
              if ( updateInfo.getValue("nick") != null) {
                if ( (updateInfo.getValue("key") == myNick) || (updateInfo.getValue("key") == (logonName+"_"+precision)) || (updateInfo.getValue("key") == (logonName)) ) {
                  iam = true;
                  whoIam = updateInfo.getValue("key");
                } else {
                  iam = false;
                }
              
                updateNick(updateInfo.getValue("key"), updateInfo.getValue("nick"), iam);
                nicks[updateInfo.getValue("key")] = updateInfo.getValue("nick");
                if ( matrix ) {
                  imGrid.updateRow(updateInfo.getValue("key"), {nick: "."+updateInfo.getValue("nick")});
                }
              }
            }
              
            if ( updateInfo.isValueChanged("msg") ) {
              if ( updateInfo.getValue("msg") != null ) {
                updateLastMsg(updateInfo.getValue("key"), updateInfo.getValue("msg"));
                msgs[updateInfo.getValue("key")] = updateInfo.getValue("msg");
              } else if ( updateInfo.getValue("msg") == "" ) {
                updateLastMsg(updateInfo.getValue("key"), "");
              }
            }
          }
        },
        onUnsubscription: function() {
          console.log("Warning: unsubscription!");
          document.getElementById("user_msg").value = "";
          
          //subsDeltaKeys.splice(0, subsDeltaKeys.length);
          //subsDeltaKeysBU.splice(0, subsDeltaKeys.length);
          unsubDeltas();
          
          subsDyns.splice(0, subsDeltaKeys.length);
          subsDynsKeys.splice(0, subsDeltaKeys.length);
          
          clearScene();
          if ( imGrid != null ) {
            imGrid.clean();
          }
        },
        onSubscription: function(){
          if (subsLogon.isActive()==false) {
            subsLogon.setItemGroup("c_logon_"+myWorld+"_"+logonName+"_"+physicsMod);
          }
          client.subscribe(subsLogon);
        }
      };
      
      subsPlayers.addListener(rndrListener);
      
      lsClient.subscribe(subsPlayers);
      
      subsLogon = new Subscription("DISTINCT", "c_logon_"+myWorld+"_"+logonName+"_"+physicsMod, ["Test"]);
      subsLogon.addListener(new LogonListener(oldSubsPlayers,oldSubsLogon,document.getElementById("subscriptionError")));
      
      var bandGrid = new StaticGrid("band",true);
      bandGrid.addListener({onVisualUpdate: function(key,info,dom) {
          if (info != null) {
            var v = info.getCellValue("currentBandwidth");
            var kB = (v / 8) * 100;
            kB = Math.round(kB) / 100;
            info.setCellValue("currentBandwidth", v + " kbps");
            bandGrid.updateRow(key, {currentBandwidthKB:kB + " kBps"});
          }
        }
      });
      gBandSubs = new Subscription("MERGE", "My_Band_"+logonName, ["currentBandwidth", "currentBandwidthKB"]);
      gBandSubs.addListener(bandGrid);
      gBandSubs.addListener({onUnsubscription: function() {
          bandGrid.updateRow("My_Band_"+logonName, {currentBandwidth:"-.-"});
        }
      });
      gBandSubs.setRequestedMaxFrequency(0.5);
      lsClient.subscribe(gBandSubs);
      
      /*var subStats = new Subscription("MERGE", "Statistics", ["total_players", "total_bandwidth"]);
      subStats.addListener({onItemUpdate: function(updateInfo){
          console.log("Stats - Total players: " + updateInfo.getValue("total_players") +", TolalBandwidth: " + updateInfo.getValue("total_bandwidth"));
        }
      });
      lsClient.subscribe(subStats); */
    }); 
 }

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
      v+=0.0000001;
    }
    var val = Number(v.toString().substring(0,5));
    if (val == maxFreqVal) {
      val = "unlimited";
      document.getElementById("nowFrequency").innerHTML = val;
    } else {
      if ( physicsMod == 0) {
        if ( v < 0.05 ) {
          document.getElementById("nowFrequency").innerHTML = "never";
          document.getElementById("um").innerHTML = " ";
          val = 0.000001;
        } else {
          document.getElementById("nowFrequency").innerHTML = Math.round(Number((1/v).toString().substring(0,5)))+"";
          document.getElementById("um").innerHTML = " seconds";
        }
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