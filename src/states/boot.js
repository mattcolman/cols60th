import _ from 'lodash'

class Boot extends Phaser.State {

	create() {
    console.log('boot me up')

    this.game.setupStage()
    this.game.addStates()
    this.game.startGame()
  }
}

export default Boot;
