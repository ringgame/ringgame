export default class Level0 {
	constructor(gamectrl, geometry, rings_rnd) {
		this.gamectrl = gamectrl;
		this.geometry = geometry;
		this.rings_rnd = rings_rnd;
	}
		
	init(scene, rings) {
			//Add first Rings
			var obstacles = new LinkedList();
			for(var i=0; i<this.geometry.rings_count; i++){
				var object = this.geometry.createRing(0, 0, -(this.geometry.ring_distance*i), this.geometry.ring_radius);

				//Add object to scene
				rings[i] = object;
				scene.add(object);
				
				var obstacle = this.geometry.createObstacle(object);
				obstacles.append(obstacle[1]);
				scene.add(obstacle[0]);
			}
			return [rings, obstacles];
	}
	envUpdate(scene, camera, rings, obstacles) {

			//Add obstacles and rings
			if(rings[0].position.z > camera.position.z) {
				//Remove first obstacle and add new ones
				scene.remove(rings[0]);

				for(var i = 0;i < rings.length-1;i++) {
					rings[i] = rings[i+1];
				}

				if((this.gamectrl.passed_rings + this.gamectrl.missed) % 2 == 0){
					var obstacle = this.geometry.createObstacle(rings[this.geometry.rings_count-1]);
					obstacles.append(obstacle[1]);
					scene.add(obstacle[0]);
				}
				if((this.gamectrl.passed_rings + this.gamectrl.missed) % 3 == 0){
					var obstacle = this.geometry.createObstacle(rings[this.geometry.rings_count-1]);
					obstacles.append(obstacle[1]);
					scene.add(obstacle[0]);
					var obstacle = this.geometry.createObstacle(rings[this.geometry.rings_count-1]);
					obstacles.append(obstacle[1]);
					scene.add(obstacle[0]);
				}
				if((this.gamectrl.passed_rings + this.gamectrl.missed) % 5 == 0){
					var obstacle = this.geometry.createObstacle(rings[this.geometry.rings_count-1]);
					obstacles.append(obstacle[1]);
					scene.add(obstacle[0]);
					var obstacle = this.geometry.createObstacle(rings[this.geometry.rings_count-1]);
					obstacles.append(obstacle[1]);
					scene.add(obstacle[0]);
					var obstacle = this.geometry.createObstacle(rings[this.geometry.rings_count-1]);
					obstacles.append(obstacle[1]);
					scene.add(obstacle[0]);
				}
				
				var rR = this.rings_rnd() * this.gamectrl.max_possible;
				var rA = this.rings_rnd() * 2*Math.PI;

				//Random ring position
				var rX = Math.cos(rR)*rR + rings[this.geometry.rings_count-2].position.x;
				var rY = Math.sin(rR)*rR + rings[this.geometry.rings_count-2].position.y;
				var nZ = rings[this.geometry.rings_count-2].position.z - this.geometry.ring_distance;
				
				//Random radius of rings
				var ring_radius_random = 0.75*this.geometry.ring_radius + 0.5*this.rings_rnd()*this.geometry.ring_radius;
				var object = this.geometry.createRing(rX, rY, nZ, ring_radius_random);

				//Add object to scene
				rings[this.geometry.rings_count-1] = object;
				scene.add(object);
				}	
	}
}
