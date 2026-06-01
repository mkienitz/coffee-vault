import { sum } from 'radash';

type WeightRow = {
	weight: number | null;
};

export type CoffeeInventory = {
	weight: number;
	tubes: WeightRow[];
	bags: WeightRow[];
	brews: WeightRow[];
};

export function getConsumedWeight({ brews }: Pick<CoffeeInventory, 'brews'>) {
	return sum(brews, (brew) => brew.weight ?? 0);
}

export function getAllocatedWeight({ tubes, bags }: Pick<CoffeeInventory, 'tubes' | 'bags'>) {
	return sum(tubes, (tube) => tube.weight ?? 0) + sum(bags, (bag) => bag.weight ?? 0);
}

export function getRemainingWeight(inventory: Pick<CoffeeInventory, 'weight' | 'brews'>) {
	return inventory.weight - getConsumedWeight(inventory);
}

export function getUndosedWeight(inventory: CoffeeInventory) {
	return getRemainingWeight(inventory) - getAllocatedWeight(inventory);
}
