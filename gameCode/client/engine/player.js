//PLAYER
function Player(id, x, y, vx, vy, img, weapon, isBig) {
	
	var maxHealth = 100;
	var meleeDamage = 5;
	
	var smallMass = 80;
	var smallWidth = 50;
	var smallHeight = 50;
	var smallAcceleration = 100*mpsTOppf/framesPerSecond;
	var smallMaxVX = 5*mpsTOppf;
	var smallMaxVY = 15*mpsTOppf;
	var smallJumpSpeed = 5*mpsTOppf;
	var smallSlowDown = 3;
	
	var bigMass = 400;
	var bigWidth = 100;
	var bigHeight = 100;
	var bigAcceleration = 2*mpsTOppf/framesPerSecond;
	var bigMaxVX = 12*mpsTOppf;
	var bigMaxVY = 20*mpsTOppf;
	var bigJumpSpeed = 3*mpsTOppf;
	var bigSlowDown = 4;
	

	
	//type, id, x, y, vx, vy, width, height, img, color, acceleration, maxVX, maxVY, health, weapon, mass, jumpSpeed, meleeDamage
	var self = Humanoid('player', id, x, y, vx, vy, smallWidth, smallHeight, img, 'red', smallAcceleration, smallMaxVX, smallMaxVY,
						maxHealth, weapon, smallMass, smallJumpSpeed, meleeDamage, smallSlowDown);
						
	//console.log(self.width);
	
	self.maxHealth = maxHealth;
	self.transformCounter = 100;
	self.leftCounter = 0;
	self.rightCounter = 0;
	self.smallSpeed = 5;
	self.isBig = isBig;	
	self.doubleJumped = false;
	
	self.acceleration = self.isBig ? bigAcceleration:smallAcceleration;
	self.jumpSpeed = self.isBig ? bigJumpSpeed:smallJumpSpeed;
	self.maxVelocityX = self.isBig ? bigMaxVX:smallMaxVX;
	self.maxVelocityY = self.isBig ? bigMaxVY:smallMaxVY;
	self.slowDownFactor = self.isBig ? bigSlowDown:smallSlowDown;
	
	self.meleeRadius = 15;

	self.maxMomentum = bigMass*bigMaxVX;
	
	var oldUpdate = self.updatePosition;
	self.updatePosition = function() {
		
		//console.log(self.vx);
		
		if (Math.sign(self.vx) != Math.sign(self.ax) && !self.isLaunched) {
			//console.log("Slowing");
			self.ax = self.slowDownFactor*self.ax;
		}	
		
		oldUpdate();
		
	}
	
	self.updateAim = function(mouseX, mouseY) {
		mouseX -= gui.fg.width/2;
		mouseY -= self.y;
	
		self.aimAngle = Math.atan2(mouseY,mouseX) / Math.PI * -180;
	}
	
	self.setAirMotion = function() {
		self.ay = g;
		if (self.isBig) {
			self.ax /= 2;
		}
		else {
			self.ax /= 4;
		}
	}
	
	self.setGroundMotion = function() {
		self.ay = 0;
		self.vy = 0;
		self.acceleration = self.isBig ? bigAcceleration:smallAcceleration;
		self.maxVelocityX = self.isBig ? bigMaxVX:smallMaxVX;
	}
	
	self.sprint = function() {
		
	}
	
	self.transform = function() {
		if (self.transformCounter > 100) {
		
			self.transformCounter = 0;
			
			px = self.vx*self.mass;
			py = self.vy*self.mass;
			
			var oldHeight = self.height;
			
			if (self.isBig) {
				self.isBig = false;
				self.mass = smallMass;
				self.width = smallWidth;
				self.height = smallHeight;
				self.acceleration = smallAcceleration;
				self.maxVelocityX = smallMaxVX;
				self.maxVelocityY = smallMaxVY;
				self.jumpSpeed = smallJumpSpeed;
				self.slowDownFactor = smallSlowDown;
				
				self.xOffset = self.width/2;
				self.yOffset = self.height/2;
			}
			else {
				self.isBig = true;
				self.mass = bigMass;
				self.width = bigWidth;
				self.height = bigHeight;
				self.acceleration = bigAcceleration;
				self.maxVelocityX = bigMaxVX;
				self.maxVelocityY = bigMaxVY;
				self.jumpSpeed = bigJumpSpeed;
				self.slowDownFactor = bigSlowDown;
				
				self.xOffset = self.width/3;
				self.yOffset = self.height/3;
			}
			
			self.y -= (self.height - oldHeight)/2;
			self.vx = (px / self.mass) * mpsTOppf;
			self.vy = (py / self.mass) * mpsTOppf;
		}	
	}
	
	self.takeDamage = function(amount) {
		if (!self.isBig) {
			self.health -= amount;
			self.isImmune = true;
			self.immuneCounter = 0;
		}
		else {
			self.health -= amount/2;
			self.isImmune = true;
			self.immuneCounter = 0;
		}
	}
	//self.draw = function() {
		
	//}

	
	return self;
}
