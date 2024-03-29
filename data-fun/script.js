document.addEventListener("DOMContentLoaded", function() {

	const svg = d3.select('svg')
		.style('width', '600')
		.style('height', '600');

	const colorScale = d3.scaleOrdinal(['Male', 'Female'], d3.schemePastel1);

	d3.csv('https://raw.githubusercontent.com/Marcus-Friis/afae-exam/main/data/income.csv').then((data) => {
		let xextent = d3.extent(data.map(x => x.age))
		let xscale = d3.scaleLinear(xextent, [20,600])

		let yextent = d3.extent(data.map(x => x['hours-per-week']))
		let yscale = d3.scaleLinear(yextent, [20,600])

		console.log(data)
		svg
			.selectAll('circle')
			.data(data)
			.join('circle')
			.attr('r', '1')
			.attr('cx', d => xscale(d.age))
			.attr('cy', d => yscale(d['hours-per-week']))
			.style('fill', d => colorScale(d.gender));

		let axis = d3.axisBottom(xscale);
		svg.select('g')
			.call(axis);
	});

});