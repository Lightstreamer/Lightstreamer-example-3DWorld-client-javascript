import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import droid_serif_bold from 'three/fonts/droid/droid_serif_bold.typeface.json'
import droid_serif_regular from 'three/fonts/droid/droid_serif_regular.typeface.json'
import helvetiker_regular from 'three/fonts/helvetiker_regular.typeface.json'

const loader = new FontLoader();
const font_droid_serif_bold = loader.parse(droid_serif_bold);
const font_droid_serif_regular = loader.parse(droid_serif_regular);
const font_helvetiker_regular = loader.parse(helvetiker_regular);

var WIDTH = window.innerWidth;
var HEIGHT = window.innerHeight;
var zWide = 0;
var players = new Array();
var nicks = new Array();
var lifes = new Array();
var mlls = new Array();
var cube = new Array();
var texts = new Array();
var msgs = new Array();
var dinamics = new Array();
var sceneReady = false;

var FRAME_RATE = 50;
var BASE_RATE = 10;
var rateFactor = 0;

var MAX_SIZE_X = 85;
var MAX_SIZE_Y = 45;
var MAX_SIZE_Z = 60;

var scene = new THREE.Scene(); 

// Camera definition
var camera = null; 

var webGLinUse = true;
var extraInfo = true;

var renderer = null;
var materialLines = null;
var goRender = true;
var goPhysics = true;

var materialMe = new THREE.MeshLambertMaterial( { color: 0xff0000 } );
var materialOther = new THREE.MeshLambertMaterial( { color: 0x0f87ff } );
var materialGhost = new THREE.MeshLambertMaterial( { color: 0xdddddd } );
var materialSphere = new THREE.MeshLambertMaterial( { color: 0xffc32b } );
var materialAxisLabel = new THREE.MeshLambertMaterial( { color: 0x2a2a2a } );
var materialMsgs = new THREE.MeshLambertMaterial( { color: 0xffc32b } );

