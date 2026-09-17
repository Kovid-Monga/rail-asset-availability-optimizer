/* ==========================================================================
 * LIGHTWEIGHT ISOMETRIC SCENE (lazy-loaded, one page only)
 * A restrained 3D hero: corridor, stations, glowing active block, one moving
 * train. Deliberately not a game — the schematic SVG map carries the detail.
 * ========================================================================== */

import { useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import type { Mesh } from "three"
import type { NetworkResponse } from "@/types"

const TRAFFIC_HEX = { High: "#C0392B", Medium: "#C2610F", Low: "#1E7D45" } as const
const SPAN = 18 // world units across the corridor

function Train({ speed = 0.08 }: { speed?: number }) {
	const ref = useRef<Mesh>(null)
	useFrame((state) => {
		if (!ref.current) return
		const t = (state.clock.getElapsedTime() * speed) % 1
		ref.current.position.x = -SPAN / 2 + t * SPAN
	})
	return (
		<mesh ref={ref} position={[-SPAN / 2, 0.42, 0]} castShadow>
			<boxGeometry args={[1.5, 0.5, 0.6]} />
			<meshStandardMaterial color="#1D4ED8" emissive="#1D4ED8" emissiveIntensity={0.35} />
		</mesh>
	)
}

function ActiveBlock({ x, width }: { x: number; width: number }) {
	const ref = useRef<Mesh>(null)
	useFrame((state) => {
		if (!ref.current) return
		const pulse = 0.25 + Math.sin(state.clock.getElapsedTime() * 2) * 0.12
		;(ref.current.material as { opacity: number }).opacity = pulse
	})
	return (
		<mesh ref={ref} position={[x, 0.6, 0]}>
			<boxGeometry args={[width, 1.2, 1.6]} />
			<meshStandardMaterial color="#0E7C86" transparent opacity={0.3} />
		</mesh>
	)
}

export default function Railway3DScene({
	network,
	focusedSection,
}: {
	network: NetworkResponse
	focusedSection?: string | null
}) {
	const n = Math.max(1, network.sections.length)
	const segW = SPAN / n

	return (
		<div style={{ height: 320 }} className="overflow-hidden rounded-[10px] border border-line bg-canvas">
			<Canvas camera={{ position: [13, 11, 15], fov: 38 }} dpr={[1, 1.6]}>
				<ambientLight intensity={0.55} />
				<directionalLight position={[8, 14, 6]} intensity={1.1} />

				{/* ground */}
				<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
					<planeGeometry args={[34, 16]} />
					<meshStandardMaterial color="#1a1c1f" />
				</mesh>

				{/* section rails */}
				{network.sections.map((sec, i) => {
					const x = -SPAN / 2 + segW * i + segW / 2
					const dim = Boolean(focusedSection) && focusedSection !== sec.id
					return (
						<group key={sec.id}>
							<mesh position={[x, 0.08, 0]}>
								<boxGeometry args={[segW * 0.94, 0.16, 1.1]} />
								<meshStandardMaterial
									color={TRAFFIC_HEX[sec.traffic]}
									transparent
									opacity={dim ? 0.3 : 1}
									emissive={TRAFFIC_HEX[sec.traffic]}
									emissiveIntensity={focusedSection === sec.id ? 0.5 : 0.12}
								/>
							</mesh>
							{sec.active_block ? <ActiveBlock x={x} width={segW * 0.9} /> : null}
						</group>
					)
				})}

				{/* stations */}
				{network.stations.map((s, i) => {
					const x = -SPAN / 2 + (SPAN / Math.max(1, network.stations.length - 1)) * i
					return (
						<mesh key={s.id} position={[x, 0.5, 1.5]}>
							<cylinderGeometry args={[0.26, 0.26, 1, 12]} />
							<meshStandardMaterial color="#f0efed" />
						</mesh>
					)
				})}

				<Train />
				<OrbitControls enablePan={false} minDistance={12} maxDistance={30} maxPolarAngle={Math.PI / 2.3} />
			</Canvas>
		</div>
	)
}
