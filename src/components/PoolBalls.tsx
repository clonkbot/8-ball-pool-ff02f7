import { useRef, useEffect, useMemo, useState } from 'react'
import { RigidBody, BallCollider } from '@react-three/rapier'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { RapierRigidBody } from '@react-three/rapier'
import type { GameState } from '../App'

interface PoolBallsProps {
  cueBallPosition: [number, number, number]
  setCueBallPosition: (pos: [number, number, number]) => void
  gameState: GameState
  power: number
  cueAngle: number
  pocketedBalls: number[]
  onBallPocketed: (ballNumber: number) => void
}

// Ball colors and stripe info
const ballData: { color: string; stripe: boolean; number: number }[] = [
  { color: '#ffffff', stripe: false, number: 0 },  // Cue ball
  { color: '#f5d742', stripe: false, number: 1 },  // Yellow solid
  { color: '#2563eb', stripe: false, number: 2 },  // Blue solid
  { color: '#dc2626', stripe: false, number: 3 },  // Red solid
  { color: '#7c3aed', stripe: false, number: 4 },  // Purple solid
  { color: '#f97316', stripe: false, number: 5 },  // Orange solid
  { color: '#16a34a', stripe: false, number: 6 },  // Green solid
  { color: '#7f1d1d', stripe: false, number: 7 },  // Maroon solid
  { color: '#1a1a1a', stripe: false, number: 8 },  // 8 ball (black)
  { color: '#f5d742', stripe: true, number: 9 },   // Yellow stripe
  { color: '#2563eb', stripe: true, number: 10 },  // Blue stripe
  { color: '#dc2626', stripe: true, number: 11 },  // Red stripe
  { color: '#7c3aed', stripe: true, number: 12 },  // Purple stripe
  { color: '#f97316', stripe: true, number: 13 },  // Orange stripe
  { color: '#16a34a', stripe: true, number: 14 },  // Green stripe
  { color: '#7f1d1d', stripe: true, number: 15 },  // Maroon stripe
]

// Triangle rack positions
function getRackPositions(): [number, number, number][] {
  const startX = -0.5
  const ballDiameter = 0.054
  const positions: [number, number, number][] = []

  // Row 0: 1 ball (apex)
  positions.push([startX, 0.03, 0])

  // Row 1: 2 balls
  positions.push([startX - ballDiameter, 0.03, ballDiameter / 2])
  positions.push([startX - ballDiameter, 0.03, -ballDiameter / 2])

  // Row 2: 3 balls (8 ball in center)
  positions.push([startX - ballDiameter * 2, 0.03, ballDiameter])
  positions.push([startX - ballDiameter * 2, 0.03, 0])
  positions.push([startX - ballDiameter * 2, 0.03, -ballDiameter])

  // Row 3: 4 balls
  positions.push([startX - ballDiameter * 3, 0.03, ballDiameter * 1.5])
  positions.push([startX - ballDiameter * 3, 0.03, ballDiameter * 0.5])
  positions.push([startX - ballDiameter * 3, 0.03, -ballDiameter * 0.5])
  positions.push([startX - ballDiameter * 3, 0.03, -ballDiameter * 1.5])

  // Row 4: 5 balls
  positions.push([startX - ballDiameter * 4, 0.03, ballDiameter * 2])
  positions.push([startX - ballDiameter * 4, 0.03, ballDiameter])
  positions.push([startX - ballDiameter * 4, 0.03, 0])
  positions.push([startX - ballDiameter * 4, 0.03, -ballDiameter])
  positions.push([startX - ballDiameter * 4, 0.03, -ballDiameter * 2])

  return positions
}

// Proper order for 8-ball rack (8-ball in center of row 3)
const rackOrder = [1, 9, 2, 10, 8, 11, 3, 12, 4, 13, 5, 14, 6, 15, 7]

