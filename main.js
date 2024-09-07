import Globe from "globe.gl";

// import * as d3 from "d3";
// const colorScale = d3.scaleSequentialSqrt(d3.interpolateYlOrRd);
// const getVal = (feat) =>
// 	feat.properties.GDP_MD_EST / Math.max(1e5, feat.properties.POP_EST);

const markerSvg = `<svg viewBox="-4 0 36 36">
    <path fill="currentColor" d="M14,0 C21.732,0 28,5.641 28,12.6 C28,23.963 14,36 14,36 C14,36 0,24.064 0,12.6 C0,5.641 6.268,0 14,0 Z"></path>
    <circle fill="black" cx="14" cy="14" r="7"></circle>
  </svg>`;

const cords = [
  { lat: 40.71427, long: -74.00597, name: "New York" },
	{ lat: 38.89511, long: -77.03637, name: "Washington D.C." },
	{ lat: 34.88902, long: 35.88659, name: "Tartous" },
	{ lat: 25.0657, long: 55.17128, name: "Dubai" },
	{ lat: 25.33737, long: 55.41206, name: "Sharjah" },
];

const gData = cords.map((cord) => ({
	lat: cord.lat,
	lng: cord.long,
	size: 30,
	color: ["red", "white", "blue", "green"][Math.round(Math.random() * 3)],
}));

fetch("./ne_110m_admin_0_countries.geojson")
	.then((res) => res.json())
	.then((countries) => {
		const world = Globe()
			.lights([])
			.globeImageUrl("//unpkg.com/three-globe/example/img/earth-night.jpg")
			.atmosphereColor("#00000000")
			.showAtmosphere(false)

			.polygonsData(countries.features)
			.lineHoverPrecision(0)

			// .polygonCapColor("#0f0")

			.polygonCapColor(() => "#0f0")

			.polygonAltitude(0.009)

			// .polygonCapColor((feat) => colorScale(getVal(feat)))
			.polygonSideColor(() => "#00000000")
			.backgroundColor("#000")
			// .polygonLabel(
			// 	({ properties: d }) => `
			//     <b>${d.ADMIN} (${d.ISO_A2}):</b> <br />
			//     GDP: <i>${d.GDP_MD_EST}</i> M$<br/>
			//     Population: <i>${d.POP_EST}</i>
			//   `
			// )
			.onPolygonHover((hoverD) =>
				world
					.polygonAltitude((d) => (d === hoverD ? 0.04 : 0.009))
					.polygonCapColor((d) =>
						// d === hoverD ? "steelblue" : colorScale(getVal(d))
						d === hoverD ? "steelblue" : "#0f0"
					)
			)
			.polygonStrokeColor(() => "#111")
			.htmlElementsData(gData)
			.htmlElement((d) => {
				const el = document.createElement("div");
				el.innerHTML = markerSvg;
				el.style.color = d.color;
				el.style.width = `${d.size}px`;

				el.style["pointer-events"] = "auto";
				el.style.cursor = "pointer";
				el.onclick = () => console.info(d);
				return el;
			})(document.getElementById("globeViz"));

		const globeMaterial = world.globeMaterial();
		// globeMaterial.alphaHash = true
		globeMaterial.transparent = true;
		globeMaterial.opacity = 0.9;
	});
