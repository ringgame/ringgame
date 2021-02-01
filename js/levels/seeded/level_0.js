export default class Level0 {
	constructor(gamectrl, geometry, rings_rnd) {
		this.gamectrl = gamectrl;
		this.geometry = geometry;
		this.rings_rnd = rings_rnd;

		this.gameLength = 10; 
		this.rings = new Array(this.gameLength+3);
		this.bullets = new LinkedList();
		this.obstacles = new LinkedList();
		this.opponent;
		this.nextRing = 0;;
	}
		
	init(scene) {
			for(var i=0; i<3; i++){
				//Add object to scene
				var object = this.geometry.createRing(0, 0, -(this.geometry.ring_distance*i), this.geometry.ring_radius);
				this.rings[i] = object;
				scene.add(object);
				
				var obstacle = this.geometry.createObstacle(object);
				this.obstacles.append(obstacle[1]);
				scene.add(obstacle[0]);
			}	
			for(var i=3; i<this.gameLength; i++){
				var rR = this.rings_rnd() * this.gamectrl.max_possible;
				var rA = this.rings_rnd() * 2*Math.PI;

				//Random ring position
				var rX = Math.cos(rR)*rR + this.rings[i-1].position.x;
				var rY = Math.sin(rR)*rR + this.rings[i-1].position.y;
				var nZ = this.rings[i-1].position.z - this.geometry.ring_distance;
				
				//Random radius of rings
				var ring_radius_random = 0.75*this.geometry.ring_radius + 0.5*this.rings_rnd()*this.geometry.ring_radius;
				var object = this.geometry.createRing(rX, rY, nZ, ring_radius_random);

				//Add object to scene
				this.rings[i] = object;
				scene.add(object);

				if(i % 2 == 0){
					var obstacle = this.geometry.createObstacle(this.rings[i-1]);
					this.obstacles.append(obstacle[1]);
					scene.add(obstacle[0]);
				}
				if(i % 3 == 0){
					var obstacle = this.geometry.createObstacle(this.rings[i-1]);
					this.obstacles.append(obstacle[1]);
					scene.add(obstacle[0]);
					var obstacle = this.geometry.createObstacle(this.rings[i-1]);
					this.obstacles.append(obstacle[1]);
					scene.add(obstacle[0]);
				}
				if(i % 5 == 0){
					var obstacle = this.geometry.createObstacle(this.rings[i-1]);
					this.obstacles.append(obstacle[1]);
					scene.add(obstacle[0]);
					var obstacle = this.geometry.createObstacle(this.rings[i-1]);
					this.obstacles.append(obstacle[1]);
					scene.add(obstacle[0]);
					var obstacle = this.geometry.createObstacle(this.rings[i-1]);
					this.obstacles.append(obstacle[1]);
					scene.add(obstacle[0]);
				}
				
				
				
			}
	}
	envUpdate(scene, camera) {
			if(this.rings[0].position.z > camera.position.z) {
				//Remove first obstacle and add new ones
				scene.remove(this.rings);
				this.nextRing = this.nextRing + 1;
				for(var i = 0;i < this.rings.length-1;i++) {
					this.rings[i] = this.rings[i+1];
				}
			}
			//Check if level ended
			if(this.nextRing >= this.gameLength) {
            	document.getElementById("bgtext").innerHTML = "level passed";
            	document.getElementById("log").innerHTML = "level passed";
            	return true;
			}
	}
}