export function PoolBalls({
  cueBallPosition,
  setCueBallPosition,
  gameState,
  power,
  cueAngle,
  pocketedBalls,
  onBallPocketed
}: PoolBallsProps) {
  const cueBallRef = useRef<RapierRigidBody>(null)
  const ballRefs = useRef<(RapierRigidBody | null)[]>([])
  const [shotFired, setShotFired] = useState(false)

  const rackPositions = useMemo(() => getRackPositions(), [])

  // Pocket positions for detection
  const pockets = useMemo(() => [
    [-1.1, -0.55],
    [0, -0.57],
    [1.1, -0.55],
    [-1.1, 0.55],
    [0, 0.57],
    [1.1, 0.55],
  ], [])

  // Handle shooting
  useEffect(() => {
    if (gameState === 'shooting' && !shotFired && cueBallRef.current) {
      const angle = cueAngle * (Math.PI / 180)
      const force = power * 0.15

      cueBallRef.current.applyImpulse(
        { x: -Math.cos(angle) * force, y: 0, z: Math.sin(angle) * force },
        true
      )
      setShotFired(true)
    }

    if (gameState === 'aiming') {
      setShotFired(false)
    }
  }, [gameState, power, cueAngle, shotFired])

  // Check for pocketed balls
  useFrame(() => {
    // Check cue ball
    if (cueBallRef.current) {
      const pos = cueBallRef.current.translation()
      setCueBallPosition([pos.x, pos.y, pos.z])

      for (const pocket of pockets) {
        const dist = Math.sqrt(
          Math.pow(pos.x - pocket[0], 2) + Math.pow(pos.z - pocket[1], 2)
        )
        if (dist < 0.08 || pos.y < -0.2) {
          // Reset cue ball position
          cueBallRef.current.setTranslation({ x: 0.6, y: 0.05, z: 0 }, true)
          cueBallRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true)
          cueBallRef.current.setAngvel({ x: 0, y: 0, z: 0 }, true)
          onBallPocketed(0)
          break
        }
      }
    }

    // Check numbered balls
    ballRefs.current.forEach((ref, i) => {
      if (!ref) return
      const ballNumber = rackOrder[i]
      if (pocketedBalls.includes(ballNumber)) return

      const pos = ref.translation()

      for (const pocket of pockets) {
        const dist = Math.sqrt(
          Math.pow(pos.x - pocket[0], 2) + Math.pow(pos.z - pocket[1], 2)
        )
        if (dist < 0.08 || pos.y < -0.2) {
          // Move ball far away (pocketed)
          ref.setTranslation({ x: 10, y: -5, z: i * 0.1 }, true)
          ref.setLinvel({ x: 0, y: 0, z: 0 }, true)
          ref.setAngvel({ x: 0, y: 0, z: 0 }, true)
          onBallPocketed(ballNumber)
          break
        }
      }
    })
  })

  return (
    <group>
      {/* Cue ball */}
      <RigidBody
        ref={cueBallRef}
        position={cueBallPosition}
        colliders={false}
        linearDamping={1.2}
        angularDamping={0.8}
        restitution={0.9}
        friction={0.4}
      >
        <BallCollider args={[0.025]} restitution={0.9} friction={0.4} />
        <mesh castShadow>
          <sphereGeometry args={[0.025, 32, 32]} />
          <meshStandardMaterial
            color="#ffffff"
            roughness={0.2}
            metalness={0.1}
          />
        </mesh>
      </RigidBody>

      {/* Numbered balls */}
      {rackPositions.map((pos, i) => {
        const ballNumber = rackOrder[i]
        const data = ballData[ballNumber]
        if (pocketedBalls.includes(ballNumber)) return null

        return (
          <RigidBody
            key={ballNumber}
            ref={(el) => { ballRefs.current[i] = el }}
            position={pos}
            colliders={false}
            linearDamping={1.2}
            angularDamping={0.8}
            restitution={0.9}
            friction={0.4}
          >
            <BallCollider args={[0.025]} restitution={0.9} friction={0.4} />
            <PoolBall
              color={data.color}
              stripe={data.stripe}
              number={ballNumber}
            />
          </RigidBody>
        )
      })}
    </group>
  )
}

interface PoolBallProps {
  color: string
  stripe: boolean
  number: number
}

function PoolBall({ color, stripe, number }: PoolBallProps) {
  const meshRef = useRef<THREE.Mesh>(null)

  // Create texture for ball number
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 256
    const ctx = canvas.getContext('2d')!

    if (stripe) {
      // White base with colored stripe
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, 256, 256)
      ctx.fillStyle = color
      ctx.fillRect(0, 64, 256, 128)
    } else {
      // Solid color
      ctx.fillStyle = color
      ctx.fillRect(0, 0, 256, 256)
    }

    // Number circle
    if (number > 0) {
      ctx.fillStyle = '#ffffff'
      ctx.beginPath()
      ctx.arc(128, 128, 40, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = '#000000'
      ctx.font = 'bold 48px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(number.toString(), 128, 132)
    }

    const tex = new THREE.CanvasTexture(canvas)
    tex.needsUpdate = true
    return tex
  }, [color, stripe, number])

  return (
    <mesh ref={meshRef} castShadow>
      <sphereGeometry args={[0.025, 32, 32]} />
      <meshStandardMaterial
        map={texture}
        roughness={0.25}
        metalness={0.1}
      />
    </mesh>
  )
}
