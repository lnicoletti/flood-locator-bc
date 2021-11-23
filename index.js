mapboxgl.accessToken = "pk.eyJ1IjoibG5pY29sZXR0aSIsImEiOiJjazZ1a3I5cjgwNWxtM2xxcDlva2NvaDNzIn0.xDhib2HysGYu4_oIkgHHow"

config = ({
    lng: -123.0407,
    lat: 49.2767,
    zoom: 11.1,
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
    // colors = ["#f0f0f0", "#ead2d2", "#e4b5b5", "#de9696", "#d87676", "#d65454", "#d7eded", "#d7d2d2", "#d7b5b5", "#d79696", "#d77676", "#d15252", "#bdeaea", "#bdd2d2", "#bdb5b5", "#bd9696", "#bd7676", "#bd5252", "#a0e6e6", "#a0d2d2", "#a0b5b5", "#a09696", "#a07676", "#a05252", "#81e2e2", "#81d2d2", "#81b5b5", "#819696", "#817676", "#815252", "#5ddede", "#5dd2d2", "#5db5b5", "#5d9696", "#5d7676", "#5d5252"]

    // colors = ["#e8e8e8", "#e0e1c0", "#d8da97", "#cfd26b", "#c6ca3d", "#bcc20c", "#c7c6e0", "#c7c6c0", "#c7c697", "#c7c66b", "#c6c63d", "#b9bf0b", "#a7a5d8", "#a7a5c0", "#a7a597", "#a7a56b", "#a7a53d", "#a7a50c", "#8884cf", "#8884c0", "#888497", "#88846b", "#88843d", "#88840c", "#6863c7", "#6863c0", "#686397", "#68636b", "#68633d", "#68630c", "#4943bf", "#4741bf", "#474197", "#47416b", "#47413d", "#47410c"]
    colors = ["#ebebeb", "#ead8cb", "#eac4aa", "#e9af87", "#e99964", "#e9823d", "#cccdde", "#cbbcbf", "#cbaaa0", "#ca9880", "#ca855e", "#c97139", "#acb0d1", "#aba1b4", "#ab9297", "#ab8379", "#ab7259", "#aa6136", "#8d92c5", "#8d86aa", "#8d7a8e", "#8c6c71", "#8c5f54", "#8c5033", "#6e75b8", "#6e6c9f", "#6e6285", "#6e576a", "#6e4c4e", "#6d412f", "#5159ac", "#505294", "#504a7c", "#504263", "#503a49", "#50312c"]
    // colors = ["#efefef", "#e8d0cd", "#e0b2aa", "#d79288", "#cf7164", "#c64d3b", "#dce4ed", "#d5c6cc", "#ceaaa9", "#c68b87", "#bf6c63", "#b64a3b", "#c8d9ea", "#c1bdc9", "#bba2a7", "#b38585", "#ad6762", "#a5463a", "#b4cde8", "#aeb3c8", "#a899a6", "#a27e84", "#9c6161", "#954339", "#a1c3e6", "#9ca9c5", "#9691a4", "#917782", "#8b5c60", "#853f39", "#8cb7e4", "#889fc3", "#8388a2", "#7e7081", "#7a575f", "#743b38"]


    n = Math.floor(Math.sqrt(colors.length))
    
    dataBivar = Object.assign(new Map(data.features.map(d=>d.properties).map((d, i) => [i, [d.IMP, d.pop_den]])),{title: ["Impermeability", "Pop. Density"]})
    yBivar = d3.scaleQuantile(Array.from(dataBivar.values(), d => d[1]), d3.range(n))
    xBivar = d3.scaleQuantile(Array.from(dataBivar.values(), d => d[0]), d3.range(n))

    console.log(dataBivar)

    

    labels = ["low", "", "", "", "", "high"]



    legendIndex = () => {
        const k = 70/n;
        // const arrow = 1;
        //font-family=sans-serif
        // <g transform="translate(-${k * n / 2},-${k * n / 2}) rotate(-45 ${k * n / 2},${k * n / 2})">
        return svg`<g class="legend">
        
          <marker id="arrow" markerHeight=10 markerWidth=10 refX=3 refY=3 orient=auto>
            <path d="M0,0L6,3L0,6Z" />
          </marker>
          ${d3.cross(d3.range(n), d3.range(n)).map(([i, j]) => svg`<rect width=${k} height=${k} x=${i * k} y=${(n - 1 - j) * k} fill=${colors[j * n + i]}>
            <title>${dataBivar.title[0]}${labels[j] && ` (${labels[j]})`}
      ${dataBivar.title[1]}${labels[i] && ` (${labels[i]})`}</title>
          </rect>`)}
          <line marker-end="url(#arrow)" x1=0 x2=${n * k} y1=${n * k} y2=${n * k} stroke=black stroke-width=1.5 />
          <line marker-end="url(#arrow)" y2=0 y1=${n * k} stroke=black stroke-width=1.5 />
          <line marker-end="url(#arrow)" x1=0 x2=${n * k-2} y1=${n * k} y2=${n-4} stroke=black stroke-width=1.5 opacity=0.3 stroke-dasharray="4 3" />
          <text font-weight="bold" dy="0.71em" transform="rotate(90) translate(${n / 2 * k},6)" text-anchor="middle">${dataBivar.title[0]}</text>
          <text font-weight="bold" dy="0.71em" transform="translate(${n / 2 * k},${n * k + 6})" text-anchor="middle">${dataBivar.title[1]}</text>
          <text font-weight="bold" dy="0.71em" transform="rotate(-45) translate(${0},${n * k - 30})" text-anchor="middle" opacity=0.3 >Hazard</text>
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
        minZoom: 9.8
      });
    // }

    // var mq = window.matchMedia( "(min-width: 420px)" );

    // if (mq.matches){
    //     map.setCenter([-123.4807, 49.2767]); //set map zoom level for desktop size
    // } else {
    //     map.setCenter([
    //       config.lng,
    //       config.lat,
    //     ]); //set map zoom level for mobile size
    // };
    
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
      const aLevel = impPop>10?"very high":
               (impPop>8)&&(impPop<=10)?"high":
               (impPop>4)&&(impPop<=8)?"average":
               (impPop>1)&&(impPop<=4)?"low":
               (impPop<=1)?"very low":""
       
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
             .style("background-color", "#f4f4f2")
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
  
    const dim = 100
    const svg = d3
      // .select(mapContainer)
      .select("#bivmap")
      .append("svg")
        .attr('width', dim)
        .attr('height', dim)
        .style('position', 'absolute')
        .style('z-index', 0)
        .attr("id", "legend")
        // .style("transform", `translate(45px, 100px)`)
      
    const leg = svg.append("g")
      //   .attr("height", height)
      // .attr("width", width);
      // .style("overflow", "visible")
                // .attr('transform', `translate(${0}, ${marginTop+20})`)
    
    leg.append(legendIndex)
    .style("transform", `translate(20px, 10px)`)
        
              
              // .attr("transform", `rotate(45)`)
              // .attr("transform", `rotate(45), translate(${170},${80})`)
    //           // .attr("transform", `rotate(45), translate(${100},${0})`)
    //           .attr("class", "bivlegend")
          // .attr("transform", `rotate(45), translate(${700},${-400})`);
  
    const titleCont = d3
          .select("#bivmap")
          .append("div")
          .attr('id', "titleContainer")

    const title = //d3
      // .select("#bivmap")
      // .append("div")
      //  .attr('width', dim)
      // .attr('height', dim)
      titleCont.append("text")
      .text("FLOOD-HAZARD LOCATOR")
      // .style("transform", "translate(20px,30px)")
        .attr("class", "mapTitle")
        .style('position', 'absolute')
  
    const subTitle = //d3
      // .select("#bivmap")
      // .append("div")
      //  .attr('width', dim)
      // .attr('height', dim)
      titleCont.append("text")
      .text("Mapping Flood Hazard in the Vancouver Metropolitan Region")
      // .style("transform", "translate(20px,70px)")
        .attr("class", "mapSubTitle")
        .style('position', 'absolute')
        
    const info = subTitle.append('tspan')
                          .html(" &#9432")
                          .attr("id", "infoPoint")
                          // .on("mouseover", (event, d) => d3.select(this).attr("font-weight", 900))
                          .on("click", function(event, d) {
                            // toolTipScale.domain([0, -90])
                            // console.log(d)
                            return showInfo(event, d)
                          })

    // const circle = 
    // titleCont.append("circle")
    //           .attr("cx", 200)
    //           .attr("cy", 200)
    //           .attr("r", 4)
    //           .attr("stroke", "black")
    //           .attr("fill", none)
  
    const credit = //d3
      // .select("#bivmap")
      // .append("div")
      //  .attr('width', dim)
      // .attr('height', dim)
      titleCont.append("html")
      .html("by <a href='https://www.leonardonicoletti.com/' style='text-decoration:underline; color:black' target='_blank'><b>LEONARDO NICOLETTI</b></a>")
      // .style("transform", "translate(10px,100px)")
        .attr("class", "mapCredit")
        .style('position', 'absolute')
  
    
}

function renderMapbox(map, dataColored, colorExpr) {

var baseWidth = 0.1; // 20px
var baseZoom = 11.1; // zoom 10

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
        'line-opacity':0.4,
        "line-width": {
          "type": "exponential",
          "base": 2,
          "stops": [
              [0, baseWidth * Math.pow(2, (0 - baseZoom))],
              [24, baseWidth * Math.pow(2, (24 - baseZoom))]
          ]
      },
        // 'line-width': 0.1
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
map.on('click', layerId, (e) => {
  showTooltip(map, e)
});
    
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

function showInfo(event, d){

      console.log(event.pageX)
      tooltip
      .transition()
      .duration(0)
      .style("opacity", 1)
      
      tooltip
      .html(`In light of the flooding events that recently occured in British Columbia, 
            this map is a data-driven tool for identifying areas within the <b>Greater Vancouver Region</b>
            where <b>flood hazard</b> may potentially be more severe during extreme flood events. <br><br>This map
            combines data on ground impermeability from 
            <a href='http://www.metrovancouver.org/data/Data/EcoHealthIndicators-CanopyandImperviousness/MVCCISPPACensusBlock2014rel2019.zip' 
            style='text-decoration:underline; color:black' target='_blank'><b>Metro Vancouver</b></a> and data on population 
            density from <a href='https://www12.statcan.gc.ca/census-recensement/index-eng.cfm' 
            style='text-decoration:underline; color:black' target='_blank'><b>Statistics Canada</b></a> to compute a simple index of <i>Flood Hazard</i> for 
            each census block of the Greater Vancouver Region. According to this index, flood hazard is 
            highest in areas where both ground impermeability
            and population density are high. In contrast, areas where population density is high but ground
            impermeability is low or where population density is low but ground impermeability is high are
            categorized as low hazard areas by this index.<br><br>
            Of course, more elements could be incorporated to improve the accuracy of this index, so this
            map is meant to serve as an educational tool only and should not be used to make conclusions 
            on how at-risk your area is. Nonetheless, it can provide high level insight for planners as to
            which areas may deserve more attention during extreme flood events.`)

      .attr("class", "infoText")
      .style("background", "#f4f4f2")
      .style("color", "black")
      // .style("border", "grey")
      .style("left", event.clientX - 245 + "px")
      .style("top", event.clientY + 10 + "px")
      .style("z-index", 1);
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


d3.select("#bivmap").on("click", (event, d)=>tooltip.style("opacity", 0))

tooltip = d3
  .select("#bivmap")
  .append("div")
  .attr("class", "tooltip")
  // .style("font-size", "10pt")
  // .style("font-family", "Lato")
  .style("position", "absolute")
  .style("text-align", "left")
  .style("width", "auto")
  .style("height", "auto")
  .style("padding", "5px")
  .style("max-width", "250px")
  // .style("background", "black")
  .attr("stroke", "white")
  .style("pointer-events", "none")
  .style("opacity", 0)

svg = template(function(string) {
    var root = document.createElementNS("http://www.w3.org/2000/svg", "g");
    root.innerHTML = string.trim();
    return root;
  }, function() {
    return document.createElementNS("http://www.w3.org/2000/svg", "g");
  });