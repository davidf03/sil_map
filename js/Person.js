// (function(window){

	function Person(n) {
		this.name = n;
	}

	Person.prototype.sayHi = function() {
		console.log("Wes thu hal! "+ this.name +" is min nama");
	}

// }(window));