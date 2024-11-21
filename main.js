import Globe from "globe.gl";
import { data } from "./ne_110m_admin_0_countries";
import * as turf from "@turf/turf";
import { AmbientLight } from "three";

//#region Elements & Constants
let selected = { lat: 0, lng: 0, name: "" };
const world = Globe({
	rendererConfig: {
		antialias: false,
		precision: "highp",
		powerPreference: "high-performance",
	},
});

const COLORS_COUNTRIES = "#bec5cb";
const COLOR_CURSOR = "#317bfe";
const SELECTED_COLOR = "#003882";
const RED_COLOR = "#b11116";
const FOCUSED_HEIGHT = 0.007;
const UN_FOCUS_HEIGHT = 0.007;
let ALTITUDE = 2;

const globe = document.getElementById("globe_wrapper");

// Elements
// ? Me: Mama I want React.js
// & Mama: We Have React.js At Home
// * React.js at home: ;(
const PHONE_ICON =
	'<svg xmlns="http://www.w3.org/2000/svg" width="15px" height="15px" viewBox="0 0 56 56"><path fill="currentColor" d="M39.156 50.934c4.078 0 6.774-1.102 9.164-3.774c.188-.187.352-.398.54-.586c1.406-1.57 2.062-3.117 2.062-4.593c0-1.688-.984-3.258-3.07-4.712l-6.82-4.734c-2.11-1.453-4.571-1.617-6.54.328l-1.804 1.805c-.54.539-1.008.563-1.547.234c-1.242-.797-3.797-3.023-5.532-4.757c-1.828-1.805-3.609-3.82-4.523-5.297c-.328-.54-.281-.985.258-1.524l1.781-1.805c1.969-1.968 1.805-4.453.352-6.538l-4.758-6.82c-1.43-2.087-3-3.048-4.688-3.071c-1.476-.024-3.023.656-4.593 2.062c-.211.188-.399.352-.61.516c-2.648 2.39-3.75 5.086-3.75 9.14c0 6.704 4.125 14.86 11.696 22.43c7.523 7.524 15.703 11.696 22.382 11.696m.024-3.61c-5.977.117-13.64-4.476-19.711-10.523c-6.117-6.094-10.922-14.016-10.805-19.992c.047-2.579.938-4.805 2.79-6.399c.14-.14.28-.258.444-.375c.68-.61 1.454-.937 2.11-.937c.703 0 1.312.257 1.758.96l4.547 6.82c.492.727.539 1.548-.188 2.274l-2.062 2.063c-1.641 1.617-1.5 3.586-.328 5.156c1.335 1.805 3.656 4.43 5.437 6.211c1.805 1.805 4.64 4.336 6.445 5.695c1.57 1.172 3.563 1.29 5.18-.328l2.062-2.062c.727-.727 1.524-.68 2.25-.211l6.82 4.547c.704.468.985 1.054.985 1.758c0 .68-.328 1.43-.96 2.132a5.82 5.82 0 0 1-.352.446c-1.617 1.828-3.844 2.718-6.422 2.765"/></svg>';
const EMAIL_ICON =
	'<svg xmlns="http://www.w3.org/2000/svg" width="15px" height="15px" viewBox="0 0 24 24"><path fill="currentColor" d="M5 5h13a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3m0 1c-.5 0-.94.17-1.28.47l7.78 5.03l7.78-5.03C18.94 6.17 18.5 6 18 6H5m6.5 6.71L3.13 7.28C3.05 7.5 3 7.75 3 8v9a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2V8c0-.25-.05-.5-.13-.72l-8.37 5.43Z"/></svg>';
const LOCATION_ICON =
	'<svg xmlns="http://www.w3.org/2000/svg" width="15px" height="15px" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path d="M12.56 20.82a.964.964 0 0 1-1.12 0C6.611 17.378 1.486 10.298 6.667 5.182A7.592 7.592 0 0 1 12 3c2 0 3.919.785 5.333 2.181c5.181 5.116.056 12.196-4.773 15.64Z"/><path d="M12 12a2 2 0 1 0 0-4a2 2 0 0 0 0 4Z"/></g></svg>';

