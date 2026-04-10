import { useEffect, useRef, useEffectEvent } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { useQuery } from "@tanstack/react-query";
import Axios from "axios";
import { Spinner } from "@/components/ui/spinner";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { AlertCircle, Map as MapIcon } from "lucide-react";
import type { RoomOccupancyMap } from "@/types/map";
import type { FloorEntity } from "@/api/generated/models";

// Axios instance to fetch the SVG contents
const plainAxios = Axios.create();

// Options for react-zoom-pan-pinch
const DOUBLE_CLICK_OPTS = { mode: "reset" as const };
const PANNING_OPTS = { velocityDisabled: false };
const WRAPPER_STYLE: React.CSSProperties = { width: "100%", height: "100%" };
const CONTENT_STYLE: React.CSSProperties = {
	width: "100%",
	height: "100%",
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
};

interface FloorPlanViewerProps {
	floorPlanUrl: string | undefined;
	floor: FloorEntity | undefined;
	occupancy: RoomOccupancyMap;
	onRoomClick?: (
		roomDataAttribute: string,
		occupancy: RoomOccupancyMap[string] | undefined
	) => void;
	onStairwayClick?: (direction: "up" | "down") => void;
}

export function FloorPlanViewer({
	floorPlanUrl,
	floor,
	occupancy,
	onRoomClick,
	onStairwayClick,
}: FloorPlanViewerProps) {
	const svgContainerRef = useRef<HTMLDivElement>(null);
	const listenersAttachedRef = useRef(false);

	const injectedSvgRef = useRef<string | null>(null);

	// Fetch SVG content via React Query
	const {
		data: svgContent,
		isLoading: loading,
		error: fetchError,
	} = useQuery({
		queryKey: ["floor-plan-svg", floorPlanUrl],
		queryFn: async () => {
			const { data } = await plainAxios.get<string>(floorPlanUrl!, {
				responseType: "text",
			});

			return data;
		},
		enabled: !!floorPlanUrl,
		staleTime: 1000 * 60 * 10,
	});

	const error = fetchError ? (fetchError as Error).message : null;

	// Track mouse down position to distinguish clicks from drags
	const pointerDownPos = useRef<{ x: number; y: number } | null>(null);

	// Movement beyond this many px is a drag, not a click
	const DRAG_THRESHOLD = 5;

	const handleClick = useEffectEvent((e: MouseEvent) => {
		if (pointerDownPos.current) {
			const dx = Math.abs(e.clientX - pointerDownPos.current.x);
			const dy = Math.abs(e.clientY - pointerDownPos.current.y);

			if (dx > DRAG_THRESHOLD || dy > DRAG_THRESHOLD) {
				pointerDownPos.current = null;

				return;
			}
		}

		pointerDownPos.current = null;

		const target = e.target as SVGElement;

		const element = target.closest("[data-room], [data-direction]");

		if (!element) {
			return;
		}

		const roomAttribute = element.getAttribute("data-room");

		if (roomAttribute) {
			e.stopPropagation();

			onRoomClick?.(roomAttribute, occupancy[roomAttribute]);

			return;
		}

		const direction = element.getAttribute("data-direction");

		if (direction === "up" || direction === "down") {
			e.stopPropagation();

			onStairwayClick?.(direction);
		}
	});

	// Inject raw SVG when svgContent changes
	useEffect(() => {
		const container = svgContainerRef.current;

		if (!container || !svgContent) {
			return;
		}

		// Check if we already have this exact SVG content injected
		const svgInDom = container.querySelector("svg");

		if (injectedSvgRef.current === svgContent && svgInDom) {
			return;
		}

		container.innerHTML = svgContent;
		injectedSvgRef.current = svgContent;

		const svg = container.querySelector("svg");

		if (!svg) {
			return;
		}

		// Make SVG responsive
		svg.setAttribute("width", "100%");
		svg.setAttribute("height", "100%");
		svg.style.maxWidth = "100%";
		svg.style.maxHeight = "100%";

		// Setup room interactivity (hover effects)
		const masksLayer = svg.querySelector("#masks-layer");

		if (masksLayer) {
			const interactiveElements = masksLayer.querySelectorAll(
				"[data-room], [data-direction], [data-type]"
			);

			interactiveElements.forEach(element => {
				const svgElement = element as SVGElement;

				svgElement.style.cursor = "pointer";
				svgElement.style.fill = "transparent";
				svgElement.style.transition = "fill 0.15s ease";

				svgElement.addEventListener("mouseenter", () => {
					const dataType = svgElement.getAttribute("data-type");

					if (dataType) {
						svgElement.style.fill = "rgba(255, 255, 255, 0.2)";
						return;
					}

					const hasOccupancyData =
						svgElement.hasAttribute("data-has-info");

					if (!hasOccupancyData) {
						svgElement.style.fill = "rgba(255, 255, 255, 0.2)";
						return;
					}

					const isOccupied =
						svgElement.getAttribute("data-occupied") === "true";

					const hoverColor = isOccupied
						? "rgba(239, 68, 68, 0.4)"
						: "rgba(34, 197, 94, 0.4)";

					svgElement.style.fill = hoverColor;
				});

				svgElement.addEventListener("mouseleave", () => {
					const savedColor = svgElement.getAttribute(
						"data-occupancy-fill"
					);

					svgElement.style.fill = savedColor ?? "transparent";
				});
			});
		}

		// Staircase direction arrows
		// Injected once per SVG load so we can wire hover animation directly
		// to the mask element and the text reference in the same closure.
		const plansLayer = svg.querySelector("#plans-layer");

		if (masksLayer && plansLayer) {
			masksLayer.querySelectorAll("[data-direction]").forEach(element => {
				const direction = element.getAttribute("data-direction");

				if (direction !== "up" && direction !== "down") {
					return;
				}

				try {
					const boundingBox = (
						element as SVGGraphicsElement
					).getBBox();

					const centerX = boundingBox.x + boundingBox.width / 2;
					const centerY = boundingBox.y + boundingBox.height / 2;

					const fontSize =
						Math.min(boundingBox.width, boundingBox.height) * 0.45;

					// How far the arrow shifts in CSS pixel space on hover
					const hoverOffset = direction === "up" ? "-4px" : "4px";

					const text = document.createElementNS(
						"http://www.w3.org/2000/svg",
						"text"
					);

					text.setAttribute("x", String(centerX));
					text.setAttribute("y", String(centerY));

					text.setAttribute("text-anchor", "middle");
					text.setAttribute("dominant-baseline", "central");
					text.setAttribute("class", "injected-staircase-label");

					text.style.fontSize = `${fontSize}px`;
					text.style.fontWeight = "700";
					text.style.fill = "var(--primary)";
					text.style.pointerEvents = "none";
					text.style.userSelect = "none";
					text.style.transition = "transform 0.35s ease-in-out";

					text.textContent = direction === "up" ? "\u2191" : "\u2193";

					plansLayer.appendChild(text);

					// Animate the arrow in the direction it points on mask hover
					(element as SVGElement).addEventListener(
						"mouseenter",
						() => {
							text.style.transform = `translateY(${hoverOffset})`;
						}
					);

					(element as SVGElement).addEventListener(
						"mouseleave",
						() => {
							text.style.transform = "";
						}
					);
				} catch {
					// getBBox can fail if element is not rendered
				}
			});
		}
	}, [svgContent]);

	// Attach click handlers whenever SVG is available
	useEffect(() => {
		const container = svgContainerRef.current;

		if (!container || !svgContent) {
			return;
		}

		// Only attach listeners once per SVG injection to avoid duplicates
		if (listenersAttachedRef.current) {
			return;
		}

		const handlePointerDown = (e: PointerEvent) => {
			pointerDownPos.current = { x: e.clientX, y: e.clientY };
		};

		listenersAttachedRef.current = true;
		container.addEventListener("pointerdown", handlePointerDown);
		container.addEventListener("click", handleClick);

		return () => {
			listenersAttachedRef.current = false;
			container.removeEventListener("pointerdown", handlePointerDown);
			container.removeEventListener("click", handleClick);
		};
	}, [svgContent]);

	// Apply / update room colors & labels whenever occupancy changes
	useEffect(() => {
		const container = svgContainerRef.current;

		if (!container || !svgContent) {
			return;
		}

		const svg = container.querySelector("svg");

		if (!svg) {
			return;
		}

		const masksLayer = svg.querySelector("#masks-layer");

		if (!masksLayer) {
			return;
		}

		// Room coloring on masks layer
		const maskRooms = masksLayer.querySelectorAll(".rooms use[data-room]");

		maskRooms.forEach(roomElement => {
			const roomName = roomElement.getAttribute("data-room");

			if (!roomName) {
				return;
			}

			const info = occupancy[roomName];

			const fillColor = info
				? info.occupied
					? "rgba(239, 68, 68, 0.25)"
					: "rgba(34, 197, 94, 0.25)"
				: "transparent";

			(roomElement as SVGElement).style.fill = fillColor;

			// Save occupancy color so mouseleave handlers can restore it
			(roomElement as SVGElement).setAttribute(
				"data-occupancy-fill",
				fillColor
			);

			// Save occupancy state for hover color calculation
			(roomElement as SVGElement).setAttribute(
				"data-occupied",
				String(info?.occupied ?? false)
			);

			// Mark whether this room has occupancy data
			if (info) {
				(roomElement as SVGElement).setAttribute(
					"data-has-info",
					"true"
				);
			} else {
				(roomElement as SVGElement).removeAttribute("data-has-info");
			}

			(roomElement as SVGElement).style.stroke = "";
			(roomElement as SVGElement).style.strokeWidth = "";
		});

		// Room name labels (from plans-layer)
		const plansLayer = svg.querySelector("#plans-layer");

		if (!plansLayer) {
			return;
		}

		plansLayer
			.querySelectorAll(".injected-room-label")
			.forEach(element => element.remove());

		const roomGroups = plansLayer.querySelectorAll(".rooms g[data-room]");

		roomGroups.forEach(roomGroup => {
			const roomAttribute = roomGroup.getAttribute("data-room");

			if (!roomAttribute) {
				return;
			}

			const info = occupancy[roomAttribute];
			const displayName = info?.room.name ?? roomAttribute;

			const mainShape =
				roomGroup.querySelector("use") ??
				roomGroup.querySelector("path");

			if (!mainShape) {
				return;
			}

			try {
				const boundingBox = (mainShape as SVGGraphicsElement).getBBox();

				const centerX = boundingBox.x + boundingBox.width / 2;
				const centerY = boundingBox.y + boundingBox.height / 2;

				const text = document.createElementNS(
					"http://www.w3.org/2000/svg",
					"text"
				);

				text.setAttribute("x", String(centerX));
				text.setAttribute("y", String(centerY));

				text.setAttribute("text-anchor", "middle");
				text.setAttribute("dominant-baseline", "central");
				text.setAttribute("class", "injected-room-label");

				text.style.fontSize = `${Math.min(boundingBox.width, boundingBox.height) * 0.2}px`;
				text.style.fontWeight = "600";
				text.style.fill = "currentColor";
				text.style.pointerEvents = "none";
				text.style.userSelect = "none";

				text.textContent = displayName;

				plansLayer.appendChild(text);
			} catch {
				// getBBox can fail if element is not rendered
			}
		});

		// Room sub-labels (e.g. active class name) are intentionally omitted here.
		// They will be injected based on filter state once filters are implemented.
	}, [svgContent, occupancy]);

	if (loading) {
		return (
			<div className="flex-1 flex items-center justify-center">
				<div className="flex flex-col items-center gap-2">
					<Spinner className="h-8 w-8 text-primary" />

					<p className="text-xs text-muted-foreground font-medium">
						Loading floor plan...
					</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex-1 flex items-center justify-center">
				<Empty>
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<AlertCircle className="h-10 w-10 text-destructive/50" />
						</EmptyMedia>

						<EmptyTitle>Failed to load floor plan</EmptyTitle>

						<EmptyDescription>{error}</EmptyDescription>
					</EmptyHeader>
				</Empty>
			</div>
		);
	}

	if (!svgContent) {
		return (
			<div className="flex-1 flex items-center justify-center">
				<Empty>
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<MapIcon className="h-10 w-10 text-muted-foreground/50" />
						</EmptyMedia>

						<EmptyTitle>
							{floor
								? "No floor plan available"
								: "Select a floor"}
						</EmptyTitle>

						<EmptyDescription>
							{floor
								? "No floor plan has been uploaded for this floor yet."
								: "Select a building and floor to view the map."}
						</EmptyDescription>
					</EmptyHeader>
				</Empty>
			</div>
		);
	}

	return (
		<div className="flex-1 min-h-0 relative overflow-hidden">
			<TransformWrapper
				initialScale={1}
				minScale={0.3}
				maxScale={5}
				centerOnInit
				limitToBounds={false}
				doubleClick={DOUBLE_CLICK_OPTS}
				panning={PANNING_OPTS}>
				<TransformComponent
					wrapperStyle={WRAPPER_STYLE}
					contentStyle={CONTENT_STYLE}>
					<div
						ref={svgContainerRef}
						className="w-full h-full flex items-center justify-center [&_svg]:max-w-full [&_svg]:max-h-full [&_svg]:w-auto [&_svg]:h-auto"
					/>
				</TransformComponent>
			</TransformWrapper>
		</div>
	);
}
