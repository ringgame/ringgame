"use strict";
import GeometryFactory from "./geometry.js";
import GameCtrl from "./gamectrl.js";
import Level0 from "./levels/seeded/level_0.js";
//import {OBJLoader} from "./OBJLoader.js";

//Global variables
var scene;
var ws;
var geometry;
var gamectrl;
var camera;
var clock = new THREE.Clock();
var opponent;
var renderer;
var level;
var bullet = null;

var rings = new Array(4);
var bullets = new LinkedList();
var obstacles = new LinkedList();
var opponent_geometry;
var loader;


//Constants
const keyboard = new KeyListener();
const ws_seed = "My random seed";
const rings_rnd = new Math.seedrandom(ws_seed);
console.log(rings_rnd());



window.onload = start();


function syncEnvironment(event){
	//console.log(event.data);
	const data = JSON.parse(event.data);
	if (data.type === "pos") {
		opponent.position.x = data.x;
		opponent.position.y = data.y;
		opponent.position.z = data.z;
	} else if (data.type === "hit") {
		let cur = obstacles.first;				
		console.log(cur.id);
		console.log(data.id);
		while(cur !== null && cur.id !== data.id) {
			cur = cur.next;
		}
		if (!cur) {
			console.log("Got message about hit of object " + data.id + ", but I don't have that obstacle.");
			return;
		}
		scene.remove(cur.object);
		obstacles.remove(cur);
	} else if (data.type === "bullet") {
		var bulletObject = geometry.createBullet(opponent.position);
        scene.add(bulletObject);
        var bullet = new Bullet(bulletObject, data);
        bullets.append(bullet);
	}
}

function start(){
	/*loader = new OBJLoader();
	loader.load("../models/opponent.obj", (object) => {
		opponent_geometry = object;
		//Create websocket
		ws = new WebSocket("ws://localhost:8080");
  		ws.onopen = function(event) {init();console.log("WebSocket is open now.");};
		ws.onmessage = syncEnvironment;
	});*/
	//Create websocket
	ws = new WebSocket("ws://localhost:8080");
  	ws.onopen = function(event) {init();console.log("WebSocket is open now.");};
	ws.onmessage = syncEnvironment;
}

function init() {
    //Create scene and load BG
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2( 0x00000, 0.00075);
    const loader = new THREE.TextureLoader();
    loader.load('../img/stars.jpg' , function(texture){scene.background = texture;});
   	 
    //Create geometry object
	var rings_count = 5;
	var ring_distance = 500;
	var ring_radius = 20;
	var bullet_radius = ring_radius/10;
	var obstacle_radius = ring_radius;
    geometry = new GeometryFactory(ring_radius, bullet_radius, obstacle_radius, rings_count, rings_rnd, ring_distance, opponent_geometry);

    //Create gamectrl object
	var max_missed = 3;
	var maxSideSpeed = 100;
	var minFrontSpeed = 0;
	var maxFrontSpeed = 600;
	gamectrl = new GameCtrl(geometry, max_missed, maxSideSpeed, minFrontSpeed, maxFrontSpeed);

	//Create level environment loader and init env
	level = new Level0(gamectrl, geometry, rings_rnd);
	rings = level.init(scene, rings );
	
	//Add player
    opponent = geometry.createOpponent(0, 0, 1000, 4);
    scene.add(opponent);

    //Create camera
    camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight, 1, 5000);
    camera.position.z = geometry.ring_distance;
    camera.position.y = 0;
    camera.position.x = 0;
    
	//Create Renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0x000000);
    renderer.setSize(window.innerWidth, window.innerHeight);

    var b = document.getElementsByTagName("body")[0];
    b.appendChild(renderer.domElement);

    renderer.render( scene, camera );

    window.requestAnimationFrame(mainLoop);
}


function mainLoop() {
    var delta = clock.getDelta()*1000;
	
	//Websocket Sycronization
	var frontSpeed = gamectrl.frontSpeed;
	var sideSpeed = gamectrl.sideSpeed;
	var msg = JSON.stringify({type: "pos", ...camera.position, frontSpeed, sideSpeed, delta});
	ws.send(msg);
    opponent.rotation.z += 0.3;
	
	//Check if ring was passed, if so, did we make it?
	var dead = gamectrl.ring_passed(rings, camera, geometry, delta);
   	if(dead) {
		return;
	} 
	
	//Level 0 ring loader (load next rings and obstacles)	
	level.envUpdate(scene, camera, rings, obstacles);
	
	//Fire bullets and check if they hit
	gamectrl.shooting(scene, ws, camera, keyboard, geometry, bullets, obstacles, delta );

	//Control: UP, DOWN, SPEED, SLOW, et, etcc
	gamectrl.controls(keyboard, delta);
    
    //Move camera forward
    camera.position.x += delta * gamectrl.sideSpeed.x;
    camera.position.y += delta * gamectrl.sideSpeed.y;
    camera.position.z -= delta * gamectrl.frontSpeed/1000;
	
	//Render scene
    renderer.render(scene, camera);
    window.requestAnimationFrame(mainLoop);
}
