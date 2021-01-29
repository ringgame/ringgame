"use strict";

var scene;
var camera;
var clock = new THREE.Clock();
var renderer;
var projector;
var bullet = null;

var score = 0;
var passed_rings = 0;
var missed = 0;


//Konstanten
var max_missed = 3;

var rings = new Array(4);
var keyboard = new KeyListener();
var ring_distance = 500;
var rings_count = 5;
var ring_radius = 20;

var frontSpeed = 300;
var minFrontSpeed = 0;
var maxFrontSpeed = 600;
var frontAcc = 150;

var maxSideSpeed = 100;
var sideSpeed = new THREE.Vector2(0, 0);
var sideAcc = 0.5;

var friction = 0.9;

var max_possible = maxSideSpeed * (ring_distance / maxFrontSpeed)*1.1;

var bullets = new LinkedList();
var obstacles = new LinkedList();

var bullet_radius = ring_radius/10;
var obstacle_radius = ring_radius;

window.onload = start();

function start(){
    init();
    window.requestAnimationFrame(mainLoop);
}

function init() {
    //Create scene
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2( 0x00000, 0.00075);

    //Create camera
    camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight, 1, 5000);
    camera.position.z = ring_distance;
    camera.position.y = 0;
    camera.position.x = 0;

    //First Rings
    for(var i=0; i<rings_count; i++){
        var object = createRing(0, 0, -(ring_distance*i), ring_radius);

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

function createRing(x,y,z,r) {
    //Create Object Geometry
    var geometry = new THREE.TorusGeometry(r, (1/10)*ring_radius, 15, 15 );

    //ObjectMaterial
    var material = new THREE.MeshBasicMaterial({ color: 0xffffff});

    //Create Objects
    var object = new THREE.Mesh(geometry, material);
    object.position.x = x;
    object.position.y = y;
    object.position.z = z;

    return object;
}

function createBullet() {
    //Create Object Geometry
    var geometry = new THREE.SphereGeometry( bullet_radius, 8, 8 );

    //ObjectMaterial
    var material = new THREE.MeshBasicMaterial({ color: 0x45A505});

    //Create Objects
    var object = new THREE.Mesh(geometry, material);
    object.position.x = camera.position.x;
    object.position.y = camera.position.y;
    object.position.z = camera.position.z;

    return object;
}

function createObstacle() {
    //Create Object Geometry
    var geometry = new THREE.TetrahedronGeometry( obstacle_radius );

    //ObjectMaterial
    var randomColor ='#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0'); //Math.floor(Math.random()*16777215).toString(16);
    var material = new THREE.MeshBasicMaterial({ color: randomColor});

    //Create Objects
    var object = new THREE.Mesh(geometry, material);

    var radius = 5*ring_radius + 3*ring_radius*Math.random();
    var angle = Math.random() * 2 *Math.PI;

    object.position.x = rings[rings_count-1].position.x + Math.cos(angle) * radius;
    object.position.y = rings[rings_count-1].position.y + Math.sin(angle) * radius;
    object.position.z = rings[rings_count-1].position.z;

    var gameOb = new Obstacle(object, rings[rings_count-1].position, Math.random()*2 - 1, radius, angle);
    obstacles.append(gameOb);
    console.log(object.material);

    return object;
}


function mainLoop() {
    var delta = clock.getDelta()*1000;


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


    if(rings[0].position.z > camera.position.z) {
        scene.remove(rings[0]);

        for(var i = 0;i < rings.length-1;i++) {
            rings[i] = rings[i+1];
        }

        if((passed_rings + missed) % 2 == 0){
            var obstacle = createObstacle();
            scene.add(obstacle);
        }
	if((passed_rings + missed) % 3 == 0){
            var obstacle = createObstacle();
            scene.add(obstacle);
            var obstacle = createObstacle();
            scene.add(obstacle);
        }
	if((passed_rings + missed) % 5 == 0){
            var obstacle = createObstacle();
            scene.add(obstacle);
            var obstacle = createObstacle();
            scene.add(obstacle);
            var obstacle = createObstacle();
            scene.add(obstacle);
        }


        var rR = Math.random() * max_possible;
        var rA = Math.random() * 2*Math.PI;

        var alt = rings[rings_count - 2];



        var rX = Math.cos(rR)*rR + rings[rings_count-2].position.x;
        var rY = Math.sin(rR)*rR + rings[rings_count-2].position.y;


        var nZ = rings[rings_count-2].position.z - ring_distance;

        var ring_radius_random = 0.75*ring_radius + 0.5*Math.random()*ring_radius;
        var object = createRing(rX, rY, nZ, ring_radius_random);

        //Add object to scene
        rings[rings_count-1] = object;
        scene.add(object);

    }



    if(keyboard.mouse){
        keyboard.mouse = false;

        var x = ((2*keyboard.x)/window.innerWidth) -1;
        var y = (((2*keyboard.y)/window.innerHeight) -1)*(-1);
	    
        var dir = new THREE.Vector3(x, y);
        var raycaster = new THREE.Raycaster();
	raycaster.setFromCamera( dir, camera );

        var bulletSpeed = raycaster.ray.direction.multiplyScalar(3000);
        bulletSpeed.x += sideSpeed.x;
        bulletSpeed.y += sideSpeed.y;
        bulletSpeed.z -= frontSpeed;

        var bulletObject = createBullet();
        scene.add(bulletObject);

        var bullet = new Bullet(bulletObject, bulletSpeed);
        bullets.append(bullet);
    }

    if(bullets.length != 0) {
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

                if(d < obstacle_radius + bullet_radius + 20){

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

    sideSpeed.multiplyScalar(friction);

    camera.position.x += delta * sideSpeed.x;
    camera.position.y += delta * sideSpeed.y;

    camera.position.z -= delta * frontSpeed/1000;



    renderer.render(scene, camera);
    window.requestAnimationFrame(mainLoop);
}
