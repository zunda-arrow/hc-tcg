import {GameModel} from './models/game-model'
import {CurrentCoinFlip, Message} from './types/game-state'

export type GameController = {
	game: GameModel
	publishBattleLog: (logs: Array<Message>, delay: number) => Promise<void>
	getRandomDelayForAI: (coinFlips: Array<CurrentCoinFlip>) => number
	broadcastState: () => void
}
