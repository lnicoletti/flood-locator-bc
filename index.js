mapboxgl.accessToken = "pk.eyJ1IjoibG5pY29sZXR0aSIsImEiOiJjazZ1a3I5cjgwNWxtM2xxcDlva2NvaDNzIn0.xDhib2HysGYu4_oIkgHHow"

config = ({
    lng: -123.0207,
    lat: 49.2667,
    zoom: 10.5,
    fillOpacity: 0.5,
    colorScaleImp: ["#f7fcfd","#e0ecf4","#bfd3e6","#9ebcda","#8c96c6","#8c6bb1","#88419d","#6e016b"],
    colorScalePop: ["#fff5eb","#fee6ce","#fdd0a2","#fdae6b","#fd8d3c","#f16913","#d94801","#8c2d04"],
    areaThreshold: 0.75
  })

d3.json("https://gist.githubusercontent.com/lnicoletti/cdb0d6df5476da695f307b78e39ff864/raw/88ff0bbb9cd76ea72313da277a307e532af215d2/MV_IMP_POP_s_ll.json", d3.autoType).then(data=> {

    console.log(data)

    // bivar vars
    colorBivar = function(value) {
        // return value => {
        // if (!value) return "lightgrey";
        let [a, b] = value;
        return colors[yBivar(b) + xBivar(a) * n];
        // }
    }
    colors = ["#f0f0f0", "#ead2d2", "#e4b5b5", "#de9696", "#d87676", "#d65454", "#d7eded", "#d7d2d2", "#d7b5b5", "#d79696", "#d77676", "#d15252", "#bdeaea", "#bdd2d2", "#bdb5b5", "#bd9696", "#bd7676", "#bd5252", "#a0e6e6", "#a0d2d2", "#a0b5b5", "#a09696", "#a07676", "#a05252", "#81e2e2", "#81d2d2", "#81b5b5", "#819696", "#817676", "#815252", "#5ddede", "#5dd2d2", "#5db5b5", "#5d9696", "#5d7676", "#5d5252"]

    n = Math.floor(Math.sqrt(colors.length))
    
    dataBivar = Object.assign(new Map(data.features.map(d=>d.properties).map((d, i) => [i, [d.IMP, d.pop_den]])),{title: ["Flood Risk", "Pop. Density"]})
    yBivar = d3.scaleQuantile(Array.from(dataBivar.values(), d => d[1]), d3.range(n))
    xBivar = d3.scaleQuantile(Array.from(dataBivar.values(), d => d[0]), d3.range(n))

    console.log(dataBivar)

    

    labels = ["low", "", "high"]



    legendIndex = () => {
        const k = 70/n;
        // const arrow = 1;
        //font-family=sans-serif
        return svg`<g class="legend">
        <g transform="translate(-${k * n / 2},-${k * n / 2}) rotate(-45 ${k * n / 2},${k * n / 2})">
          <marker id="arrow" markerHeight=10 markerWidth=10 refX=3 refY=3 orient=auto>
            <path d="M0,0L6,3L0,6Z" />
          </marker>
          ${d3.cross(d3.range(n), d3.range(n)).map(([i, j]) => svg`<rect width=${k} height=${k} x=${i * k} y=${(n - 1 - j) * k} fill=${colors[j * n + i]}>
            <title>${dataBivar.title[0]}${labels[j] && ` (${labels[j]})`}
      ${dataBivar.title[1]}${labels[i] && ` (${labels[i]})`}</title>
          </rect>`)}
          <line marker-end="url(#arrow)" x1=0 x2=${n * k} y1=${n * k} y2=${n * k} stroke=black stroke-width=1.5 />
          <line marker-end="url(#arrow)" y2=0 y1=${n * k} stroke=black stroke-width=1.5 />
          <text font-weight="bold" dy="0.71em" transform="rotate(90) translate(${n / 2 * k},6)" text-anchor="middle">${dataBivar.title[0]}</text>
          <text font-weight="bold" dy="0.71em" transform="translate(${n / 2 * k},${n * k + 6})" text-anchor="middle">${dataBivar.title[1]}</text>
        </g>
      </g>`;
      }

    colorExpr = ['match', ['string',['get', 'colorHex']]].concat(colors.map(d=>[d,d]).flat()).concat('#ccc')

    dataColored = {
        
        type: "FeatureCollection",
        features: data.features.map((d, i) => ({...d, 
                    properties:
                    {...d.properties, colorHex: colorBivar(dataBivar.get(i))}}))
        
    }

    console.log(dataColored)

    showMap(dataColored, colorExpr)
 

})

