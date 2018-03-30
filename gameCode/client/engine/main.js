
var frameCount;

var level;
var player;
var enemies;
var bullets = {};
var blocks;
var sufaceMods;

var hasReleasedJump = false;

var charCodes = {65:"left", 87:"jump", 68:"right", 83:"crouch", 32:"transform", 27:"pause", };

var pressing = { "left": 0, "right":0, "jump":0, "crouch":0, "transform":0, "shoot":0, };


document.onkeydown = function(event) {
	pressing[charCodes[event.keyCode]] = 1;
}

document.onkeyup = function(event) {
	if (charCodes[event.keyCode] == "jump") {
		hasReleasedJump = true;
	}
	pressing[charCodes[event.keyCode]] = 0;
}

document.onmousedown = function(mouse) {
	var mouseX = mouse.clientX - gui.fg.getBoundingClientRect().left;
	var mouseY = mouse.clientY - gui.fg.getBoundingClientRect().top;
	
	player.updateAim(mouseX, mouseY);
	
	pressing["shoot"] = 1;
}

document.onmouseup = function(mouse) {
	pressing["shoot"] = 0;
}

document.oncontextmenu = function(mouse) {	
	mouse.preventDefault();	
}

/*
* Reset the player's aiming angle when they move the mouse
*/
document.onmousemove = function(mouse){
	var mouseX = mouse.clientX - gui.fg.getBoundingClientRect().left;
	var mouseY = mouse.clientY - gui.fg.getBoundingClientRect().top;
	
	player.updateAim(mouseX, mouseY);
}

/*
* Do everything that is pressed, controlled by the 'pressing' dict
*/
var doPressedActions = function() {
	
	if (pressing['left']) {
		player.ax = -player.acceleration;
	}
	else if (pressing['right']) {
		player.ax = player.acceleration;
	}
	else {
		if (Math.abs(player.vx) < 2 && !player.isLaunched) {
			//console.log("Stopping");
			player.vx = 0;
		}
		player.ax = -Math.sign(player.vx)*player.acceleration*0.5;
	}
	
	if (pressing['jump']) {
		if (!player.inAir) {
			console.log("Jumping");
			player.jump();
			hasReleasedJump = false;
		}
		else if (player.jumpBuffer > 10 && !player.doubleJumped && hasReleasedJump) {
			player.jump();
			player.doubleJumped = true;
		}
	}
	
	if (pressing['crouch']) {
		player.crouch();
	}
	
	if (pressing['transform']) {
		player.transform();
	}
	
	if (pressing['shoot']) {
		
		newBullets = player.shoot();
		for (i in newBullets) {
			newBullet = newBullets[i];
			if (newBullet) {				
				bullets[newBullet.id] = newBullet;
			}
		}
	}
}

/*
* Return true if the player is standing on terrain, false otherwise

var nearTerrain = function(x, y) {
	if (Math.abs(y - 450) <= 10) {
		return true;
	}
	return false;
}

var putOnTerrain = function(thing) {
	thing.y = 450-thing.height/2;
}
*/

/*
* Return true if the given entity is within the renderable radius
*/
var inRange = function(thing) {
	len = Math.sqrt( Math.pow(thing.x - player.x, 2) + Math.pow(thing.y - player.y, 2) ) //sqrt(delta_x^2 + delta_y^2)
	return len < gameWidth;
}

