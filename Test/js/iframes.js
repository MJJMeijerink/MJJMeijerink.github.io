function SetSrca1() {
	var exist = document.getElementById("myIframea1");
	//var URL = "http://tv.majorleaguegaming.com/player/" + document.getElementById("txtSRCa1").value;
	var URL = "" + document.getElementById("mySelect").value;
	if (exist != null) {
		document.getElementById("left_col").removeChild(exist);
	}
	var myIframea1 = document.createElement('iframe');
	myIframea1.id = "myIframea1";
	myIframea1.setAttribute("src", URL);
	//document.getElementById("myIfreme1").src = "http://tv.majorleaguegaming.com/player/" +document.getElementById("txtSRC").value;
	document.getElementById("left_col").insertBefore(myIframea1, document.getElementById("f2"));
	//document.getElementById("myIfreme2").src = document.getElementById("txtSRC2").value;
}

function SetSrca2() {
	var exist = document.getElementById("myIframea2");
	var URL = "" + document.getElementById("myChat").value;
	if (exist != null) {
		document.getElementById("left_col").removeChild(exist);
	}
	var myIframea2 = document.createElement('iframe');
	myIframea2.id = "myIframea2";
	myIframea2.setAttribute("src", URL);
	//document.getElementById("myIfreme1").src = "http://tv.majorleaguegaming.com/player/" +document.getElementById("txtSRC").value;
	document.getElementById("left_col").appendChild(myIframea2);
	//document.getElementById("myIfreme2").src = document.getElementById("txtSRC2").value;
}

function SetSrca3()
 {
	var exist = document.getElementById("myIframea3");
	var URL = "" + document.getElementById("myChat3").value;
	
	if(exist != null){ 
		document.getElementById("middle").removeChild(exist);
	}
 
	 var myIframea3 = document.createElement('iframe');
	 myIframea3.width="98%";
	myIframea3.height="48%";;
	 myIframea3.marginwidth="0";
	 myIframea3.id="myIframea3";
	 myIframea3.setAttribute("src", URL);
	 myIframea3.setAttribute("frameborder", "0");
		 myIframea3.setAttribute("scrolling", "yes");	 
     //document.getElementById("myIfreme1").src = "http://tv.majorleaguegaming.com/player/" +document.getElementById("txtSRC").value;
	 document.getElementById("middle").appendChild(myIframea3);
     //document.getElementById("myIfreme2").src = document.getElementById("txtSRC2").value;
 }
 
 function SetSrcb3()
 {
	var exist = document.getElementById("myIframeb3");
	var URL = "" + document.getElementById("myChat4").value;
	
	if(exist != null){ 
		document.getElementById("middle").removeChild(exist);
	}
 
	 var myIframeb3 = document.createElement('iframe');
	 myIframeb3.width="98%";
	myIframeb3.height="48%";;
	 myIframeb3.marginwidth="0";
	 myIframeb3.id="myIframeb3";
	 myIframeb3.setAttribute("src", URL);
	 myIframeb3.setAttribute("frameborder", "0");
		 myIframeb3.setAttribute("scrolling", "yes");	 
     //document.getElementById("myIfreme1").src = "http://tv.majorleaguegaming.com/player/" +document.getElementById("txtSRC").value;
	 document.getElementById("middle").appendChild(myIframeb3);
     //document.getElementById("myIfreme2").src = document.getElementById("txtSRC2").value;
 }

function SetSrcb1() {
	var exist = document.getElementById("myIframeb1");
	var URL = "" + document.getElementById("mySelect2").value;
	if (exist != null) {
		document.getElementById("right_col").removeChild(exist);
	}
	var myIframeb1 = document.createElement('iframe');
	myIframeb1.marginwidth = "0";
	myIframeb1.id = "myIframeb1";
	myIframeb1.setAttribute("src", URL);
	//document.getElementById("myIfreme1").src = "http://tv.majorleaguegaming.com/player/" +document.getElementById("txtSRC").value;
	document.getElementById("right_col").insertBefore(myIframeb1, document.getElementById("f4"));
	//document.getElementById("myIfreme2").src = document.getElementById("txtSRC2").value;
}

function SetSrcb2() {
	var exist = document.getElementById("myIframeb2");
	var URL = "" + document.getElementById("myChat2").value;
	if (exist != null) {
		document.getElementById("right_col").removeChild(exist);
	}
	var myIframeb2 = document.createElement('iframe');
	myIframeb2.marginwidth = "0";
	myIframeb2.id = "myIframeb2";
	myIframeb2.setAttribute("src", URL);
	//document.getElementById("myIfreme1").src = "http://tv.majorleaguegaming.com/player/" +document.getElementById("txtSRC").value;
	document.getElementById("right_col").appendChild(myIframeb2);
	//document.getElementById("myIfreme2").src = document.getElementById("txtSRC2").value;
}