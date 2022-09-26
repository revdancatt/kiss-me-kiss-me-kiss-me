/* global preloadImagesTmr fxhash fxrand paper1Loaded */

//
//  fxhash - Kiss Me Kiss Me Kiss Me
//
//
//  HELLO!! Code is copyright revdancatt (that's me), so no sneaky using it for your
//  NFT projects.
//  But please feel free to unpick it, and ask me questions. A quick note, this is written
//  as an artist, which is a slightly different (and more storytelling way) of writing
//  code, than if this was an engineering project. I've tried to keep it somewhat readable
//  rather than doing clever shortcuts, that are cool, but harder for people to understand.
//
//  You can find me at...
//  https://twitter.com/revdancatt
//  https://instagram.com/revdancatt
//  https://youtube.com/revdancatt
//

const ratio = 1
// const startTime = new Date().getTime() // so we can figure out how long since the scene started
let drawn = false
let highRes = false // display high or low res
const features = {}
const nextFrame = null
let resizeTmr = null

window.$fxhashFeatures = {}

//  Work out what all our features are
const makeFeatures = () => {
  // features.background = 1
  features.paperOffset = {
    paper1: {
      x: fxrand(),
      y: fxrand()
    },
    paper2: {
      x: fxrand(),
      y: fxrand()
    }
  }
  //  Decide how many kisses we have
  const kisses = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4, 4, 4, 4, 4, 4, 4, 4, 9, 9, 9, 9, 16, 16, 25][Math.floor(fxrand() * 31)]
  const kissColours = ['#6B1344', '#ECA81B', '#BA1D11', '#021902', '#0D443E', '#111111', '#051A4C']
  const backgroundColours = ['#D698B9', '#E9CF0E', '#C0312B', '#8CB951', '#A8D4ED', '#99ABB3', '#0D67A8']
  features.kisses = []
  features.allFlat = (fxrand() < 0.1 && kisses > 1)
  features.allColour = (fxrand() < 0.1 && kisses > 1)
  features.allMonochrome = (fxrand() < 0.1 && kisses > 1)

  //  Now loop through the kisses and make them
  for (let i = 0; i < kisses; i++) {
    const kiss = {}
    kiss.top = {
      radius: fxrand() * 0.4 + 0.8
    }
    kiss.bottom = {
      radius: fxrand() * 0.4 + 0.8,
      type: 'circle'
    }
    // Sometimes the bottom kiss will be flat
    if (fxrand() > 0.5) kiss.bottom.type = 'flat'
    //  Work out the rotation of the whole kiss
    kiss.rotation = 0
    if (fxrand() < 0.9 && !features.allFlat) kiss.rotation = Math.sqrt(fxrand() * 360 * 360)
    // And the leftRight shift, and the upDown shift
    kiss.leftRight = fxrand() * 0.5 - 0.25
    kiss.upDown = fxrand() * 0.25 - 0.125
    kiss.colour = 'black'
    kiss.background = null

    if (!features.allMonochrome) {
      // Sometimes colour will be involved
      if (fxrand() < 0.33 || features.allColour) {
        // That colour may be the background
        if (fxrand() < 0.5) {
          // Add background colour here
          kiss.background = backgroundColours[Math.floor(fxrand() * backgroundColours.length)]
          //  There is a slim chance of a foreground colour
          if (fxrand() < 0.1 || features.allColour) kiss.colour = kissColours[Math.floor(fxrand() * kissColours.length)]
        } else {
          // Add the fourground colour here
          kiss.colour = kissColours[Math.floor(fxrand() * kissColours.length)]
          //  There is a slim chance of a background colour
          if (fxrand() < 0.1 || features.allColour) kiss.background = backgroundColours[Math.floor(fxrand() * backgroundColours.length)]
        }
      }
    }
    features.kisses.push(kiss)
  }

  window.$fxhashFeatures.kisses = kisses
  window.$fxhashFeatures['Forced all Level'] = features.allFlat
  window.$fxhashFeatures['Forced all Colour'] = features.allColour
  window.$fxhashFeatures['Forced all Monochrome'] = features.allMonochrome
}

//  Call the above make features, so we'll have the window.$fxhashFeatures available
//  for fxhash
makeFeatures()
console.log(features)
console.table(window.$fxhashFeatures)

