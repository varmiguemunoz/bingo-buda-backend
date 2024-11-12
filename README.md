Game
  ├── id: number
  ├── players: Player[]
  ├── status: string
  ├── startTime: Date
  ├── endTime: Date
  └── cardTemplate: number[][]

Player
  ├── id: number
  ├── username: string
  ├── email: string
  ├── gameId: number
  ├── cardId: number
  └── status: string

BingoCard
  ├── id: number
  ├── playerId: number
  ├── numbers: number[][]
  ├── selectedBalls: number[]
  └── isBingo: boolean

Ball
  ├── id: number
  ├── number: number
  └── isDrawn: boolean

GameState
  ├── gameId: number
  ├── round: number
  ├── ballsDrawn: number[]
  ├── currentBall: number
  └── winners: Player[]
