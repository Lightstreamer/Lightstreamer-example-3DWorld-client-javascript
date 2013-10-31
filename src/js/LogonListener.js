define(["./lsClient"], function(lsClient) {

  var LogonListener = function (subsPlayers,subsLogon,errorSpan) {
    this.subsPlayers = subsPlayers;
    this.subsLogon = subsLogon;
    this.errorSpan = errorSpan;
    
    console.error("Qua.");
  };

  LogonListener.prototype = {
    onSubscription: function(){
    
      this.errorSpan.innerHTML = " ";
      
      enableAllCommands();
      
      if (this.subsPlayers != null) {
        lsClient.unsubscribe(this.subsPlayers);
        this.subsPlayers = null;
      }
      
      if (myNick != logonName) {
        setTimeout(function(){sendNickMsg(myNick)},50);
      }
      
      if (this.subsLogon != null) {
        lsClient.unsubscribe(this.subsLogon);
        this.subsLogon = null;
      }
      
    },
    onSubscriptionError: function(code, msg) {
      this.errorSpan.innerHTML = msg;
      iamWatcher = true;
      disableAllCommands();
    }
  };
  
  return LogonListener;
  
});