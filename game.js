//genetic algorithm parameters
let maximum_moves = 25;
let population_size = 500;
let generation = 1;
let mutation_rate = 0.05; //5%

let movement_speed = 50; //ms
let possible_moves = ['U', 'D', 'L', 'R'];
let grid_size = 7;

//x,y (top left is 0, 0)
let start = [0, 0];
let goal = [grid_size-1, grid_size-1 ];
generateRandomNumber = (lower_num, upper_num) => {
	return Math.floor(Math.random()*upper_num) + lower_num;
}
let holes = [
	[generateRandomNumber(1, grid_size-1), generateRandomNumber(0, grid_size-2)],
	[generateRandomNumber(1, grid_size-1), generateRandomNumber(0, grid_size-2)],
	[generateRandomNumber(1, grid_size-1), generateRandomNumber(0, grid_size-2)],
	[generateRandomNumber(1, grid_size-1), generateRandomNumber(0, grid_size-2)],
	[generateRandomNumber(1, grid_size-1), generateRandomNumber(0, grid_size-2)],
	[generateRandomNumber(1, grid_size-1), generateRandomNumber(0, grid_size-2)],
	[generateRandomNumber(1, grid_size-1), generateRandomNumber(0, grid_size-2)],
];
let population = []; //this will store all of the population of moves

class Moves {
  constructor() {
    this.moves = "XXXXXXXXXXX";
    this.fitness = 9999;
  }
}

$(document).ready(function() {

	initializeGrid();
	initializeInitialPopulation();
	//console.log(population);
	//console.log("MOVES: " + calculateFitness('RRRRUUUU'));
	animateMove(population[0].moves);

});


//Genetic Algorithm Functions

initializeInitialPopulation = () => {
	for (let i=0; i<population_size; i++) {
		let temp_move = new Moves();
		temp_move.moves = "";
		for (let x=0; x<maximum_moves; x++) {
			temp_move.moves += generateRandomMove();
		}
		temp_move.fitness = calculateFitness(temp_move.moves);
		population.push(temp_move);
	}
	sortPopulationByFitness();
	displayBestMoves();
}

generateRandomMove = () => {
	let temp_random_index = Math.floor(Math.random()*4) + 0;
	return possible_moves[temp_random_index];
}

sortPopulationByFitness = () => {
	population.sort(function(a, b) {
	    return a.fitness - b.fitness;
	});
}

moveGenerationTimes = () => {
	let num_generations_to_move = $('#number-of-generations-to-move').val();
	var i=0, j=parseInt(num_generations_to_move);
	var iv = setInterval(function() {
		generation++;
		$('#generation').html(generation);
		var old_population = JSON.parse(JSON.stringify(population));
		for (let x=0; x<population_size; x++) {
			let parent_1_index = Math.floor(Math.random()*(population_size/5)) + 0;
			let parent_2_index = Math.floor(Math.random()*(population_size-1)) + 0;
			population[x].moves = generateNewChild(old_population[parent_1_index].moves, old_population[parent_2_index].moves);
			population[x].fitness = calculateFitness(population[x].moves);
		}
		sortPopulationByFitness();
		displayBestMoves();
		if (++i>=j) clearInterval(iv);
	}, 1);
}

generateNewChild = (parent_1, parent_2) => {
	let new_child = "";
	for (let x=0; x<parent_1.length; x++) {
		if ((Math.floor(Math.random()*1) + 0) == 0) {
			new_child += parent_1[x];
		} else {
			new_child += parent_2[x];
		}
	}
	if ((Math.floor(Math.random()*100) + 0) < mutation_rate*100) {
		let index_to_mutate = (Math.floor(Math.random()*new_child.length-1) + 0);
		new_child = new_child.replaceAt(index_to_mutate, generateRandomMove());
	}
	return new_child;
}

animateBestMove = () => {
	initializeGrid();
	animateMove(population[0].moves);
}

String.prototype.replaceAt=function(index, char) {
    var a = this.split("");
    a[index] = char;
    return a.join("");
}




