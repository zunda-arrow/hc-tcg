import classNames from 'classnames'
import {ACHIEVEMENTS, ACHIEVEMENTS_LIST} from 'common/achievements'
import debugConfig from 'common/config/debug-config'
import {ALL_COSMETICS} from 'common/cosmetics'
import {COINS} from 'common/cosmetics/coins'
import {
	Background,
	Border,
	Coin,
	Cosmetic,
	Heart,
	Title,
} from 'common/cosmetics/types'
import AchievementComponent from 'components/achievement'
import Button from 'components/button'
import MenuLayout from 'components/menu-layout'
import Tabs from 'components/tabs/tabs'
import Tooltip from 'components/tooltip'
import {
	getAchievements,
	getAppearance,
} from 'logic/game/database/database-selectors'
import {localMessages} from 'logic/messages'
import {getSession} from 'logic/session/session-selectors'
import {useRef, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import css from './cosmsetics.module.scss'

type Pages = 'achievements' | 'rewards'

type Props = {
	setMenuSection: (section: string) => void
	page: Pages
}

export function CosmeticPreview() {
	const {playerName, minecraftName} = useSelector(getSession)
	const appearance = useSelector(getAppearance)
	const health = (lives: number) => {
		const hearts = new Array(3).fill(null).map((_, index) => {
			const heartImg =
				lives > index
					? `/images/cosmetics/heart/${appearance.heart.id}.png`
					: '/images/game/heart_empty.png'
			return (
				<img
					key={index}
					className={css.heart}
					src={heartImg}
					width="32"
					height="32"
				/>
			)
		})
		return hearts
	}

	const previewStyle = {
		borderImageSource:
			appearance.border.id === 'blue'
				? undefined
				: `url(/images/cosmetics/border/${appearance.border.id}.png)`,
		backgroundImage:
			appearance.background.id === 'transparent'
				? undefined
				: `url(/images/cosmetics/background/${appearance.background.id}.png)`,
	}

	return (
		<div className={css.cosmeticPreview}>
			<div className={css.appearanceContainer} style={previewStyle}>
				<img
					className={css.playerHead}
					src={`https://mc-heads.net/head/${minecraftName}/right`}
					alt="player head"
				/>
				<div className={css.playerName}>
					<h1>{playerName}</h1>
					<p className={css.title}>{appearance.title.name}</p>
				</div>

				<div className={css.health}>{health(3)}</div>
			</div>
		</div>
	)
}

const CosmeticItem = ({cosmetic}: {cosmetic: Cosmetic}) => {
	const dispatch = useDispatch()
	const achievementProgress = useSelector(getAchievements)
	const appearance = useSelector(getAppearance)
	const itemRef = useRef<HTMLDivElement>(null)

	const cosmetics = [
		appearance.background,
		appearance.border,
		appearance.coin,
		appearance.heart,
		appearance.title,
	]

	let isUnlocked = true

	let isSelected = cosmetics.find((c) => c.id === cosmetic.id)

	const achievement = cosmetic.requires
		? ACHIEVEMENTS[cosmetic.requires.achievement]
		: null

	if (cosmetic.requires && achievement && !debugConfig.unlockAllCosmetics) {
		isUnlocked =
			!!achievementProgress[achievement.numericId].levels[
				cosmetic.requires.level || 0
			]?.completionTime
	}

	const icon_url = `/images/cosmetics/${cosmetic.type}/${cosmetic.id}.png`

	const item = (
		<div
			className={classNames(css.cosmeticItem, {
				[css.unlocked]: isUnlocked,
				[css.selected]: isSelected,
			})}
			ref={itemRef}
			onClick={() => {
				if (!isUnlocked || isSelected) return
				dispatch({
					type: localMessages.COSMETIC_UPDATE,
					cosmetic: cosmetic,
				})
				if (!itemRef.current) return
				itemRef.current.animate(
					{
						backgroundColor: ['var(--gray-400)', 'var(--gray-500)'],
					},
					{
						easing: 'ease-in-out',
						duration: 200,
					},
				)
			}}
		>
			{cosmetic.type === 'title' && (
				<div className={css.cosmeticTitle}>{cosmetic.name || 'No Title'}</div>
			)}
			{cosmetic.type === 'background' && (
				<img
					className={css.cosmeticBackground}
					src={icon_url}
					alt={cosmetic.name}
				></img>
			)}
			{cosmetic.type === 'coin' && (
				<img
					className={css.cosmeticCoin}
					style={{
						borderColor: `${COINS[cosmetic.id].borderColor}`,
						boxShadow: `0 0 4px ${COINS[cosmetic.id].borderColor}`,
					}}
					src={icon_url}
					alt={cosmetic.name}
				></img>
			)}
			{cosmetic.type === 'heart' && (
				<div className={css.cosmeticHeart}>
					<img src={icon_url} alt={cosmetic.name}></img>
					<img src={icon_url} alt={cosmetic.name}></img>
					<img src={icon_url} alt={cosmetic.name}></img>
				</div>
			)}
			{cosmetic.type === 'border' && (
				<div
					className={css.cosmeticBorder}
					style={{
						borderImageSource: `url("${icon_url}")`,
					}}
				></div>
			)}
			{!isUnlocked && (
				<div className={css.lockOverlay}>
					<img src="/images/lock.png" />
				</div>
			)}
		</div>
	)

	const tooltip = achievement ? (
		<div className={css.tooltip}>
			<b>{achievement.levels[cosmetic.requires?.level || 0].name}</b>
			<p>{achievement.levels[cosmetic.requires?.level || 0].description}</p>
		</div>
	) : (
		<div className={css.tooltip}>
			<b>{cosmetic.name}</b>
		</div>
	)

	return (
		<div className={css.cosmeticBox}>
			{achievement || cosmetic.name.length > 0 ? (
				<Tooltip tooltip={tooltip}>{item}</Tooltip>
			) : (
				item
			)}
			{cosmetic.type !== 'title' && (
				<div
					className={classNames(css.cosmeticName, isUnlocked && css.unlocked)}
				>
					{cosmetic.name}
				</div>
			)}
		</div>
	)
}

function Cosmetics({setMenuSection, page}: Props) {
	const dispatch = useDispatch()

	const cosmetics = useSelector(getAppearance)
	const [tab, selectTab] = useState<Pages>(page)
	const progressData = useSelector(getAchievements)

	const usernameRef = useRef<HTMLInputElement>(null)
	const minecraftNameRef = useRef<HTMLInputElement>(null)

	const sortedCosmetics = ALL_COSMETICS.reduce(
		(
			r: {
				background: Array<Background>
				title: Array<Title>
				coin: Array<Coin>
				heart: Array<Heart>
				border: Array<Border>
			},
			c,
		) => {
			if (c.type === 'background') r.background.push(c)
			else if (c.type === 'border') r.border.push(c)
			else if (c.type === 'coin') r.coin.push(c)
			else if (c.type === 'heart') r.heart.push(c)
			else if (c.type === 'title') r.title.push(c)
			return r
		},
		{background: [], title: [], coin: [], heart: [], border: []},
	)

	return (
		<MenuLayout
			back={() => setMenuSection('main-menu')}
			title="Achievements"
			returnText="Main Menu"
			className={css.cosmeticsLayout}
		>
			<div className={css.body}>
				<div className={css.body2}>
					<Tabs
						selected={tab}
						setSelected={selectTab}
						tabs={['achievements', 'rewards']}
					/>
					<div className={css.itemSelector}>
						{tab === 'achievements' && (
							<div className={css.achievements}>
								{ACHIEVEMENTS_LIST.map((achievement) => {
									return (
										<AchievementComponent
											key={achievement.numericId}
											achievement={achievement}
											progressData={progressData[achievement.numericId]}
										/>
									)
								})}
							</div>
						)}
						{tab === 'rewards' && (
							<div className={css.cosmeticsContainerContainer}>
								<div className={css.cosmeticsContainer}>
									<div className={css.sectionHeader}>Backgrounds</div>
									<div className={css.cosmetics}>
										{sortedCosmetics.background.map((cosmetic) => (
											<CosmeticItem cosmetic={cosmetic}></CosmeticItem>
										))}
									</div>
									<div className={css.sectionHeader}>Borders</div>
									<div className={css.cosmetics}>
										{sortedCosmetics.border.map((cosmetic) => (
											<CosmeticItem cosmetic={cosmetic}></CosmeticItem>
										))}
									</div>
									<div className={css.sectionHeader}>Coins</div>
									<div className={css.cosmetics}>
										{sortedCosmetics.coin.map((cosmetic) => (
											<CosmeticItem cosmetic={cosmetic}></CosmeticItem>
										))}
									</div>
									<div className={css.sectionHeader}>Hearts</div>
									<div className={css.cosmetics}>
										{sortedCosmetics.heart.map((cosmetic) => (
											<CosmeticItem cosmetic={cosmetic}></CosmeticItem>
										))}
									</div>
									<div className={css.sectionHeader}>Titles</div>
									<div className={css.cosmetics}>
										{sortedCosmetics.title.map((cosmetic) => (
											<CosmeticItem cosmetic={cosmetic}></CosmeticItem>
										))}
									</div>
								</div>
							</div>
						)}
					</div>
				</div>
				{tab === 'rewards' && (
					<div className={css.leftSideCosmetics}>
						<h2 className={css.hideOnMobile}>Your Appearance</h2>
						<div className={css.appearance}>
							<CosmeticPreview />
						</div>
						<img
							className={classNames(css.appearanceCoin, css.hideOnMobile)}
							style={{
								borderColor: `${COINS[cosmetics.coin.id].borderColor}`,
								boxShadow: `0 0 4px ${COINS[cosmetics.coin.id].borderColor}`,
							}}
							src={`/images/cosmetics/coin/${cosmetics.coin.id}.png`}
							alt={'Coin'}
						></img>
						<h2 className={css.hideOnMobile}>Your Info</h2>
						<div className={css.nameSelector}>
							<div className={css.updatePlayerInfo}>
								<input ref={usernameRef} placeholder={'Username'}></input>
								<Button
									onClick={() => {
										if (!usernameRef.current) return
										dispatch({
											type: localMessages.USERNAME_SET,
											name: usernameRef.current.value,
										})
									}}
								>
									Update Username
								</Button>
							</div>
							<div className={css.updatePlayerInfo}>
								<input
									ref={minecraftNameRef}
									placeholder={'Minecraft Username'}
									minLength={3}
								></input>
								<Button
									onClick={() => {
										if (!minecraftNameRef.current) return
										dispatch({
											type: localMessages.MINECRAFT_NAME_SET,
											name: minecraftNameRef.current.value,
										})
									}}
								>
									Update Player Head
								</Button>
							</div>
						</div>
					</div>
				)}
			</div>
		</MenuLayout>
	)
}

export default Cosmetics
