"use strict";
import Geometry from "./geometry.js";

//Global variables
var scene;
var geometry;
var camera;
var clock = new THREE.Clock();
var renderer;
var bullet = null;

var difficulty = 1;
var rings = new Array(4);
var bullets = new LinkedList();
var obstacles = new LinkedList();
var sideSpeed = new THREE.Vector2(0, 0);
var frontSpeed = 0;

//Constants
const keyboard = new KeyListener();

const max_missed = 3;
const rings_count = 3;
const ring_distance = 500;
const ring_radius = 20;
const bullet_radius = ring_radius/10;
const obstacle_radius = ring_radius;

const maxSideSpeed = 100;
const minFrontSpeed = 0;
const maxFrontSpeed = 600;
const max_possible = maxSideSpeed * (ring_distance / maxFrontSpeed)*1.1;

const frontAcc = 150;
const sideAcc = 0.5;
const friction = 0.9;


window.onload = start();

function start(){
    init();
    window.requestAnimationFrame(mainLoop);
}

function init() {
    //Create scene
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2( 0x00000, 0.00075);

    //Load background texture
    const loader = new THREE.TextureLoader();
    loader.load('stars.jpg' , function(texture){scene.background = texture;});

    //Create camera
    camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight, 1, 5000);
    camera.position.z = ring_distance;
    camera.position.y = 0;
    camera.position.x = 0;
    
    //Create geometry object (creates geometry objects for us)
    geometry = new Geometry(ring_radius, bullet_radius, obstacle_radius, rings_count);
    
	//Add first Rings
    for(var i=0; i<rings_count; i++){
        var object = geometry.createRing(i*ring_distance/2, 0, -(ring_distance*i*0.8), ring_radius);

        //Add object to scene
        rings[i] = object;
        scene.add(object);
	}	
    for(var i=0; i<rings_count; i++){
		var obstacle = geometry.createObstacle(rings[i]);
		obstacles.append(obstacle[1]);
		scene.add(obstacle[0]);
    }

    //Create Renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0x000000);
    renderer.setSize(window.innerWidth, window.innerHeight);

    var b = document.getElementsByTagName("body")[0];
    b.appendChild(renderer.domElement);

    renderer.render( scene, camera );

}


function mainLoop() {
    var delta = clock.getDelta()*1000;
    


    if(obstacles.length == 0) {
		difficulty = difficulty + 1;
    	for(var i=0; i<rings_count; i++){
    		for(var j=0; j<difficulty; j++){
				var obstacle = geometry.createObstacle(rings[i]);
				obstacles.append(obstacle[1]);
				scene.add(obstacle[0]);
    			for(var k=0; k<difficulty-1; k++){
					var obstacle = geometry.createObstacle(obstacle[0], 50);
					obstacles.append(obstacle[1]);
					scene.add(obstacle[0]);
				}
    		}		
		}
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
        bulletSpeed.x += sideSpeed.x;
        bulletSpeed.y += sideSpeed.y;
        bulletSpeed.z -= frontSpeed;

        var bulletObject = geometry.createBullet(camera, rings);
        scene.add(bulletObject);

        var bullet = new Bullet(bulletObject, bulletSpeed);
        bullets.append(bullet);
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
            currentObstacle.angle = currentObstacle.angle + (delta * currentObstacle.speed*difficulty)/1000;

            currentObstacle.object.rotation.x += 0.02*difficulty*10;
            currentObstacle.object.rotation.y += 0.02*difficulty*10;

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
                if(d < obstacle_radius + bullet_radius + 5){

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

    //Keyboard controls
    
	/*if(keyboard.space && frontSpeed < maxFrontSpeed) {
        frontSpeed += delta * (frontAcc/1000);

        if(frontSpeed > maxFrontSpeed) {
            frontSpeed = maxFrontSpeed;
        }
    }
    if(keyboard.shift && frontSpeed > minFrontSpeed) {
        frontSpeed -= delta * (frontAcc/1000);

        if(frontSpeed < minFrontSpeed) {
            frontSpeed = minFrontSpeed;
        }
    }
	*/
    if(keyboard.up && sideSpeed.length() < maxSideSpeed) {
        sideSpeed.y += delta * (sideAcc/1000);
    }
    if(keyboard.down && sideSpeed.length() < maxSideSpeed ) {
        sideSpeed.y -= delta * (sideAcc/1000);
    }
    if(keyboard.left && sideSpeed.length() < maxSideSpeed) {
        sideSpeed.x -= delta * (sideAcc/1000);
    }
    if(keyboard.right && sideSpeed.length() < maxSideSpeed) {
        sideSpeed.x += delta * (sideAcc/1000);
    }
    

    //Allow for friction in sidespeed
    sideSpeed.multiplyScalar(friction);
    
    //Move camera forward
    camera.position.x += delta * sideSpeed.x;
    camera.position.y += delta * sideSpeed.y;

    camera.position.z -= delta * frontSpeed/1000;



    renderer.render(scene, camera);
    window.requestAnimationFrame(mainLoop);
}
