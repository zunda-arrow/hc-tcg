import assert from 'node:assert'
import {ComponentQuery} from '../components/query'
import {Entity, newEntity} from '../entities'
import {GameModel} from '../models/game-model'
import {createBrotliDecompress} from 'node:zlib'

export type Component = {
	entity: Entity<any>
}

export type ComponentClass<T> = new (...args: Array<any>) => T

function callPredicate(game: GameModel, value: any) {
	return (predicate: any) => predicate(game, value)
}

/** A map of entities to component objects. Components in the component
 * table can be queried. See the filter and find methods for more information.
 */
export default class ComponentTable {
	private game: GameModel
	private components: Array<Component>
	private tables: Array<Array<Entity<any> | undefined>>
	private tableMap: Array<number>

	constructor(game: GameModel) {
		this.game = game
		this.components = ["TMP"]
		/* Max of 20 component types */
		this.tables = new Array(20)
		this.tableMap = []
	}

	/** Get a specific entity by the ID */
	public get<T>(id: Entity<T> | null): T | null {
		if (id === null) return null
		return this.components[id] as T | null
	}

	/** Get a specific entity by the ID. If the entity does not exist, raise an error */
	public getOrError<T>(id: Entity<T>): T {
		const component = this.get(id)
		if (!component) {
			throw new Error(`Could not find component with ID \`${id}\` in ECS`)
		}
		// @ts-ignore
		return component
	}

	/** Remove an entity from the ECS. Before removing a component from the ECS, first consider if you can
	 * mark the element as invalid instead.
	 */
	public delete(id: Entity<any>) {
		let table = this.tableMap[id]
		if (!table) return
		this.tables[table][id] = undefined
	}

	/** Add a entity linked to a component and return the ID of the value */
	public new<T extends Component, Args extends Array<any>>(
		newValue: new (game: GameModel, id: T['entity'], ...args: Args) => T,
		...args: Args
	): T {
		assert(
			(newValue as any).table,
			`Found component type \`${newValue.name}\` has undefined table`,
		)

		const value = new newValue(
			this.game,
			this.components.length as Entity<T>,
			...args,
		)

		this.components.push(value)

		if (this.tables[newValue.tableNumber] === undefined) {
			this.tables[newValue.tableNumber] = []
		}

		this.tables[newValue.tableNumber].push(value.entity)

		return value
	}

	/** Filter all entities in the game by a given predicate
	 * ```ts
	 * import query from 'common/components/query'
	 * // Get all slots for the current player.
	 * game.components.filter(SlotComponent, query.slot.currentPlayer)
	 * ```
	 */
	public filter<T extends Component>(
		type: ComponentClass<T>,
		...predicates: Array<ComponentQuery<T>>
	): Array<T> {
		let out = []

		let table = this.tables[type.tableNumber] || []

		for (const entity of table) {
			if (entity === undefined) continue
			let component = this.components[entity]
			if (
				component instanceof type &&
				predicates.every(callPredicate(this.game, component))
			) {
				out.push(component)
			}
		}

		return out
	}

	public filterEntities<T extends Component>(
		type: ComponentClass<T>,
		...predicates: Array<ComponentQuery<T>>
	): Array<T['entity']> {
		return this.filter(type, ...predicates)?.map((x) => x.entity)
	}

	/** Find a component that fulfills a condition. This method does not neccisarily return
	 * oldest or first item to satisfy the condition. When using this method, assume you will get a random item.
	 * For drawing cards please use `player.draw()` instead as this will grab the items in the correct order.
	 */
	public find<T extends Component>(
		type: ComponentClass<T>,
		...predicates: Array<ComponentQuery<T>>
	): T | null {
		let table = this.tables[type.tableNumber] || []

		for (const entity of table) {
			if (entity === undefined) continue
			let component = this.components[entity]
			if (
				component instanceof type &&
				predicates.every(callPredicate(this.game, component))
			) {
				return component
			}
		}

		return null
	}

	public findEntity<T extends Component>(
		type: ComponentClass<T>,
		...predicates: Array<ComponentQuery<T>>
	): T['entity'] | null {
		return this.find(type, ...predicates)?.entity || null
	}

	/** Check if a component exists and return true if that is the case. */
	public exists<T extends Component>(
		type: ComponentClass<T>,
		...predicates: Array<ComponentQuery<T>>
	): boolean {
		return this.find(type, ...predicates) !== null
	}
}