try { 
  renderer = new THREE.WebGLRenderer({ antialias: true }); 

  /*
  //The wireframe has changed since r61, with ugly diagonal lines.
  
  materialLines = new THREE.MeshBasicMaterial( { wireframe: true, color: 0x2f2f2f } );
  
  var geometryLines = new THREE.CubeGeometry( 160, 90, 120 );
  var meshLines = new THREE.Mesh( geometryLines, materialLines );
  
  group.add( meshLines );
  */
  
  var sizeX = 60, sizeZ = 80, step = 10;
  var material = new THREE.LineBasicMaterial( { color: 0x2f2f2f, opacity: 0.2 } );
  
  var plane1 = new THREE.Geometry();
  plane1.vertices.push( new THREE.Vector3( 80, -45, 60 ) );
  plane1.vertices.push( new THREE.Vector3( -80, -45, 60 ) );
  plane1.vertices.push( new THREE.Vector3( -80, 45, 60 ) );
  plane1.vertices.push( new THREE.Vector3( 80, 45, 60 ) );
  
  var plane2 = new THREE.Geometry();
  plane2.vertices.push( new THREE.Vector3( 80, -45, -60 ) );
  plane2.vertices.push( new THREE.Vector3( -80, -45, -60 ) );
  plane2.vertices.push( new THREE.Vector3( -80, 45, -60 ) );
  plane2.vertices.push( new THREE.Vector3( 80, 45, -60 ) );
  
  var plane3 = new THREE.Geometry();
  plane3.vertices.push( new THREE.Vector3( -80, -45, 60 ) );
  plane3.vertices.push( new THREE.Vector3( -80, 45, 60 ) );
  plane3.vertices.push( new THREE.Vector3( -80, -45, -60 ) );
  plane3.vertices.push( new THREE.Vector3( -80, 45, -60 ) );
  
  var plane4 = new THREE.Geometry();
  plane4.vertices.push( new THREE.Vector3( -80, 45, 60 ) );
  plane4.vertices.push( new THREE.Vector3( -80, 45, -60 ) );
  plane4.vertices.push( new THREE.Vector3( 80, 45, 60 ) );
  plane4.vertices.push( new THREE.Vector3( 80, 45, -60 ) );

  var plane5 = new THREE.Geometry();
  plane5.vertices.push( new THREE.Vector3( 80, 45, 60 ) );
  plane5.vertices.push( new THREE.Vector3( 80, 45, -60 ) );
  plane5.vertices.push( new THREE.Vector3( 80, -45, -60 ) );
  plane5.vertices.push( new THREE.Vector3( 80, -45, 60 ) );
  
  var plane6 = new THREE.Geometry();
  plane6.vertices.push( new THREE.Vector3( -80, -45, -60 ) );
  plane6.vertices.push( new THREE.Vector3( -80, -45, 60 ) );
  plane6.vertices.push( new THREE.Vector3( 80, -45, 60 ) );
  plane6.vertices.push( new THREE.Vector3( 80, -45, -60 ) );
  
  var plane7 = new THREE.Geometry();
  plane7.vertices.push( new THREE.Vector3( 80, 45, 60 ) );
  plane7.vertices.push( new THREE.Vector3( 80, -45, 60 ) );
  plane7.vertices.push( new THREE.Vector3( 80, 45, -60 ) );
  plane7.vertices.push( new THREE.Vector3( 80, -45, -60 ) );
  
  var plane8 = new THREE.Geometry();
  plane8.vertices.push( new THREE.Vector3( -80, -45, 60 ) );
  plane8.vertices.push( new THREE.Vector3( -80, -45, -60 ) );
  
  var line8 = new THREE.Line( plane8, material );
  line8.type = THREE.LinePieces;
  scene.add( line8 );
  
  var line7 = new THREE.Line( plane7, material );
  line7.type = THREE.LinePieces;
  scene.add( line7 );
  
  var line5 = new THREE.Line( plane5, material );
  line5.type = THREE.LinePieces;
  scene.add( line5 );
  
  var line4 = new THREE.Line( plane4, material );
  line4.type = THREE.LinePieces;
  scene.add( line4 );
  
  var line1 = new THREE.Line( plane1, material );
  line1.type = THREE.LinePieces;
  scene.add( line1 );
  
  var line2 = new THREE.Line( plane2, material );
  line2.type = THREE.LinePieces;
  scene.add( line2 );
  
  var line3 = new THREE.Line( plane3, material );
  line3.type = THREE.LinePieces;
  scene.add( line3 );
  
  camera = new THREE.PerspectiveCamera(45, WIDTH/HEIGHT, 0.1, 10000); 
  
  // Lighting the scene.
  var lightF = new THREE.DirectionalLight( 0xffffff, 2 );
  lightF.position.set( 160, 90, 120 );
  scene.add( lightF );
  
  var light = new THREE.PointLight( 0xffffff, 2 ); 
  light.position.set( -160, -90, -120 );
  scene.add( light );
  
} catch (e) { 
  renderer = new THREE.CanvasRenderer();
  webGLinUse = false;
  extraInfo = false;
  
  materialLines = new THREE.MeshLambertMaterial( { wireframe: true, opacity: 1.0 } );
  
  var lightF = new THREE.DirectionalLight( 0xffffff, 2 );
  lightF.position.set( 160, 90, 120 );
  scene.add( lightF );
  
  var light = new THREE.PointLight( 0xffffff, 2 ); 
  light.position.set( -160, -90, -120 );
  scene.add( light );
  
  var sizeX = 60, sizeZ = 80, step = 10;
  var material = new THREE.LineBasicMaterial( { color: 0xffffff, opacity: 0.2 } );
  
  var plane1 = new THREE.Geometry();
  plane1.vertices.push( new THREE.Vector3( 80, -45, 60 ) );
  plane1.vertices.push( new THREE.Vector3( -80, -45, 60 ) );
  plane1.vertices.push( new THREE.Vector3( -80, 45, 60 ) );
  plane1.vertices.push( new THREE.Vector3( 80, 45, 60 ) );
  
  var plane2 = new THREE.Geometry();
  plane2.vertices.push( new THREE.Vector3( 80, -45, -60 ) );
  plane2.vertices.push( new THREE.Vector3( -80, -45, -60 ) );
  plane2.vertices.push( new THREE.Vector3( -80, 45, -60 ) );
  plane2.vertices.push( new THREE.Vector3( 80, 45, -60 ) );
  
  var plane3 = new THREE.Geometry();
  plane3.vertices.push( new THREE.Vector3( -80, -45, 60 ) );
  plane3.vertices.push( new THREE.Vector3( -80, 45, 60 ) );
  plane3.vertices.push( new THREE.Vector3( -80, -45, -60 ) );
  plane3.vertices.push( new THREE.Vector3( -80, 45, -60 ) );
  
  var plane4 = new THREE.Geometry();
  plane4.vertices.push( new THREE.Vector3( -80, 45, 60 ) );
  plane4.vertices.push( new THREE.Vector3( -80, 45, -60 ) );
  plane4.vertices.push( new THREE.Vector3( 80, 45, 60 ) );
  plane4.vertices.push( new THREE.Vector3( 80, 45, -60 ) );

  var plane5 = new THREE.Geometry();
  plane5.vertices.push( new THREE.Vector3( 80, 45, 60 ) );
  plane5.vertices.push( new THREE.Vector3( 80, 45, -60 ) );
  plane5.vertices.push( new THREE.Vector3( 80, -45, -60 ) );
  plane5.vertices.push( new THREE.Vector3( 80, -45, 60 ) );
  
  var plane6 = new THREE.Geometry();
  plane6.vertices.push( new THREE.Vector3( -80, -45, -60 ) );
  plane6.vertices.push( new THREE.Vector3( -80, -45, 60 ) );
  plane6.vertices.push( new THREE.Vector3( 80, -45, 60 ) );
  plane6.vertices.push( new THREE.Vector3( 80, -45, -60 ) );
  
  var plane7 = new THREE.Geometry();
  plane7.vertices.push( new THREE.Vector3( 80, 45, 60 ) );
  plane7.vertices.push( new THREE.Vector3( 80, -45, 60 ) );
  plane7.vertices.push( new THREE.Vector3( 80, 45, -60 ) );
  plane7.vertices.push( new THREE.Vector3( 80, -45, -60 ) );
  
  var plane8 = new THREE.Geometry();
  plane8.vertices.push( new THREE.Vector3( -80, -45, 60 ) );
  plane8.vertices.push( new THREE.Vector3( -80, -45, -60 ) );
  
  var line8 = new THREE.Line( plane8, material );
  line8.type = THREE.LinePieces;
  scene.add( line8 );
  
  var line7 = new THREE.Line( plane7, material );
  line7.type = THREE.LinePieces;
  scene.add( line7 );
  
  var line5 = new THREE.Line( plane5, material );
  line5.type = THREE.LinePieces;
  scene.add( line5 );
  
  var line4 = new THREE.Line( plane4, material );
  line4.type = THREE.LinePieces;
  scene.add( line4 );
  
  var line1 = new THREE.Line( plane1, material );
  line1.type = THREE.LinePieces;
  scene.add( line1 );
  
  var line2 = new THREE.Line( plane2, material );
  line2.type = THREE.LinePieces;
  scene.add( line2 );
  
  var line3 = new THREE.Line( plane3, material );
  line3.type = THREE.LinePieces;
  scene.add( line3 );
  
  camera = new THREE.PerspectiveCamera(45, WIDTH/HEIGHT, 1, 10000); 
}

