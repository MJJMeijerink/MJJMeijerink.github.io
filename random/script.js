var prev;
var prev2;
function infoShow(x) {
	document.getElementById('Welcome').style.display = "none";
	document.getElementById('WelcomeID').style.fontWeight = "initial";
	var y = document.getElementById(x);
	if (window.innerWidth > 799) {
		y.style.display  = "initial";
	}
	var z = document.getElementById(x+"ID");
	z.style.fontWeight = "bold";
	if (prev && prev != y) {
		prev.style.display = "none";
		prev2.style.fontWeight="initial";
	}
	prev = y;
	prev2 = z;
	return;
}
	
function mouseIn(x) {
	x.style.fontWeight = "bold";
}

function mouseOut(x) {
	if (typeof prev2 === 'undefined'){
		prev2 = document.getElementById('WelcomeID');
		if (prev2 != x){
			x.style.fontWeight = "initial";
		}
	}
	else if (prev2 != x)
		{x.style.fontWeight = "initial";}
}
/* 
function mouseOut(x) {
	if (typeof prev2 === 'undefined'){
		prev2 = document.getElementById('WelcomeID');
	}
	if (prev2 != x)
		{x.style.fontWeight = "initial";}
}
*/
window.onresize = function() {
	if (window.innerWidth<800) {
		if (typeof prev === 'undefined'){
			prev = document.getElementById('Welcome');
			}
		document.getElementById('balk').style.fontSize = '20px';
		prev.style.display = "none"
		document.getElementById('main').style.marginLeft = '10%';
	}
	else {
		document.getElementById('balk').style.fontSize = '45px';
		document.getElementById('main').style.marginLeft = '0%';
		prev.style.display = "initial"
	}
}