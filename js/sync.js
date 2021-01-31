export function syncEnvironment(event, scene, geometry, opponent, bullets){
	const data = JSON.parse(event.data);
	if (data.type === "pos") {
		opponent.position.x = data.x;
		opponent.position.y = data.y;
		opponent.position.z = data.z;
	} else if (data.type === "hit") {
		let cur = obstacles.first;				
		console.log(cur.id);
		console.log(data.id);
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
		var bulletObject = geometry.createBullet(opponent.position);
        scene.add(bulletObject);
        var bullet = new Bullet(bulletObject, data);
        bullets.append(bullet);
	}
};