var worldHTML = document.getElementById("theWorld");
if ( (WIDTH/HEIGHT) >  1.5) {
  renderer.setSize(WIDTH-(WIDTH*0.075), HEIGHT-(HEIGHT*0.075));
} else {
  zWide = (WIDTH-(WIDTH*0.075));
  renderer.setSize(zWide, zWide/1.77777);
  
  camera.aspect = 1.77777;
  camera.updateProjectionMatrix();
}
renderer.sortObjects = false;
worldHTML.appendChild(renderer.domElement); 

// Geometry of players body definition
var geometry = new THREE.CubeGeometry(2,4,2); 
var sphere = new THREE.Mesh( new THREE.SphereGeometry( 1, 0.2, 0.2 ), materialSphere );
sphere.name = "Centro";

scene.add( sphere );

// Add axis name.
var textaX = new THREE.TextGeometry( "x", {
            size: 70,
            height: 0,
            curveSegments: 4,
            font: "helvetiker"
          });
textaX.computeBoundingBox();
var aX = new THREE.Mesh(textaX, materialAxisLabel);
aX.position.x = -21;
aX.position.y = -45;
aX.position.z = -50;
//aX.useQuaternion = true;
aX.quaternion.x = 0.7071067811;
aX.quaternion.y = 0;
aX.quaternion.z = 0;
aX.quaternion.w = 0.7071067811;
scene.add( aX );