const init = async () => {
  //  I should add a timer to this, but really how often to people who aren't
  //  the developer resize stuff all the time. Stick it in a digital frame and
  //  have done with it!
  window.addEventListener('resize', async () => {
    clearTimeout(resizeTmr)
    resizeTmr = setTimeout(layoutCanvas, 100)
  })

  //  Now layout the canvas
  await layoutCanvas()
}

const layoutCanvas = async () => {
  //  Kill the next animation frame
  window.cancelAnimationFrame(nextFrame)

  const wWidth = window.innerWidth
  const wHeight = window.innerHeight
  let cWidth = wWidth
  let cHeight = cWidth * ratio
  if (cHeight > wHeight) {
    cHeight = wHeight
    cWidth = wHeight / ratio
  }
  const canvas = document.getElementById('target')
  if (highRes) {
    canvas.height = 8192
    canvas.width = 8192 / ratio
  } else {
    canvas.width = Math.min((8192 / 2), cWidth * 2)
    canvas.height = Math.min((8192 / ratio / 2), cHeight * 2)
    //  Minimum size to be half of the high rez cersion
    if (Math.min(canvas.width, canvas.height) < 8192 / 2) {
      if (canvas.width < canvas.height) {
        canvas.height = 8192 / 2
        canvas.width = 8192 / 2 / ratio
      } else {
        canvas.width = 8192 / 2
        canvas.height = 8192 / 2 / ratio
      }
    }
  }

  canvas.style.position = 'absolute'
  canvas.style.width = `${cWidth}px`
  canvas.style.height = `${cHeight}px`
  canvas.style.left = `${(wWidth - cWidth) / 2}px`
  canvas.style.top = `${(wHeight - cHeight) / 2}px`

  //  Re-Create the paper pattern
  const paper1 = document.createElement('canvas')
  paper1.width = canvas.width / 2
  paper1.height = canvas.height / 2
  const paper1Ctx = paper1.getContext('2d')
  await paper1Ctx.drawImage(paper1Loaded, 0, 0, 1920, 1920, 0, 0, paper1.width, paper1.height)
  features.paper1Pattern = paper1Ctx.createPattern(paper1, 'repeat')

  const paper2 = document.createElement('canvas')
  paper2.width = canvas.width / (22 / 7)
  paper2.height = canvas.height / (22 / 7)
  const paper2Ctx = paper2.getContext('2d')
  await paper2Ctx.drawImage(paper1Loaded, 0, 0, 1920, 1920, 0, 0, paper2.width, paper2.height)
  features.paper2Pattern = paper2Ctx.createPattern(paper2, 'repeat')

  //  And draw it!!
  drawCanvas()
}

