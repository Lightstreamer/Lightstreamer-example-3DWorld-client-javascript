
define(["LightstreamerClient","StatusWidget"],function(LightstreamerClient,StatusWidget) {
  var protocolToUse = document.location.protocol != "file:" ? document.location.protocol : "http:";
  var lsClient = new LightstreamerClient(protocolToUse+"//localhost:8080","DEMOMOVE3D");
  
  lsClient.connectionOptions.setXDomainStreamingEnabled(false);
   
  lsClient.addListener(new StatusWidget("left", "0px", true));

  lsClient.connect();
  
  return lsClient;
});

