import {checkTable, extraInfoOnOff, switchShift, updateBWInd, updateFreqInd, updFrequencyDyns, updateBandFreqInd, zoomCamera, fovCamera, updateDecimals, changePrecision, submitNick,submitMsg, enableButton, submitKeySmall, submitKey, submitWorld, gBandSubs, client, maxBandVal} from "./main";
export * from "./main";

// accordion
$(function () {
  $("#accordion").accordion({ active: false });
});

// "notaccordion" type used for keeping multiple panels open at the same time
$(function () {
  $("#notaccordion").addClass("ui-accordion ui-accordion-icons ui-widget ui-helper-reset")
    .find("h3")
    .addClass("ui-accordion-header ui-helper-reset ui-state-default ui-corner-top ui-corner-bottom")
    .hover(function () { $(this).toggleClass("ui-state-hover"); })
    .prepend('<span class="ui-icon ui-icon-triangle-1-e"></span>')
    .click(function () {
      $(this)
        .toggleClass("ui-accordion-header-active ui-state-active ui-state-default ui-corner-bottom")
        .find("> .ui-icon").toggleClass("ui-icon-triangle-1-e ui-icon-triangle-1-s").end()
        .next().toggleClass("ui-accordion-content-active").slideToggle();
      checkTable(this);
      return false;
    })
    .next().hide()
    .addClass("ui-accordion-content  ui-helper-reset ui-widget-content ui-corner-bottom");
});

// button
$(function () {
  $("a", ".button").button();
  //$( "a", ".button" ).click(function() { return false; });
});

$(function () {
  $("#checkExtra").button()
    .click(function (event) {
      extraInfoOnOff();
    });;
  $("#format").buttonset();
});

$(function () {
  $("#checkRot").button()
    .click(function (event) {
      switchShift();
    });;
  $("#format").buttonset();
});

// slider
$(document).ready(function () {
  $("#bwslider").slider({
    animate: true,
    min: 0.5,
    max: 100.5,
    step: 1,
    values: [100.5],
    slide: function (event, ui) {
      updateBWInd(ui.value);
    },
    change: function (event, ui) {
      var v = ui.value;
      updateBWInd(v);
      if (client) {
        if (ui.value == maxBandVal) {
          v = "unlimited";
        }
        client.connectionOptions.setRequestedMaxBandwidth(v);
      }
    }
  });
});

$(document).ready(function () {
  $("#freqslider").slider({
    animate: true,
    min: 0.0,
    max: 1.0,
    step: 0.05,
    values: [0.5],
    slide: function (event, ui) {
      updateFreqInd(ui.value);
    },
    change: function (event, ui) {
      var rv = updateFreqInd(ui.value);
      //if ( subsPlayers ) {
      //
      //if ( subsPlayers.getRequestedMaxFrequency() < 0.0001 ) {
      //resubPlayers();
      //}
      //subsPlayers.setRequestedMaxFrequency(String(rv));
      updFrequencyDyns(rv);
    }
  });
});

$(document).ready(function () {
  $("#feedslider").slider({
    animate: true,
    min: 2,
    max: 100,
    step: 2,
    values: [10],
    slide: function (event, ui) {
      updateBandFreqInd(ui.value);
    },
    change: function (event, ui) {
      var rv = updateBandFreqInd(ui.value);
      if (gBandSubs) {
        gBandSubs.setRequestedMaxFrequency(String(1 / rv));
      }
    }
  });
});

$(document).ready(function () {
  $("#zoomslider").slider({
    animate: true,
    min: 10,
    max: 500,
    step: 10,
    values: [140],
    slide: function (event, ui) {
      zoomCamera(Number(ui.value));
    },
    change: function (event, ui) {
      zoomCamera(Number(ui.value));
    }
  });
});

$(document).ready(function () {
  $("#fovslider").slider({
    animate: true,
    min: 5,
    max: 170,
    step: 5,
    values: [45],
    slide: function (event, ui) {
      fovCamera(Number(ui.value));
    },
    change: function (event, ui) {
      fovCamera(Number(ui.value));
    }
  });
});

$(document).ready(function () {
  $("#decslider").slider({
    animate: true,
    min: 1,
    max: 15,
    step: 1,
    values: [8],
    slide: function (event, ui) {
      updateDecimals(ui.value);
    },
    change: function (event, ui) {
      var rv = updateDecimals(ui.value);

      changePrecision();
    }
  });
});

$(document).ready(function () {
  var availableTags = [
    ""
  ];
  $("#user_nick").autocomplete({
    source: availableTags,
    response: function (event, ui) {
    },
    change: function (event, ui) {
      submitNick();
    }
  });
});