function showMap(dataColored, colorExpr) {
    let map = this;
    
    // if (!map) {
      map = new mapboxgl.Map({
        container: "bivmap",
        center: [
          config.lng,
          config.lat,
        ],
        zoom: config.zoom,
        style: 'mapbox://styles/mapbox/light-v9',
        // style: 'mapbox://styles/lnicoletti/ckwaumva16h1315t6wcywwbk9',
        maxZoom: 14,
        minZoom: 9.5
      });
    // }
    
    map.addControl(new mapboxgl.FullscreenControl(), 'top-right'); //zoom controls
    map.addControl(new mapboxgl.NavigationControl(), 'top-right'); //zoom controls
    
    // Wait until the map loads, then yield the container again.
    // yield new Promise(resolve => {
    //   if (map.loaded()) resolve(map);
    //   else map.on('load', () => resolve(map));
    // });

    map.on('load', function() {
        renderMapbox(map, dataColored, colorExpr) 
        renderLegend(map)
        }   
    )
    
  }

function showTooltip(map, e) {
    // new mapboxgl.Popup({className: "accessTooltip"})
    // console.log(e)
    const visibleBlock = e.features[0].properties.IMP>0.1 && e.features[0].properties.pop_den>2
 
   if (visibleBlock===true) {
      const impPop = e.features[0].properties.IMP*e.features[0].properties.pop_den/1000
      const aLevel = impPop>20?"very high":
               (impPop>12)&&(impPop<=20)?"high":
               (impPop>8)&&(impPop<=12)?"average":
               (impPop>3)&&(impPop<=8)?"low":
               (impPop<=3)?"very low":""
       
     const color = e.features[0].properties.colorHex
   
      new mapboxgl.Popup()
       .setLngLat(e.lngLat)
        // .setHTML("In this block: " + (e.features[0].properties.DBpop2016) + "people are at a flood risk of " + (e.features[0].properties.IMP))
       .setHTML(`<span class="tooltipInfo" style="font-weight:light">In this block, flood hazard during extreme events is 
                   <b><span style="text-transform:uppercase;color:${color}">${aLevel}</span></b><br><br>
                   there are <b>${e.features[0].properties.DBpop2016}</b> residents and <b>${(e.features[0].properties.IMP*100).toFixed()}%</b> 
                   of the ground is impermeable</span>`)
       .addTo(map);
       
         d3.selectAll(".mapboxgl-popup-content")
             .style("background-color", "#e9f0f5")
             .style("fill", "black")
         d3.selectAll(".mapboxgl-popup")
           .style("max-width", "200px")
   }
     
       // d3.selectAll(".mapboxgl-popup-tip")
       //     .style("fill", "none")
   // .attr("rx", 50)
 }

 function renderLegend(map) {

    // const mapContainer = map.getCanvasContainer();
  
    const dim = 240
    const svg = d3
      // .select(mapContainer)
      .select("#bivmap")
      .append("svg")
        .attr('width', dim)
        .attr('height', dim)
        .style('position', 'absolute')
        .style('z-index', 0)
        // .style("transform", `translate(45px, 100px)`)
      
    const leg = svg.append("g")
      //   .attr("height", height)
      // .attr("width", width);
      // .style("overflow", "visible")
                // .attr('transform', `translate(${0}, ${marginTop+20})`)
    
    leg.append(legendIndex)
              // .attr("transform", `translate(100, 100)`)
              // .attr("transform", `rotate(45)`)
              .attr("transform", `rotate(45), translate(${170},${80})`)
    //           // .attr("transform", `rotate(45), translate(${100},${0})`)
    //           .attr("class", "bivlegend")
          // .attr("transform", `rotate(45), translate(${700},${-400})`);
  
    const title = d3
      // .select(mapContainer)
      .select("#bivmap")
      // .append("div")
      //  .attr('width', dim)
      // .attr('height', dim)
      .append("text")
      .text("FLOOD-HAZARD LOCATOR")
      .style("transform", "translate(20px,30px)")
        .attr("class", "mapTitle")
        .style('position', 'absolute')
  
    const subTitle = d3
      // .select(mapContainer)
      .select("#bivmap")
      // .append("div")
      //  .attr('width', dim)
      // .attr('height', dim)
      .append("text")
      .text("Mapping Flood Hazard in the Vancouver Metropolitan Region")
      .style("transform", "translate(20px,70px)")
        .attr("class", "mapSubTitle")
        .style('position', 'absolute')
        
  
    const credit = d3
      // .select(mapContainer)
      .select("#bivmap")
      // .append("div")
      //  .attr('width', dim)
      // .attr('height', dim)
      .append("html")
      .html("by <a href='https://www.leonardonicoletti.com/' style='text-decoration:underline; color:black' target='_blank'><b>LEONARDO NICOLETTI</b></a>")
      .style("transform", "translate(10px,100px)")
        .attr("class", "mapCredit")
        .style('position', 'absolute')
  
    
  }

