window.addEventListener("error", onError);
window.addEventListener("load", onLoad);
function createGear(index) {
	let template = document.getElementById("template").cloneNode(true);
	let span = template.getElementsByTagName("span")[0];
	let input = template.getElementsByTagName("input")[0];
	span.textContent = index + 1;
	input.value = Math.max(5 - index, 1);
	input.addEventListener("change", onChange);
	template.style.visibility = "visible";
	return template;
}
function draw() {
	let canvas = document.getElementById("canvas");
	let self = {
		context: canvas.getContext("2d"),
		width: parseInt(canvas.getAttribute("width")),
		height: parseInt(canvas.getAttribute("height")),
		rotationMax: parseInt(document.getElementById("rotation-max").value),
		rotationScale: parseFloat(document.getElementById("rotation-scale").value),
		speedFactor: parseFloat(document.getElementById("speed-factor").value),
		speedScale: parseFloat(document.getElementById("speed-scale").value),
		speedUnit: parseFloat(document.getElementById("speed-unit").value)
	};
	makeBackground(self);
	drawBackground(self);
	makeGrid(self);
	drawRotationGrid(self);
	drawSpeedGrid(self);
	makeRotation(self);
	drawRotation(self, self.rotationMax);
	makeGear(self);
	drawGears(self);
}
function drawBackground(self) {
	self.context.fillRect(0, 0, self.width, self.height);
}
function drawGear(self, ratio, previous) {
	if ((self.rotationScale >= 1) && (self.speedScale >= 1)) {
		let factor = self.speedFactor * self.rotationMax;
		let speed = factor / ratio / self.speedUnit;
		let x = speed * (self.width / self.speedScale);
		let y = self.rotationMax * (self.height / self.rotationScale);
		let rotation = 0;
		let x0 = 0;
		let y0 = 0;
		if (previous > 0) {
			let speed0 = (previous ? (factor / previous) : 0) / self.speedUnit;
			let scale = speed0 / speed;
			rotation = self.rotationMax * scale;
			x0 = x * scale;
			y0 = y * scale;
		}
		self.context.beginPath();
		self.context.moveTo(x0, self.height - y0);
		self.context.lineTo(x, self.height - y);
		self.context.closePath();
		self.context.stroke();
		self.context.fillText(formatSpeed(speed, self.speedUnit), x, self.height - y);
		self.context.fillText(formatRotation(rotation), x0, self.height - y0 + 10);
	}
}
function drawGears(self) {
	let final = parseFloat(document.getElementById("final").value);
	let gears = [];
	let previous = 0;
	for (let row of document.getElementById("transmission").getElementsByTagName("tr")) {
		gears.push(parseFloat(row.getElementsByTagName("input")[0].value));
	}
	for (let gear of gears) {
		let ratio = gear * final;
		drawGear(self, ratio, previous);
		previous = ratio;
	}
}
function drawRotation(self, rotation) {
	if (self.rotationScale >= 1) {
		let y = rotation * (self.height / self.rotationScale);
		if (y < self.height) {
			y = self.height - y;
			self.context.beginPath();
			self.context.moveTo(0, y);
			self.context.lineTo(self.width, y);
			self.context.closePath();
			self.context.stroke();
			self.context.fillText(formatRotation(rotation), 0, y);
			return true;
		}
	}
	return false;
}
function drawRotationGrid(self) {
	let step = parseInt(document.getElementById("rotation-step").value);
	if (step >= 1) {
		let rotation = step;
		while (drawRotation(self, rotation)) {
			rotation += step;
		}
	}
}
function drawSpeed(self, speed) {
	if (self.speedScale >= 1) {
		let x = speed * (self.width / self.speedScale);
		if (x < self.width) {
			self.context.beginPath();
			self.context.moveTo(x, 0);
			self.context.lineTo(x, self.height);
			self.context.closePath();
			self.context.stroke();
			self.context.fillText(formatSpeed(speed, self.speedUnit), x, self.height);
			return true;
		}
	}
	return false;
}
function drawSpeedGrid(self) {
	let step = parseInt(document.getElementById("speed-step").value);
	if (step >= 1) {
		let speed = step;
		while (drawSpeed(self, speed)) {
			speed += step;
		}
	}
}
function formatRotation(rotation) {
	return Math.round(rotation).toString() + " rpm";
}
function formatSpeed(speed, unit) {
	return Math.round(speed).toString() + ((unit == 1) ? " km/h" : " mph");
}
function makeBackground(self) {
	self.context.fillStyle = "black";
}
function makeGear(self) {
	self.context.fillStyle = "white";
	self.context.strokeStyle = "white";
}
function makeGrid(self) {
	self.context.fillStyle = "white";
	self.context.strokeStyle = "green";
}
function makeRotation(self) {
	self.context.fillStyle = "red";
	self.context.strokeStyle = "red";
}
function onChange() {
	draw();
}
function onChangeAuto() {
	updateAuto();
	onChange();
}
function onChangeGears() {
	updateGears();
	onChange();
}
function onChangeSize() {
	updateCanvas();
	onChange();
}
function onChangeUnit() {
	updateUnit();
	onChange();
}
function onError(event) {
	alert(event.message);
	stop();
}
function onLoad() {
	document.getElementById("gears").addEventListener("change", onChangeGears);
	document.getElementById("final").addEventListener("change", onChange);
	document.getElementById("rotation-max").addEventListener("change", onChange);
	document.getElementById("canvas-width").addEventListener("change", onChangeSize);
	document.getElementById("canvas-height").addEventListener("change", onChangeSize);
	document.getElementById("rotation-scale").addEventListener("change", onChange);
	document.getElementById("rotation-step").addEventListener("change", onChange);
	document.getElementById("speed-factor").addEventListener("change", onChange);
	document.getElementById("speed-scale").addEventListener("change", onChange);
	document.getElementById("speed-step").addEventListener("change", onChange);
	document.getElementById("speed-unit").addEventListener("change", onChangeUnit);
	document.getElementById("auto").addEventListener("click", onChangeAuto);
	updateGears();
	updateCanvas();
	draw();
}
function updateAuto() {
	let rows = document.getElementById("transmission").getElementsByTagName("tr");
	let maximum = parseInt(document.getElementById("rotation-max").value);
	let pivot = parseInt(document.getElementById("auto-pivot").value) - 1;
	let shift = parseInt(document.getElementById("auto-rotation").value);
	let step = parseInt(document.getElementById("auto-step").value);
	let gears = [];
	for (let row of rows) {
		gears.push(parseFloat(row.getElementsByTagName("input")[0].value));
	}
	if ((maximum > 0) && (shift > 0) && (0 <= pivot) && (pivot < gears.length)) {
		let current = 0;
		gears[pivot] = 1;
		for (let index = pivot - 1; index >= 0; index--) {
			gears[index] = gears[index + 1] * maximum / (shift - current);
			current += step;
		}
		for (let index = pivot + 1; index < gears.length; index++) {
			gears[index] = gears[index - 1] * maximum / (shift + current);
			current -= step;
		}
	}
	for (let index = 0; index < gears.length; index++) {
		rows[index].getElementsByTagName("input")[0].value = Math.round(gears[index] * 1000) / 1000;
	}
}
function updateCanvas() {
	let canvas = document.getElementById("canvas");
	canvas.setAttribute("width", parseInt(document.getElementById("canvas-width").value));
	canvas.setAttribute("height", parseInt(document.getElementById("canvas-height").value));
}
function updateGears() {
	let table = document.getElementById("transmission");
	let rows = table.getElementsByTagName("tr");
	let count = Math.max(parseInt(document.getElementById("gears").value), 1);
	while (rows.length < count) {
		table.appendChild(createGear(rows.length));
	}
	while (rows.length > count) {
		table.removeChild(rows[rows.length - 1]);
	}
}
function updateUnit() {
	let text = (document.getElementById("speed-unit").value == 1) ? "km/h" : "mph";
	for (let element of document.getElementsByClassName("speed-unit")) {
		element.textContent = text;
	}
}