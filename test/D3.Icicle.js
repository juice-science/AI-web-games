'________________________'
'GLOBAL VARIABLES'
'Material data matrix'
materialdata = [wood_log, copper, iron, stone, wolfram, coal, wood_plank, wood_frame, copper_ingot, copper_wire, iron_ingot, iron_gear, sand, silicon, glass, tungsten, graphite, carbide, coupler, lens, heat_sink, iron_plate, emagnet, metal_frame, steel, steel_rod, rotor, concrete, battery, motor, circuit, carbfibre, nanowire, computer, ind_frame, gyroscope, stabilizer, mag_field, quantum, microscope, turbocharg, supercomp, atomic, energy_cube, tank, compressor, particle, duplicator, earth_token, uranium, enriched_ur, empty_fuel, nuclear_fuel];
'Total required for each material array initialisation'
materialtotal = [0];
materialtotal.length = materialdata.length;
zero(materialtotal);
'_________________________'
'END OF GLOBAL VARIABLE'

const chart = (() => {
    // 차트의 차원을 지정합니다. Specify the chart’s dimensions.
    const width = 928;
    const height = 2400;
    const format = d3.format(",d");

    // 색상 스케일 생성 (루트 노드와 그 자손의 각 하위 항목에 대한 색상) Create a color scale (a color for each child of the root node and their descendants).
    const color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, data.children.length + 1))

    // 파티션 레이아웃 생성. Create a partition layout.
    const partition = d3.partition()
        .size([height, width])
        .padding(1);

    // 파티션 레이아웃 추가 Apply the partition layout.
    const root = partition(d3.hierarchy(data)
        .sum(d => d.value)
        .sort((a, b) => b.height - a.height || b.value - a.value));

    // SVG 컨테이너 만들기 Create the SVG container.
    const svg = d3.create("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif");

    // 계층 구조의 각 노드에 대해 셀을 추가합니다. Add a cell for each node of the hierarchy.
    const cell = svg
        .selectAll()
        .data(root.descendants())
        .join("g")
        .attr("transform", d => `translate(${d.y0},${d.x0})`);

    cell.append("title")
        .text(d => `${d.ancestors().map(d => d.data.name).reverse().join("/")}\n${format(d.value)}`);

    // Color the cell with respect to which child of root it belongs to. 
    cell.append("rect")
        .attr("width", d => d.y1 - d.y0)
        .attr("height", d => d.x1 - d.x0)
        .attr("fill-opacity", 0.6)
        .attr("fill", d => {
            if (!d.depth) return "#ccc";
            while (d.depth > 1) d = d.parent;
            return color(d.data.name);
        });

    // Add labels and a title.
    const text = cell.filter(d => (d.x1 - d.x0) > 16).append("text")
        .attr("x", 4)
        .attr("y", 13);

    text.append("tspan")
        .text(d => d.data.name);

    text.append("tspan")
        .attr("fill-opacity", 0.7)
        .text(d => ` ${format(d.value)}`);

    return svg.node();
})

//data = Object {name: "flare", children: Array(10)}