# pf-perlin

**N-Dimensional Perlin Noise Generator** - A Perlin Noise generator for any number of dimensions.

## Examples

```javascript
// Require the module to use it.
const perlin = require('pf-perlin');

// Create a 3D Perlin Noise generator.
const Perlin3D = perlin({dimensions: 3});

// Use it to make a 100x100x100 grid of values
let res = 100, data = [];
for (let i = 0; i < res; ++i)
  for (let j = 0; j < res; ++j)
    for (let k = 0; k < res; ++k)
      data.push(Perlin3D.get(i/res, j/res, k/res));

const _ = require('lodash');
data = _.chunk(_.chunk(data, res), res);
```

See `examples/index.html` for a 4-dimensional usage. To build it, run
```
npm install browserify -g
npm run build
```

## API

### perlin(options)

 * **options** (Object) - *Optional*. An object of options
   * **seed** (Mixed) - Default: `null`. The RNG's seed
   * **dimensions** (Number) - Default: `2`. Number of dimensions
   * **min** (Number) - Default: `0`. The minimum value returned
   * **max** (Number) - Default: `1`. The maximum value returned
   * **wavelength** (Number) - Default: `1`. Size of the largest octave
   * **octaves** (Number) - Default: `8`. How many octaves to sample
   * **octaveScale** (Number) - Default: `1/2`. Scaling for successive octaves
   * **persistence** (Number) - Default: `1/2`. Value weighting for successive octaves
   * **interpolation** (Function) - Default: *cosine*. Interpolation function used

`seed` is expected to be a String, but will be passed through `JSON.stringify()` if it is not. Note that even with the same seed, a different order of `perlin.get()` calls will change the overall noise function since its values are generated lazily.

`wavelength` sets the size of the first octave, and each successive octave will be `octaveScale` times the previous. The octaves are centered about the origin, and added together according to their weight. The first octave has a weight of `1`, and each successive octave will be `persistence` times the previous.

The octaves are sampled using the `interpolation` function with signature `function(a, b, t)` that returns a value between `a` and `b` according to the parameter `0 <= t <= 1`. The default interpolation function used is cosine interpolation.

```javascript
interpolation: function(a, b, t) {
  return (1-Math.cos(Math.PI*t))/2 * (b-a) + a;
}
```

After the octaves are sampled and added together, the values are adjusted to fall between `min` and `max`. Note that the value distribution is roughly Gaussian.

 * **returns** (Object) - An object with a single function `get()`. This function accepts either the coordinates as parameters `get(x, y, z)` or an array of coordinates `get([x, y, z])`. This object does not store any returned values.