$(document).ready(function () {
  var availableTags = [
    ""
  ];
  $("#user_msg").autocomplete({
    source: availableTags,
    change: function (event, ui) {
      submitMsg();
    }
  });
});

$(document).ready(function () {
  var availableTags = [
    "Default",
  ];
  $("#user_world").autocomplete({
    autoFocus: true,
    delay: 0,
    minLength: 0,
    source: availableTags,
    focus: function (event, ui) {
      enableButton();
      $("#world_button").button("option", "disabled", false);
    }
  });
});

$(function () {
  $("input[type=submit]")
    .button()
    .click(function (event) {

      return false;
    });
});

$(function () {
  $("#s_button")
    .button()
    .click(function (event) {
      submitKeySmall(83);
      return false;
    });
});

$(function () {
  $("#c_s_button")
    .button()
    .click(function (event) {
      submitKey(83);
      return false;
    });
});

$(function () {
  $("#a_button")
    .button()
    .click(function (event) {
      submitKeySmall(65);
      return false;
    });
});

$(function () {
  $("#c_a_button")
    .button()
    .click(function (event) {
      submitKey(65);
      return false;
    });
});

$(function () {
  $("#w_button")
    .button()
    .click(function (event) {
      submitKeySmall(87);
      return false;
    });
});

$(function () {
  $("#c_w_button")
    .button()
    .click(function (event) {
      submitKey(87);
      return false;
    });
});

$(function () {
  $("#d_button")
    .button()
    .click(function (event) {
      submitKeySmall(68);
      return false;
    });
});

$(function () {
  $("#c_d_button")
    .button()
    .click(function (event) {
      submitKey(68);
      return false;
    });
});

$(function () {
  $("#1_button")
    .button()
    .click(function (event) {
      submitKeySmall(49);
      return false;
    });
});

$(function () {
  $("#c_1_button")
    .button()
    .click(function (event) {
      submitKey(49);
      return false;
    });
});

$(function () {
  $("#2_button")
    .button()
    .click(function (event) {
      submitKeySmall(50);
      return false;
    });
});

$(function () {
  $("#c_2_button")
    .button()
    .click(function (event) {
      submitKey(50);
      return false;
    });
});

$(function () {
  $("#ss_button")
    .button()
    .click(function (event) {
      submitKey(1083);
      return false;
    });
});

$(function () {
  $("#sa_button")
    .button()
    .click(function (event) {
      submitKey(1065);
      return false;
    });
});

$(function () {
  $("#sw_button")
    .button()
    .click(function (event) {
      submitKey(1087);
      return false;
    });
});

$(function () {
  $("#sd_button")
    .button()
    .click(function (event) {
      submitKey(1068);
      return false;
    });
});

$(function () {
  $("#s1_button")
    .button()
    .click(function (event) {
      submitKey(1049);
      return false;
    });
});

$(function () {
  $("#s2_button")
    .button()
    .click(function (event) {
      submitKey(1050);
      return false;
    });
});

$(function () {
  $("#world_button")
    .button()
    .click(function (event) {
      submitWorld();
      $("#world_button").button("option", "disabled", true);

      return false;
    });
});
/*
$(function() {
  $( "#Nickname" ).tooltip({ content: "Choose your nickname so as to be recognizable in the world." });
});*/

$.fn.qtip.styles.helpstyle = {
  background: '#FFFFFF',
  color: '#446976',
  textAlign: 'left',
  padding: 5,
  width: 320,
  border: {
    width: 3,
    radius: 5,
    color: '#dec972'
  },
  tip: 'bottomLeft'
}

$(function () {
  $("#Nickname").qtip({
    content: "Choose your nickname so as to be recognizable in the world.",
    position: { corner: { target: 'topMiddle', tooltip: 'bottomLeft' } }, style: 'helpstyle', show: { effect: { type: 'fade', length: 400 } }
  });
});

$(function () {
  $("#MyMsg").qtip({
    content: "Your message for other players in this world ... ",
    position: { corner: { target: 'topMiddle', tooltip: 'bottomLeft' } }, style: 'helpstyle', show: { effect: { type: 'fade', length: 400 } }
  });
});

$(function () {
  $("#Teleport").qtip({
    content: "Choose a world to be teleported to. You can either enter an existing world (agree with your friends on a name) or create a new one. Only letters and numbers are accepted.",
    position: { corner: { target: 'topMiddle', tooltip: 'bottomLeft' } }, style: 'helpstyle', show: { effect: { type: 'fade', length: 400 } }
  });
});