/*
* Main game loop
*/
var update = function() {
	
	gui.fg_ctx.clearRect(0, 0, gui.fg.width, gui.fg.height);
	

	
	//Update counters
	frameCount++;
	if (frameCount % 10 == 0) {
		everyTenCount++;
	}
	
	//Draw HUD
	//draws background
	gui.drawMap();
	gui.fgDraw(gui.fg_ctx,player.health/player.maxHealth*100,100,20);
	
	
	//Manage player -----------------------------------------------------------------------------------
	
	player.attackCounter++;
	player.transformCounter++;
	player.immuneCounter++;
	
	player.falling = true; //set to false if standing on terrain;
	
	if (player.isLaunched) {
		//console.log("Launched");
		player.launchTimer++;
		if (player.launchTimer > 50) {
			player.isLaunched = false;
		}
	}

	//Manage player damage immunity
	if (player.isImmune && player.immuneCounter > 100) {
		player.isImmune = false;
	}
	
	//Do things according to player input (shoot, jump, etc.)
	doPressedActions();

	
	//Manage whether or not player is in the air
	
	//Don't put player on the ground if they just jumped (even though they are near terrain)
	if (player.justJumped) {
		player.inAir = true;
		player.jumpBuffer++;
		if (player.jumpBuffer > 20) {
			player.justJumped = false;
		}
	}
	
	//If they didn't just jump, and they are near terrain, put them on that terrain
	/*
	else if (nearTerrain(player.x, player.y+player.height/2)) {
		player.inAir = false;
		player.doubleJumped = false;
		putOnTerrain(player);
	}
	*/
	
	//Manage motion type
	if (player.inAir) {
		player.setAirMotion();
	}
	else {
		player.setGroundMotion();
	}
	
	player.update();

	
	
	//Manage all the bullets -----------------------------------------------------------------------------------------------------
	
	for (var key in bullets) {
	
		var bullet = bullets[key];
		
		//If the bullet is very far away from the player, just delete it
		if (!inRange(bullet)) {
			delete bullets[key];
		}
		
		//Update the bullet's position, and re-draw it
		bullet.update();
		
		//Check if the bullet has hit a humanoid. If so, remove it, and damage the humanoid
		toRemove = false;
		
		for (var key2 in enemies) {
			
			var isColliding = bullet.testCollision(enemies[key2]);
			if (isColliding && bullet.ownerID != enemies[key2].id) {
				toRemove = true;
				
				//Enemy takes damage, maybe apply effect (like knockback)
				enemies[key2].takeDamage(bullet.damage);
				break;
			}	
		}
		
		if (bullet.ownerID != player.id) {
			var isColliding = bullet.testCollision(player);
			if (isColliding) {
				toRemove = true;
				player.takeDamage(bullet.damage);
			}
		}
		
		if (bullet.type == 'meleeBullet') {
			
			//console.log("Position: " + bullet.x + ", " + bullet.y);
			
			bullet.timer++;
			//console.log(bullet.timer);
			if (bullet.timer > 50) {
				toRemove = true;
			}
		}
		
		if(toRemove){
			delete bullets[key];
		}
	}
	
	//Manage all the enemies ----------------------------------------------------------------------------------------
	
	for (var key in enemies) {
		
		var enemy = enemies[key];
		
		//console.log(enemy.type + ": " + enemy.health);
	
		if (!inRange(enemy)) {
			//console.log("skipping " + enemy.id);
			continue;
		}
		
		enemy.update();
		enemy.updateAim(player);
		
		if (enemy.health <= 0) {
			delete enemies[key];
		}
		
		if (nearTerrain(enemy.x, enemy.y)) {
			//console.log(enemy.id)
			putOnTerrain(enemy);
		}
		
		enemy.attackCounter++;
		
		if (enemy.isLaunched) {
			enemy.launchTimer++;
			if (enemy.launchTimer > 50) {
				enemy.isLaunched = false;
			}	
		}
		
		
		newBullets = enemy.shoot();
		//console.log(newBullets);
		for (i in newBullets) {
			newBullet = newBullets[i];
			//console.log(newBullet);
			if (newBullet) {
				bullets[newBullet.id] = newBullet;
			}
		}
		
				
		var isColliding = enemy.testCollision(player);
		
		if (isColliding) {
			
			var enemyDeals = enemy.meleeDamage;
			var playerDeals = 0;
			
			if (!player.isImmune) {
				
				if (player.isBig || enemy.type=="tank enemy") {
					
					player_p = Math.abs(player.getMomentum());
					enemy_p = Math.abs(enemy.getMomentum());
					
					delta_p = Math.abs(player_p - enemy_p);
					
					if (player_p > enemy_p) {
						enemy.launch(Math.sign(player.vx)*delta_p/enemy.mass);
						playerDeals += delta_p/150;
						console.log(playerDeals);
						//player.vx = 0;
						
						//console.log(Math.sign(player.vx)*delta_p/enemy.mass)
					}
					else if (enemy_p > player_p) {
						player.launch(Math.sign(enemy.vx)*delta_p/player.mass);
						
						enemyDeals += delta_p/150;
						//console.log(player.vx);
						//enemy.vx = 0;
					}
					else {
						//player.vx
					}
					
				}
				
				player.takeDamage(enemyDeals);
				
			}
			enemy.takeDamage(playerDeals);
		}
		
	}
	
	
	//Manage terrain ---------------------------------------------------------------------------
	for (var key in terrain) {
		
		block = terrain[key];
		
		gui.drawTerrain(block,gui.fg_ctx)
		
		if (!inRange(block)) {
			continue;
		}
		
		if (getTerrainCollision(block, player)) {
			player.falling = false;
			if (!player.justJumped) {
				putOnTerrain(block, player);
			}
		}
		
		if (player.falling) {
			player.inAir = true;
			player.setAirMotion();
		}
		
		
	}
	
	
}

var getTerrainCollision = function(terrain, entity) {
	
	entity_rect = {'x':entity.x-entity.width/2, 'y':entity.y-entity.height/2, 'width':entity.width, 'height':entity.height};
	
	//console.log(testCollision(terrain, entity_rect));
	return testCollision(terrain, entity_rect);
	
}

var putOnTerrain = function(terrain, entity) {
	
	entity.inAir = false;
	entity.doubleJumped = false;
	
	entity.y = terrain.y - entity.height/2;
	entity.vy = 0;
	
	
}

var testCollision = function(rect1, rect2) {
	return rect1.x <= rect2.x+rect2.width 
		&& rect2.x <= rect1.x+rect1.width
		&& rect1.y <= rect2.y + rect2.height
		&& rect2.y <= rect1.y + rect1.height;
}

var startGame = function(initial_level) {
	level = initial_level;
	player = level["player"];
	enemies = level["enemies"];
	blocks = level["terrain"];
	//surfaceMods = level["terrain"];
	frameCount = 0;
	everyTenCount = 0;
	//console.log(enemies['enemy2']);
	
	console.log(terrain);

	
	setInterval(update, 1000/60)
}

var endGame = function() {
	
}
