"use strict";
import GeometryFactory from "./geometry.js";
import GameCtrl from "./gamectrl.js";
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
var bullet = null;

var rings = new Array(4);
var bullets = new LinkedList();
var obstacles = new LinkedList();
var opponent_geometry;
var loader;

var rings_count = 5;
var ring_distance = 500;
var ring_radius = 20;
var bullet_radius = ring_radius/10;
var obstacle_radius = ring_radius;

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
    //Create scene
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2( 0x00000, 0.00075);

    //Load background texture
    const loader = new THREE.TextureLoader();
    loader.load('../img/stars.jpg' , function(texture){scene.background = texture;});

    //Create camera
    camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight, 1, 5000);
    camera.position.z = ring_distance;
    camera.position.y = 0;
    camera.position.x = 0;
   	 
    //Create geometry object (creates geometry objects for us)
    geometry = new GeometryFactory(ring_radius, bullet_radius, obstacle_radius, rings_count, rings_rnd, ring_distance, opponent_geometry);

    //Create gamectrl
	gamectrl = new GameCtrl(ring_distance);	

	//Init random numbers with synced key
	
	//Add player
    opponent = geometry.createOpponent(0, 0, 1000, 4);
    scene.add(opponent);
	
    //Add first Rings
    for(var i=0; i<rings_count; i++){
        var object = geometry.createRing(0, 0, -(ring_distance*i), geometry.ring_radius);

        //Add object to scene
        rings[i] = object;
        scene.add(object);
    }

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
	
	//Websocket Sycnronization
	var frontSpeed = gamectrl.frontSpeed;
	var sideSpeed = gamectrl.sideSpeed;
	var msg = JSON.stringify({type: "pos", ...camera.position, frontSpeed, sideSpeed, delta});
	ws.send(msg);
    opponent.rotation.z += 0.3;
	
	//Check if ring was passed
	var dead = gamectrl.ring_passed(rings, camera, geometry, delta);
   	if(dead) {
		return;
	} 
	
    //Add obstacles and rings
    if(rings[0].position.z > camera.position.z) {
        //Remove first obstacle and add new ones
        scene.remove(rings[0]);

        for(var i = 0;i < rings.length-1;i++) {
            rings[i] = rings[i+1];
        }

        if((gamectrl.passed_rings + gamectrl.missed) % 2 == 0){
            var obstacle = geometry.createObstacle(rings[rings_count-1]);
	    	obstacles.append(obstacle[1]);
            scene.add(obstacle[0]);
        }
		if((gamectrl.passed_rings + gamectrl.missed) % 3 == 0){
            var obstacle = geometry.createObstacle(rings[rings_count-1]);
	    	obstacles.append(obstacle[1]);
            scene.add(obstacle[0]);
            var obstacle = geometry.createObstacle(rings[rings_count-1]);
	    	obstacles.append(obstacle[1]);
            scene.add(obstacle[0]);
        }
        if((gamectrl.passed_rings + gamectrl.missed) % 5 == 0){
            var obstacle = geometry.createObstacle(rings[rings_count-1]);
	    	obstacles.append(obstacle[1]);
            scene.add(obstacle[0]);
            var obstacle = geometry.createObstacle(rings[rings_count-1]);
	    	obstacles.append(obstacle[1]);
            scene.add(obstacle[0]);
            var obstacle = geometry.createObstacle(rings[rings_count-1]);
	    	obstacles.append(obstacle[1]);
            scene.add(obstacle[0]);
        }
		
        var rR = rings_rnd() * gamectrl.max_possible;
        var rA = rings_rnd() * 2*Math.PI;

		//Random ring position
        var rX = Math.cos(rR)*rR + rings[geometry.rings_count-2].position.x;
        var rY = Math.sin(rR)*rR + rings[geometry.rings_count-2].position.y;
        var nZ = rings[geometry.rings_count-2].position.z - ring_distance;
        
		//Random radius of rings
        var ring_radius_random = 0.75*geometry.ring_radius + 0.5*rings_rnd()*geometry.ring_radius;
        var object = geometry.createRing(rX, rY, nZ, ring_radius_random);

        //Add object to scene
        rings[geometry.rings_count-1] = object;
        scene.add(object);
    }

    //Shooting
    if(keyboard.mouse){
        keyboard.mouse = false;

        var x = ((2*keyboard.x)/window.innerWidth) -1;
        var y = (((2*keyboard.y)/window.innerHeight) -1)*(-1);
	    
        var dir = new THREE.Vector3(x, y);
        var raycaster = new THREE.Raycaster();
		raycaster.setFromCamera( dir, camera );

		//Accelerate bullet with ray vector
        var bulletSpeed = raycaster.ray.direction.multiplyScalar(3000);
        bulletSpeed.x += gamectrl.sideSpeed.x;
        bulletSpeed.y += gamectrl.sideSpeed.y;
        bulletSpeed.z -= gamectrl.frontSpeed;

        var bulletObject = geometry.createBullet(camera.position);
        scene.add(bulletObject);

        var bullet = new Bullet(bulletObject, bulletSpeed);
        bullets.append(bullet);
		
		var msg = JSON.stringify({type: "bullet", x:bulletSpeed.x, y:bulletSpeed.y, z:bulletSpeed.z});
		ws.send(msg);
    }
    
    if(bullets.length != 0) {
        //Bulltes out of range?
        if(bullets.first.object.position.z - camera.position.z <= -2000) {
            scene.remove(bullets.first.object);
            bullets.removeFirst();
        }

        var currentBullet = bullets.first;
        while(currentBullet != null){
            currentBullet.object.position.x += currentBullet.speed.x*delta/1000;
            currentBullet.object.position.y += currentBullet.speed.y*delta/1000;
            currentBullet.object.position.z += currentBullet.speed.z*delta/1000;
            currentBullet = currentBullet.next;
        }
    }

    if(obstacles.length != 0) {
        //Obstacle out of range
        if(obstacles.first.object.position.z - camera.position.z >= 0) {
            scene.remove(obstacles.first.object);
            obstacles.removeFirst();
        }

        var currentObstacle = obstacles.first;
        while(currentObstacle != null){
            currentObstacle.angle = currentObstacle.angle + (delta * currentObstacle.speed)/1000;

            currentObstacle.object.rotation.x += 0.02;
            currentObstacle.object.rotation.y += 0.02;

	    	currentObstacle.object.position.x = currentObstacle.r_center.x + Math.cos(currentObstacle.angle)*currentObstacle.radius;
            currentObstacle.object.position.y = currentObstacle.r_center.y + Math.sin(currentObstacle.angle)*currentObstacle.radius;

            currentObstacle = currentObstacle.next;
        }
    }
    
    if(obstacles.length != 0 && bullets.length != 0){
        var obstacle = obstacles.first;
        while(obstacle != null){
            var bullet = bullets.first;
            while(bullet != null){

                var pos = obstacle.object.position.clone();
                var d = pos.sub(bullet.object.position).length();

    			//Check wheter shot hit
                if(d < geometry.obstacle_radius + geometry.bullet_radius + 5){

                    gamectrl.score += 10000;
                    document.getElementById("log").innerHTML = "+ " + 10000;
					
					var msg = JSON.stringify({type: "hit", id: obstacle.id});
					ws.send(msg);

                    scene.remove(bullet.object);
                    scene.remove(obstacle.object);
                    bullets.remove(bullet);
                    obstacles.remove(obstacle);
                }


                bullet = bullet.next;
            }
            obstacle = obstacle.next;
        }
    }

	//GAMECONTROLLER
	gamectrl.controls(keyboard, delta);
    
    //Move camera forward
    camera.position.x += delta * gamectrl.sideSpeed.x;
    camera.position.y += delta * gamectrl.sideSpeed.y;

    camera.position.z -= delta * gamectrl.frontSpeed/1000;



    renderer.render(scene, camera);
    window.requestAnimationFrame(mainLoop);
}