function renderMapbox(map, dataColored, colorExpr) {

const sourceId = 'van-blocks';
const layerId = `${sourceId}-layer`;
const outlineId = `${sourceId}-outline`;
// const layerId_imp = `${sourceId}-imp`;
// const layerId_pop = `${sourceId}-pop`;

let source = map.getSource(sourceId);
let hoveredStateId = null;

// Add the source and layer if we haven't created them yet
// if (!source) {
    map.addSource(sourceId, {
    type: 'geojson',
    data: dataColored
    });

    map.addLayer({
    id: layerId,
    source: sourceId,
    type: 'fill',
    // interactive: false,
    paint: {
        'fill-color': colorExpr,
        'fill-opacity': 
        ['case',
        ['all', ['<', ['get', 'IMP'], 0.1]],
        0,
        ['all', ['<', ['get', 'pop_den'], 2]],
        0,
        // ['boolean', ['feature-state', 'hover'], true],
        // 0.5,
        1
        ]
//         'fill-opacity': [
// 'case',
// ['boolean', ['feature-state', 'hover'], false],
// 1,
// 0.5
// ]
    },
    });
    map.addLayer({
    id: outlineId,
    source: sourceId,
    type: 'line',
    // interactive: false,
    paint: {
        'line-color': 'white',
        'line-width': 0.05
        // [
        //   'interpolate',
        //   // Set the exponential rate of change to 0.5
        //   ['exponential', 0.1],
        //   ['zoom'],
        //   // When zoom is 10, buildings will be 100% transparent.
        //   9,
        //   0.05,
        //   // When zoom is 18 or higher, buildings will be 100% opaque.
        //   14,
        //   1
        // ]
    },
    });

    source = map.getSource(sourceId);
// }

// Update the geojson data
source.setData(dataColored);

// tooltip
// map.on('click', layerId, (e) => {
//     console.log(e)
//   new mapboxgl.Popup()
//   .setLngLat(e.lngLat)
//   .setHTML("In this block: " + (e.features[0].properties.DBpop2016) + "people are at a flood risk of " + (e.features[0].properties.IMP))
//   .addTo(map);
// });
    
    // Change the cursor to a pointer when
    // the mouse is over the states layer.
map.on('mouseover', layerId, (e) => {
    // console.log(event)
        showTooltip(map, e)
    });
    
map.on('mousemove', layerId, (e) => {
    d3.selectAll(".mapboxgl-popup-content").remove()
    d3.selectAll(".mapboxgl-popup-tip").remove()
    showTooltip(map, e)
});

// Change the cursor to a pointer when
// the mouse is over the states layer.
map.on('mouseenter', layerId, () => {
    map.getCanvas().style.cursor = 'pointer';
});

// Change the cursor back to a pointer
// when it leaves the states layer.
map.on('mouseleave', layerId, () => {
    map.getCanvas().style.cursor = '';
    d3.selectAll(".mapboxgl-popup-content").remove()
    d3.selectAll(".mapboxgl-popup-tip").remove()
});


}

function template(render, wrapper) {
    return function(strings) {
      var string = strings[0],
          parts = [], part,
          root = null,
          node, nodes,
          walker,
          i, n, j, m, k = -1;
  
      // Concatenate the text using comments as placeholders.
      for (i = 1, n = arguments.length; i < n; ++i) {
        part = arguments[i];
        if (part instanceof Node) {
          parts[++k] = part;
          string += "<!--o:" + k + "-->";
        } else if (Array.isArray(part)) {
          for (j = 0, m = part.length; j < m; ++j) {
            node = part[j];
            if (node instanceof Node) {
              if (root === null) {
                parts[++k] = root = document.createDocumentFragment();
                string += "<!--o:" + k + "-->";
              }
              root.appendChild(node);
            } else {
              root = null;
              string += node;
            }
          }
          root = null;
        } else {
          string += part;
        }
        string += strings[i];
      }
  
      // Render the text.
      root = render(string);
  
      // Walk the rendered content to replace comment placeholders.
      if (++k > 0) {
        nodes = new Array(k);
        walker = document.createTreeWalker(root, NodeFilter.SHOW_COMMENT, null, false);
        while (walker.nextNode()) {
          node = walker.currentNode;
          if (/^o:/.test(node.nodeValue)) {
            nodes[+node.nodeValue.slice(2)] = node;
          }
        }
        for (i = 0; i < k; ++i) {
          if (node = nodes[i]) {
            node.parentNode.replaceChild(parts[i], node);
          }
        }
      }
  
      // Is the rendered content
      // … a parent of a single child? Detach and return the child.
      // … a document fragment? Replace the fragment with an element.
      // … some other node? Return it.
      return root.childNodes.length === 1 ? root.removeChild(root.firstChild)
          : root.nodeType === 11 ? ((node = wrapper()).appendChild(root), node)
          : root;
    };
  }

svg = template(function(string) {
    var root = document.createElementNS("http://www.w3.org/2000/svg", "g");
    root.innerHTML = string.trim();
    return root;
  }, function() {
    return document.createElementNS("http://www.w3.org/2000/svg", "g");
  });