var textaY = new THREE.TextGeometry( "y", {
            size: 50,
            height: 0,
            curveSegments: 4,
            font: "helvetiker"
          });
textaY.computeBoundingBox();
var aY = new THREE.Mesh(textaY, materialAxisLabel);
//aY.position.x = -76;
//aY.position.y = -37;
//aY.position.z = -59;
aY.position.x = -75;
aY.position.y = -15;
aY.position.z = -60;
//aY.useQuaternion = true;
aY.quaternion.x = 0;
aY.quaternion.y = 0;
aY.quaternion.z = 0;
aY.quaternion.w = 1;
scene.add( aY );

var textaZ = new THREE.TextGeometry( "z", {
            size: 50,
            height: 0,
            curveSegments: 4,
            font: "helvetiker"
          });
textaZ.computeBoundingBox();
var aZ = new THREE.Mesh(textaZ, materialAxisLabel);
//aZ.position.x = -78;
//aZ.position.y = -43;
//aZ.position.z = -50;
aZ.position.x = -80;
aZ.position.y = -41;
aZ.position.z = 15;
//aZ.useQuaternion = true;
aZ.quaternion.x = 0;
aZ.quaternion.y = 0.7071067811;
aZ.quaternion.z = 0;
aZ.quaternion.w = 0.7071067811;
scene.add( aZ );

// scene.add( group );
camera.position.z = 140;
camera.lookAt( sphere.position );

