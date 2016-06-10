import $ from 'jquery'
import Base64Binary from '../base64-binary'
import EXIF from 'exif-js'
import 'gsap'

class TakeSelfieState extends Phaser.State {

  preload() {
    this.game.load.image('selfie_button', 'assets/images/selfie_button.png')
    this.game.load.image('fbshare', 'assets/images/fb_share.png')
    this.game.load.image('back_button', 'assets/images/back_button.png')
  }

  create() {
    super.create()

    this.addBackground()
    this.lowerThird = this.addLowerThird()
    this.selfieBtn  = this.addTakeSelfieButton()
  }

  shutdown() {
    $("#capture").off("change", this.handleChange)
  }

  addBackground() {
    let img = this.game.add.image(0, 0, 'background')
    img.width = this.world.width
    img.height = this.world.height
  }

  addBackButton() {
    let btn = this.game.add.image(50, 50, 'back_button')
    btn.inputEnabled = true
    btn.events.onInputUp.add(()=> {
      this.state.start('login')
    })
  }
  addLowerThird() {
    let lowerThird = this.game.add.image(0, 0, 'lowerthird')
    lowerThird.width = this.world.width
    lowerThird.scale.y = lowerThird.scale.x
    lowerThird.position.y = this.world.height - lowerThird.height
    return lowerThird
  }

  addTakeSelfieButton() {
    this.handleChange = ()=> {
      console.log('oh change!')
      let input = event.target
      if (input.files && input.files[0]) {
        console.log('yep file')
        var reader = new FileReader();

        reader.onload = (e)=> {
          console.log('onload')

          let dataURI = e.target.result
          // this.game.load.image('image-data', dataURI)
          // this.game.load.onFileComplete.add((e)=> {
          //   console.log('complete!!', e)
          //   this.goImage()
          // })
          // this.game.load.start()
          let img = new Image()
          img.src = dataURI
          img.onload = () => {

            this.game.cache.addImage('image-data', null, img)
            var _this = this
            var exif = EXIF.getData(img, function() {
              let orientation = EXIF.getTag(this, 'Orientation')
              _this.goImage(orientation)

            })
          }
        }

        console.log('file time', input.files[0])
        reader.readAsDataURL(input.files[0]);
      }
    }

    $("#capture").on("change", this.handleChange)

    console.log('click capture')

    let btn = this.game.add.image(this.world.centerX, 250, 'selfie_button')
    btn.anchor.set(.5)
    btn.inputEnabled = true
    btn.events.onInputUp.add(()=> {
      document.getElementById('capture').click()
    })

    return btn
  }

  goImage(orientation) {
    console.log('Orientation', orientation)

    this.selfieBtn.destroy()

    let grp = this.game.make.group(null)
    let img = this.game.add.image(0, 0, 'image-data', null, grp)
    img.anchor.set(.5)

    switch(orientation){
      case 2:
          // horizontal flip
          img.scale.x = -1
          break;
      case 3:
          // 180° rotate left
          img.angle = 180
          break;
      case 4:
          // vertical flip
          img.scale.y = -1
          break;
      case 5:
          // vertical flip + 90 rotate right
          img.angle = 90
          img.scale.y = -1
          break;
      case 6:
          // 90° rotate right
          img.angle = 90
          break;
      case 7:
          // horizontal flip + 90 rotate right
          img.angle = 90
          img.scale.x = -1
          break;
      case 8:
          // 90° rotate left
          img.angle = -90
          break;
      default:
        break;
    }

    var mainGrp = this.game.make.group(null)
    mainGrp.addChild(grp)
    grp.width = this.world.width
    grp.scale.y = grp.scale.x
    grp.position.set(grp.width/2, grp.height/2)

    mainGrp.addChild(this.lowerThird)
    this.lowerThird.width = grp.width
    this.lowerThird.scale.y = this.lowerThird.scale.x
    this.lowerThird.y = grp.height - this.lowerThird.height

    let photoGrp = this.addWhiteBorder(mainGrp)

    this.shareBtn = this.addShareButton()

    photoGrp.width = this.world.width - 20
    photoGrp.scale.y = photoGrp.scale.x
    if (photoGrp.height > this.world.height - this.shareBtn.height - 20) {
      photoGrp.height = this.world.height - this.shareBtn.height - 20
    }
    photoGrp.scale.x = photoGrp.scale.y
    photoGrp.x = (this.world.width - photoGrp.width) / 2
    photoGrp.y = (this.world.height - this.shareBtn.height - 20 - photoGrp.height) / 2

    this.photoGrp = photoGrp
    TweenMax.from(photoGrp, 2, {y: this.world.height, ease: Elastic.easeOut})

    this.addBackButton()

    this.shareBtn.events.onInputUp.add(()=> {
      this.shareBtn.inputEnabled = false
      this.shareBtn.alpha = .2

      // this.showPostSuccess()
      let texture = mainGrp.generateTexture()
      this.textureToPng(texture)
    })
  }

