# [Medusae][medusae-url]

[![Medusae][medusae-image-url]][medusae-url]

> Soft body jellyfish simulation.

### Source

* Jellyfish physics and graphics: [Medusae.js][medusae-source-url]
* Jellyfish hood shader: [bulb-frag.glsl][hood-glsl-source-url]
* Point repulsor: [PointRepulsorForce.js][point-force-source-url]
* Ambient dust animation and graphics: [Dust.js][dust-source-url] and [dust-vert.glsl][dust-glsl-source-url]
* Interpolated physics rendering: [Looper.js][looper-source-url] and [lerp_pos_vertex.glsl][lerp-vert-source-url]
* WebAudio player: [AudioController.js][audio-source-url]
* Canvas graph: [GraphComponent.js][graph-source-url]
* Lens dirt post effect: [LensDirtPass.js][lens-dirt-source-url]

### Process

* Screenshot and video [album][flickr-album-url]
* Progress release [code and builds][source-releases-url]
* Procedural GLSL hood texture [sketch][hood-glsl-url]
* Procedural Canvas2D water drop texture [sketch][water-canvas-url]
* Canvas graph [sketch][canvas-graph-url]

### Resources

* Photography of [Alexander Semenov][semenov-url]
* Paper on [advanced character physics][character-physics-url] by Thomas Jakobsen
* Article on [interpolated physics rendering][interpolated-physics-url] by Andrew Petersen

### Credits

* Concept, Design & Code: [Jay Weeks][portfolio-url]
* Audio Design: JP Arsenault
* Physics: [Particulate][particulate-url]
* Graphics: [Three][three-url]

### License

The Artistic License 2.0, see [LICENSE][license-source-url] for details.

### Development

[Grunt][grunt-url] is used for building and developing the project.

```sh
npm install
grunt server
```

[medusae-url]: https://jayweeks.com/medusae/
[medusae-image-url]: https://farm2.staticflickr.com/1628/23884999242_457d932c7a_h.jpg

[medusae-source-url]: https://github.com/jpweeks/particulate-medusae/blob/master/static/js/items/Medusae.js
[hood-glsl-source-url]: https://github.com/jpweeks/particulate-medusae/blob/master/static/glsl/shaders/bulb-frag.glsl
[point-force-source-url]: https://github.com/jpweeks/particulate-medusae/blob/master/static/js/forces/PointRepulsorForce.js
[dust-source-url]: https://github.com/jpweeks/particulate-medusae/blob/master/static/js/items/Dust.js
[dust-glsl-source-url]: https://github.com/jpweeks/particulate-medusae/blob/master/static/glsl/shaders/dust-vert.glsl
[looper-source-url]: https://github.com/jpweeks/particulate-medusae/blob/master/static/js/utils/Looper.js
[lerp-vert-source-url]: https://github.com/jpweeks/particulate-medusae/blob/master/static/glsl/shader-chunks/lerp_pos_vertex.glsl
[audio-source-url]: https://github.com/jpweeks/particulate-medusae/blob/master/static/js/controllers/AudioController.js
[graph-source-url]: https://github.com/jpweeks/particulate-medusae/blob/master/static/js/components/GraphComponent.js
[lens-dirt-source-url]: https://github.com/jpweeks/particulate-medusae/blob/master/static/js/post-processing/LensDirtPass.js

[flickr-album-url]: https://www.flickr.com/photos/jpweeks/sets/72157646887502644/
[source-releases-url]: https://github.com/jpweeks/particulate-medusae/releases
[hood-glsl-url]: http://glslsandbox.com/e#20575.0
[water-canvas-url]: https://jsbin.com/guqodi/11/edit?js,output
[canvas-graph-url]: https://jsbin.com/yoteko/10/edit?js,output

[semenov-url]: https://www.flickr.com/photos/a_semenov/7570746886/
[character-physics-url]: http://web.archive.org/web/20080410171619/http://www.teknikus.dk/tj/gdc2001.htm
[interpolated-physics-url]: http://kirbysayshi.com/2013/09/24/interpolated-physics-rendering.html

[portfolio-url]: https://jayweeks.com
[source-url]: https://github.com/jpweeks/particulate-medusae
[three-url]: http://threejs.org
[particulate-url]: http://particulatejs.org

[license-source-url]: https://github.com/jpweeks/particulate-medusae/blob/master/LICENSE
[grunt-url]: http://gruntjs.com