function physicsCalculator() {
  if (goPhysics) {
    setTimeout(physicsCalculator, FRAME_RATE);
  }
  
  for (var i = 0; i < cube.length; i++) {
    var tmp = 0.0;
  
    tmp = cube[i].position.x + (dinamics[i].V.x * 0.002 * rateFactor);
    cube[i].position.x = tmp;
    texts[i].position.x = (tmp+2);
    msgs[i].position.x = tmp;
    if ( cube[i].position.x >= MAX_SIZE_X ) {
      cube[i].position.x = (MAX_SIZE_X * -1);
      texts[i].position.x = ((MAX_SIZE_X * -1) + 2);
      msgs[i].position.x = (MAX_SIZE_X * -1);
    } else {
      if ( cube[i].position.x <= (MAX_SIZE_X * -1) ) {
        cube[i].position.x = MAX_SIZE_X;
        texts[i].position.x = (MAX_SIZE_X + 2);
        msgs[i].position.x = MAX_SIZE_X;
      }
    }
    
    tmp = cube[i].position.y + (dinamics[i].V.y * 0.002 * rateFactor);
    cube[i].position.y = tmp;
    texts[i].position.y = (tmp + 1);
    msgs[i].position.y = (tmp - 1);
    if ( cube[i].position.y >= MAX_SIZE_Y ) {
      cube[i].position.y = (MAX_SIZE_Y * -1);
      texts[i].position.y = ((MAX_SIZE_Y * -1) + 1);
      msgs[i].position.y = ((MAX_SIZE_Y * -1) - 1);
    } else {
      if ( cube[i].position.y <= (MAX_SIZE_Y * -1) ) {
        cube[i].position.y = MAX_SIZE_Y;
        texts[i].position.y = (MAX_SIZE_Y + 1);
        msgs[i].position.y = MAX_SIZE_Y - 1;
      }
    }
    
    tmp = cube[i].position.z + (dinamics[i].V.z * 0.002 * rateFactor);
    cube[i].position.z = tmp;
    texts[i].position.z = (tmp + 2);
    msgs[i].position.z = (tmp + 2);
    if ( cube[i].position.z >= MAX_SIZE_Z ) {
      cube[i].position.z = (MAX_SIZE_Z * -1);
      texts[i].position.z = ((MAX_SIZE_Z * -1) + 2);
      msgs[i].position.z = (MAX_SIZE_Z * -1) + 2;
    } else {
      if ( cube[i].position.z <= (MAX_SIZE_Z * -1) ) {
        cube[i].position.z = MAX_SIZE_Z ;
        texts[i].position.z = ((MAX_SIZE_Z) + 2);
        msgs[i].position.z = (MAX_SIZE_Z) + 2;
      }
    }
      
    var qx = new THREE.Quaternion();
    qx.setFromAxisAngle( new THREE.Vector3( 1, 0, 0 ), (dinamics[i].R.x * 0.02 * rateFactor) );
    cube[i].quaternion.multiply( qx );
    cube[i].quaternion.normalize();
      
    var qy = new THREE.Quaternion();
    qy.setFromAxisAngle( new THREE.Vector3( 0, 1, 0 ), (dinamics[i].R.y * 0.02 * rateFactor) );
    cube[i].quaternion.multiply( qy );
    cube[i].quaternion.normalize();
      
    var qz = new THREE.Quaternion();
    qz.setFromAxisAngle( new THREE.Vector3( 0, 0, 1 ), (dinamics[i].R.z * 0.02 * rateFactor) );
    cube[i].quaternion.multiply( qz );
    cube[i].quaternion.normalize();
    }
}

function render() {
  if ( goRender ) {
    requestAnimationFrame( render );
  }
  
  renderer.render(scene, camera); 
}

export function getScene() {
  return cube;
}

export function updateNick(player, nick, me) {

  var indx = players.indexOf(player);
  
  if ( indx > -1 ) {
    var text3d = new THREE.TextGeometry( nick, {
          size: 1.2,
          height: 0,
          curveSegments: 0,
          
          font: "droid serif",
          weight: "bold",
        });
    text3d.computeBoundingBox();
    
    if ( extraInfo ) {
      scene.remove(texts[indx]);
    }

    if ( me ) {
      texts[indx] = new THREE.Mesh(text3d, materialMe);
    } else {
      if ( player.indexOf("Ghost") == 0 ) {
        texts[indx] = new THREE.Mesh(text3d, materialGhost);
      } else {
        texts[indx] = new THREE.Mesh(text3d, materialOther);
      }
    }
    texts[indx].position.x = cube[indx].position.x+2;
    texts[indx].position.y = cube[indx].position.y+1;
    texts[indx].position.z = cube[indx].position.z+2;
    if ( extraInfo ) {
      scene.add(texts[indx]);
    }
    nicks[indx] = nick;
  }
}

export function updateLastMsg(plyr, msg) {

  var indx = players.indexOf(plyr);
  
  if ( !extraInfo ) {
    return ;
  }
  
  if ( indx > -1 && !( plyr.indexOf("Ghost") == 0) ) {
    var text3d = null;
    if ( (msg != null) && (msg != "") ) {
      text3d = new THREE.TextGeometry( msg, {
            size: 1.2,
            height: 0,
            curveSegments: 0,

            font: "droid serif"
          });
    } else {
      text3d = new THREE.TextGeometry( ".", {
              size: 0,
              height: 0,
              curveSegments: 0,

              font: "droid serif",
            });
    }          
          
    text3d.computeBoundingBox();
    
    if ( extraInfo ) {
      scene.remove(msgs[indx]);
    }
    
    msgs[indx] = new THREE.Mesh(text3d, materialMsgs);
    msgs[indx].position.x = cube[indx].position.x;
    msgs[indx].position.y = cube[indx].position.y-3;
    msgs[indx].position.z = cube[indx].position.z+2;
    if ( extraInfo ) {
      scene.add(msgs[indx]);
    }
  }
}

