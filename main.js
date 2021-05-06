window.onload = function() {
	var c = document.getElementById("canvas");
	var g = c.getContext("2d");
	var gebid = function(id) {
		return document.getElementById(id);
	};
	var images = {
		sky: gebid("sky"),
		player: gebid("player"),
		present: gebid("present"),
		fire: g.createPattern(gebid("fire"),"repeat")
	};

	c.width = 500;
	c.height = 500;
	var w = c.width;
	var h = c.height;
	var playing = 0;
	var focus = 1;
	var keys = {left:0,right:0,up:0,down:0};
	var v = 5;
	var y = 0;
	var score = 0;
	var global = 0;
	mine = 0;

	vault.sync("mine");

	var presents = [];
	var blocks = [];

	var presentInterval;
	var blockInterval;

	function drawRotatedImage(i,x,y,width,height,angle){
		g.translate(x,y);
		g.rotate(angle);
		g.drawImage(i,-width/2,-height/2,width,height);
		g.rotate(-angle);
		g.translate(-x,-y);
	};

	var drawRoundedRect = function(x,y,width,height,radius) {
		g.beginPath();
		g.moveTo(x+radius,y);
		g.lineTo(x+width-radius,y);
		g.quadraticCurveTo(x+width,y,x+width,y+radius);
		g.lineTo(x+width,y+height-radius);
		g.quadraticCurveTo(x+width,y+height,x+width-radius,y+height);
		g.lineTo(x+radius,y+height);
		g.quadraticCurveTo(x,y+height,x,y+height-radius);
		g.lineTo(x,y+radius);
		g.quadraticCurveTo(x,y,x+radius,y);
		g.closePath();
	};

	var drawText = function(t,s,a,x,y,c) {
		g.fillStyle = c;
		g.textAlign = a;
		g.font = s;
		g.fillText(t,x,y);
	};

	var die = function() {
		playing = 0;
		mine += score;
		global += score;
		getGlobal(score);
		v = 5;
		y = 0;
		score = 0;
		player.x = w/2;
		player.y = h/2;
		player.vx = 0;
		player.vy = 0;
		presents = [];
		blocks = [];
		canvas.style.cursor = "pointer";
		clearInterval(presentInterval);
		clearInterval(blockInterval);
	};

	var getGlobal = function(n) {
		x = new XMLHttpRequest();
		x.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				global = x.responseText;
				gebid("count").innerHTML = global+" presents saved worldwide <b>|</b>";
			};
		};
		x.onerror = function() {
			gebid("count").innerHTML = "Cannot connect to the server <b>|</b>";
		};
		x.open("GET","count.php?add="+n,true);
		x.send();
	};

	var story = function() {
		alert("Santa was attacked by an evil dragon and all his presents fell out of the sleigh! Can Ben Gwin, a penguin who can't fly, save the day?\n\nWASD or arrow keys to move\nCollect presents\nAvoid fire\n\nWork with players around the world to save as many presents as possible!");
	};

	var speed = 0.05;
	var player = {
		x: w/2,
		y: h/2,
		radius: 70,
		vx: 0,
		vy: 0,
		update: function() {
			this.vx *= 0.96;
			this.vy *= 0.96;
			this.x += this.vx;
			this.y += this.vy;
			if (keys.left) {
				this.vx -= speed*v;
			};
			if (keys.right) {
				this.vx += speed*v;
			};
			if (keys.up) {
				this.vy -= speed*v;
			};
			if (keys.down) {
				this.vy += speed*v;
			};
			if (this.x < -this.radius/2) {
				this.x = w+this.radius/2;
			};
			if (this.x > w+this.radius/2) {
				this.x = -this.radius/2;
			};
			if (this.y < -this.radius/2) {
				this.y = h+this.radius/2;
			};
			if (this.y > h+this.radius/2) {
				this.y = -this.radius/2;
			};
			for (i=0;i<presents.length;i++) {
				if (this.x > presents[i].x+presents[i].size/2-presents[i].size && this.x < presents[i].x+presents[i].size/2+presents[i].size && this.y > presents[i].y+presents[i].size/2-presents[i].size && this.y < presents[i].y+presents[i].size/2+presents[i].size) {
					presents.splice(i,1);
					score++;
				};
			};
			for (i=0;i<blocks.length;i++) {
				if (this.x > blocks[i].x-this.radius/3 && this.x < blocks[i].x+blocks[i].width+this.radius/3 && this.y > blocks[i].y-this.radius/3 && this.y < blocks[i].y+blocks[i].height+this.radius/3) {
					blocks.splice(i,1);
					die();
				};
			};
		},
		render: function() {
			g.beginPath();
			drawRotatedImage(images.player,this.x,this.y,this.radius,this.radius,this.vx/10);
			g.stroke();
		}
	};

	var Present = function(x,y) {
		this.x = x;
		this.y = y;
		this.size = 50;
		this.update = function() {
			this.y -= v;
			if (this.y < -this.size) {
				presents.splice(presents.indexOf(this),1);
			};
		};
		this.render = function() {
			g.drawImage(images.present,this.x,this.y,this.size,this.size);
		};
	};

	var Block = function(x,y,width) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = 30;
		this.update = function() {
			this.y -= v;
			if (this.y < -this.height) {
				blocks.splice(blocks.indexOf(this),1);
			};
		};
		this.render = function() {
			g.fillStyle = images.fire;
			//g.fillRect(this.x,this.y,this.width,this.height);
			drawRoundedRect(this.x,this.y,this.width,this.height,10);
			g.fill();
		};
	};

	var spawnPresent = function() {
		if (focus) {
			presents.push(new Present(Math.random()*w,h+100));
		};
	};

	var spawnBlock = function() {
		if (focus) {
			blocks.push(new Block(Math.random()*w,h+100,80+Math.random()*10*v));
		};
	};

	var background = function() {
		var sy = y * 0.1;
		g.drawImage(images.sky,0,(((sy/h)-Math.floor(sy/h))*h-h)*-1);
		g.drawImage(images.sky,0,(((sy/h)-Math.floor(sy/h))*h)*-1-10);
		g.drawImage(images.sky,0,(((sy/h)-Math.floor(sy/h))*h+h)*-1);
	};

	var key = function(k,s) {
		switch(k) {
			case 37:
				keys.left = s;
				break;
			case 38:
				keys.up = s;
				break;
			case 39:
				keys.right = s;
				break;
			case 40:
				keys.down = s;
				break;
			case 65:
				keys.left = s;
				break;
			case 87:
				keys.up = s;
				break;
			case 68:
				keys.right = s;
				break;
			case 83:
				keys.down = s;
				break;
		};
	};

	window.onkeydown = function(e) {
		key(e.keyCode,1);
	};

	window.onkeyup = function(e) {
		key(e.keyCode,0);
	};

	window.onfocus = function() {
		focus = 1;
	};

	window.onblur = function() {
		focus = 0;
	};

	canvas.onclick = function() {
		if (!playing) {
			playing = 1;
			canvas.style.cursor = "default";
			presentInterval = setInterval(spawnPresent,3000/(v*2));
			blockInterval = setInterval(spawnBlock,3000/(v*0.8));
		};
	};

	var update = function() {
		if (playing) {
			g.clearRect(0,0,w,h);
			v += 0.001;
			y += v*0.8;
			player.update();
			background();
			for (i=0;i<presents.length;i++) {
				presents[i].update();
			};
			for (i=0;i<presents.length;i++) {
				presents[i].render();
			};
			for (i=0;i<blocks.length;i++) {
				blocks[i].update();
			};
			for (i=0;i<blocks.length;i++) {
				blocks[i].render();
			};
			player.render();
			g.drawImage(images.present,10,5,30,30);
			drawText(score,"bold 20px Arial","left",45,30,"#000000");
		} else {
			g.fillStyle = "red";
			g.fillRect(0,0,w,h);
			drawText("Click to","bold 20px Arial","center",w/2,h/2+100,"#FFFFFF");
			drawText("PLAY","bold 70px 'Snowburst One'","center",w/2,h/2+168,"#FFFFFF");

			drawText(mine,"bold 60px 'Snowburst One'","center",w/2-100,h/2-160,"#FFFFFF");
			drawText("presents saved","20px Arial","center",w/2-100,h/2-130,"#FFFFFF");
			drawText("by me","20px Arial","center",w/2-100,h/2-110,"#FFFFFF");

			drawText(global,"bold 60px 'Snowburst One'","center",w/2+100,h/2-160,"#FFFFFF");
			drawText("presents saved","20px Arial","center",w/2+100,h/2-130,"#FFFFFF");
			drawText("worldwide","20px Arial","center",w/2+100,h/2-110,"#FFFFFF");

			p = Math.round(mine/global*100);
			if (isNaN(p)) p = 0;
			if (p > 100) p = 100;
			p = p+"%";
			drawText(p,"bold 60px 'Snowburst One'","center",w/2,h/2-50,"#FFFFFF");
			drawText("percentage saved by me","20px Arial","center",w/2,h/2-20,"#FFFFFF");
			drawText("of total saved worldwide","20px Arial","center",w/2,h/2,"#FFFFFF");

			drawRotatedImage(images.player,100,h/2+80,100,100,50);
			drawRotatedImage(images.player,w-100,h/2+80,100,100,-50);
		};
		requestAnimationFrame(update);
	};
	requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame || window.mozRequestAnimationFrame;
	update();

	getGlobal(0);
	setInterval(function() {
		getGlobal(0);
	},5000);

	gebid("help").onclick = story;

	if (vault.page.new) story();
};
