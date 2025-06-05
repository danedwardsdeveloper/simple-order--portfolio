import { type ImageKey, imagesCollection } from '@/library/imagesCollection'
import type { UseCase } from '@/types'

// Sourdough bakery
// Wholesale plant nursery

export type UseCaseKey =
	| 'apiary'
	| 'firewood'
	| 'bakery'
	| 'florist'
	| 'coffee'
	| 'autoParts'
	| 'cheeseMaker'
	| 'furnitureManufacturer'
	| 'fruitSeller'
	| 'jamMaker'
	| 'craftBrewery'
	| 'picklesAndSauces'
	| 'microDistillery'
	| 'farmToTable'
	| 'mushroomCultivator'
	| 'herbGrower'
	| 'soapMaker'
	| 'candleMaker'
	| 'stationerySupplier'
	| 'cleaningProducts'
	| 'christmasTreeFarm'
	| 'restaurantEquipment'
	| 'beautySupplier'
	| 'packagingSupplier'
	| 'edibleFlowers'
	| 'microgreens'
	| 'sourdoughStarter'
	| 'specialtySalt'
	| 'insectProtein'
	| 'heirloomSeeds'
	| 'seedWholesaler'
	| 'kombuchaBrewer'
	| 'gardenSupplies'
	| 'buildingSupplier'
	| 'specialtyNursery'
	| 'bulbSupplier'
	| 'compost'
	| 'topsoilSupplier'
	| 'turfSupplier'
	| 'organicFertilizer'
	| 'mulchSupplier'
	| 'timberMerchant'
	| 'aggregateSupplier'
	| 'concreteSupplier'

function industryImage(key: ImageKey) {
	return imagesCollection[key][0]
}