const MarkerSvg = ({
	lat,
	lng,
	name,
	flag,
	type,
	phone,
	email,
	location,
	sub,
}) => `
<button class="infoButton" data-name="${sub}">
	<svg id="animate" viewBox="-4 0 36 36">
		<path 
			data-lat="${lat}" 
			data-lng="${lng}" 
			fill="${COLOR_CURSOR}" 
			d="M14,0 C21.732,0 28,5.641 28,12.6 C28,23.1 14,36 14,36 C14,36 0,24.064 0,12.6 C0,5.641 6.268,0 14,0 Z">
		</path>
	</svg>
	<div class="infoButton-container">
		<div class="infoButton-container-message" style="display: flex; flex-direction: column; gap: 10px; color: ${SELECTED_COLOR}">
			<div style="display: flex; gap: 10px">
				<img src="${flag}" alt="${name}" style="width: 40px; height: 40px; border-radius: 50%" />
				<div style="display: flex; flex-direction: column; gap: 10px;">
					<span style="font-weight: 700">${name}</span>
					<span style="font-style: italic">${type}</span>
				</div>
			</div>
			<div style="display: flex; flex-direction: column; gap: 5px">
				<span style="display: flex; gap: 5px; align-items: center">
					<span style="color: ${RED_COLOR}; stroke: none;">${PHONE_ICON}</span>
					<span>${phone}</span>
				</span>
				<span style="display: flex; gap: 5px; align-items: center">
					<span style="stroke: ${RED_COLOR}">${EMAIL_ICON}</span>
					<span>${email}</span>
				</span>
				<span style="display: flex; gap: 5px; align-items: center">
					<span style="color: ${RED_COLOR};">${LOCATION_ICON}</span>
					<span>${location}</span>
				</span>
			</div>
		</div>
	</div>
</button>
`;

const Button = (lat, lng, name, image) => `
<button class="go-btn" data-lat="${lat}" data-lng="${lng}" data-name="${name}">
	<img src="${image}" alt="${name}" data-lat="${lat}" data-lng="${lng}" data-name="${name}">
	<span data-lat="${lat}" data-lng="${lng}" data-name="${name}">${name}</span>
</button>
`;

const Select = (lat, lng, name) => `
<option class="go-option" data-lat="${lat}" data-lng="${lng}" data-name="${name}">
	${name}
</option>
`;
//#endregion Elements

const handleUpdateGlobe = (d = { lat: 0, lng: 0 }) => {
	world
		.polygonAltitude((dd) => {
			if (d.lat) {
				const point = turf.point([d.lng, d.lat]);
				const isInside = turf.booleanPointInPolygon(point, dd);

				if (isInside) {
					return FOCUSED_HEIGHT;
				}
				return UN_FOCUS_HEIGHT;
			}

			return UN_FOCUS_HEIGHT;
		})
		.polygonCapColor((dd) => {
			if (d.lat) {
				const point = turf.point([d.lng, d.lat]);
				const isInside = turf.booleanPointInPolygon(point, dd);

				if (isInside) {
					return SELECTED_COLOR;
				}
				return COLORS_COUNTRIES;
			} else {
				return COLORS_COUNTRIES;
			}
		});
};

// todo define media query
// ! don't forget to set world width and height accordingly
// & ALTITUDE is the the how far is the camera from the globe
const resizer = () => {
	console.log(globe.clientWidth);
	if (window.innerWidth < 768) {
		world.width(window.innerWidth);
		world.height(window.innerHeight / 2 + 100);
		world.pointOfView({
			altitude: ALTITUDE,
		});
		ALTITUDE = 2;
	} else {
		if (window.innerWidth < 900) {
			ALTITUDE = 3;
		} else if (window.innerWidth < 1100) {
			ALTITUDE = 2.5;
		} else {
			ALTITUDE = 2;
		}
		world.width(window.innerWidth / 2);
		world.height(window.innerHeight);
		world.pointOfView({
			altitude: ALTITUDE,
		});
	}
};

