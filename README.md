# pf-perlin

**N-Dimensional Perlin Noise Generator** - An approximate [Perlin noise generator](https://en.wikipedia.org/wiki/Perlin_noise) for any number of dimensions. This is NOT true Perlin noise, but is a faster alternative. The difference is explained at [http://pf-n.co/github/pf-perlin](http://pf-n.co/github/pf-perlin).

![Rainbow Perlin Noise](/rainbow-perlin.png)

## Examples

```javascript
// Require the module to use it.
const Perlin = require('pf-perlin')

// Create a 3D Perlin Noise generator.
const perlin3D = new Perlin({ dimensions: 3 })

// Use it to make a 100x100x100 grid of values
const resolution = 100
let data = []
for (let x = 0; x < resolution; ++x) {
  for (let y = 0; y < resolution; ++y) {
    for (let z = 0; z < resolution; ++z) {
      data.push(perlin3D.get([ x / resolution, y / resolution, z / resolution ]))
    }
  }
}

const _ = require('lodash')
data = _(data).chunk(resolution).chunk(resolution).value()
data[5][62][17]
// 0.6594545530358533
```

The following example creates the above picture.

```javascript
// Create the canvas
const { createCanvas } = require('canvas')
const [ width, height ] = [ 800, 200 ]
const canvas = createCanvas(width, height)
const ctx = canvas.getContext('2d', { alpha: false })

// Create the image data
const Perlin = require('./perlin')
const perlin3D = new Perlin({ dimensions: 3 })
const resolution = 100
const imageData = ctx.createImageData(width, height)
let dataIndex = 0
for (let row = 0; row < height; ++row) {
  for (let col = 0; col < width; ++col) {
    imageData.data[dataIndex++] = perlin3D.get([ row / resolution, col / resolution, 0 ]) * 256 | 0
    imageData.data[dataIndex++] = perlin3D.get([ row / resolution, col / resolution, 1 ]) * 256 | 0
    imageData.data[dataIndex++] = perlin3D.get([ row / resolution, col / resolution, 2 ]) * 256 | 0
    ++dataIndex
  }
}

// Export the image data
const fs = require('fs')
const path = require('path')
ctx.putImageData(imageData, 0, 0)
canvas.createPNGStream()
  .pipe(fs.createWriteStream(path.resolve(__dirname, './rainbow-perlin.png')))
```

## API

### `Perlin`

*({Class})*: Represents a Perlin noise generator.

```javascript
const Perlin = require('pf-perlin')
const noiseGenerator = new Perlin()
```

### `Perlin.constructor([options])`

**Arguments**
 1. `[options]` *(Object)*: An objects of options. All options are optional.

|  Option         | Type     | Default  | Description                    |
|:---------------:|:--------:|:--------:|:-------------------------------|
| `seed`          | String   | `null`   | RNG's seed                     |
| `dimensions`    | Number   | `2`      | Number of dimensions           |
| `min`           | Number   | `0`      | Minimum value returned         |
| `max`           | Number   | `1`      | Maximum value returned         |
| `wavelength`    | Number   | `1`      | Size of the first octave       |
| `octaves`       | Number   | `8`      | Number of octaves to sample    |
| `octaveScale`   | Number   | `1/2`    | Scaling for successive octaves |
| `persistence`   | Number   | `1/2`    | Weight for successive octaves  |
| `interpolation` | Function | *cosine* | Interpolation function used    |

`seed` is expected to be a String, but will be passed through `JSON.stringify()` if it is not. Note that even with the same seed, a different order of `<Perlin>.get()` calls will change the overall noise function since its values are generated lazily.

`wavelength` sets the size of the first octave, and each successive octave will be `octaveScale` times the previous. The octaves are centered about the origin and added together according to their weight. The first octave has a weight of `1`, and each successive octave will be `persistence` times the previous.

The octaves are sampled using the `interpolation` function with signature `function(a, b, t)` that returns a value between `a` and `b` according to the parameter `0 <= t <= 1`. The default interpolation function used is cosine interpolation.

```javascript
interpolation: function (a, b, t) {
  return (1 - Math.cos(Math.PI * t)) / 2 * (b - a) + a
}
```

After the octaves are sampled and added together, the values are adjusted to fall between `min` and `max`. Note that the value distribution is roughly Gaussian depending on the number of octaves.

### `Perlin.prototype.get(coordinates)`

**Arguments**
 1. `coordinates` *(Array<Number>)*: The data point to get. Its length should match `dimensions`.

**Returns**
 * *(Number)*: The value at those coordinates.

Note: This function may modify `coordinates`. If this is an issue, use `perlin.get(coordinates.slice())`.

```javascript
const perlin4D = new Perlin({ dimensions: 4 })

perlin4D.get([ 1, 2, 3, 4 ])
// 0.538503118881535
```
