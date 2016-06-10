import GameState from './states/game_state'
import Boot from './states/boot'
import LoginState from './states/login_state'
import TakeSelfieState from './states/take_selfie_state'

class Game extends Phaser.Game {

  setupStage() {

    // this.scale.pageAlignVertically = true
    // $('#content').css({'min-height':$(window).height()}) // need this for vertical centering

    if (this.device.desktop) {
      this.scale.scaleMode = Phaser.ScaleManager.USER_SCALE
      this.scale.pageAlignHorizontally = true
      this.scale.setMinMax(this.width / 2, this.height / 2, this.width, this.height)
      this.scale.setResizeCallback(this.fitToWindow, this)
    } else {
      // Mobile
      this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL
      this.input.maxPointers = 1
      this.scale.forceOrientation(false, true) // portrait
    }

    // apparently a fix for android browser...might be out of date!
    // if (this.game.device.android && this.game.device.chrome == false) {
    //   this.game.stage.scaleMode = Phaser.StageScaleMode.EXACT_FIT;
    //   this.game.stage.scale.maxIterations = 1;
    // }
  }

  fitToWindow() {
    let w = window.innerWidth / this.width
    let h = window.innerHeight / this.height
    let scale = Math.min( w, h )
    this.scale.setUserScale(scale, scale)
  }

  addStates() {
    Game.states.forEach( ([name, stateClass]) => {
      this.state.add(name, stateClass)
    })
  }

  setTheme(theme) {
    this.theme = theme
  }

  startGame() {
    console.log('start game')
    this.stateIndex = 0
    this.nextState()
  }

  nextState() {
    this.gotoStateByIndex(this.stateIndex + 1)
  }

  prevState() {
    this.gotoStateByIndex(this.stateIndex - 1)
  }

  gotoStateByIndex(index) {
    index = Math.min(index, Game.states.length-1)
    index = Math.max(index, 1)
    this.stateIndex = index
    this.state.start(Game.states[index][0])
    // testing state transitions
    // this.state.start(Game.states[index][0], Phaser.Plugin.StateTransition.Out.SlideLeft, Phaser.Plugin.StateTransition.In.SlideLeft)
  }

  get currentState() {
    return this.state.states[this.state.current]
  }

}

Game.states = [
  ['boot', Boot],
  ['login', LoginState],
  ['take_selfie', TakeSelfieState]
]

export default Game;
