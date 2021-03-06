export default class GameCtrl {
	constructor(geometry, max_missed, maxSideSpeed, minFrontSpeed, maxFrontSpeed) {
		this.score = 0;
		this.passed_rings = 0;
		this.missed = 0;
		this.max_missed = max_missed;
		this.gameTime = 0;
		this.lastLog = 0;
		this.lastNPCShot = 0;
		
		this.maxSideSpeed = maxSideSpeed;
		this.minFrontSpeed = minFrontSpeed;
		this.maxFrontSpeed = maxFrontSpeed;
		this.max_possible = this.maxSideSpeed * (geometry.ring_distance / this.maxFrontSpeed)*1.1;
		
		this.sideSpeed = new THREE.Vector2(0, 0);
		this.frontSpeed = 0;
		this.frontAcc = 150;
		this.sideAcc = 0.5;
		this.friction = 0.9;
		
		//No sound if vars are null
		this.portal_sound = '../audio/portal.wav';
		this.obstacle_sound = '../audio/obstacle.mp3';
		this.bullet_sound = '../audio/shot.wav';
	}

	ring_passed(rings, camera, geometry, delta) {
		
		//Reset log after 2 seconds 
		if( (this. gameTime - this.lastLog) > 2000){
            document.getElementById("log").innerHTML = "";
		}
		
		
    	//Game logic, win, lose, ring missed
    	if(rings[0].position.z >= camera.position.z) {
        	var distanceToMiddle = Math.sqrt(Math.pow(camera.position.x - rings[0].position.x, 2) + Math.pow(camera.position.y- rings[0].position.y, 2));
        	if(Math.abs(distanceToMiddle - geometry.ring_radius) <= (1/7)*geometry.ring_radius){
            	document.getElementById("log").innerHTML = "collision";
            	document.getElementById("bgtext").innerHTML = "game over";
				this.lastLog = this.gameTime;
            	return true;

        	} else if(distanceToMiddle < rings[0].radius){
            	this.passed_rings++;
            	this.score += 10 * this.frontSpeed/100;
				if (this.portal_sound != null) {
					var sound = new Audio(this.portal_sound);
					sound.volume = 0.4;
					sound.play();
				}
            	document.getElementById("log").innerHTML = "pass: +" + Math.round((10 * (this.frontSpeed/100)));
				this.lastLog = this.gameTime;

        	} else {
            	this.missed++;
            	if(this.missed >= this.max_missed){
                	document.getElementById("rings").innerHTML = this.passed_rings + "/" + (this.passed_rings + this.missed);
                	document.getElementById("log").innerHTML = "missed too many rings";
            		document.getElementById("bgtext").innerHTML = "game over";
					this.lastLog = this.gameTime;
                	return true;
            }
            	document.getElementById("log").innerHTML = "ring missed";
				this.lastLog = this.gameTime;
        	}

    	}
    	//this.score += this.frontSpeed * delta/1000;

    	document.getElementById("rings").innerHTML = this.passed_rings + "/" + (this.passed_rings + this.missed);
    	document.getElementById("speed").innerHTML = "" + Math.round(this.frontSpeed);
    	document.getElementById("left").innerHTML = "" + Math.round(this.score);
		return false;
	}
	



	controls(keyboard, delta) {
    	//Keyboard controls
    	if(keyboard.space && this.frontSpeed < this.maxFrontSpeed) {
        	this.frontSpeed += delta * (this.frontAcc/1000);

        	if(this.frontSpeed > this.maxFrontSpeed) {
            	this.frontSpeed = this.maxFrontSpeed;
        	}
    	}
    	if(keyboard.shift && this.frontSpeed > this.minFrontSpeed) {
        	this.frontSpeed -= delta * (this.frontAcc/1000);

        	if(this.frontSpeed < this.minFrontSpeed) {
            	this.frontSpeed = this.minFrontSpeed;
        	}
    	}
    	if(keyboard.up && this.sideSpeed.length() < this.maxSideSpeed) {
        	this.sideSpeed.y += delta * (this.sideAcc/1000);
    	}
    	if(keyboard.down && this.sideSpeed.length() < this.maxSideSpeed ) {
        	this.sideSpeed.y -= delta * (this.sideAcc/1000);
    	}
    	if(keyboard.left && this.sideSpeed.length() < this.maxSideSpeed) {
        	this.sideSpeed.x -= delta * (this.sideAcc/1000);
    	}
   		if(keyboard.right && this.sideSpeed.length() < this.maxSideSpeed) {
        	this.sideSpeed.x += delta * (this.sideAcc/1000);
    	}
    

    	//Allow for friction in sidespeed
    	this.sideSpeed.multiplyScalar(this.friction);
		
	}

	addBullet(scene, ws, camera, keyboard, level, type) {
		var x = ((2*keyboard.x)/window.innerWidth) -1;
		var y = (((2*keyboard.y)/window.innerHeight) -1)*(-1);
		
		var dir = new THREE.Vector3(x, y);
		var raycaster = new THREE.Raycaster();
		raycaster.setFromCamera( dir, camera );

		//Accelerate bullet with ray vector
		var bulletSpeed = raycaster.ray.direction.multiplyScalar(3000);
		bulletSpeed.x += this.sideSpeed.x;
		bulletSpeed.y += this.sideSpeed.y;
		bulletSpeed.z -= this.frontSpeed;

		var bulletObject;
		if (type == 'standard') {
			var bulletObject = level.geometry.createBullet(camera.position);
		} else if (type == 'special'){
			var bulletObject = level.geometry.createSpecialBullet(level.rings[0].position);
		} else if (type == 'npc'){
			var dir = new THREE.Vector3();
			
			var xv = level.geometry.rings_rnd() * 25;				
			var yv = level.geometry.rings_rnd() * 25;				
			var zv = level.geometry.rings_rnd() * 25;				
			var posv = {}
			posv.x = ((level.geometry.rings_rnd() < 0.5) ? camera.position.x + xv: camera.position.x - xv);
			posv.y = ((level.geometry.rings_rnd() < 0.5) ? camera.position.y + yv: camera.position.y - yv);
			posv.z = ((level.geometry.rings_rnd() < 0.5) ? camera.position.z + zv: camera.position.z - zv);

			//to, from
			dir = dir.subVectors( posv, level.npcs.first.object.position).normalize();

			//origin, direction
			var raycaster = new THREE.Raycaster(level.rings[0].position, dir );
			var bulletSpeed = raycaster.ray.direction.multiplyScalar(3000);
			var bulletObject = level.geometry.createSpecialBullet(level.npcs.first.object.position);
		}
		scene.add(bulletObject);

		var bullet = new Bullet(bulletObject, bulletSpeed);
		if (this.bullet_sound != null) {
			var sound = new Audio(this.bullet_sound);
			sound.volume = 0.2;
			sound.play();
		}
		level.bullets.append(bullet);
		
		var msg = JSON.stringify({type: "bullet", 
			x:bulletSpeed.x, y:bulletSpeed.y, z:bulletSpeed.z, 
			bulletType:bulletObject.type, 
			posX:bulletObject.position.x, posY:bulletObject.position.y, posZ:bulletObject.position.z});
		ws.send(msg);

	}	

	shooting(scene, ws, camera, keyboard, level, delta) {
			//Shooting
			if(level.npcs.first != null) {
				if( ((this.gameTime - this.lastNPCShot) > 500) && ((camera.position.z - level.npcs.first.object.position.z) < level.geometry.ring_distance*3)){
					this.lastNPCShot = this.gameTime;
					this.addBullet(scene, ws, camera, keyboard, level, 'npc');
				}
			}
			if(keyboard.context){
				keyboard.context = false;
				this.addBullet(scene, ws, camera, keyboard, level, 'special');
			}
			if(keyboard.mouse){
				keyboard.mouse = false;
				this.addBullet(scene, ws, camera, keyboard, level, 'standard');
			}
			
			if(level.bullets.length != 0) {
				//Bulltes out of range?
				if(level.bullets.first.object.position.z - camera.position.z <= -level.gameLength * level.geometry.ring_distance) {
					scene.remove(level.bullets.first.object);
					level.bullets.removeFirst();
				}

				var currentBullet = level.bullets.first;
				while(currentBullet != null){
					currentBullet.object.position.x += currentBullet.speed.x*delta/1000;
					currentBullet.object.position.y += currentBullet.speed.y*delta/1000;
					currentBullet.object.position.z += currentBullet.speed.z*delta/1000;
					currentBullet = currentBullet.next;
				}
			}

			if(level.npcs.length != 0) {
				//Obstacle out of range
				if(level.npcs.first.object.position.z - camera.position.z >= 0) {
					scene.remove(level.npcs.first.object);
					level.npcs.removeFirst();
				}
			}
			
			if(level.obstacles.length != 0) {
				//Obstacle out of range
				if(level.obstacles.first.object.position.z - camera.position.z >= 0) {
					scene.remove(level.obstacles.first.object);
					level.obstacles.removeFirst();
				}

				var currentObstacle = level.obstacles.first;
				while(currentObstacle != null){
					currentObstacle.angle = currentObstacle.angle + (delta * currentObstacle.speed)/1000;

					currentObstacle.object.rotation.x += 0.02;
					currentObstacle.object.rotation.y += 0.02;

					currentObstacle.object.position.x = currentObstacle.r_center.x + Math.cos(currentObstacle.angle)*currentObstacle.radius;
					currentObstacle.object.position.y = currentObstacle.r_center.y + Math.sin(currentObstacle.angle)*currentObstacle.radius;

					currentObstacle = currentObstacle.next;
				}
			}
			
			//Check if we are hit	
			var bullet = level.bullets.first;
			while(bullet != null){

				var pos = camera.position.clone();
				var d = pos.sub(bullet.object.position).length();

				//Check wheter shot hit
				if(d < level.geometry.player_radius + bullet.object.radius + 5){

					document.getElementById("log").innerHTML = "DEAD - halt";
					this.lastLog = this.gameTime;
					this.frontSpeed = 0;	
					this.sideSpeed = new THREE.Vector2(0, 0);
					scene.remove(bullet.object);
					level.bullets.remove(bullet);
				}


				bullet = bullet.next;
			}
			//Check if we hit npc
			var bullet = level.bullets.first;
			while(bullet != null){
				var npc = level.npcs.first;
				while(npc != null) {
					var pos = npc.object.position.clone();
					var d = pos.sub(bullet.object.position).length();

					//Check wheter shot hit
					if((d < level.geometry.npc_radius + bullet.object.radius + 5) && (bullet.origin != "opponent")){

						this.score += 100;
						document.getElementById("log").innerHTML = "headshot: " + 100;
						this.lastLog = this.gameTime;
					
						scene.remove(npc.object);
						scene.remove(bullet.object);
						level.bullets.remove(bullet);
						level.npcs.remove(npc);
					}
					npc = npc.next;
				}

				bullet = bullet.next;
			}

			//Check if we hit opponent
			var bullet = level.bullets.first;
			while(bullet != null){

				var pos = level.opponent.position.clone();
				var d = pos.sub(bullet.object.position).length();

				//Check wheter shot hit
				if(d < level.geometry.player_radius + bullet.object.radius + 5){

					this.score += 100;
					document.getElementById("log").innerHTML = "headshot: " + 100;
					this.lastLog = this.gameTime;
					
					scene.remove(bullet.object);
					level.bullets.remove(bullet);
				}


				bullet = bullet.next;
			}


			//Check if we hit an obstacle
			if(level.obstacles.length != 0 && level.bullets.length != 0){
				var obstacle = level.obstacles.first;
				while(obstacle != null){
					var bullet = level.bullets.first;
					while(bullet != null){

						var pos = obstacle.object.position.clone();
						var d = pos.sub(bullet.object.position).length();

						//Check wheter shot hit
						if((d < level.geometry.obstacle_radius + bullet.object.radius + 5) && (bullet.origin != "opponent")){

							this.score += 50;
							if (this.obstacle_sound != null) {
								var sound = new Audio(this.obstacle_sound);
								sound.volume = 0.05;
								sound.play();
							}
							document.getElementById("log").innerHTML = "hit: +" + 50;
							this.lastLog = this.gameTime;
							
							var msg = JSON.stringify({type: "hit", id: obstacle.id});
							ws.send(msg);

							scene.remove(bullet.object);
							scene.remove(obstacle.object);
							level.bullets.remove(bullet);
							level.obstacles.remove(obstacle);
						}


						bullet = bullet.next;
					}
					obstacle = obstacle.next;
				}
			}

	}
}