export const useCases: Record<UseCaseKey, UseCase> = {
	apiary: {
		featuredImage: industryImage('apiary'),
		industry: 'Apiary',
		industries: 'Apiaries',
		business: 'Beekeeping business',
		activity: 'producing honey',
		people: 'Beekeepers',
	},
	firewood: {
		featuredImage: industryImage('firewood'),
		industry: 'Firewood supplier',
		business: 'Firewood supply business',
		activity: 'Supplying firewood',
		people: 'Firewood suppliers',
	},
	bakery: {
		featuredImage: industryImage('bakery'),
		industry: 'Bakery',
		industries: 'Bakeries',
		business: 'Bakery business',
		activity: 'Baking',
		people: 'Bakers',
	},
	florist: {
		featuredImage: industryImage('florist'),
		industry: 'Florist',
		business: 'Florist',
		activity: 'supplying flowers',
		people: 'Florists',
	},
	coffee: {
		featuredImage: industryImage('coffee'),
		industry: 'Coffee Roaster',
		business: 'Coffee roasting business',
		activity: 'Coffee roasting',
		people: 'Coffee roasters',
	},
	autoParts: {
		featuredImage: industryImage('autoParts'),
		industry: 'Auto Parts',
		business: 'auto parts business',
		activity: 'supplying auto parts',
		people: 'Auto parts suppliers',
	},
	cheeseMaker: {
		featuredImage: industryImage('cheeseMaker'),
		industry: 'Cheese Making',
		business: 'cheese making business',
		activity: 'making cheese',
		people: 'Cheese makers',
	},
	furnitureManufacturer: {
		featuredImage: industryImage('furnitureManufacturer'),
		industry: 'Furniture Manufacturing',
		business: 'furniture manufacturing business',
		activity: 'manufacturing furniture',
		people: 'Furniture manufacturers',
	},
	fruitSeller: {
		featuredImage: industryImage('fruitSeller'),
		industry: 'Fruit and Vegetable Supply',
		business: 'produce business',
		activity: 'supplying fresh produce',
		people: 'Produce suppliers',
	},
	jamMaker: {
		// ToDo: Add images
		industry: 'Jam Maker',
		business: 'jam making business',
		activity: 'making preserves',
		people: 'Jam Makers',
	},
	craftBrewery: {
		industry: 'Craft Brewery',
		industries: 'Craft Breweries',
		business: 'craft brewery',
		activity: 'brewing beer',
		people: 'Craft Brewers',
	},
	picklesAndSauces: {
		industry: 'Condiment Manufacturer',
		business: 'condiment manufacturing business',
		activity: 'making condiments',
		people: 'Condiment Manufacturers',
	},
	microDistillery: {
		industries: 'Micro Distilleries',
		industry: 'Micro Distillery',
		business: 'micro distillery',
		activity: 'distilling spirits',
		people: 'Micro Distillers',
	},
	farmToTable: {
		industry: 'Farm Supplier',
		business: 'farm supply business',
		activity: 'supplying farm products',
		people: 'Farm Suppliers',
	},
	mushroomCultivator: {
		industry: 'Mushroom Cultivator',
		business: 'mushroom cultivation business',
		activity: 'growing mushrooms',
		people: 'Mushroom Cultivators',
	},
	herbGrower: {
		industry: 'Herb Grower',
		business: 'herb growing business',
		activity: 'growing herbs',
		people: 'Herb Growers',
	},
	soapMaker: {
		industry: 'Soap Maker',
		business: 'soap making business',
		activity: 'making soap',
		people: 'Soap Makers',
	},
	candleMaker: {
		industry: 'Candle Maker',
		business: 'candle making business',
		activity: 'making candles',
		people: 'Candle Makers',
	},
	stationerySupplier: {
		industry: 'Stationery Supplier',
		business: 'stationery supply business',
		activity: 'supplying stationery',
		people: 'Stationery Suppliers',
	},
	cleaningProducts: {
		industry: 'Cleaning Products Supplier',
		business: 'cleaning products business',
		activity: 'supplying cleaning products',
		people: 'Cleaning Products Suppliers',
	},
	christmasTreeFarm: {
		industry: 'Christmas Tree Farm',
		business: 'christmas tree farm',
		activity: 'growing christmas trees',
		people: 'Christmas Tree Farmers',
	},
	restaurantEquipment: {
		industry: 'Restaurant Equipment Supplier',
		business: 'restaurant equipment business',
		activity: 'supplying restaurant equipment',
		people: 'Restaurant Equipment Suppliers',
	},
	beautySupplier: {
		industry: 'Beauty Supplier',
		business: 'beauty supply business',
		activity: 'supplying beauty products',
		people: 'Beauty Suppliers',
	},
	packagingSupplier: {
		industry: 'Packaging Supplier',
		business: 'packaging supply business',
		activity: 'supplying packaging',
		people: 'Packaging Suppliers',
	},
	edibleFlowers: {
		industry: 'Edible Flower Grower',
		business: 'edible flower business',
		activity: 'growing edible flowers',
		people: 'Edible Flower Growers',
	},
	microgreens: {
		industry: 'Microgreen Grower',
		business: 'microgreen business',
		activity: 'growing microgreens',
		people: 'Microgreen Growers',
	},
	sourdoughStarter: {
		industry: 'Sourdough Starter Supplier',
		business: 'sourdough starter business',
		activity: 'supplying sourdough starters',
		people: 'Sourdough Starter Suppliers',
	},
	specialtySalt: {
		industry: 'Specialty Salt Producer',
		business: 'specialty salt business',
		activity: 'producing specialty salts',
		people: 'Specialty Salt Producers',
	},
	insectProtein: {
		industry: 'Insect Protein Supplier',
		business: 'insect protein business',
		activity: 'supplying insect protein',
		people: 'Insect Protein Suppliers',
	},
	heirloomSeeds: {
		industry: 'Heirloom Seed Supplier',
		business: 'heirloom seed business',
		activity: 'supplying heirloom seeds',
		people: 'Heirloom Seed Suppliers',
	},
	seedWholesaler: {
		industry: 'Seed Wholesaler',
		business: 'seed wholesale business',
		activity: 'wholesaling seeds',
		people: 'Seed Wholesalers',
	},
	kombuchaBrewer: {
		industry: 'Kombucha Brewer',
		business: 'kombucha brewing business',
		activity: 'brewing kombucha',
		people: 'Kombucha Brewers',
	},
	gardenSupplies: {
		industry: 'Garden Supplier',
		business: 'garden supply business',
		activity: 'supplying garden products',
		people: 'Garden Suppliers',
	},
	buildingSupplier: {
		industry: 'Building Supplier',
		business: 'building supply business',
		activity: 'supplying building materials',
		people: 'Building Suppliers',
	},
	specialtyNursery: {
		industry: 'Specialty Plant Nursery',
		industries: 'Specialty Plant Nurseries',
		business: 'specialty plant nursery',
		activity: 'growing specialty plants',
		people: 'Nursery Owners',
	},
	bulbSupplier: {
		industry: 'Bulb Supplier',
		business: 'bulb supply business',
		activity: 'supplying bulbs',
		people: 'Bulb Suppliers',
	},
	compost: {
		industry: 'Compost Supplier',
		business: 'compost supply business',
		activity: 'producing compost',
		people: 'Compost Suppliers',
		featuredImage: industryImage('compost'),
	},
	topsoilSupplier: {
		industry: 'Topsoil Supplier',
		business: 'topsoil supply business',
		activity: 'supplying topsoil',
		people: 'Topsoil Suppliers',
	},
	turfSupplier: {
		industry: 'Turf Supplier',
		business: 'turf supply business',
		activity: 'supplying turf',
		people: 'Turf Suppliers',
	},
	organicFertilizer: {
		industry: 'Organic Fertilizer Supplier',
		business: 'organic fertilizer business',
		activity: 'producing organic fertilizers',
		people: 'Organic Fertilizer Suppliers',
	},
	mulchSupplier: {
		industry: 'Mulch Supplier',
		business: 'mulch supply business',
		activity: 'supplying mulch',
		people: 'Mulch Suppliers',
	},
	timberMerchant: {
		industry: 'Timber Merchant',
		business: 'timber merchant business',
		activity: 'supplying timber',
		people: 'Timber Merchants',
	},
	aggregateSupplier: {
		industry: 'Aggregate Supplier',
		business: 'aggregate supply business',
		activity: 'supplying aggregates',
		people: 'Aggregate Suppliers',
	},
	concreteSupplier: {
		industry: 'Concrete Supplier',
		business: 'concrete supply business',
		activity: 'supplying ready-mix concrete',
		people: 'Concrete Suppliers',
	},
	// 44 keys
}
