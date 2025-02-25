import British from './british'
import CantTouchThis from './cant-touch-this'
import CertifiedZombie from './certified-zombie'
import DeckedOut from './decked-out'
import DefeatEvilX from './defeat-evil-x'
import Designer from './designer'
import Ethogirl from './ethogirl'
import EyeOfTheSpider from './eye-of-the-spider'
import GoFish from './go-fish'
import HotTake from './hot-take'
import HowDidWeGetHere from './how-did-we-get-here'
import Inneffective from './inneffective'
import AllCards from './jack-of-all-cards'
import NakedAndScared from './naked-and-scared'
import NoDerpcoins from './no-derpcoins'
import OreSnatcher from './ore-snatcher'
import PackOfWolves from './pack-of-wolves'
import PeskyBird from './pesky-bird'
import ServerLag from './server-lag'
import SheepStarer from './sheep-starer'
import SUStainable from './sustainable'
import TeamStar from './team-star'
import {
	BalancedWins,
	BuilderWins,
	ExplorerWins,
	FarmWins,
	MinerWins,
	PranksterWins,
	PvpWins,
	RedstoneWins,
	SpeedrunnerWins,
	TerraformWins,
} from './type-wins'
import {Achievement} from './types'
import Win from './wins'
import Wipeout from './wipeout'

export const ACHIEVEMENTS_LIST: Array<Achievement> = [
	AllCards,
	CantTouchThis,
	DeckedOut,
	Ethogirl,
	EyeOfTheSpider,
	PackOfWolves,
	GoFish,
	HowDidWeGetHere,
	Wipeout,
	DefeatEvilX,
	NoDerpcoins,
	British,
	ServerLag,
	PeskyBird,
	TeamStar,
	OreSnatcher,
	SheepStarer,
	NakedAndScared,
	HotTake,
	Designer,
	CertifiedZombie,
	SUStainable,
	Inneffective,
	Win,
	BalancedWins,
	BuilderWins,
	SpeedrunnerWins,
	RedstoneWins,
	FarmWins,
	PvpWins,
	TerraformWins,
	PranksterWins,
	MinerWins,
	ExplorerWins,
]

export const ACHIEVEMENTS: Record<string | number, Achievement> =
	ACHIEVEMENTS_LIST.reduce(
		(result: Record<string | number, Achievement>, card) => {
			result[card.numericId] = card
			result[card.id] = card
			return result
		},
		{},
	)