$(function () {
  $("#Physics").qtip({
    content: "Choose if the translation and rotation calculations will be performed on the client side or on the server side.",
    position: { corner: { target: 'topMiddle', tooltip: 'bottomLeft' } }, style: 'helpstyle', show: { effect: { type: 'fade', length: 400 } }
  });
});

$(function () {
  $("#Encoding").qtip({
    content: "In case of physics calculated server side you can choose the precision and the format of the incoming data from the server.",
    position: { corner: { target: 'topMiddle', tooltip: 'bottomLeft' } }, style: 'helpstyle', show: { effect: { type: 'fade', length: 400 } }
  });
});

$(function () {
  $("#hExtra").qtip({
    content: "Hide / Show the nickname and messages of the players.",
    position: { corner: { target: 'topMiddle', tooltip: 'bottomLeft' } }, style: 'helpstyle', show: { effect: { type: 'fade', length: 400 } }
  });
});

$(function () {
  $("#cZoom").qtip({
    content: "Configure the distance of the camera from the center of the scene on Z axis. Minimum distance is fixed to 10 maximum to 500.",
    position: { corner: { target: 'topMiddle', tooltip: 'bottomLeft' } }, style: 'helpstyle', show: { effect: { type: 'fade', length: 400 } }
  });
});

$(function () {
  $("#cField").qtip({
    content: "Configure the camera frustum vertical field of view, from bottom to top of view, in degree.",
    position: { corner: { target: 'topMiddle', tooltip: 'bottomLeft' } }, style: 'helpstyle', show: { effect: { type: 'fade', length: 400 } }
  });
});

$(function () {
  $("#maxBand").qtip({
    content: "The maximum allocated bandwidth for the whole real-time data downstream.",
    position: { corner: { target: 'topMiddle', tooltip: 'bottomLeft' } }, style: 'helpstyle', show: { effect: { type: 'fade', length: 400 } }
  });
});

$(function () {
  $("#maxFreq").qtip({
    content: "Interval between full resynchronizations sent by the server.",
    position: { corner: { target: 'topMiddle', tooltip: 'bottomLeft' } }, style: 'helpstyle', show: { effect: { type: 'fade', length: 400 } }
  });
});

$(function () {
  $("#maxFreqS").qtip({
    content: "The maximum number of updates per second sent by the server for each object in the world.",
    position: { corner: { target: 'topMiddle', tooltip: 'bottomLeft' } }, style: 'helpstyle', show: { effect: { type: 'fade', length: 400 } }
  });
});

$(function () {
  $("#dialog").dialog({
    autoOpen: false,
    width: 350,
    modal: true
  });
});

$(document).ready(function () {
  /////////////// Initializations

  document.getElementById("user_nick").disabled = false;
  document.getElementById("user_world").disabled = false;
  document.getElementById("world_button").disabled = true;

  document.getElementById("binary_dDesc").style.verticalAlign = "bottom";
  document.getElementById("binary_sDesc").style.verticalAlign = "bottom";
  document.getElementById("chkBin").style.verticalAlign = "bottom";
  document.getElementById("chkStr").style.verticalAlign = "bottom";
  document.getElementById("chkCside").style.verticalAlign = "bottom";
  document.getElementById("chkSside").style.verticalAlign = "bottom";

  document.getElementById("user_msg").innerHTML = "";

  document.getElementById("radio_cliSide").checked = true;

  setTimeout(function () {
    try {
      document.getElementById("radio_binary").checked = true;
      document.getElementById("radio_string").disabled = true;
      document.getElementById("radio_binary").disabled = true;

      document.getElementById("radio_d").disabled = true;
      document.getElementById("radio_s").checked = true;
      document.getElementById("radio_s").disabled = true;
      document.getElementById("radio_f").disabled = true;
      $("#decslider").slider("option", "disabled", true);
    } catch (e) {
      console.error("Initialization fail: " + e);
    }
  }, 500);

  // open an accordion soon after page load
  setTimeout(function () {
    $("#identity").toggleClass("ui-accordion-header-active ui-state-active ui-state-default ui-corner-bottom")
    .find("> .ui-icon").toggleClass("ui-icon-triangle-1-e ui-icon-triangle-1-s").end()
    .next().toggleClass("ui-accordion-content-active").slideToggle();
  }, 750);

  setTimeout(function () {
    $("#rendering").toggleClass("ui-accordion-header-active ui-state-active ui-state-default ui-corner-bottom")
      .find("> .ui-icon").toggleClass("ui-icon-triangle-1-e ui-icon-triangle-1-s").end()
      .next().toggleClass("ui-accordion-content-active").slideToggle();
    checkTable({ id: "rendering" });
  }, 900);
});
