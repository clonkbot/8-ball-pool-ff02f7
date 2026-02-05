import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows, Text } from '@react-three/drei'
import { Physics } from '@react-three/rapier'
import { Suspense, useState, useCallback } from 'react'
import { PoolTable } from './components/PoolTable'
import { PoolBalls } from './components/PoolBalls'
import { CueStick } from './components/CueStick'
import { GameUI } from './components/GameUI'

export type GameState = 'aiming' | 'charging' | 'shooting' | 'waiting'
export type BallType = 'solid' | 'stripe' | null

export interface PlayerState {
  currentPlayer: 1 | 2
  player1Type: BallType
  player2Type: BallType
  player1Score: number
  player2Score: number
  gameOver: boolean
  winner: 1 | 2 | null
}

function App() {
  const [gameState, setGameState] = useState<GameState>('aiming')
  const [power, setPower] = useState(0)
  const [cueAngle, setCueAngle] = useState(0)
  const [cueBallPosition, setCueBallPosition] = useState<[number, number, number]>([0.6, 0.05, 0])
  const [pocketedBalls, setPocketedBalls] = useState<number[]>([])
  const [showInstructions, setShowInstructions] = useState(true)
  const [playerState, setPlayerState] = useState<PlayerState>({
    currentPlayer: 1,
    player1Type: null,
    player2Type: null,
    player1Score: 0,
    player2Score: 0,
    gameOver: false,
    winner: null
  })

  const handleBallPocketed = useCallback((ballNumber: number) => {
    setPocketedBalls(prev => {
      if (prev.includes(ballNumber)) return prev
      return [...prev, ballNumber]
    })

    setPlayerState(prev => {
      if (prev.gameOver) return prev

      // Ball 0 is cue ball - scratch!
      if (ballNumber === 0) {
        return {
          ...prev,
          currentPlayer: prev.currentPlayer === 1 ? 2 : 1
        }
      }

      // Ball 8 - game over logic
      if (ballNumber === 8) {
        const playerType = prev.currentPlayer === 1 ? prev.player1Type : prev.player2Type
        const playerScore = prev.currentPlayer === 1 ? prev.player1Score : prev.player2Score
        // Win if you've pocketed all your balls (7), lose otherwise
        const targetScore = 7
        if (playerScore >= targetScore) {
          return { ...prev, gameOver: true, winner: prev.currentPlayer }
        } else {
          return { ...prev, gameOver: true, winner: prev.currentPlayer === 1 ? 2 : 1 }
        }
      }

      const isSolid = ballNumber >= 1 && ballNumber <= 7
      const isStripe = ballNumber >= 9 && ballNumber <= 15
      const ballType: BallType = isSolid ? 'solid' : isStripe ? 'stripe' : null

      let newState = { ...prev }

      // Assign ball types on first pocket
      if (!prev.player1Type && !prev.player2Type && ballType) {
        if (prev.currentPlayer === 1) {
          newState.player1Type = ballType
          newState.player2Type = ballType === 'solid' ? 'stripe' : 'solid'
        } else {
          newState.player2Type = ballType
          newState.player1Type = ballType === 'solid' ? 'stripe' : 'solid'
        }
      }

      const currentPlayerType = prev.currentPlayer === 1 ? newState.player1Type : newState.player2Type

      // Check if player pocketed their own ball
      if (currentPlayerType === ballType) {
        if (prev.currentPlayer === 1) {
          newState.player1Score = prev.player1Score + 1
        } else {
          newState.player2Score = prev.player2Score + 1
        }
        // Player continues (don't switch)
      } else {
        // Wrong ball - switch players
        newState.currentPlayer = prev.currentPlayer === 1 ? 2 : 1
      }

      return newState
    })
  }, [])

  const handleShoot = useCallback(() => {
    if (gameState === 'aiming') {
      setGameState('charging')
    }
  }, [gameState])

  const handleRelease = useCallback(() => {
    if (gameState === 'charging' && power > 0) {
      setGameState('shooting')
      setTimeout(() => {
        setGameState('waiting')
        setTimeout(() => {
          setGameState('aiming')
          setPower(0)
        }, 2000)
      }, 100)
    }
  }, [gameState, power])

  const resetGame = useCallback(() => {
    setPocketedBalls([])
    setCueBallPosition([0.6, 0.05, 0])
    setGameState('aiming')
    setPower(0)
    setPlayerState({
      currentPlayer: 1,
      player1Type: null,
      player2Type: null,
      player1Score: 0,
      player2Score: 0,
      gameOver: false,
      winner: null
    })
  }, [])

  return (
    <div className="w-screen h-screen bg-[#0a0f0d] overflow-hidden relative">
      {/* Ambient texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30 z-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          mixBlendMode: 'overlay'
        }}
      />

      {/* 3D Canvas */}
      <Canvas
        shadows
        camera={{ position: [0, 2.5, 2.5], fov: 50 }}
        className="touch-none"
      >
        <color attach="background" args={['#0a0f0d']} />
        <fog attach="fog" args={['#0a0f0d', 3, 8]} />

        <Suspense fallback={null}>
          <ambientLight intensity={0.15} />
          <spotLight
            position={[0, 3, 0]}
            angle={0.6}
            penumbra={0.5}
            intensity={2}
            castShadow
            shadow-mapSize={[2048, 2048]}
            color="#fff5e6"
          />
          <pointLight position={[-2, 2, 2]} intensity={0.3} color="#c9a962" />
          <pointLight position={[2, 2, -2]} intensity={0.3} color="#c9a962" />

          <Physics gravity={[0, -9.81, 0]}>
            <PoolTable />
            <PoolBalls
              cueBallPosition={cueBallPosition}
              setCueBallPosition={setCueBallPosition}
              gameState={gameState}
              power={power}
              cueAngle={cueAngle}
              pocketedBalls={pocketedBalls}
              onBallPocketed={handleBallPocketed}
            />
          </Physics>

          <CueStick
            cueBallPosition={cueBallPosition}
            angle={cueAngle}
            power={power}
            gameState={gameState}
          />

          <ContactShadows
            position={[0, -0.49, 0]}
            opacity={0.6}
            scale={6}
            blur={2}
            far={3}
          />

          <Environment preset="night" />

          <OrbitControls
            enablePan={false}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 2.2}
            minDistance={1.5}
            maxDistance={5}
            enableDamping
            dampingFactor={0.05}
            target={[0, 0, 0]}
          />
        </Suspense>
      </Canvas>

      {/* Game UI Overlay */}
      <GameUI
        gameState={gameState}
        power={power}
        setPower={setPower}
        cueAngle={cueAngle}
        setCueAngle={setCueAngle}
        onShoot={handleShoot}
        onRelease={handleRelease}
        pocketedBalls={pocketedBalls}
        playerState={playerState}
        onReset={resetGame}
      />

      {/* Instructions Modal */}
      {showInstructions && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-gradient-to-b from-[#1a2820] to-[#0d1510] border border-[#c9a962]/30 rounded-lg p-6 md:p-8 max-w-md w-full shadow-2xl">
            <h2 className="font-display text-2xl md:text-3xl text-[#c9a962] mb-4 text-center">8-Ball Pool</h2>
            <div className="space-y-3 text-[#a8b5a0] font-body text-sm md:text-base">
              <p><span className="text-[#c9a962]">•</span> Drag the <span className="text-white">angle slider</span> to aim</p>
              <p><span className="text-[#c9a962]">•</span> Hold <span className="text-white">SHOOT</span> to charge power</p>
              <p><span className="text-[#c9a962]">•</span> Release to strike the cue ball</p>
              <p><span className="text-[#c9a962]">•</span> Pocket your balls (solids 1-7 or stripes 9-15)</p>
              <p><span className="text-[#c9a962]">•</span> Sink the 8-ball last to win!</p>
              <p><span className="text-[#c9a962]">•</span> Orbit camera by dragging the scene</p>
            </div>
            <button
              onClick={() => setShowInstructions(false)}
              className="mt-6 w-full py-3 bg-gradient-to-r from-[#c9a962] to-[#a8893f] text-[#0a0f0d] font-display text-lg rounded hover:from-[#d4b872] hover:to-[#b8994f] transition-all duration-300 active:scale-95"
            >
              BREAK!
            </button>
          </div>
        </div>
      )}

      {/* Game Over Modal */}
      {playerState.gameOver && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-gradient-to-b from-[#1a2820] to-[#0d1510] border border-[#c9a962]/30 rounded-lg p-6 md:p-8 max-w-md w-full shadow-2xl text-center">
            <h2 className="font-display text-3xl md:text-4xl text-[#c9a962] mb-2">
              {playerState.winner === 1 ? '🎱 Player 1 Wins!' : '🎱 Player 2 Wins!'}
            </h2>
            <p className="text-[#a8b5a0] font-body mb-6">
              Final Score: P1 {playerState.player1Score} - P2 {playerState.player2Score}
            </p>
            <button
              onClick={resetGame}
              className="w-full py-3 bg-gradient-to-r from-[#c9a962] to-[#a8893f] text-[#0a0f0d] font-display text-lg rounded hover:from-[#d4b872] hover:to-[#b8994f] transition-all duration-300 active:scale-95"
            >
              PLAY AGAIN
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="absolute bottom-2 md:bottom-4 left-0 right-0 text-center z-20 pointer-events-none">
        <p className="text-[#4a5a4a] text-xs font-body tracking-wide">
          Requested by <span className="text-[#6a7a6a]">@blugati</span> · Built by <span className="text-[#6a7a6a]">@clonkbot</span>
        </p>
      </footer>
    </div>
  )
}

export default App
