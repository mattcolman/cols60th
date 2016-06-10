import 'pixi'
import 'p2'
import Phaser from 'phaser'
import Game from './game'
import Config from './config'

var getMeFacebook = function() {
  window.fbAsyncInit = function() {
    FB.init({
      appId      : Config.AppID,
      cookie     : true,
      xfbml      : true,
      version    : 'v2.6'
    });
    init();
  };

  (function(d, s, id){
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {return;}
    js = d.createElement(s); js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
  }(document, 'script', 'facebook-jssdk'));
}

var init = function() {

  const WORLD_WIDTH = 768
  let WORLD_HEIGHT = 1366

  // on mobile the width stays fixed and we adjust the height to fit the screen
  if (!device.desktop) {
    const windowAspectRatio = window.innerHeight/window.innerWidth
    WORLD_HEIGHT = Math.ceil(WORLD_WIDTH * windowAspectRatio)
  }

  var config = {
    "width": WORLD_WIDTH,
    "height": WORLD_HEIGHT,
    "renderer": Phaser.CANVAS,
    "parent": 'content',
    "resolution": screen.resolution,
    "state": Game.states[0][1]
  }

  let game = new Game(config)
}

// device is a singleton, when Phaser.Game loads it will overwrite this instance
var device = Phaser.Device
device.whenReady(getMeFacebook, this)

// Hide splash screen if it's not already hidden...?
document.addEventListener("deviceready", function() {
  setTimeout(function() {
    if(navigator.splashscreen) {
      navigator.splashscreen.hide();
    }
  }, 5000, false);
});

