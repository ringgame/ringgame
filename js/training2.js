"use strict";
import GeometryFactory from "./geometry.js";

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

const max_missed = 1;
const rings_count = 5;
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
    loader.load('../img/stars.jpg' , function(texture){scene.background = texture;});

    //Create camera
    camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight, 1, 5000);
    camera.position.z = ring_distance;
    camera.position.y = 0;
    camera.position.x = 0;
    
    //Create geometry object (creates geometry objects for us)
    geometry = new GeometryFactory(ring_radius, bullet_radius, obstacle_radius, rings_count);

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
            alert("Game over!");
            return;

        } else if(distanceToMiddle < ring_radius){
            passed_rings++;
            score += 1000 * frontSpeed/100;

        } else {
            missed++;
            if(missed >= max_missed){
                document.getElementById("rings").innerHTML = passed_rings + "/" + (passed_rings + missed);
                alert("Game over!");
                return;
            }
        }

    }
    score += frontSpeed * delta/1000;

    document.getElementById("rings").innerHTML = passed_rings + "/" + (passed_rings + missed);
    document.getElementById("speed").innerHTML = "" + Math.round(frontSpeed);
    
	
    //Add obstacles and rings
    if(rings[0].position.z > camera.position.z) {
        //Remove first obstacle and add new ones
        scene.remove(rings[0]);
		frontSpeed = frontSpeed + 10;

        for(var i = 0;i < rings.length-1;i++) {
            rings[i] = rings[i+1];
        }
		

        var rR = Math.random() * max_possible;
        var rA = Math.random() * 2*Math.PI;
        var alt = rings[rings_count - 2];

		//Random ring position
        var rX = Math.cos(rR)*rR + rings[rings_count-2].position.x;
        var rY = Math.sin(rR)*rR + rings[rings_count-2].position.y;
        var nZ = rings[rings_count-2].position.z - ring_distance;
        
		//Random radius of rings
        var ring_radius_random = 0.6*ring_radius + 0.5*Math.random()*ring_radius;
        var object = geometry.createRing(rX, rY, nZ, ring_radius_random);

        //Add object to scene
        rings[rings_count-1] = object;
        scene.add(object);
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
