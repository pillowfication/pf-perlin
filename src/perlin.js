const random = require('random-seed')

function defaultify (options) {
  return Object.assign({
    seed: null,
    dimensions: 2,
    min: 0,
    max: 1,
    wavelength: 1,
    octaves: 8,
    octaveScale: 0.5,
    persistence: 0.5,
    interpolation: (a, b, t) => (1 - Math.cos(Math.PI * t)) / 2 * (b - a) + a
  }, options)
}

class Perlin {
  constructor (options) {
    options = defaultify(options)

    this._data = {}
    const uheprng = random.create()
    uheprng.seed(options.seed)
    this._random = uheprng.random

    this.dim = options.dimensions
    this.di2 = 1 << options.dimensions
    this.len = options.dimensions - 1
    this.min = options.min
    this.lam = options.wavelength
    this.oct = options.octaves
    this.sca = 1 / options.octaveScale
    this.per = options.persistence
    this.int = options.interpolation

    // amp = sum_{i=1}^{oct} per^{i-1} = (per^oct-1)/(per-1)
    // val = (val/amp)*(max-min)+min = val*fac+min
    // fac = (max-min)*(per-1)/(per^oct-1)
    this.fac =
      (options.max - options.min) *
      (options.persistence - 1) /
      (Math.pow(options.persistence, options.octaves) - 1)
  }

  // Lazily get the grid value at coordinates x-vect
  _grid (x) {
    let axis = this._data
    let coordinate
    for (let subscript = 0; (coordinate = x[subscript], subscript < this.len); ++subscript) {
      axis = axis[coordinate] || (axis[coordinate] = {})
    }

    const value = axis[coordinate]
    return value === undefined ? (axis[coordinate] = this._random()) : value
  }

  // Get the [0, 1) value at coordinates x-vect
  _get (x) {
    // Calculate grid coordinates and dx values
    const integral = []
    const fractional = []
    for (let subscript = 0; subscript < this.dim; ++subscript) {
      integral[subscript] = Math.floor(x[subscript])
      fractional[subscript] = x[subscript] - integral[subscript]
    }

    // Store hypercube-corner values
    const values = []
    for (let index = 0, corner = []; index < this.di2; ++index) {
      for (let subscript = 0; subscript < this.dim; ++subscript) {
        corner[subscript] = integral[subscript] + (index >> subscript & 1)
      }
      values.push(this._grid(corner))
    }

    // Repeatedly interpolate along axes
    for (let axis = 0; axis < this.dim; ++axis) {
      for (let corner = 0; corner < this.di2 >> axis; corner += 2) {
        values[corner >> 1] = this.int(values[corner], values[corner + 1], fractional[axis])
      }
    }

    // Final result is accumulated into `values[0]`
    return values[0]
  }

  get (coordinates) {
    // Scale coordinates by wavelength
    for (let subscript = 0; subscript < this.dim; ++subscript) {
      coordinates[subscript] /= this.lam
    }

    // Repeatedly add values from each octave
    let value = 0
    const x = []
    for (let octave = 0, scale = 1, weight = 1; octave < this.oct; ++octave, scale *= this.sca, weight *= this.per) {
      for (let subscript = 0; subscript < this.dim; ++subscript) {
        x[subscript] = coordinates[subscript] * scale
      }
      value += this._get(x) * weight
    }

    // Put the value in range
    return value * this.fac + this.min
  }
}

module.exports = Perlin
