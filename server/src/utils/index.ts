import {ServerGameController} from 'game-controller'

export const getOpponentId = (
	controller: ServerGameController,
	playerId: string,
) => {
	const players = controller.viewers
		.filter((viewer) => !viewer.spectator)
		.map((viewer) => viewer.player)
	return players.filter((p) => p.id !== playerId)[0]?.id || null
}

/** Call a function and log errors if they are found. This function is used to prevent errors from reaching
 * the root of the tree.
 */
export function* safeCall(fun: any, ...args: any[]): any {
	try {
		return yield* fun(...args)
	} catch (e) {
		console.error(e)
	}
}
