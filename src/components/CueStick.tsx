import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { GameState } from '../App'

interface CueStickProps {
  cueBallPosition: [number, number, number]
  angle: number
  power: number
  gameState: GameState
}

export function CueStick({ cueBallPosition, angle, power, gameState }: CueStickProps) {
  const groupRef = useRef<THREE.Group>(null)
  const stickRef = useRef<THREE.Mesh>(null)

  const angleRad = angle * (Math.PI / 180)
  const pullBack = power * 0.003 // Max 0.3 units pullback

  // Hide cue during shot
  const visible = gameState === 'aiming' || gameState === 'charging'

  useFrame(() => {
    if (!groupRef.current) return

    // Position group at cue ball
    groupRef.current.position.set(
      cueBallPosition[0],
      cueBallPosition[1],
      cueBallPosition[2]
    )

    // Rotate to face aim direction
    groupRef.current.rotation.y = -angleRad
  })

  if (!visible) return null

  return (
    <group ref={groupRef}>
      {/* Aim line */}
      <mesh rotation={[0, 0, Math.PI / 2]} position={[-0.5, 0, 0]}>
        <cylinderGeometry args={[0.002, 0.002, 1, 8]} />
        <meshBasicMaterial color="#c9a962" transparent opacity={0.4} />
      </mesh>

      {/* Cue stick */}
      <group position={[0.05 + pullBack, 0, 0]}>
        {/* Tip (white/blue) */}
        <mesh position={[0.01, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.006, 0.008, 0.02, 8]} />
          <meshStandardMaterial color="#87ceeb" roughness={0.6} />
        </mesh>

        {/* Ferrule (white) */}
        <mesh position={[0.03, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.008, 0.008, 0.02, 8]} />
          <meshStandardMaterial color="#f5f5f0" roughness={0.4} />
        </mesh>

        {/* Shaft (maple) */}
        <mesh position={[0.25, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.008, 0.012, 0.4, 8]} />
          <meshStandardMaterial color="#d4a574" roughness={0.5} />
        </mesh>

        {/* Wrap area */}
        <mesh position={[0.55, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.012, 0.014, 0.2, 8]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
        </mesh>

        {/* Butt (dark wood) */}
        <mesh position={[0.75, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.014, 0.016, 0.2, 8]} />
          <meshStandardMaterial color="#3d2817" roughness={0.6} />
        </mesh>

        {/* Butt cap (brass) */}
        <mesh position={[0.86, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.016, 0.016, 0.02, 8]} />
          <meshStandardMaterial color="#c9a962" metalness={0.8} roughness={0.3} />
        </mesh>
      </group>
    </group>
  )
}
