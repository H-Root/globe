import Globe from "globe.gl";
import { data } from "./ne_110m_admin_0_countries";
import * as turf from "@turf/turf";

// global state
let selected = { lat: 0, lng: 0, name: "" };

// Elements
const MarkerSvg = (lat, lng) => `<svg id="animate" viewBox="-4 0 36 36">
    <path data-lat="${lat}" data-lng="${lng}" fill="currentColor" d="M14,0 C21.732,0 28,5.641 28,12.6 C28,23.963 14,36 14,36 C14,36 0,24.064 0,12.6 C0,5.641 6.268,0 14,0 Z"></path>
  </svg>`;

const Button = (lat, lng, name) =>
	`<button class="go-btn" data-lat="${lat}" data-lng="${lng}" data-name="${name}">Go To ${name}</button>`;

// todo
// ? custom label color
// ? custom label size

// Coords for labels and navigation
const cords = [
	{ lat: 40.71427, long: -74.00597, name: "New York" },
	{ lat: 34.88902, long: 37, name: "Tartous" },
	{ lat: 25.0657, long: 55.17128, name: "Dubai" },
	{ lat: 45.46427, long: 9.18951, name: "Milan" },
	{ lat: 50.11552, long: 8.68417, name: "Frankfurt" },
	{ lat: 51.50853, long: -0.12574, name: "London" },
	{ lat: 55.75222, long: 37.61556, name: "Moscow" },
];

// Reshaping data
const gData = cords.map((cord) => ({
	lat: cord.lat,
	lng: cord.long,
	size: 30,
	color: "#317bfe",
}));

const handleUpdateGlobe = (d = { lat: 0, lng: 0 }) => {
	world
		.polygonAltitude((dd) => {
			if (d.lat) {
				const point = turf.point([d.lng, d.lat]);
				const isInside = turf.booleanPointInPolygon(point, dd);

				if (isInside) {
					return 0.04;
				}
				return 0.009;
			}

			return 0.009;
		})
		.polygonCapColor((dd) => {
			if (d.lat) {
				const point = turf.point([d.lng, d.lat]);
				const isInside = turf.booleanPointInPolygon(point, dd);

				if (isInside) {
					return "#fe3c3b";
				}
				return "#10b650";
			} else {
				return "#10b650";
			}
		});
};

const resizer = () => {
	if (window.innerWidth > 768) {
		world.width((window.innerWidth / 3) * 2);
		world.height(window.innerHeight);
	} else {
		world.width(window.innerWidth);
	}
};

const renderButtons = () => {
	const btnContainer = document.getElementById("fill-btns");
	btnContainer.innerHTML = cords
		.map((cord) => {
			return Button(cord.lat, cord.long, cord.name);
		})
		.join("");
};

const renderer = () => {
	const world = Globe();

	const btn = document.querySelectorAll(".go-btn");

	world
		.lights([])
		.globeImageUrl("//unpkg.com/three-globe/example/img/earth-night.jpg")
		.showAtmosphere(false)
		.polygonsData(data.features)
		.lineHoverPrecision(0)
		.polygonCapColor(() => "#10b650")
		.polygonAltitude(0.009)
		.polygonSideColor(() => "#00000000")
		.backgroundColor("#f00")
		.polygonStrokeColor(() => "#111")
		.htmlElementsData(gData)
		.htmlElement((d) => {
			const el = document.createElement("div");
			el.innerHTML = MarkerSvg(d.lat, d.lng);
			el.style.color = d.color;
			el.style.width = `${d.size}px`;

			el.style["pointer-events"] = "auto";
			el.style.cursor = "pointer";
			el.onclick = () => {
				world.resumeAnimation();
				btn.forEach((item) => (item.disabled = true));

				if (selected.lat == d.lat && selected.lng == d.lng) {
					world.pointOfView(
						{
							lat: d.lat,
							lng: d.lng,
							altitude: 2,
						},
						1000
					);
					handleUpdateGlobe({ lat: 0, lng: 0 });
					setTimeout(() => {
						btn.forEach((item) => (item.disabled = null));
					}, 1000);
					selected = {};
				} else {
					world.resumeAnimation();
					world.pointOfView(
						{
							lat: d.lat,
							lng: d.lng,
							altitude: 1,
						},
						1000
					);
					selected = {
						lat: d.lat,
						lng: d.lng,
					};
					handleUpdateGlobe(selected);
					setTimeout(() => {
						btn.forEach((item) => (item.disabled = null));
						world.pauseAnimation();
					}, 1000);
				}
			};

			return el;
		})(document.getElementById("globeViz"));

	resizer();
	const globeMaterial = world.globeMaterial();
	globeMaterial.transparent = true;
	globeMaterial.opacity = 1;

	world.controls().autoRotate = true;
	world.controls().autoRotateSpeed = 1.8;
	world.controls().enableZoom = false;
};

//#region button mapper
const mapButtons = () => {
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
				handleUpdateGlobe({ lat: 0, lng: 0 });

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
				handleUpdateGlobe(selected);
				setTimeout(() => {
					btn.forEach((item) => (item.disabled = null));
					world.pauseAnimation();
				}, 1000);
			}
		});
	});
};
//#endregion button mapper

const init = () => {
	// render navigate around the world buttons
	renderButtons();
	// webGl renderer and globe configs
	renderer();
	// adding event listeners over the rendered buttons
	mapButtons();
	// listening to window resize to resize the globe
	window.addEventListener("resize", () => {
		resizer();
	});
};

init();
