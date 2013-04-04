
3D World Demo Client
============================

A demo showing the potentials of the integration of Lightstreamer in any multiplayer 3D world simulation. 
This project implements the HTML/JavaScript client. Particular attention is paid to aspects of real-time communication and opportunities to minimize the network bandwidth utilization. Consider that the Demo allows two modality:
- the physics calculations are performed both client side and server side, the rendering is based on client side physics calculations and resynchs with information arriving from server every n seconds. Instead panel "Matrix" data are those that come from the server.
- the physics engine run completely on the server side and the positional and rotational data for all the players in the game are transmitted to all the clients with a frequency of up to 100Hz.

HTML Client
-----------

A simple HTML client with five panels: Identity, Tuning, Matrix, Commands, and Rendering.<br>
In the Identity panel the player can configure its nickname, send messages to other users in the same world and change the world where the player moves. 'Default' is the initial world where the player starts.<br>
In the Tuning panel the user can choose the operating mode of the demo: client side or server side. In the first case, you can configure the maximum total bandwidth used by the entire page and interval resync with server images in the range from 1 every second to 1 every 20 seconds. In the second mode you can configure the max bandwidth allowed for the whole page, max frequency of updates for each player (from 1 second to 100 per second). Here you can also choose the precision and format of the incoming data from the server.<br>
In the Matrix panel the position of all the players in the same world is shown in a tabular view (your player is the red forecolored row, other active players are the blue forecolored rows and automatic ghost players are the black forecolored rows). Data in this panel are always the ones coming from the server in either mode of the demo.<br>
In the Command panel you can find a recap of the commands that allow you to move the cuboid. The player can input the movement commands with these keys:
- "d": add +1 force impulse on axis X; 
- "a": add -1 force impulse on axis X; 
- "w": add +1 force impulse on axis Y; 
- "s": add -1 force impulse on axis Y; 
- "1": add +1 force impulse on axis Z; 
- "2": add -1 force impulse on axis Z;
- shift + "d": add +1 torque impulse on axis X;
- shift + "a": add -1 torque impulse on axis X;
- shift + "w": add +1 torque impulse on axis Y;
- shift + "s": add -1 torque impulse on axis Y;
- shift + "1": add +1 torque impulse on axis Z;
- shift + "2": add -1 torque impulse on axis Z.

<br>In the Rendering panel the player can watch a 3d rendering of the scene with all the players represented by cuboids. The origin of axes is marked with a yellow sphere and the edges of the world are outlined by white lines.
The 3d rendering is powered by [three.js library](http://mrdoob.github.com/three.js/).


Run The Demo
------------

Before you can run the demo some dependencies need to be solved:

-  Get the lightstreamer.js file from the [Lightstreamer 5 Colosseo distribution](http://www.lightstreamer.com/download) 
   and put it in the src/js folder of the demo. Alternatively you can build a lightstreamer.js file from the 
   [online generator](http://www.lightstreamer.com/distros/Lightstreamer_Allegro-Presto-Vivace_5_0_Colosseo_20120803/Lightstreamer/DOCS-SDKs/sdk_client_javascript/tools/generator.html).
   In that case be sure to include the LightstreamerClient, Subscription, DynaGrid and StatusWidget modules and to use the "Use AMD" version.
-  Download [Three.js](http://github.com/mrdoob/three.js/zipball/master) and copy the three.min.js file to the src/js folder of the demo. The demo requires the Three.js v.57 or higher.
-  Please note that the demo use a jQuery customized theme included in this project.

You can deploy this Demo in order to use the Lightstreamer server as Web server or in any external Web Server you are running. 
If you choose the former case please create a "3DWorldDemo" folder in the <LS_HOME>\pages\demos folder and copy here all the files and subfolders from the src directory of this project. The client demo configuration assume that Lightstreamer Server, Lightstreamer 3D World Adapter and this client are launched on the same machine. 
Anyway the [3DWorldDemo Adapter Set](https://github.com/Weswit/Lightstreamer-example-3DWorld-adapter-java) have to be deployed in your local Lightstreamer server instance. Please check out the project and follow the installation instructions provided with it.
The demo is now ready to be launched. [Here](http://www.lightstreamer.com/demo/3DWorldDemo/) a demostration hosted in our servers.

Lightstreamer Compatibility Notes
---------------------------------

- Compatible with Lightstreamer Server 5.1 or newer.
- Compatible with Lightstreamer JavaScript Client library version 6.0 or newer.