const drawCanvas = async () => {
  //  Let the preloader know that we've hit this function at least once
  drawn = true
  //  Make sure there's only one nextFrame to be called
  window.cancelAnimationFrame(nextFrame)

  // Grab all the canvas stuff
  const canvas = document.getElementById('target')
  const ctx = canvas.getContext('2d')
  const w = canvas.width
  const h = canvas.height

  //  Lay down the first paper texture
  ctx.fillStyle = features.paper1Pattern

  ctx.save()
  ctx.translate(-w * features.paperOffset.paper1.x, -h * features.paperOffset.paper1.y)
  ctx.fillRect(0, 0, w * 2, h * 2)
  ctx.restore()

  //  Lay down the second paper texture
  ctx.globalCompositeOperation = 'darken'
  ctx.fillStyle = features.paper2Pattern

  ctx.save()
  ctx.translate(-w * features.paperOffset.paper1.x, -h * features.paperOffset.paper1.y)
  ctx.fillRect(0, 0, w * 2, h * 2)
  ctx.restore()

  ctx.globalCompositeOperation = 'source-over'

  // Now draw the kisses
  // First work out how many kisses across and down we have,
  // it's the square root of the number of kisses
  const kissesAcross = Math.ceil(Math.sqrt(features.kisses.length))
  const kissesDown = kissesAcross
  //  Work out the square size we are going to use
  const squareSize = w / kissesAcross
  const halfSquareSize = squareSize / 2

  // Loop through the kisses
  for (let y = 1; y <= kissesDown; y++) {
    for (let x = 1; x <= kissesAcross; x++) {
      const kiss = features.kisses[(y - 1) * kissesAcross + (x - 1)]
      ctx.save()
      // Make a clipping mask for the square
      // Work out a corner radius
      const cornerRadius = squareSize * 0.02
      const border = squareSize * 0.01
      ctx.beginPath()
      // Top line
      ctx.moveTo((x - 1) * squareSize + border + cornerRadius, (y - 1) * squareSize + border)
      ctx.lineTo(x * squareSize - border - cornerRadius, (y - 1) * squareSize + border)
      // Top right corner
      ctx.arc(x * squareSize - border - cornerRadius, (y - 1) * squareSize + border + cornerRadius, cornerRadius, 1.5 * Math.PI, 2 * Math.PI)
      ctx.lineTo(x * squareSize - border, y * squareSize - border - cornerRadius)
      ctx.arc(x * squareSize - border - cornerRadius, y * squareSize - border - cornerRadius, cornerRadius, 0, 0.5 * Math.PI)
      ctx.lineTo((x - 1) * squareSize + border + cornerRadius, y * squareSize - border)
      ctx.arc((x - 1) * squareSize + border + cornerRadius, y * squareSize - border - cornerRadius, cornerRadius, 0.5 * Math.PI, 1 * Math.PI)
      ctx.lineTo((x - 1) * squareSize + border, (y - 1) * squareSize + border + cornerRadius)
      ctx.arc((x - 1) * squareSize + border + cornerRadius, (y - 1) * squareSize + border + cornerRadius, cornerRadius, 1 * Math.PI, 1.5 * Math.PI)
      ctx.closePath()
      ctx.clip()

      // Set the origin to the centre of the square
      ctx.save()
      // Do the main translation
      ctx.translate(x * squareSize - halfSquareSize, y * squareSize - halfSquareSize)
      // And now the kiss translation
      ctx.translate(kiss.leftRight * squareSize, kiss.upDown * squareSize)
      // Rotate the whole kiss
      ctx.rotate(kiss.rotation * Math.PI / 180)

      //  If there's a background colour then fill the background
      if (kiss.background) {
        ctx.fillStyle = kiss.background
        ctx.fillRect(-w * 4, -h * 4, w * 12, h * 12)
      }

      // Set the colour of the kisses
      ctx.fillStyle = kiss.colour

      // Work out the radius of the top kiss
      const topRadius = kiss.top.radius * (h / kissesDown) * 1.5
      // Draw the top kiss as a circle
      ctx.beginPath()
      ctx.arc(0, -topRadius - (h / 5000), topRadius, 0, 2 * Math.PI)
      // Fill the circle
      ctx.fill()

      // Start the path
      ctx.beginPath()
      if (kiss.bottom.type === 'circle') {
        //  Work out the radius of the bottom kiss
        const bottomRadius = kiss.bottom.radius * (h / kissesDown) * 5
        //  Draw the bottom kiss as a circle
        ctx.arc(0, bottomRadius, bottomRadius, 0, 2 * Math.PI)
      }
      if (kiss.bottom.type === 'flat') {
        ctx.moveTo(-w * 2, 0)
        ctx.lineTo(w * 3, 0)
        ctx.lineTo(w * 3, h * 2)
        ctx.lineTo(-w * 2, h * 2)
        ctx.closePath()
      }
      // Fill it in
      ctx.fill()

      // Now restore the canvas
      ctx.restore()
      ctx.restore()
    }
  }
}

const autoDownloadCanvas = async (showHash = false) => {
  const element = document.createElement('a')
  element.setAttribute('download', `Kiss_Me_Kiss_Me_Kiss_Me_${fxhash}`)
  element.style.display = 'none'
  document.body.appendChild(element)
  let imageBlob = null
  imageBlob = await new Promise(resolve => document.getElementById('target').toBlob(resolve, 'image/png'))
  element.setAttribute('href', window.URL.createObjectURL(imageBlob, {
    type: 'image/png'
  }))
  element.click()
  document.body.removeChild(element)
}

//  KEY PRESSED OF DOOM
document.addEventListener('keypress', async (e) => {
  e = e || window.event
  // Save
  if (e.key === 's') autoDownloadCanvas()

  //   Toggle highres mode
  if (e.key === 'h') {
    highRes = !highRes
    await layoutCanvas()
  }
})

//  This preloads the images so we can get access to them
// eslint-disable-next-line no-unused-vars
const preloadImages = () => {
  //  If paper1 has loaded and we haven't draw anything yet, then kick it all off
  if (paper1Loaded !== null && !drawn) {
    clearInterval(preloadImagesTmr)
    init()
  }
}