const handleButtonClick = (el, d) => {
	const btn = document.querySelectorAll(".go-btn");
	world.resumeAnimation();
	btn.forEach((item) => (item.disabled = true));

	const clickedPointer = document.querySelector(
		`button[data-name='${d.sub}'].infoButton`
	);

	const classes = clickedPointer.classList;
	const isActive = clickedPointer.classList.contains("infoButton_isActive");

	document.querySelectorAll(".infoButton").forEach((btn) => {
		btn.classList.remove("infoButton_isActive");
	});

	if (isActive) {
		classes.remove("infoButton_isActive");
	} else {
		classes.add("infoButton_isActive");
	}

	if (selected.lat == d.lat && selected.lng == d.lng) {
		world.pointOfView(
			{
				lat: d.lat,
				lng: d.lng,
				altitude: ALTITUDE,
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
				altitude: ALTITUDE,
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

const handleToggleMenus = (nodeData) => {
	setTimeout(() => {
		const selectedElement = document.querySelector(
			`button[data-name='${nodeData.name}'].infoButton`
		);

		const classes = selectedElement.classList;
		const isActive = selectedElement.classList.contains("infoButton_isActive");

		document.querySelectorAll(".infoButton").forEach((btn) => {
			btn.classList.remove("infoButton_isActive");
		});

		if (isActive) {
			classes.remove("infoButton_isActive");
		} else {
			classes.add("infoButton_isActive");
		}
	}, 1000);
};

const renderButtons = (cords) => {
	const btnContainer = document.getElementById("fill-btns");
	btnContainer.innerHTML = cords
		.map((cord) => {
			return Button(cord.latitude, cord.longitude, cord.name, cord.icon);
		})
		.join("");
};

const renderSelect = (cords) => {
	const btnContainer = document.getElementById("fill-select");
	btnContainer.innerHTML = [
		`<option value="">Select Location</option>`,
		...cords.map((cord) => {
			return Select(cord.latitude, cord.longitude, cord.name);
		}),
	].join("");
};

const renderer = (gData) => {
	world
		.lights([new AmbientLight(0xffffff, 2.5)])
		.globeImageUrl("/earth.png")
		.showAtmosphere(false)
		.polygonsData(data.features)
		.lineHoverPrecision(5)
		.polygonCapColor(() => COLORS_COUNTRIES)
		.polygonAltitude(UN_FOCUS_HEIGHT)
		.polygonSideColor(() => "#00000000")
		.backgroundColor("#00000000")
		.polygonStrokeColor(() => "#111")
		.htmlElementsData(gData)
		.htmlElement((d) => {
			const el = document.createElement("div");
			el.innerHTML = MarkerSvg({ ...d });

			el.style["pointer-events"] = "auto";
			el.style.cursor = "pointer";
			el.onclick = () => handleButtonClick(el, d);

			return el;
		})(document.getElementById("globeViz"));

	resizer();

	const globeMaterial = world.globeMaterial();
	globeMaterial.transparent = true;
	globeMaterial.opacity = 1;

	world.controls().enableZoom = false;

	const searchParams = new URLSearchParams(window.location.search);
	if (searchParams.get("animate") == "1") {
		world.controls().autoRotate = true;
		world.controls().autoRotateSpeed = 1.8;
	}
};

const mapButtons = () => {
	const btn = document.querySelectorAll(".go-btn");

	btn.forEach((element) => {
		element.addEventListener("click", (e) => {
			btn.forEach((item) => (item.disabled = "true"));
			world.resumeAnimation();

			const temp = {
				lat: +e.target.getAttribute("data-lat"),
				lng: +e.target.getAttribute("data-lng"),
				name: e.target.getAttribute("data-name"),
			};

			handleToggleMenus(temp);

			if (selected.lat === temp.lat && selected.lng === temp.lng) {
				world.pointOfView(
					{
						lat: temp.lat,
						lng: temp.lng,
						altitude: ALTITUDE,
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
						altitude: ALTITUDE,
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

const mapOptions = () => {
	const select = document.getElementById("fill-select");

	select.addEventListener("change", (e) => {
		console.log(e);
		select.disabled = "true";
		world.resumeAnimation();

		console.log(e.target.selectedOptions);

		const temp = {
			lat: +e.target.selectedOptions[0].getAttribute("data-lat"),
			lng: +e.target.selectedOptions[0].getAttribute("data-lng"),
			name: e.target.selectedOptions[0].getAttribute("data-name"),
		};

		handleToggleMenus(temp);

		if (selected.lat === temp.lat && selected.lng === temp.lng) {
			world.pointOfView(
				{
					lat: temp.lat,
					lng: temp.lng,
					altitude: ALTITUDE,
				},
				1000
			);
			selected = {};
			handleUpdateGlobe({ lat: 0, lng: 0 });

			setTimeout(() => {
				select.disabled = null;
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
					altitude: ALTITUDE,
				},
				1000
			);
			handleUpdateGlobe(selected);
			setTimeout(() => {
				select.disabled = null;
				world.pauseAnimation();
			}, 1000);
		}
	});

	// btn.forEach((element) => {
	// 	element.addEventListener("click", (e) => {
	// 		btn.forEach((item) => (item.disabled = "true"));
	// 		world.resumeAnimation();

	// 		const temp = {
	// 			lat: +e.target.getAttribute("data-lat"),
	// 			lng: +e.target.getAttribute("data-lng"),
	// 			name: e.target.getAttribute("data-name"),
	// 		};

	// 		handleToggleMenus(temp);

	// 		if (selected.lat === temp.lat && selected.lng === temp.lng) {
	// 			world.pointOfView(
	// 				{
	// 					lat: temp.lat,
	// 					lng: temp.lng,
	// 					altitude: ALTITUDE,
	// 				},
	// 				1000
	// 			);
	// 			selected = {};
	// 			handleUpdateGlobe({ lat: 0, lng: 0 });

	// 			setTimeout(() => {
	// 				btn.forEach((item) => (item.disabled = null));
	// 				world.resumeAnimation();
	// 			}, 1000);
	// 		} else {
	// 			// world.polygon
	// 			selected.lat = temp.lat;
	// 			selected.lng = temp.lng;
	// 			world.pointOfView(
	// 				{
	// 					lat: temp.lat,
	// 					lng: temp.lng,
	// 					altitude: ALTITUDE,
	// 				},
	// 				1000
	// 			);
	// 			handleUpdateGlobe(selected);
	// 			setTimeout(() => {
	// 				btn.forEach((item) => (item.disabled = null));
	// 				world.pauseAnimation();
	// 			}, 1000);
	// 		}
	// 	});
	// });
};

const init = (cords) => {
	fetch("https://sca.lucidly.dev/wp-json/custom/v1/options")
		.then(async (res) => {
			console.log(res);
			const data = await res.json();
			console.log(data.contact);
			renderButtons(data.contact);
			renderSelect(data.contact);
			const gData = data.contact.map((cord) => ({
				lat: cord.latitude,
				lng: cord.longitude,
				size: 30,
				color: COLOR_CURSOR,
				flag: cord.icon,
				name: cord.name,
				email: cord.email,
				phone: cord.phone,
				location: cord.location.title,
				type: cord.type,
				sub: cord.name,
			}));
			renderer(gData);
			resizer();
			window.addEventListener("resize", () => {
				world.resumeAnimation();
				resizer();
			});

			mapButtons();
			mapOptions();
		})
		.catch((err) => {
			console.log(err);
		});
};

init();