export function getNick(indx) {
  if ( indx > -1 ) {
    return nicks[indx];
  } else {
    return ".";
  }
}

export function updateDinamics2(plyr, command, value) {

  var indx = players.indexOf(plyr);
  
  if ( indx != -1 ) {
    if (command == "Vx")  {
      dinamics[indx].V.setX(value);
    }
    if (command == "Vy")  {
      dinamics[indx].V.setY(value);
    }
    if (command == "Vz")  {
      dinamics[indx].V.setZ(value);
    }
    if (command == "momx")  {
      dinamics[indx].R.setX(value);
    }
    if (command == "momy")  {
      dinamics[indx].R.setY(value);
    }
    if (command == "momz")  {
      dinamics[indx].R.setZ(value);
    }
  }
}

export function updateScene(plyr, posX, posY, posZ, rotX, rotY, rotZ, rotW, me, life) {
  var indx = players.indexOf(plyr);
  var addObjs = false;

  try {
  if ( indx == -1 ) {
    addObjs = true;
    indx = players.push(plyr) - 1;
  
    var text3d = new THREE.TextGeometry( plyr, {
          size: 1.2,
          height: 0,
          curveSegments: 0,

          font: "droid serif",
          weight: "bold",
        });
    text3d.computeBoundingBox();
  
    var text4d = new THREE.TextGeometry( ".", {
          size: 0,
          height: 0,
          curveSegments: 0,

          font: "droid serif",
          weight: "bold",
        });
    text4d.computeBoundingBox();
    
    nicks[indx] = ".";
    lifes[indx] = parseInt(life);
    mlls[indx] = new Date().valueOf();

    if ( me ) {
      cube[indx] = new THREE.Mesh(geometry, materialMe);
      texts[indx] = new THREE.Mesh(text3d, materialMe);
      msgs[indx] = new THREE.Mesh(text4d, materialMe);
    } else {
      if ( (plyr).indexOf("Ghost") == 0 ) {
        cube[indx] = new THREE.Mesh(geometry, materialGhost);
        texts[indx] = new THREE.Mesh(text3d, materialGhost);
        msgs[indx] = new THREE.Mesh(text4d, materialGhost);
      } else {
        cube[indx] = new THREE.Mesh(geometry, materialOther);
        texts[indx] = new THREE.Mesh(text3d, materialOther);
        msgs[indx] = new THREE.Mesh(text4d, materialOther);
      }
    }
    cube[indx].name = plyr;
    //cube[indx].useQuaternion = true;
    cube[indx].quaternion = new THREE.Quaternion(rotX,rotY,rotZ,rotW);
    dinamics[indx] = {V: new THREE.Vector3( 0, 0, 0 ), R: new THREE.Vector3( 0, 0, 0 )};
  }
    
  if ( posX != null ) {
    cube[indx].position.x = posX;
    texts[indx].position.x = posX+2;
    msgs[indx].position.x = posX;
  }
  if ( posY != null ) {
    cube[indx].position.y = posY;
    texts[indx].position.y = posY+1;
    msgs[indx].position.y = posY-1;
  }
  if ( posZ != null ) {
    cube[indx].position.z = posZ;
    texts[indx].position.z = posZ+2;
    msgs[indx].position.z = posZ+2;
  }
  
  if ( goPhysics == false ) {
    if ( rotX != null ) {
      cube[indx].quaternion.x = rotX;
    }
    if ( rotY != null ) {
      cube[indx].quaternion.y = rotY;
    }
    if ( rotZ != null ) {
      cube[indx].quaternion.z = rotZ;
    }
    if ( rotW != null ) {
      cube[indx].quaternion.w = rotW;
    }
  }
  
  if ( addObjs ) {
    scene.add( cube[indx] );
    if ( extraInfo ) {
      scene.add( texts[indx] );
      scene.add( msgs[indx] );
    }
  }
  
  if ( life > 0 ) {
    if ( plyr.indexOf("Ghost") != 0 ) {
      var today = new Date();
      
      if ( parseInt(life) > (parseInt(lifes[indx]) + 4) )  {
        var nowmillis = today.getMilliseconds();
        if ( parseInt(life) > (parseInt(lifes[indx]) + 50) )  {
          console.error(today + "." + nowmillis + " - Warning: " + life + " - " + (lifes[indx]));
        } else {
          console.info(today +  "." + nowmillis + " - Warning: " + life + " - " + (lifes[indx]));
        }
      } 
      lifes[indx] = life;
    
      if ( today > (mlls[indx] + 990) ) {
        console.log("Warning millis: " + today.valueOf() + ", " + mlls[indx]);
      }
      mlls[indx] = today.valueOf();
    }
  }
  
  } catch (e) {
    console.error("Error: " + e + " > " + plyr + "," + posX + "," + posY + "," + posZ );
  }
  /*
  if ( goRender ) {
    render();
  } */
  
  return addObjs;
}

