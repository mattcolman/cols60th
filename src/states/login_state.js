import $ from 'jquery'
import Base64Binary from '../base64-binary'

class LoginState extends Phaser.State {

  preload() {
    this.game.load.crossOrigin = 'anonymous'
    // this.game.load.image('background', 'assets/images/dummy_background.png')
    // this.game.load.image('lowerthird', 'assets/images/dummy_lower_third.png')
    this.game.load.image('background', 'assets/images/background.jpg')
    this.game.load.image('lowerthird', 'assets/images/col_lower_third.png')
    this.game.load.image('fblogin', 'assets/images/fb_login.png')
    this.game.load.image('selfie_button', 'assets/images/selfie_button.png')
  }

  create() {
    super.create()

    this.addBackground()
    this.addLowerThird()
    this.checkLoginState()
  }

  addBackground() {
    let img = this.game.add.image(0, 0, 'background')
    img.width = this.world.width
    img.height = this.world.height
  }

  addLowerThird() {
    let lowerThird = this.game.add.image(0, 0, 'lowerthird')
    lowerThird.width = this.world.width
    lowerThird.scale.y = lowerThird.scale.x
    lowerThird.position.y = this.world.height - lowerThird.height
  }

  // This function is called when someone finishes with the Login
  // Button.  See the onlogin handler attached to it in the sample
  // code below.
  checkLoginState() {
    FB.getLoginStatus( (response)=> {
      if (response.status == 'connected') {
        this.game.accessToken = response.authResponse.accessToken;
        this.handleLoggedIn()
      } else {
        this.addLoginButton()
      }
    })
  }

  handleLoggedIn() {
    console.log('logged in!')
    this.game.state.start('take_selfie')
  }

  addLoginButton() {
    let btn = this.game.add.image(this.world.centerX, 250, 'fblogin')
    btn.anchor.set(.5)
    btn.inputEnabled = true
    btn.events.onInputUp.add(()=> {
      btn.alpha = .2
      this.login()
    })
  }

  login() {
    FB.login( (response)=> {
      if (response.status == 'connected') {
        this.game.accessToken = response.authResponse.accessToken;
        this.handleLoggedIn()
      } else {
       alert("Oh dear, something went wrong. Oh well, enjoy the party!");
      }
    }, {scope:'user_posts,publish_actions,user_photos'});
  }
}

export default LoginState;
