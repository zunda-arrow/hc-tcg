import {Card} from 'common/cards/types'
import {COINS} from 'common/coins'
import {AIComponent} from 'common/components/ai-component'
import {GameSettings} from 'common/models/game-model'
import {applyMiddleware, createStore} from 'redux'
import createSagaMiddleware from 'redux-saga'
import {GameController} from 'server/game-controller'
import gameSaga from 'server/routines/game'
import {call} from 'typed-redux-saga'
import {FuzzAI} from './fuzz-ai'
import {CurrentCoinFlip} from 'common/types/game-state'

class FuzzyGameController extends GameController {
	public override getRandomDelayForAI(_flips: Array<CurrentCoinFlip>) {
		return 0
	}
}

function getTestPlayer(playerName: string, deck: Array<Card>) {
	return {
		model: {
			name: playerName,
			minecraftName: playerName,
			censoredName: playerName,
			selectedCoinHead: 'creeper' as keyof typeof COINS,
		},
		deck,
	}
}

function testSaga(rootSaga: any) {
	const sagaMiddleware = createSagaMiddleware({
		// Prevent default behavior where redux saga logs errors to stderr. This is not useful to tests.
		onError: (_err, {sagaStack: _}) => {},
	})
	createStore(() => {}, applyMiddleware(sagaMiddleware))

	let saga = sagaMiddleware.run(function* () {
		yield* rootSaga
	})

	if (saga.error()) {
		throw saga.error()
	}
}

const defaultGameSettings = {
	maxTurnTime: 90 * 1000,
	extraActionTime: 30 * 1000,
	showHooksState: {
		enabled: false,
		clearConsole: false,
	},
	blockedActions: [],
	availableActions: [],
	autoEndTurn: false,
	disableDeckOut: true,
	startWithAllCards: false,
	unlimitedCards: false,
	oneShotMode: false,
	extraStartingCards: [],
	disableDamage: false,
	noItemRequirements: false,
	forceCoinFlip: true,
	shuffleDeck: false,
	logErrorsToStderr: false,
	verboseLogging: !!process.env.UNIT_VERBOSE,
	disableRewardCards: false,
} satisfies GameSettings

/**
 * Test a saga against a game. The game is created with default settings similar to what would be found in production.
 * Note that decks are not shuffled in test games.
 */
export function testGame(options: {
	playerOneDeck: Array<Card>
	playerTwoDeck: Array<Card>
	seed: string
}) {
	let controller = new FuzzyGameController(
		getTestPlayer('playerOne', options.playerOneDeck),
		getTestPlayer('playerTwo', options.playerTwoDeck),
		{
			randomizeOrder: false,
			randomSeed: options.seed,
			settings: {
				...defaultGameSettings,
			},
		},
	)

	controller.game.components.new(
		AIComponent,
		controller.game.currentPlayer.entity,
		FuzzAI,
	)
	controller.game.components.new(
		AIComponent,
		controller.game.opponentPlayer.entity,
		FuzzAI,
	)

	testSaga(
		call(function* () {
			yield* call(gameSaga, controller)
		}),
	)
}
