$(function() { 
//**********

var x = 0;
var y = 0;
var c = document.getElementById("mainCanvas");
var canvas = c.getContext('2d');
var d = document.getElementById("otherCanvas");
var danvas = d.getContext('2d');

var draw = function(x, y, color){
	canvas.fillStyle = color;
	canvas.fillRect(x,y,50,50);
}

var check = function(){
	if(x >= c.width){
		x = 0;
		y += 50;
	}
}


$('.addBlue').on('click', function(){
	draw(x, y, 'blue');
	x += 50;
	check();
});

$('.addRed').on('click', function(){
	draw(x, y, 'red');
	x += 50;
	check();
});


$('#copy').on('click', function(){
	var picData = canvas.getImageData(0,0,c.width,c.height);
	picData = c.toDataURL(); 
// <-- possible use for storing to DB
	// image.src = picData;
	// danvas.drawImage(image, 0, 0, c.width, c.height);
	

	console.log(picData.data[0]);

	for(var i=0; i <= c.width*c.height; i+=4){
		// console.log(i);
		if (picData.data[i+2] == 255) {
			picData.data[i+2] -= 255;
			picData.data[i+1] += 255;
		}

		picData.data[i] -= 255;
		picData.data[i+2] += 255;
	}


	danvas.putImageData(picData,0,0);
});


var sound = new window.AudioContext();
var osc = sound.createOscillator();

$('#play').on('click', function(){
	osc.frequency.value = 440;
	osc.type = "sawtooth";
	osc.connect(sound.destination);
	osc.start(0);
});

$('#stop').on('click', function(){
	osc.stop();
});



//**********
});