export default class GeometryFactory {
	constructor(ring_radius, bullet_radius, obstacle_radius, rings_count, rings_rnd, ring_distance, opponent_geometry=null) {
		this.ring_radius = ring_radius;
		this.bullet_radius = bullet_radius;
		this.obstacle_radius = obstacle_radius;
		this.rings_count = rings_count;
		this.rings_rnd = rings_rnd;
		this.n_obstacles = 0;
		this.opponent = opponent_geometry;
		this.ring_distance = ring_distance;
	}



	createRing(x,y,z,r) {
	    //Create Object Geometry
	    var geometry = new THREE.TorusGeometry(r, (1/10)*this.ring_radius, 15, 15 );

	    //ObjectMaterial
	    //var material = new THREE.MeshBasicMaterial({ color: 0xffffff});

		var texture = new THREE.TextureLoader().load( '../img/ring.jpg' );

		// immediately use the texture for material creation
		const material = new THREE.MeshBasicMaterial( { map: texture } );

	    //Create Objects
	    var object = new THREE.Mesh(geometry, material);
	    object.position.x = x;
	    object.position.y = y;
	    object.position.z = z;

	    return object;
	}
	
	createOpponent(x,y,z,r) {
	    //Create Object Geometry
			
	    //var geometry = this.opponent; //
		var geometry = new THREE.TorusGeometry(r, 0.8*r, 3, 5 );

	    //ObjectMaterial
	    //var material = new THREE.MeshBasicMaterial({ color: 0xffffff});

		var texture = new THREE.TextureLoader().load( '../img/opponent.jpg' );

		// immediately use the texture for material creation
		const material = new THREE.MeshBasicMaterial( { map: texture } );

	    //Create Objects
	    var object = new THREE.Mesh(geometry, material);
	    object.position.x = x;
	    object.position.y = y;
	    object.position.z = z;

	    return object;
	}

	createBullet(camera) {
		
	    //Create Object Geometry
	    var geometry = new THREE.SphereGeometry( this.bullet_radius, 8, 8 );

	    //ObjectMaterial
	    var material = new THREE.MeshBasicMaterial({ color: 0x45A505});

	    //Create Objects
	    var object = new THREE.Mesh(geometry, material);
	    object.position.x = camera.x;
	    object.position.y = camera.y;
	    object.position.z = camera.z;

	    return object;
	}

	createObstacle(anchor, rot_radius=-1) {
	    //Create Object Geometry
	    var geometry = new THREE.TetrahedronGeometry( this.obstacle_radius );

	    //ObjectMaterial
	    var randomColor ='#'+(this.rings_rnd() * 0xFFFFFF << 0).toString(16).padStart(6, '0'); //Math.floor(Math.random()*16777215).toString(16);
	    var material = new THREE.MeshBasicMaterial({ color: randomColor});

	    //Create Objects
	    var object = new THREE.Mesh(geometry, material);

		if(rot_radius == -1){
	    	var radius = 5*this.ring_radius + 3*this.ring_radius*this.rings_rnd();
	    } else {
			var radius = rot_radius;
		}
		var angle = this.rings_rnd() * 2 *Math.PI;

	    object.position.x = anchor.position.x + Math.cos(angle) * radius;
	    object.position.y = anchor.position.y + Math.sin(angle) * radius;
	    object.position.z = anchor.position.z;

	    var gameOb = new Obstacle(object, anchor.position, this.rings_rnd()*2 - 1, radius, angle);
		gameOb.id = this.n_obstacles;
		this.n_obstacles++;
	    return [object, gameOb];
	}
}
