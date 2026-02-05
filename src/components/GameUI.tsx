import { useEffect, useRef } from 'react'
import type { GameState, PlayerState, BallType } from '../App'

interface GameUIProps {
  gameState: GameState
  power: number
  setPower: (power: number) => void
  cueAngle: number
  setCueAngle: (angle: number) => void
  onShoot: () => void
  onRelease: () => void
  pocketedBalls: number[]
  playerState: PlayerState
  onReset: () => void
}

export function GameUI({
  gameState,
  power,
  setPower,
  cueAngle,
  setCueAngle,
  onShoot,
  onRelease,
  pocketedBalls,
  playerState,
  onReset
}: GameUIProps) {
  const isCharging = useRef(false)
  const intervalRef = useRef<number | null>(null)

  // Handle power charging
  const powerRef = useRef(power)
  powerRef.current = power

  useEffect(() => {
    if (gameState === 'charging') {
      isCharging.current = true
      intervalRef.current = window.setInterval(() => {
        const newPower = Math.min(powerRef.current + 2, 100)
        setPower(newPower)
      }, 30)
    } else {
      isCharging.current = false
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [gameState, setPower])

  const handlePointerDown = () => {
    if (gameState === 'aiming') {
      onShoot()
    }
  }

  const handlePointerUp = () => {
    if (gameState === 'charging') {
      onRelease()
    }
  }

  const getBallTypeLabel = (type: BallType): string => {
    if (type === 'solid') return 'Solids (1-7)'
    if (type === 'stripe') return 'Stripes (9-15)'
    return 'TBD'
  }

  const solidBalls = [1, 2, 3, 4, 5, 6, 7]
  const stripeBalls = [9, 10, 11, 12, 13, 14, 15]

  const ballColors: Record<number, string> = {
    1: '#f5d742', 2: '#2563eb', 3: '#dc2626', 4: '#7c3aed',
    5: '#f97316', 6: '#16a34a', 7: '#7f1d1d', 8: '#1a1a1a',
    9: '#f5d742', 10: '#2563eb', 11: '#dc2626', 12: '#7c3aed',
    13: '#f97316', 14: '#16a34a', 15: '#7f1d1d'
  }

  return (
    <>
      {/* Top HUD - Player info */}
      <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-start pointer-events-none">
        {/* Player 1 */}
        <div className={`bg-black/40 backdrop-blur-md border rounded-lg p-3 md:p-4 transition-all duration-300 pointer-events-auto ${
          playerState.currentPlayer === 1 ? 'border-[#c9a962] shadow-lg shadow-[#c9a962]/20' : 'border-white/10'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-2 h-2 rounded-full ${playerState.currentPlayer === 1 ? 'bg-[#c9a962] animate-pulse' : 'bg-white/30'}`} />
            <span className="font-display text-sm md:text-base text-white">Player 1</span>
          </div>
          <div className="text-xs text-[#a8b5a0] font-body mb-2">
            {getBallTypeLabel(playerState.player1Type)}
          </div>
          <div className="flex gap-1 flex-wrap max-w-[120px] md:max-w-none">
            {(playerState.player1Type === 'solid' ? solidBalls : playerState.player1Type === 'stripe' ? stripeBalls : []).map(num => (
              <div
                key={num}
                className={`w-4 h-4 md:w-5 md:h-5 rounded-full border transition-all duration-300 ${
                  pocketedBalls.includes(num) ? 'opacity-30 scale-75' : 'shadow-sm'
                }`}
                style={{
                  backgroundColor: ballColors[num],
                  borderColor: playerState.player1Type === 'stripe' ? '#fff' : 'transparent',
                  borderWidth: playerState.player1Type === 'stripe' ? 2 : 0
                }}
              />
            ))}
          </div>
          <div className="mt-2 font-display text-lg md:text-xl text-[#c9a962]">
            {playerState.player1Score}
          </div>
        </div>

        {/* Center - 8 ball indicator */}
        <div className="hidden md:block bg-black/40 backdrop-blur-md border border-white/10 rounded-lg px-4 py-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#1a1a1a] border-2 border-white/20 flex items-center justify-center">
              <span className="text-white text-xs font-bold">8</span>
            </div>
            <span className="text-[#a8b5a0] text-sm font-body">Pocket last to win</span>
          </div>
        </div>

        {/* Player 2 */}
        <div className={`bg-black/40 backdrop-blur-md border rounded-lg p-3 md:p-4 transition-all duration-300 pointer-events-auto ${
          playerState.currentPlayer === 2 ? 'border-[#c9a962] shadow-lg shadow-[#c9a962]/20' : 'border-white/10'
        }`}>
          <div className="flex items-center gap-2 mb-2 justify-end">
            <span className="font-display text-sm md:text-base text-white">Player 2</span>
            <div className={`w-2 h-2 rounded-full ${playerState.currentPlayer === 2 ? 'bg-[#c9a962] animate-pulse' : 'bg-white/30'}`} />
          </div>
          <div className="text-xs text-[#a8b5a0] font-body mb-2 text-right">
            {getBallTypeLabel(playerState.player2Type)}
          </div>
          <div className="flex gap-1 flex-wrap justify-end max-w-[120px] md:max-w-none">
            {(playerState.player2Type === 'solid' ? solidBalls : playerState.player2Type === 'stripe' ? stripeBalls : []).map(num => (
              <div
                key={num}
                className={`w-4 h-4 md:w-5 md:h-5 rounded-full border transition-all duration-300 ${
                  pocketedBalls.includes(num) ? 'opacity-30 scale-75' : 'shadow-sm'
                }`}
                style={{
                  backgroundColor: ballColors[num],
                  borderColor: playerState.player2Type === 'stripe' ? '#fff' : 'transparent',
                  borderWidth: playerState.player2Type === 'stripe' ? 2 : 0
                }}
              />
            ))}
          </div>
          <div className="mt-2 font-display text-lg md:text-xl text-[#c9a962] text-right">
            {playerState.player2Score}
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-12 md:bottom-16 left-4 right-4 z-20 pointer-events-none">
        <div className="max-w-lg mx-auto">
          {/* Angle Control */}
          <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-3 md:p-4 mb-3 pointer-events-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[#a8b5a0] text-xs font-body uppercase tracking-wider">Aim</span>
              <span className="text-[#c9a962] font-display text-sm">{cueAngle}°</span>
            </div>
            <input
              type="range"
              min="-180"
              max="180"
              value={cueAngle}
              onChange={(e) => setCueAngle(Number(e.target.value))}
              disabled={gameState !== 'aiming'}
              className="w-full h-2 bg-[#1a2820] rounded-lg appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-5
                [&::-webkit-slider-thumb]:h-5
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-gradient-to-b
                [&::-webkit-slider-thumb]:from-[#c9a962]
                [&::-webkit-slider-thumb]:to-[#a8893f]
                [&::-webkit-slider-thumb]:shadow-lg
                [&::-webkit-slider-thumb]:cursor-pointer
                [&::-moz-range-thumb]:w-5
                [&::-moz-range-thumb]:h-5
                [&::-moz-range-thumb]:rounded-full
                [&::-moz-range-thumb]:bg-gradient-to-b
                [&::-moz-range-thumb]:from-[#c9a962]
                [&::-moz-range-thumb]:to-[#a8893f]
                [&::-moz-range-thumb]:border-none
                [&::-moz-range-thumb]:cursor-pointer
                disabled:opacity-50"
            />
          </div>

          {/* Power & Shoot */}
          <div className="flex gap-3">
            {/* Power meter */}
            <div className="flex-1 bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-3 md:p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[#a8b5a0] text-xs font-body uppercase tracking-wider">Power</span>
                <span className="text-[#c9a962] font-display text-sm">{power}%</span>
              </div>
              <div className="h-3 bg-[#1a2820] rounded-full overflow-hidden">
                <div
                  className="h-full transition-all duration-75 rounded-full"
                  style={{
                    width: `${power}%`,
                    background: power > 80
                      ? 'linear-gradient(90deg, #c9a962, #dc2626)'
                      : power > 50
                        ? 'linear-gradient(90deg, #c9a962, #f97316)'
                        : 'linear-gradient(90deg, #2d5a3d, #c9a962)'
                  }}
                />
              </div>
            </div>

            {/* Shoot button */}
            <button
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              onTouchStart={handlePointerDown}
              onTouchEnd={handlePointerUp}
              disabled={gameState === 'waiting' || gameState === 'shooting'}
              className={`pointer-events-auto px-6 md:px-8 py-4 rounded-lg font-display text-base md:text-lg transition-all duration-200
                ${gameState === 'charging'
                  ? 'bg-gradient-to-b from-[#dc2626] to-[#991b1b] text-white scale-95'
                  : gameState === 'aiming'
                    ? 'bg-gradient-to-b from-[#c9a962] to-[#a8893f] text-[#0a0f0d] hover:from-[#d4b872] hover:to-[#b8994f] active:scale-95'
                    : 'bg-[#1a2820] text-[#4a5a4a] cursor-not-allowed'
                }
                shadow-lg select-none touch-none`}
            >
              {gameState === 'charging' ? 'RELEASE' : gameState === 'waiting' ? '...' : 'SHOOT'}
            </button>
          </div>

          {/* Reset button */}
          <button
            onClick={onReset}
            className="pointer-events-auto mt-3 w-full py-2 text-[#6a7a6a] hover:text-[#a8b5a0] text-xs font-body uppercase tracking-wider transition-colors"
          >
            Reset Game
          </button>
        </div>
      </div>
    </>
  )
}
