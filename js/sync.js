export function syncEnvironment(event, scene, geometry, opponent, obstacles, bullets){
	const data = JSON.parse(event.data);
	if (data.type === "pos") {
		opponent.position.x = data.x;
		opponent.position.y = data.y;
		opponent.position.z = data.z;
		
		opponent.speed.x = data.sideSpeed.x;
		opponent.speed.y = data.sideSpeed.y;
		opponent.speed.z = data.frontSpeed;
	} else if (data.type === "hit") {
		let cur = obstacles.first;				
		while(cur !== null && cur.id !== data.id) {
			cur = cur.next;
		}
		if (!cur) {
			console.log("Got message about hit of object " + data.id + ", but I don't have that obstacle.");
			return;
		}
		scene.remove(cur.object);
		obstacles.remove(cur);
	} else if (data.type === "bullet") {
		if (data.bulletType == 'standard'){
			var bulletObject = geometry.createBullet(opponent.position);
        	scene.add(bulletObject);
        	var bullet = new Bullet(bulletObject, data);
			bullet.origin = "opponent";
        	bullets.append(bullet);
		} else if (data.bulletType == 'special') {
			var posX = data.posX;
			var posY = data.posY;
			var posZ = data.posZ;

			var bulletObject = geometry.createSpecialBullet({x:posX, y:posY, z:posZ});
        	scene.add(bulletObject);
        	var bullet = new Bullet(bulletObject, data);
			bullet.origin = "opponent";
        	bullets.append(bullet);
			
		}
	}
};
