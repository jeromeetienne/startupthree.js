# StartupTHREE.js

startupthree.js is a little tool to help you write your first demo.
You know the code you have to repeat at the begining of every 
three.js demo ? 
- you don't ? Good, startupthree.js is doing it for you :)
- you do ? Well, if your case is typical demo, you may gain some time :)


You dont have to download it. It is possible to get it directly from a CDN 
thanks to rawgit.
[https://cdn.rawgit.com/jeromeetienne/startupthree.js/master/startupThree.js](https://cdn.rawgit.com/jeromeetienne/startupthree.js/master/startupThree.js)

It works quite well with the online editor, e.g jsfiddle, codepen etc...
Here is an [startupthree.js example on jsfiddle](https://jsfiddle.net/jetienne/nk9kswk5/)

# How to use it

```html
<!DOCTYPE html>
<meta name="viewport" content="width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0">
<script src='startupThree.js'></script>
<body style='margin: 0px; overflow: hidden; text-align:center;'><script>
startUpTHREEjs(function(){
	// create a mesh
	var geometry = new THREE.TorusGeometry(1, 0.5)
	var material = new THREE.MeshNormalMaterial()
	var mesh = new THREE.Mesh(geometry, material)
	// add the mesh to the scene
	demo.scene.add(mesh)
	// make the mesh move
	onRenderFcts.push(function(){
		mesh.rotation.x += 0.01
		mesh.rotation.y += 0.01
	})
})
</script></body>
```