// UI Related Functions including Animation (this also includes calculating the fitness of a move) //

initializeGrid = () => {
	let temp_html = '';
	for (let x=grid_size-1; x>=0; x--) {
		for (let y=0; y<grid_size; y++) {
			temp_html += '<div class="square" id="grid-'+y+'-'+x+'"></div>';
		}
		temp_html += '<div style="clear:both;width:1px;height:1px;">&nbsp</div>';
	}
	$('#grid').html(temp_html);
	putHolesGoalsCurrent();
}

putHolesGoalsCurrent = () => {
	$('#grid-'+goal[0]+'-'+goal[1]).addClass('goal');
	$('#grid-'+start[0]+'-'+start[1]).addClass('start');
	for (let x=0; x<holes.length; x++) {
		$('#grid-'+holes[x][0]+'-'+holes[x][1]).removeClass('current');
		$('#grid-'+holes[x][0]+'-'+holes[x][1]).addClass('hole');
	}
}

calculateFitness = (str) => {
	let current = [];
	current[0] = start[0];
	current[1] = start[1];
	let moves = 0;
	for (let x=0; x<str.length; x++) {
		moves++;
		//move up
		if (str[x]=='U') {
			if (current[1]<grid_size-1) {
				current[1]++;
			}
		}
		//move down
		if (str[x]=='D') {
			if (current[1]>0) {
				current[1]--;
			}
		}
		//move right
		if (str[x]=='R') {
			if (current[0]<grid_size-1) {
				current[0]++;
			}
		}
		//move left
		if (str[x]=='L') {
			if (current[0]>0) {
				current[0]--;
			}
		}
		//check if after the move, we are at the goal
		if (current[0]==goal[0] && current[1]==goal[1]) {
			return moves;
		}
		//check if we are at one of the holes
		for (let x=0; x<holes.length; x++) {
			if (current[0]==holes[x][0] && current[1]==holes[x][1]) {
				moves += 5;
			}
		}
		//console.log("Current: " + current);
		//$('#grid-'+current[0]+'-'+current[1]).addClass('current');
		//putHolesGoalsCurrent();
	}
	return moves;
}

animateMove = (str) => {
	let current = [];
	current[0] = start[0];
	current[1] = start[1];
	let moves = 0;
	let temp_timeout = [];
	for (let x=0; x<str.length; x++) {
		temp_timeout[x] = setTimeout( function timer(){
			//initializeGrid();
			moves++;
			//move up
			if (str[x]=='U') {
				if (current[1]<grid_size-1) {
					current[1]++;
				}
			}
			//move down
			if (str[x]=='D') {
				if (current[1]>0) {
					current[1]--;
				}
			}
			//move right
			if (str[x]=='R') {
				if (current[0]<grid_size-1) {
					current[0]++;
				}
			}
			//move left
			if (str[x]=='L') {
				if (current[0]>0) {
					current[0]--;
				}
			}
			//check if after the move, we are at the goal
			if (current[0]==goal[0] && current[1]==goal[1]) {
				console.log("Goal Reached!");
				for (let y=0; y<str.length; y++) {
					$('#number-of-moves').html(moves);
					clearTimeout(temp_timeout[y]);
				}
				return;
			}
			//check if we are at one of the holes
			for (let y=0; y<holes.length; y++) {
				if (current[0]==holes[y][0] && current[1]==holes[y][1]) {
					moves += 5;
				}
			}
			$('#grid-'+current[0]+'-'+current[1]).addClass('current');
			$('#number-of-moves').html(moves);
			//putHolesGoalsCurrent();
		}, x*movement_speed );
	}
	$('#generation').html(generation);
	return;
}

displayBestMoves = () => {
	let temp_str = "";
	for (let x=0; x<20; x++) {
		temp_str += "<div>" + population[x].moves + " ("+population[x].fitness+")</div>";
	}
	$('#best-moves').html(temp_str);
}