/**
 * main function
 */
function startUpTHREEjs(options, callback){
	// handle if no options is passed
	if( typeof(options) === 'function' ){
		callback = options
		options = {}
	}
	
	// handle options default values
	options.cameraControls = options.cameraControls !== undefined ? options.cameraControls : 'OrbitControls'
	options.noDownload = options.noDownload !== undefined ? options.noDownload : false
	options.stats = options.stats !== undefined ? options.stats : false
	options.webvr = options.webvr !== undefined ? options.webvr : false
	options.urlPrefix = options.urlPrefix !== undefined ? options.urlPrefix : 'https://cdn.rawgit.com/jeromeetienne/startupthree.js/0.5.0/'

	// load scripts
	startUpTHREEjs.loadStartThreejsScripts(options, function(){
		// init three.js
		startUpTHREEjs._initThreejs(options, callback)
	})
}

//////////////////////////////////////////////////////////////////////////////
//		Loading functions
//////////////////////////////////////////////////////////////////////////////

/**
 * load all the scripts needed by startupthree.js
 */
startUpTHREEjs.loadStartThreejsScripts = function(options, onLoaded){
	// honor options.noDownload
	if( options.noDownload === true )	return
	

	var firstBatchUrls = []
	var secondBatchUrls = []
	var urlPrefix = options.urlPrefix

	firstBatchUrls.push(urlPrefix+'vendor/three.js/build/three.min.js')
	if( options.stats === true ){
		firstBatchUrls.push(urlPrefix+'vendor/three.js/examples/js/libs/stats.min.js')
	}

	// handle controls
	if( options.cameraControls === 'OrbitControls' ){
		secondBatchUrls.push(urlPrefix+'vendor/three.js/examples/js/controls/OrbitControls.js')
	}else if( options.cameraControls === 'VRControls' ){
		secondBatchUrls.push(urlPrefix+'vendor/three.js/examples/js/controls/VRControls.js')		
	}
	
	if( options.webvr === true ){
		firstBatchUrls.push(urlPrefix+'vendor/webvr-polyfill.js')		
		secondBatchUrls.push(urlPrefix+'vendor/three.js/examples/js/effects/VREffect.js')		
	}

	// actually load the scripts
	startUpTHREEjs._loadScripts(firstBatchUrls, function(){
		startUpTHREEjs._loadScripts(secondBatchUrls, function(){
			onLoaded()
		})
	})
}

/**
 * load all the scripts
 */
startUpTHREEjs._loadScripts = function(urls, onLoaded){
	var loadedCount = 0
	// if urls is empty, return now
	if( urls.length === 0 ){
		onLoaded()
		return
	}
	// go thru all the urls
	for(var i = 0; i < urls.length; i++){
		startUpTHREEjs._loadScript(urls[i], function(content){
			// eval the content of this file
			eval(content)
			// update loadedCount
			loadedCount++
			// check if the loading if completed
			if( loadedCount === urls.length ){
				onLoaded()
			}
		})
	}
}

startUpTHREEjs._loadScript = function(url, onLoaded){
	var request = new XMLHttpRequest();
	request.open("GET", url);
	request.onreadystatechange = function(){
		if (request.status === 200 && request.readyState === 4 ){
			onLoaded(request.responseText);
		}
	}
	request.send()
}

//////////////////////////////////////////////////////////////////////////////
//		init three.js
//////////////////////////////////////////////////////////////////////////////

startUpTHREEjs._initThreejs = function(options, callback){
	var exports = {}

	//////////////////////////////////////////////////////////////////////////////////
	//		Init
	//////////////////////////////////////////////////////////////////////////////////

	// init renderer
	var renderer	= new THREE.WebGLRenderer();
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );

	// array of functions for the rendering loop
	var onRenderFcts= [];

	// init scene and camera
	var scene	= new THREE.Scene();
	var camera	= new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 1000);
	if( options.cameraControls === 'OrbitControls' ){
		var controls	= new THREE.OrbitControls(camera, renderer.domElement)
		camera.position.z = 10;
	}else if( options.cameraControls === 'VRControls'){
		var controls = new THREE.VRControls(camera);
	}else if( options.cameraControls === false ){
		var controls = null
	}else{
		console.assert(false, 'unknown options.cameraControls: ' + options.cameraControls)
	}
	
	if( options.webvr === true ){
		// Apply VR stereo rendering to renderer.
		var vrEffect = new THREE.VREffect(renderer);
		vrEffect.setSize(window.innerWidth, window.innerHeight);		
	}

	//////////////////////////////////////////////////////////////////////////////////
	//		render the whole thing on the page
	//////////////////////////////////////////////////////////////////////////////////

	// handle window resize
	window.addEventListener('resize', function(){
		if( vrEffect !== undefined ){
			vrEffect.setSize( window.innerWidth, window.innerHeight )
		}else{
			renderer.setSize( window.innerWidth, window.innerHeight )
		}
		camera.aspect	= window.innerWidth / window.innerHeight
		camera.updateProjectionMatrix()		
	}, false)

	
	if( options.stats === true ){
	        var stats = new Stats();
	        stats.domElement.style.position = 'absolute';
	        stats.domElement.style.top = '0px';
	        document.body.appendChild( stats.domElement );
		onRenderFcts.push(function(){
			stats.update()
		})		
	}
	
	// run the rendering loop
	var lastTimeMsec= null
	requestAnimationFrame(function animate(nowMsec){
		// keep looping
		requestAnimationFrame( animate );
		// update controls
		if( controls !== null ){
			controls.update()			
		}
		// measure time
		lastTimeMsec	= lastTimeMsec || nowMsec-1000/60
		var deltaMsec	= Math.min(200, nowMsec - lastTimeMsec)
		lastTimeMsec	= nowMsec

		// call each update function
		onRenderFcts.forEach(function(onRenderFct){
			onRenderFct(deltaMsec/1000, nowMsec/1000)
		})
		
		// render the scene
		if( vrEffect !== undefined ){
			vrEffect.render(scene, camera);
		}else{
			renderer.render( scene, camera );		
		}
	})
	
	//////////////////////////////////////////////////////////////////////////////
	//		Code Separator
	//////////////////////////////////////////////////////////////////////////////
	
	exports.renderer = renderer
	exports.scene = scene
	exports.camera = camera
	exports.controls = controls
	exports.onRenderFcts = onRenderFcts
	
	callback(exports)
}
