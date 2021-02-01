"use strict";
import GeometryFactory from "./geometry.js";
import GameCtrl from "./gamectrl.js";
import Level0 from "./levels/seeded/level_0.js";
import { syncEnvironment } from "./sync.js";
//import {OBJLoader} from "./OBJLoader.js";

//Global variables
var scene;
var ws;
var geometry;
var gamectrl;
var level;
var camera;
var clock = new THREE.Clock();
var renderer;

var opponent_geometry;
var loader;

//Constants
const keyboard = new KeyListener();
const ws_seed = "My random seed";
const rings_rnd = new Math.seedrandom(ws_seed);
console.log(rings_rnd());

window.onload = start();


function sync(event) {
	syncEnvironment(event, scene, geometry, level.opponent, level.obstacles, level.bullets);
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
	ws.onmessage = sync;
}

function init() {
    //Create scene and load BG
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2( 0x00000, 0.00075);
    const loader = new THREE.TextureLoader();
    loader.load('../img/stars.jpg' , function(texture){scene.background = texture;});
   	 
    //Create geometry object (MODEL)
	var rings_count = 5; var ring_distance = 500; var ring_radius = 20;
	var bullet_radius = ring_radius/10; var obstacle_radius = ring_radius; var player_radius=4;
    geometry = new GeometryFactory(ring_radius, bullet_radius, obstacle_radius, rings_count, rings_rnd, ring_distance, player_radius, opponent_geometry);

    //Create gamectrl object (CONTROLLER)
	var max_missed = 3; var maxSideSpeed = 100;
	var minFrontSpeed = 0; var maxFrontSpeed = 600;
	gamectrl = new GameCtrl(geometry, max_missed, maxSideSpeed, minFrontSpeed, maxFrontSpeed);

	//Create level environment loader and init env (VIEW)
	level = new Level0(gamectrl, geometry, rings_rnd);
	level.init(scene);

	//Add player to level
    level.opponent = geometry.createOpponent(0, 0, 1000, geometry.player_radius);
    scene.add(level.opponent);

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
	gamectrl.gameTime = gamectrl.gameTime + delta;
	
	//Websocket Sycronization
	var frontSpeed = gamectrl.frontSpeed;
	var sideSpeed = gamectrl.sideSpeed;
	var msg = JSON.stringify({type: "pos", ...camera.position, frontSpeed, sideSpeed, delta});
	ws.send(msg);
    level.opponent.rotation.z += 0.3;
	
	//Check if ring was passed, if so, did we make it?
	var dead = gamectrl.ring_passed(level.rings, camera, geometry, delta);
   	if(dead) {
		return;
	} 
	
	//Level 0 ring loader (load next rings and obstacles)	
	var dead = level.envUpdate(scene, camera);
   	if(dead) {
		return;
	} 
	
	//Fire bullets and check if they hit
	gamectrl.shooting(scene, ws, camera, keyboard, level, delta );

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
