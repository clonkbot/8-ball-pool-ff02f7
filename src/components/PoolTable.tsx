import { useRef } from 'react'
import { RigidBody, CuboidCollider } from '@react-three/rapier'
import * as THREE from 'three'

export function PoolTable() {
  const feltColor = '#1a4d2e'
  const railColor = '#4a2c1a'
  const cushionColor = '#2d5a3d'

  const tableWidth = 2.2
  const tableLength = 1.1
  const tableHeight = 0.1
  const railHeight = 0.08
  const railWidth = 0.12
  const pocketRadius = 0.07

  // Pocket positions
  const pockets: [number, number][] = [
    [-tableWidth / 2, -tableLength / 2], // bottom left
    [0, -tableLength / 2 - 0.02],         // bottom center
    [tableWidth / 2, -tableLength / 2],  // bottom right
    [-tableWidth / 2, tableLength / 2],  // top left
    [0, tableLength / 2 + 0.02],          // top center
    [tableWidth / 2, tableLength / 2],   // top right
  ]

  return (
    <group>
      {/* Main table body */}
      <RigidBody type="fixed" colliders={false}>
        {/* Table surface (felt) */}
        <mesh position={[0, -0.05, 0]} receiveShadow>
          <boxGeometry args={[tableWidth + railWidth * 2, tableHeight, tableLength + railWidth * 2]} />
          <meshStandardMaterial color={railColor} roughness={0.8} />
        </mesh>

        {/* Playing surface */}
        <mesh position={[0, 0.001, 0]} receiveShadow>
          <boxGeometry args={[tableWidth, 0.01, tableLength]} />
          <meshStandardMaterial color={feltColor} roughness={0.9} />
        </mesh>

        {/* Table surface collider */}
        <CuboidCollider
          args={[tableWidth / 2, 0.05, tableLength / 2]}
          position={[0, -0.05, 0]}
          friction={0.8}
          restitution={0.2}
        />
      </RigidBody>

      {/* Rails / Cushions */}
      <RigidBody type="fixed" colliders={false}>
        {/* Top rail - left section */}
        <mesh position={[-tableWidth / 4 - 0.15, railHeight / 2, tableLength / 2 + railWidth / 4]} castShadow receiveShadow>
          <boxGeometry args={[tableWidth / 2 - pocketRadius * 3, railHeight, railWidth / 2]} />
          <meshStandardMaterial color={railColor} roughness={0.6} />
        </mesh>
        <CuboidCollider
          args={[(tableWidth / 2 - pocketRadius * 3) / 2, railHeight / 2, 0.03]}
          position={[-tableWidth / 4 - 0.15, railHeight / 2, tableLength / 2 + 0.03]}
          restitution={0.85}
          friction={0.3}
        />

        {/* Top rail - right section */}
        <mesh position={[tableWidth / 4 + 0.15, railHeight / 2, tableLength / 2 + railWidth / 4]} castShadow receiveShadow>
          <boxGeometry args={[tableWidth / 2 - pocketRadius * 3, railHeight, railWidth / 2]} />
          <meshStandardMaterial color={railColor} roughness={0.6} />
        </mesh>
        <CuboidCollider
          args={[(tableWidth / 2 - pocketRadius * 3) / 2, railHeight / 2, 0.03]}
          position={[tableWidth / 4 + 0.15, railHeight / 2, tableLength / 2 + 0.03]}
          restitution={0.85}
          friction={0.3}
        />

        {/* Bottom rail - left section */}
        <mesh position={[-tableWidth / 4 - 0.15, railHeight / 2, -tableLength / 2 - railWidth / 4]} castShadow receiveShadow>
          <boxGeometry args={[tableWidth / 2 - pocketRadius * 3, railHeight, railWidth / 2]} />
          <meshStandardMaterial color={railColor} roughness={0.6} />
        </mesh>
        <CuboidCollider
          args={[(tableWidth / 2 - pocketRadius * 3) / 2, railHeight / 2, 0.03]}
          position={[-tableWidth / 4 - 0.15, railHeight / 2, -tableLength / 2 - 0.03]}
          restitution={0.85}
          friction={0.3}
        />

        {/* Bottom rail - right section */}
        <mesh position={[tableWidth / 4 + 0.15, railHeight / 2, -tableLength / 2 - railWidth / 4]} castShadow receiveShadow>
          <boxGeometry args={[tableWidth / 2 - pocketRadius * 3, railHeight, railWidth / 2]} />
          <meshStandardMaterial color={railColor} roughness={0.6} />
        </mesh>
        <CuboidCollider
          args={[(tableWidth / 2 - pocketRadius * 3) / 2, railHeight / 2, 0.03]}
          position={[tableWidth / 4 + 0.15, railHeight / 2, -tableLength / 2 - 0.03]}
          restitution={0.85}
          friction={0.3}
        />

        {/* Left rail */}
        <mesh position={[-tableWidth / 2 - railWidth / 4, railHeight / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[railWidth / 2, railHeight, tableLength - pocketRadius * 4]} />
          <meshStandardMaterial color={railColor} roughness={0.6} />
        </mesh>
        <CuboidCollider
          args={[0.03, railHeight / 2, (tableLength - pocketRadius * 4) / 2]}
          position={[-tableWidth / 2 - 0.03, railHeight / 2, 0]}
          restitution={0.85}
          friction={0.3}
        />

        {/* Right rail */}
        <mesh position={[tableWidth / 2 + railWidth / 4, railHeight / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[railWidth / 2, railHeight, tableLength - pocketRadius * 4]} />
          <meshStandardMaterial color={railColor} roughness={0.6} />
        </mesh>
        <CuboidCollider
          args={[0.03, railHeight / 2, (tableLength - pocketRadius * 4) / 2]}
          position={[tableWidth / 2 + 0.03, railHeight / 2, 0]}
          restitution={0.85}
          friction={0.3}
        />
      </RigidBody>

      {/* Pockets (visual only - collisions handled in PoolBalls) */}
      {pockets.map((pos, i) => (
        <mesh key={i} position={[pos[0], -0.02, pos[1]]}>
          <cylinderGeometry args={[pocketRadius, pocketRadius * 1.2, 0.08, 16]} />
          <meshStandardMaterial color="#0a0a0a" roughness={1} />
        </mesh>
      ))}

      {/* Decorative brass corners */}
      {[
        [-tableWidth / 2 - railWidth / 2, tableLength / 2 + railWidth / 2],
        [tableWidth / 2 + railWidth / 2, tableLength / 2 + railWidth / 2],
        [-tableWidth / 2 - railWidth / 2, -tableLength / 2 - railWidth / 2],
        [tableWidth / 2 + railWidth / 2, -tableLength / 2 - railWidth / 2],
      ].map((pos, i) => (
        <mesh key={`corner-${i}`} position={[pos[0], 0.02, pos[1]]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 0.04, 8]} />
          <meshStandardMaterial color="#c9a962" metalness={0.8} roughness={0.3} />
        </mesh>
      ))}

      {/* Leg system */}
      {[
        [-tableWidth / 2 - 0.05, -tableLength / 2 - 0.05],
        [tableWidth / 2 + 0.05, -tableLength / 2 - 0.05],
        [-tableWidth / 2 - 0.05, tableLength / 2 + 0.05],
        [tableWidth / 2 + 0.05, tableLength / 2 + 0.05],
      ].map((pos, i) => (
        <mesh key={`leg-${i}`} position={[pos[0], -0.35, pos[1]]} castShadow>
          <cylinderGeometry args={[0.05, 0.06, 0.6, 8]} />
          <meshStandardMaterial color={railColor} roughness={0.7} />
        </mesh>
      ))}

      {/* Floor */}
      <mesh position={[0, -0.65, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#0d1510" roughness={0.95} />
      </mesh>
    </group>
  )
}
