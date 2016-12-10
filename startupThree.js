// "use strict";

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
	options.urlPrefix = options.urlPrefix !== undefined ? options.urlPrefix : 'https://cdn.rawgit.com/jeromeetienne/startupthree.js/0.5.0/'
	options.noDownload = options.noDownload !== undefined ? options.noDownload : false
	options.stats = options.stats !== undefined ? options.stats : false
	options.webvr = options.webvr !== undefined ? options.webvr : false
	options.rayInput = options.rayInput !== undefined ? options.rayInput : false
	if( options.cameraControls === undefined ){
		options.cameraControls = options.webvr === true ? 'VRControls' : 'OrbitControls'
	}
	if( options.webvrPolyfill === undefined ){
		options.webvrPolyfill = options.webvr === true ? true : false
	}
	
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
	
	if( options.rayInput === true ){
		secondBatchUrls.push(urlPrefix+'vendor/ray.min.js')		
	}

	if( options.webvrPolyfill === true ){
		firstBatchUrls.push(urlPrefix+'vendor/webvr-polyfill.min.js')		
	}

	if( options.webvr === true ){
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
		startUpTHREEjs._loadScript(urls[i], function(content, url){
			// eval the content of this file
			eval(content)
			// yucky kludge to export Stats in window
			if( url.endsWith('/stats.min.js') === true ){
				window.Stats = Stats
			}
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
			onLoaded(request.responseText, url);
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
	var lastRender = 0;
	requestAnimationFrame(function animate(timestamp){
		var delta = Math.min(timestamp - lastRender, 500);
		lastRender = timestamp;	
		// keep looping
		requestAnimationFrame( animate );

		// update controls
		if( controls !== null )	controls.update()			
		// call each update function
		onRenderFcts.forEach(function(onRenderFct){
			onRenderFct(delta/1000)
		})
		
		// render the scene
		if( vrEffect !== undefined ){
			vrEffect.render(scene, camera);
		}else{
			renderer.render(scene, camera);		
		}
	})
	
	//////////////////////////////////////////////////////////////////////////////
	//		build dom for options.webvr
	//////////////////////////////////////////////////////////////////////////////
	
	if( options.webvr === true )	this._initWebvr(options, renderer)

	//////////////////////////////////////////////////////////////////////////////
	//		Code Separator
	//////////////////////////////////////////////////////////////////////////////
	
	exports.renderer = renderer
	exports.scene = scene
	exports.camera = camera
	exports.controls = controls
	exports.onRenderFcts = onRenderFcts
	
	// to export everything in window
	// Object.keys(demo).forEach(function(property){
	// 	window[property] = demo[property]
	// })
	
	callback(exports)
}


/**
 * init webvr
 */
startUpTHREEjs._initWebvr = function(options, renderer){
	console.assert(options.webvr === true)
		
	var fullscreenContainer = document.createElement('div')
	fullscreenContainer.setAttribute('id', 'fullscreenContainer')
	document.body.appendChild( fullscreenContainer )

	document.querySelector('#fullscreenContainer').appendChild( renderer.domElement );		

	var styleText = 
		'#buttonsContainer {' + 
			'z-index: 1;' + 
		'}' +
		'#buttonsContainer img:hover {' + 
			'border-radius: 5px;' + 
			'background: #444;'+
			'cursor: pointer;' +
		'}'
	var styleElement = document.createElement("style");
	styleElement.type = "text/css";
	styleElement.innerHTML = styleText;
	document.body.appendChild(styleElement);
	
	var buttonsContainer = document.createElement('div')
	buttonsContainer.setAttribute('id', 'buttonsContainer')
	buttonsContainer.style.position = 'absolute'
	buttonsContainer.style.bottom = '4px'
	buttonsContainer.style.right = '4px'
	fullscreenContainer.appendChild(buttonsContainer)
	
	var fullscreenButton = document.createElement('img')
	fullscreenButton.src = options.urlPrefix + 'images/font-awesome_4-7-0_arrows-alt_128_0_bdc3c7_none.png'
	fullscreenButton.style.height = '24px'
	fullscreenButton.style.padding = '4px'
	buttonsContainer.appendChild(fullscreenButton)
	
	var vrTriggerButton = document.createElement('img')
	vrTriggerButton.src = options.urlPrefix + 'images/font-awesome_4-7-0_eye_128_0_bdc3c7_none.png'
	vrTriggerButton.style.height = '24px'
	vrTriggerButton.style.padding = '4px'
	buttonsContainer.appendChild(vrTriggerButton)
	
	var vrResetButton = document.createElement('img')
	vrResetButton.src = options.urlPrefix + 'images/font-awesome_4-7-0_star_128_0_bdc3c7_none.png'
	vrResetButton.style.height = '24px'
	vrResetButton.style.padding = '4px'
	buttonsContainer.appendChild(vrResetButton)
	
	fullscreenButton.addEventListener('click', function() {
		enterFullscreen(fullscreenContainer);
		function enterFullscreen (element) {
			if (element.requestFullscreen) {
				element.requestFullscreen();
			} else if (element.mozRequestFullScreen) {
				element.mozRequestFullScreen();
			} else if (element.webkitRequestFullscreen) {
				element.webkitRequestFullscreen();
			} else if (element.msRequestFullscreen) {
				element.msRequestFullscreen();
			}
		}
	});
	vrTriggerButton.addEventListener('click', function() {
		vrDisplay.requestPresent([{
			source: renderer.domElement
		}]);
	});
	vrResetButton.addEventListener('click', function() {
		vrDisplay.resetPose();
	});

	// Get the VRDisplay and save it for later.
	var vrDisplay = null;
	navigator.getVRDisplays().then(function(displays) {
		if (displays.length === 0) return
		vrDisplay = displays[0];

		// if can not present, hide the buttons for presenting webvr
		if( vrDisplay.capabilities.canPresent !== true ){
			vrTriggerButton.style.display = 'none'
			vrResetButton.style.display = 'none'
		}
	});
}