export function clearScene() {
  var tmpBox;
  var tmpNicks;
  
  while ( cube.length > 0 ) {
    tmpBox = cube.pop();
    players.pop();
    nicks.pop();
    dinamics.pop();
    tmpNicks = texts.pop();
    scene.remove(tmpBox);
    scene.remove(tmpNicks);
    
    tmpBox = msgs.pop();
    scene.remove(tmpBox);
  }
  
  render();
}

export function removeFromScene(plyr) {
  var indx = players.indexOf(plyr);
  if ( indx == -1 ) {
    return ;
  }
  
  scene.remove(cube[indx]);
  scene.remove(texts[indx]);
  scene.remove(msgs[indx]);
  
  players.splice(indx, 1);
  cube.splice(indx, 1);
  texts.splice(indx, 1);
  nicks.splice(indx, 1);
  msgs.splice(indx, 1);
  dinamics.splice(indx, 1);
}

export function onWindowResize() {
  WIDTH = window.innerWidth;
  HEIGHT = window.innerHeight;
  
  if ( (WIDTH/HEIGHT) >  1.5) {
    camera.aspect = (WIDTH/HEIGHT);
    renderer.setSize(WIDTH-(WIDTH*0.075), HEIGHT-(HEIGHT*0.075));
  } else {
    camera.aspect = 1.77777;
    zWide = (WIDTH-(WIDTH*0.075));
    renderer.setSize(zWide, zWide/1.77777);
  }
  camera.updateProjectionMatrix();
} 

export function zoomCamera(zoomZ) {
  camera.position.z = zoomZ;
  camera.updateProjectionMatrix();
}

export function fovCamera(f) {
  camera.fov = f;
  camera.updateProjectionMatrix();
}

export function stopPhysics() {
  goPhysics = false;
}

export function startPhysics() {
  goPhysics = true;
  
  console.log("startPhysics.");
  physicsCalculator();
}

export function stopRender() {
  goRender = false;
}

export function startRender() {
  goRender = true;
  
  console.log("startRender - " + sceneReady);
  
  if (sceneReady) {
    render();
  }
}

function clearExtraInfo() {
  
  for (var i = 0; i < texts.length; i++) {
    scene.remove(texts[i]);
    scene.remove(msgs[i]);
  }
  
  render();
}

function addExtraInfo() {
  
  for (var i = 0; i < texts.length; i++) {
    scene.add(texts[i]);
    scene.add(msgs[i]);
  }
  
  render();
}

export function extraInfoOnOff() {
  if (document.getElementById("checkExtra").checked) {
    if ( webGLinUse ) {
      extraInfo = true;
      addExtraInfo();
    }
  } else {
    clearExtraInfo();
    extraInfo = false
  }
}

sceneReady = true;
rateFactor = (FRAME_RATE/BASE_RATE);
physicsCalculator();
render(); 