import {SlotComponent} from '../components'
import query from '../components/query'
import {afterApply} from '../types/priorities'
import {achievement} from './defaults'
import {Achievement} from './types'

const FreeAndSteel: Achievement = {
	...achievement,
	numericId: 45,
	id: 'free-and-steel',
	levels: [
		{
			name: 'Free & Steel',
			description: 'Use Flint & Steel with zero cards in your hand.',
			steps: 1,
		},
	],
	onGameStart(game, player, component, observer) {
		let playerHandSize: number = 10000

		observer.subscribe(player.hooks.beforeApply, () => {
			playerHandSize = player.getHand().length
		})

		observer.subscribeWithPriority(
			player.hooks.afterApply,
			afterApply.CHECK_BOARD_STATE,
			() => {
				let su = game.components
					.find(SlotComponent, query.slot.singleUse)
					?.getCard()
				if (!su) return
				if (su.props.id !== FreeAndSteel.id) return

				if (playerHandSize == 0) {
					component.incrementGoalProgress({goal: 0})
				}
			},
		)
	},
}

export default FreeAndSteel
