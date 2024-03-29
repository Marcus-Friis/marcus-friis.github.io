document.addEventListener("DOMContentLoaded", function() {
    const svg = d3.select('svg')
        .style("width", 600)
        .style("height", 600); // Increasing size for better visualization

    let projection = d3.geoMercator()
        .scale(600) // Adjusted scale
        .center([40, 56]); // Adjusted center coordinates

    let geoGenerator = d3.geoPath()
        .projection(projection);

    d3.json('https://api.dataforsyningen.dk/regioner?format=geojson').then((data) => {
        console.log(data);
        svg
            .selectAll('path')
            .data(data.features)
            .join('path')
            .attr('d', geoGenerator)
            .style('fill', 'red')
            .style('fill-rule', 'evenodd');
    });
});
