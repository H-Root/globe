import Globe from "globe.gl";
import { data } from "./ne_110m_admin_0_countries";

let selected = { lat: 0, lng: 0, name: "" };

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

const button = (lat, lng, name) =>
	`<button class="go-btn" data-lat="${lat}" data-lng="${lng}" data-name="${name}">Go To ${name}</button>`;

const btnContainer = document.getElementById("fill-btns");
btnContainer.innerHTML = cords
	.map((cord) => {
		return button(cord.lat, cord.long, cord.name);
	})
	.join("");

const gData = cords.map((cord) => ({
	lat: cord.lat,
	lng: cord.long,
	size: 30,
	color: "#317bfe",
	// color: ["red", "white", "blue", "green"][Math.round(Math.random() * 3)],
}));

const btn = document.querySelectorAll(".go-btn");

const world = Globe()
	.lights([])
	.globeImageUrl("//unpkg.com/three-globe/example/img/earth-night.jpg")
	// .atmosphereColor("#00000000")
	.showAtmosphere(false)

	.polygonsData(data.features)
	.lineHoverPrecision(0)

	// .polygonCapColor("#10b650")

	.polygonCapColor(() => "#10b650")

	.polygonAltitude(0.009)

	// .polygonCapColor((feat) => colorScale(getVal(feat)))
	.polygonSideColor(() => "#00000000")
	.backgroundColor("#00000000")
	// .polygonLabel(
	// 	({ properties: d }) => `
	//     <b>${d.ADMIN} (${d.ISO_A2}):</b> <br />
	//     GDP: <i>${d.GDP_MD_EST}</i> M$<br/>
	//     Population: <i>${d.POP_EST}</i>
	//   `
	// )
	.onPolygonHover((hoverD) =>
		world
			.polygonAltitude((d) => {
				return d === hoverD ? 0.04 : 0.009;
			})
			.polygonCapColor((d) =>
				// d === hoverD ? "steelblue" : colorScale(getVal(d))
				d === hoverD ? "#fe3c3b" : "#10b650"
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
		el.onclick = () => {
			world.pointOfView(
				{
					lat: d.lat,
					lng: d.lng,
					altitude: 0.9,
				},
				1000
			);
		};
		return el;
	})(document.getElementById("globeViz"));

window.addEventListener("resize", (event) => {
	world.width((event.target.innerWidth / 3) * 2);
	world.height(event.target.innerHeight);
});

const globeMaterial = world.globeMaterial();
globeMaterial.transparent = true;
globeMaterial.opacity = 0.6;

world.controls().autoRotate = true;
world.controls().autoRotateSpeed = 1.8;

btn.forEach((element) => {
	element.addEventListener("click", (e) => {
		btn.forEach((item) => (item.disabled = "true"));
		world.resumeAnimation();
		const temp = {
			lat: +e.target.getAttribute("data-lat"),
			lng: +e.target.getAttribute("data-lng"),
			name: +e.target.getAttribute("data-name"),
		};
		if (selected.lat === temp.lat && selected.lng === temp.lng) {
			world.pointOfView(
				{
					lat: temp.lat,
					lng: temp.lng,
					altitude: 2,
				},
				1000
			);
			selected = {};
			setTimeout(() => {
				btn.forEach((item) => (item.disabled = null));
				world.resumeAnimation();
			}, 1000);
		} else {
			// world.polygon
			selected.lat = temp.lat;
			selected.lng = temp.lng;
			world.pointOfView(
				{
					lat: temp.lat,
					lng: temp.lng,
					altitude: 1,
				},
				1000
			);
			setTimeout(() => {
				btn.forEach((item) => (item.disabled = null));
				world.pauseAnimation();
			}, 1000);
		}
		
	});
});
