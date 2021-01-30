"use strict";
import Geometry from "./geometry.js";

//Global variables
var scene;
var geometry;
var camera;
var clock = new THREE.Clock();
var renderer;
var bullet = null;

var score = 0;
var passed_rings = 0;
var missed = 0;

var rings = new Array(4);
var bullets = new LinkedList();
var obstacles = new LinkedList();
var sideSpeed = new THREE.Vector2(0, 0);
var frontSpeed = 300;

//Constants
const keyboard = new KeyListener();

const maxSideSpeed = 100;
const minFrontSpeed = 0;
const maxFrontSpeed = 600;
const max_possible = maxSideSpeed * (ring_distance / maxFrontSpeed)*1.1;

const frontAcc = 150;
const sideAcc = 0.5;
const friction = 0.9;

const max_missed = 3;
const rings_count = 5;
const ring_distance = 500;
const ring_radius = 20;
const bullet_radius = ring_radius/10;
const obstacle_radius = ring_radius;

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
        var object = geometry.createRing(0, 0, -(ring_distance*i), ring_radius);

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

}


function mainLoop() {
    var delta = clock.getDelta()*1000;

    //Game logic, win, lose, ring missed
    if(rings[0].position.z >= camera.position.z) {
        var distanceToMiddle = Math.sqrt(Math.pow(camera.position.x - rings[0].position.x, 2) + Math.pow(camera.position.y- rings[0].position.y, 2));
        if(Math.abs(distanceToMiddle - ring_radius) <= (1/7)*ring_radius){
            document.getElementById("log").innerHTML = "Death by collision";
            alert("Game over!");
            return;

        } else if(distanceToMiddle < ring_radius){
            passed_rings++;
            score += 1000 * frontSpeed/100;
            document.getElementById("log").innerHTML = "+ " + Math.round((1000 * (frontSpeed/100)));

        } else {
            missed++;
            if(missed >= max_missed){
                document.getElementById("rings").innerHTML = passed_rings + "/" + (passed_rings + missed);
                document.getElementById("log").innerHTML = "Maximum Ring-Miss Count";
                alert("Game over!");
                return;
            }
            document.getElementById("log").innerHTML = "Ring missed";
        }

    }
    score += frontSpeed * delta/1000;

    document.getElementById("rings").innerHTML = passed_rings + "/" + (passed_rings + missed);
    document.getElementById("speed").innerHTML = "" + Math.round(frontSpeed);
    document.getElementById("left").innerHTML = "" + Math.round(score);
    
	
    //Add obstacles and rings
    if(rings[0].position.z > camera.position.z) {
        //Remove first obstacle and add new ones
        scene.remove(rings[0]);

        for(var i = 0;i < rings.length-1;i++) {
            rings[i] = rings[i+1];
        }

        if((passed_rings + missed) % 2 == 0){
            var obstacle = geometry.createObstacle(rings);
	    obstacles.append(obstacle[1]);
            scene.add(obstacle[0]);
        }
	if((passed_rings + missed) % 3 == 0){
            var obstacle = geometry.createObstacle(rings);
	    obstacles.append(obstacle[1]);
            scene.add(obstacle[0]);
            var obstacle = geometry.createObstacle(rings);
	    obstacles.append(obstacle[1]);
            scene.add(obstacle[0]);
        }
	if((passed_rings + missed) % 5 == 0){
            var obstacle = geometry.createObstacle(rings);
	    obstacles.append(obstacle[1]);
            scene.add(obstacle[0]);
            var obstacle = geometry.createObstacle(rings);
	    obstacles.append(obstacle[1]);
            scene.add(obstacle[0]);
            var obstacle = geometry.createObstacle(rings);
	    obstacles.append(obstacle[1]);
            scene.add(obstacle[0]);
        }

        var rR = Math.random() * max_possible;
        var rA = Math.random() * 2*Math.PI;
        var alt = rings[rings_count - 2];

	//Random ring position
        var rX = Math.cos(rR)*rR + rings[rings_count-2].position.x;
        var rY = Math.sin(rR)*rR + rings[rings_count-2].position.y;
        var nZ = rings[rings_count-2].position.z - ring_distance;
        
	//Random radius of rings
        var ring_radius_random = 0.75*ring_radius + 0.5*Math.random()*ring_radius;
        var object = geometry.createRing(rX, rY, nZ, ring_radius_random);

        //Add object to scene
        rings[rings_count-1] = object;
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
                if(d < obstacle_radius + bullet_radius + 5){

                    score += 10000;
                    document.getElementById("log").innerHTML = "+ " + 10000;

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
    if(keyboard.space && frontSpeed < maxFrontSpeed) {
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
