GUI = function(container){
	var self={};
	

	self.container=container;
	var Img = {};
	Img.background1= new Image();
	Img.background1.src="img/worldOneBackground.png";
	Img.background2= new Image();
	Img.background2.src="img/worldTwoBackground.png";
	Img.background3= new Image();
	Img.background3.src="img/worldThreeBackground.png";
	Img.playerSmall = new Image();
	Img.playerSmall.src = "img/movingCharacter.png";
	Img.playerBig = new Image();
	Img.playerBig.src = "img/bigGuy.png";
	Img.basicEnemy1=new Image();
	Img.basicEnemy1.src="img/enemy1.png";
	Img.basicEnemy2=new Image();
	Img.basicEnemy2.src="img/enemy2.png";
	Img.basicEnemy3=new Image();
	Img.basicEnemy3.src="img/enemy3.png";
	Img.pistol=new Image();
	Img.pistol.src="img/pistolWeapon.png";
	Img.assaultWeapon=new Image();
	Img.assaultWeapon.src="img/assaultWeapon.png";
	Img.swordWeapon=new Image();
	Img.swordWeapon.src="img/swordWeapon.png";
	Img.bullet=new Image();
	Img.bullet.src="img/bullet.png";
	var smallPlayerAnimation=0;

	var backgroundPositionCounter=0;
	self.create= function(type, id, left, top, width, height){
		var element= document.createElement(type);
		element.id=id;
		element.style.position='absolute';
		if(left!=0){element.style.left=left;}
		if(top!=0){element.style.top=top;}
		if(height!=0){
			if(type=='canvas'){
				element.height=height;
			}else{
				element.style.height=height;
			}
		}
		if(width!=0){
			if(type=='canvas'){
				element.width=width;
			}else{
				element.style.width=width;
			}
		}
		self.container.appendChild(element);
		return element;
	}

	self.createCanvas=function(width, height){
		self.bg=self.create('canvas','bg',0,0,width,height);
		self.fg=self.create('canvas','fg',0,0,width,height);
		self.bg_ctx = self.bg.getContext("2d");
		self.fg_ctx = self.fg.getContext("2d");
	}

	self.drawMap=function(){
		gui.bg_ctx.clearRect(0,0,self.bg.width,self.bg.height);
		//
		//!!!!!!!!!!!e.x will need to be changed once level object is used!!!!!!!!!!!
		//
		//n is number of canvas distance the player has travelled
		n=backgroundPositionCounter;
		x=self.bg.width-e.x;
		y=0;
		Img.background1.onload=function(){
		}

		//continuously loops backgrounds
		gui.bg_ctx.drawImage(Img.background1,x+self.bg.width*(n-1),y,self.bg.width,self.bg.height);
		gui.bg_ctx.drawImage(Img.background1,x+self.bg.width*n,y,self.bg.width,self.bg.height);
		gui.bg_ctx.drawImage(Img.background1,x+self.bg.width*(n-2),y,self.bg.width,self.bg.height);

		if(x<self.bg.width-self.bg.width*n){
			backgroundPositionCounter++;
		}
		else if(x>(-self.bg.width)*n){
			backgroundPositionCounter--;
		}
	}
	//draws Entities

	self.drawEntity=function(entity){
		gui.fg_ctx.save();
		//
		//!!!!!!!!!!!e.x will need to be changed once level object is used!!!!!!!!!!!
		//
		playX=e.x-self.fg.width/2;
			//Drawing humanoids
			if(entity.type=="player"){
				//console.log(Img.player);
				if(entity.isBig==true){
					gui.fg_ctx.drawImage(Img.playerBig,self.fg.width/2,entity.y-entity.height/2,entity.width,entity.height);
					Img.playerBig.onload=function(){}
				}
				else{
					var frameWidth=Img.playerSmall.width/5;
					var frameHeight=Img.playerSmall.height/2;
					playerDirection=self.getImageDirection(entity);
					//updates player animation every 5th frame
					smallPlayerAnimation=self.updateEntityAnimation(entity,smallPlayerAnimation,5);
					gui.fg_ctx.drawImage(Img.playerSmall,smallPlayerAnimation*frameWidth,playerDirection*frameHeight,frameWidth,frameHeight,self.fg.width/2-entity.width/2,entity.y-entity.height/2,entity.width,entity.height);

					Img.playerSmall.onload=function(){}
				}
			}
			else if(entity.type=="basic enemy"){
				gui.fg_ctx.drawImage(Img.basicEnemy1,(entity.x-entity.width/2)-playX,entity.y-entity.height/2,entity.width,entity.height);
				entity.img.onload=function(){

				}
			}
			else if(entity.type=="flying enemy"){
				gui.fg_ctx.drawImage(Img.basicEnemy2,(entity.x-entity.width/2)-playX,entity.y-entity.height/2,entity.width,entity.height);
				entity.img.onload=function(){

				}

			}
			else if(entity.type=="tank enemy"){
				gui.fg_ctx.drawImage(Img.basicEnemy3,(entity.x-entity.width/2)-playX,entity.y-entity.height/2,entity.width,entity.height);
				entity.img.onload=function(){

				}
			}
			else if(entity.type=="ghost"){
				gui.fg_ctx.drawImage(img,x-width/2,y-height/2);

			}
			//Drawing special terrain
			else if(entity.type=="moving plaform"){
				gui.fg_ctx.fillStyle=color;
				gui.fg_ctx.fillRect(x-width/2,y-height/2,width,height);
				gui.fg_ctx.restore();
			}
			else if(entity.type=="friction modifier"){
				gui.fg_ctx.fillStyle=color;
				gui.fg_ctx.fillRect(x-width/2,y-height/2,width,height);
				gui.fg_ctx.restore();
			}
			else if(entity.type=="spike trap"){
				gui.fg_ctx.drawImage(img,x-width/2,y-height/2);
			}
			//Drawing Useables
			else if(entity.type=="pistol"){
				gui.fg_ctx.rotate(e.aimAngle*Math.pi/180);
				gui.fg_ctx.drawImage(Img.pistol,(entity.x-entity.width/2)-playX+30,entity.y-entity.height/2,entity.width,entity.height);

				entity.img.onload=function(){
				}
			}
			else if(entity.type=="shotgun"){
				gui.fg_ctx.drawImage(img,x-width/2,y-height/2);

			}
			else if(entity.type=="sword"){
				gui.fg_ctx.drawImage(img,x-width/2,y-height/2);

			}
			else if(entity.type=="assault rifle"){
				gui.fg_ctx.drawImage(img,x-width/2,y-height/2);

			}
			//Draw projectiles
			else if(entity.type=="bullet"){
				gui.fg_ctx.drawImage(Img.bullet,(entity.x-entity.width/2)-playX,entity.y-entity.height,entity.width,entity.height);
				Img.bullet.onload=function(){}
			}
			else{

			}
			gui.fg_ctx.restore();
	};

	self.getImageDirection=function(entity){
		if(entity.aimAngle<=90 && entity.aimAngle>-90){
			return 0;
		}
		else{
			return 1;
		}
	}
	//Function to update the entitys Animations

	self.updateEntityAnimation=function(entity,animationCounter,numAnimations){
		if(entity.vx==0){
			return 0;
		}
		if(frameCount%5==0){
			animationCounter++;
				if(animationCounter==numAnimations){
					animationCounter=0;
				}
		}
		return animationCounter;
	}




	self.fgDraw=function(fg_ctx,playerHealth,playerMomentum,ammo){
		var healthX=0;
		var healthY=30;
		var momentX=0;
		var momentY=60;
		var ammoX=1050;
		var ammoY=30;
		var weaponX=1050;
		var weaponY=60;
		var weaponImgX=1125;
		var weaponImgY=50;
		fg_ctx.save();

		fg_ctx.clearRect(0,0,self.fg.width,self.fg.height);
		fg_ctx.font="18px Arial";
		//draw bar outlines
		fg_ctx.strokeRect(healthX,healthY,100,10);
		fg_ctx.strokeRect(momentX,momentY,100,10);
		//draw Healthbar
		fg_ctx.fillStyle="#FF0000";
		fg_ctx.fillRect(healthX,healthY,playerHealth,10);
		//draw Momentumbar
		fg_ctx.fillStyle="#0000FF";
		fg_ctx.fillRect(momentX,momentY,playerMomentum,10);
		//Colour Text
		fg_ctx.fillStyle="#FFFFFF";
		fg_ctx.fillText('Health:',healthX,healthY);
		fg_ctx.fillText('Momentum:',momentX,momentY);
		//draw ammo
		fg_ctx.fillText('Ammo: '+ammo,ammoX,ammoY);
		fg_ctx.fillText('Weapon: '/*+weaponImg*/,weaponX,weaponY);
		//draw current weapon image
 		gui.fg_ctx.drawImage(Img.pistol,weaponImgX,weaponImgY,Img.pistol.width,Img.pistol.height);
		Img.pistol.onload=function(){}

	};
	return self;
}
