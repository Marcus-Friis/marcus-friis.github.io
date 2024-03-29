document.addEventListener("DOMContentLoaded", function() {
    const svg = d3.select('svg')
        .style("width", 300)
        .style("height", 300);

    
    d3.json('https://api.dataforsyningen.dk/regioner').then((data) => {
        let xvalues = data.map(x => x.visueltcenter[0]);
        let yvalues = data.map(y => y.visueltcenter[1]);
        let extentx = d3.extent(xvalues);
        let extenty = d3.extent(yvalues);
        let scalex = d3.scaleLinear(extentx, [50, 250]);
        let scaley = d3.scaleLinear(extenty, [50, 250]);

        console.log(data)
        svg
            .selectAll('circle')
            .data(data)
            .join('circle')
            .attr('cx', (d) => {
                return scalex(d.visueltcenter[0])
            })
            .attr('cy', (d) => {
                return scaley(d.visueltcenter[1])
            })
            .attr('r', '10')
            .style('fill', '#c00')
    })
  
});