  addWhiteBorder(parent) {
    let grp = this.game.add.group()
    const border = 20
    let g = this.game.add.graphics(0, 0, grp)
    g.beginFill(0xffffff)
     .drawRect(0, 0, parent.width + border*2, parent.height + border*2)
    grp.addChild(parent)
    parent.position.set(border, border)
    return grp
  }

  addShareButton() {
    let btn = this.game.add.image(this.world.centerX, this.world.height - 10, 'fbshare')
    btn.anchor.set(.5, 1)
    btn.width = this.world.width
    btn.scale.y = btn.scale.x
    btn.inputEnabled = true
    return btn
  }

  textureToPng(texture) {
    // })
    // This bit is important.  It detects/adds XMLHttpRequest.sendAsBinary.  Without this
    // you cannot send image data as part of a multipart/form-data encoded request from
    // Javascript.  This implementation depends on Uint8Array, so if the browser doesn't
    // support either XMLHttpRequest.sendAsBinary or Uint8Array, then you will need to
    // find yet another way to implement this. (This is left as an exercise for the reader,
    // but if you do it, please let me know and I'll integrate it.)

    // from: http://stackoverflow.com/a/5303242/945521

    if ( XMLHttpRequest.prototype.sendAsBinary === undefined ) {
      XMLHttpRequest.prototype.sendAsBinary = function(string) {
        var bytes = Array.prototype.map.call(string, function(c) {
          return c.charCodeAt(0) & 0xff;
        });
        this.send(new Uint8Array(bytes).buffer);
      };
    }

    let source = texture.baseTexture.source.toDataURL('image/png')
    let encodedPng = source.substring(source.indexOf(',')+1, source.length);
    let decodedPng = Base64Binary.decode(encodedPng);
    this.postImageToFacebook(this.game.accessToken, 'img.png', 'image/png', decodedPng, '#cols60th')
  }


  // This function takes an array of bytes that are the actual contents of the image file.
  // In other words, if you were to look at the contents of imageData as characters, they'd
  // look like the contents of a PNG or GIF or what have you.  For instance, you might use
  // pnglib.js to generate a PNG and then upload it to Facebook, all from the client.
  //
  // Arguments:
  //   authToken - the user's auth token, usually from something like authResponse.accessToken
  //   filename - the filename you'd like the uploaded file to have
  //   mimeType - the mime type of the file, eg: image/png
  //   imageData - an array of bytes containing the image file contents
  //   message - an optional message you'd like associated with the image
  postImageToFacebook( authToken, filename, mimeType, imageData, message ) {
    // this is the multipart/form-data boundary we'll use
    var boundary = '----ThisIsTheBoundary1234567890';

    // let's encode our image file, which is contained in the var
    var formData = '--' + boundary + '\r\n'
    formData += 'Content-Disposition: form-data; name="source"; filename="' + filename + '"\r\n';
    formData += 'Content-Type: ' + mimeType + '\r\n\r\n';
    for ( var i = 0; i < imageData.length; ++i )
    {
        formData += String.fromCharCode( imageData[ i ] & 0xff );
    }
    formData += '\r\n';
    formData += '--' + boundary + '\r\n';
    formData += 'Content-Disposition: form-data; name="message"\r\n\r\n';
    formData += message + '\r\n'
    formData += '--' + boundary + '--\r\n';

    var xhr = new XMLHttpRequest();
    xhr.open( 'POST', 'https://graph.facebook.com/me/photos?access_token=' + authToken, true );
    xhr.onload = ()=> {
      console.log( xhr.responseText );
      this.showPostSuccess()
    }
    xhr.onerror = ()=> {
      alert('oh no, error posting. oh well...enjoy the party!')
    }
    xhr.setRequestHeader( "Content-Type", "multipart/form-data; boundary=" + boundary );
    xhr.sendAsBinary( formData );
  }

  showPostSuccess() {
    this.shareBtn.destroy()
    const style = {font: '50px Arial', fill: '#fff', align: 'center'}
    let txt = this.game.add.text(this.world.centerX, 300, 'Your photo has been\nposted to Facebook!\n Enjoy the party!', style)
    txt.anchor.set(.5)

    let tl = new TimelineMax()
    tl.to(this.photoGrp, 1, {y: -1000, alpha: 0, ease: Back.easeIn})
      .from(txt, 1, {y: 1000, alpha: 0, ease: Back.easeOut})
  }

}

export default TakeSelfieState;
