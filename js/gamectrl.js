export default class GameCtrl {
	constructor(ring_distance) {
		this.score = 0;
		this.passed_rings = 0;
		this.missed = 0;
		this.max_missed = 3;
		
		this.maxSideSpeed = 100;
		this.minFrontSpeed = 0;
		this.maxFrontSpeed = 600;
		this.max_possible = this.maxSideSpeed * (ring_distance / this.maxFrontSpeed)*1.1;
		
		this.sideSpeed = new THREE.Vector2(0, 0);
		this.frontSpeed = 0;
		this.frontAcc = 150;
		this.sideAcc = 0.5;
		this.friction = 0.9;
	}

	ring_passed(rings, camera, geometry, delta) {
    	//Game logic, win, lose, ring missed
    	if(rings[0].position.z >= camera.position.z) {
        	var distanceToMiddle = Math.sqrt(Math.pow(camera.position.x - rings[0].position.x, 2) + Math.pow(camera.position.y- rings[0].position.y, 2));
        	if(Math.abs(distanceToMiddle - geometry.ring_radius) <= (1/7)*geometry.ring_radius){
            	document.getElementById("log").innerHTML = "Death by collision";
            	alert("Game over!");
            	return true;

        	} else if(distanceToMiddle < geometry.ring_radius){
            	this.passed_rings++;
            	this.score += 1000 * this.frontSpeed/100;
            	document.getElementById("log").innerHTML = "+ " + Math.round((1000 * (this.frontSpeed/100)));

        	} else {
            	this.missed++;
            	if(this.missed >= this.max_missed){
                	document.getElementById("rings").innerHTML = this.passed_rings + "/" + (this.passed_rings + this.missed);
                	document.getElementById("log").innerHTML = "Maximum Ring-Miss Count";
                	alert("Game over!");
                	return true;
            }
            	document.getElementById("log").innerHTML = "Ring missed";
        	}

    	}
    	this.score += this.frontSpeed * delta/1000;

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
	
}
