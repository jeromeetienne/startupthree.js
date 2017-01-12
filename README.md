# StartupTHREE.js

startupthree.js is a little tool to help you write your first demo.
You know the code you have to repeat at the begining of every 
three.js demo ? 
- you don't ? Good, startupthree.js is doing it for you :)
- you do ? Well, if your case is typical demo, you may gain some time :)


You dont have to download it. It is possible to get it directly from a CDN 
thanks to [rawgit](https://rawgit.com).
[https://cdn.rawgit.com/jeromeetienne/startupthree.js/0.6.1/startupThree.js](https://cdn.rawgit.com/jeromeetienne/startupthree.js/0.6.1/startupThree.js)

It works quite well with the online editor, e.g jsfiddle, codepen etc...
Here is an [startupthree.js example on jsfiddle](https://jsfiddle.net/jetienne/nk9kswk5/). 
[same on codepen](http://codepen.io/jeromeetienne/pen/dOqZNm)
You can fork it and start prototyping in three.js in less than a minute :)

# How to use it

```html
<script src='https://cdn.rawgit.com/jeromeetienne/startupthree.js/0.6.1/startupThree.js'></script>
<body><script>
startUpTHREEjs(function(demo){
	// create mesh
	var geometry = new THREE.TorusGeometry(1, 0.5)
	var material = new THREE.MeshNormalMaterial()
	var mesh = new THREE.Mesh(geometry, material)
	// add mesh to scene
	demo.scene.add(mesh)
	// make mesh move
	demo.onRenderFcts.push(function(delta){
		mesh.rotation.x += Math.PI*2 * delta * 0.1
		mesh.rotation.y += Math.PI*2 * delta * 0.1
	})
})
</script></body>
```

# Options
TODO here documents the options

```javascript
var options = {
	urlPrefix : '../',	// give the prefix url. Thus we can fetch the dependancies from there
	stats: true,		// true if you want to include stats.js performance monitoring
	rayInput : true,	// true to init rayinput - https://github.com/borismus/ray-input
	webvr : true,		// true to init webvr
				// - webvr-polyfill is included 
	webvrPolyfillPointerLock: true	// true if you want pointer lock controls when doing webvr
}
```

# Changelogs

### 0.6.1 
- added a startUpTHREEjs.VERSION to get the semver version
- fixed webvr.js typo
- better webvr supports

# How to release
It is important to have a good version because [rawgit](https://rawgit.com) requires to have [git tags](https://git-scm.com/book/en/v2/Git-Basics-Tagging)
to be unthrottled. Additionnaly, any tagged content is cached forever.
So here is how to release

1. replace the old version by the new version in the whole repository. 
   - simply use your text editor for that
1. commit the changes - ```git add . && git commit -a -m 'bump version'```
1. push the changes - ```git push```
1. tag the repo - ```git tag 0.6.1```
1. push the tag - ```git push --tags```
1. you are done.
