export default class Geometry {
	constructor(ring_radius, bullet_radius, obstacle_radius, rings_count) {
		this.ring_radius = ring_radius;
		this.bullet_radius = bullet_radius;
		this.obstacle_radius = obstacle_radius;
		this.rings_count = rings_count;
	}

	createRing(x,y,z,r) {
	    //Create Object Geometry
	    var geometry = new THREE.TorusGeometry(r, (1/10)*this.ring_radius, 15, 15 );

	    //ObjectMaterial
	    var material = new THREE.MeshBasicMaterial({ color: 0xffffff});

	    //Create Objects
	    var object = new THREE.Mesh(geometry, material);
	    object.position.x = x;
	    object.position.y = y;
	    object.position.z = z;

	    return object;
	}

	createBullet(camera, rings) {
	    //Create Object Geometry
	    var geometry = new THREE.SphereGeometry( this.bullet_radius, 8, 8 );

	    //ObjectMaterial
	    var material = new THREE.MeshBasicMaterial({ color: 0x45A505});

	    //Create Objects
	    var object = new THREE.Mesh(geometry, material);
	    object.position.x = camera.position.x;
	    object.position.y = camera.position.y;
	    object.position.z = camera.position.z;

	    return object;
	}

	createObstacle(rings, ring_id) {
	    //Create Object Geometry
	    var geometry = new THREE.TetrahedronGeometry( this.obstacle_radius );

	    //ObjectMaterial
	    var randomColor ='#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0'); //Math.floor(Math.random()*16777215).toString(16);
	    var material = new THREE.MeshBasicMaterial({ color: randomColor});

	    //Create Objects
	    var object = new THREE.Mesh(geometry, material);

	    var radius = 5*this.ring_radius + 3*this.ring_radius*Math.random();
	    var angle = Math.random() * 2 *Math.PI;

	    object.position.x = rings[ring_id].position.x + Math.cos(angle) * radius;
	    object.position.y = rings[ring_id].position.y + Math.sin(angle) * radius;
	    object.position.z = rings[ring_id].position.z;

	    var gameOb = new Obstacle(object, rings[ring_id].position, Math.random()*2 - 1, radius, angle);

	    return [object, gameOb];
	}
}
