import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

'________________________'
'GLOBAL VARIABLES'
'Material data matrix'
materialdata = [wood_log, copper, iron, stone, wolfram, coal, wood_plank, wood_frame, copper_ingot, copper_wire, iron_ingot, iron_gear, sand, silicon, glass, tungsten, graphite, carbide, coupler, lens, heat_sink, iron_plate, emagnet, metal_frame, steel, steel_rod, rotor, concrete, battery, motor, circuit, carbfibre, nanowire, computer, ind_frame, gyroscope, stabilizer, mag_field, quantum, microscope, turbocharg, supercomp, atomic, energy_cube, tank, compressor, particle, duplicator, earth_token, uranium, enriched_ur, empty_fuel, nuclear_fuel];
'Total required for each material array initialisation'
materialtotal = [0];
materialtotal.length = materialdata.length;
zero(materialtotal);
'_________________________'
'END OF GLOBAL VARIABLE'

// 제품 레시피 정의
const RECIPES = {
    'wood_plank': {
        name: '목재',
        ingredients: {
            'wood_Log': 1
        }
    },
    'copper_ingot': {
        name: 'copper',
        ingredients: {
            'copper': 1
        }
    },
    'iron_ingot': {
        name: 'iron',
        ingredients: {
            'iron': 1
        }
    },
    'sand': {
        name: 'stone',
        ingredients: {
            'stone': 1
        }
    },
    'wood_frame': {
        name: '나무 틀',
        ingredients: {
            'wood_plank': 4
        }
    },
    'iron_plate': {
        name: '철판',
        ingredients: {
            'iron_ingot': 1
        }
    },
    'metal_frame': {
        name: '금속프레임',
        ingredients: {
            'iron_plate': 4,
            'wood_frame': 1
        }
    }

};

// 기본 재료 정의
const BASE_MATERIALS = {
    Wood_Log: { name: '나무', color: 'bg-amber-700' },
    iron: { name: '철', color: 'bg-gray-500' }
};

const MaterialCalculator = () => {
    const [selectedProduct, setSelectedProduct] = useState('metal_frame');
    const [quantity, setQuantity] = useState(1);
    const [requirements, setRequirements] = useState({});

    // 재귀적으로 필요한 모든 재료 계산
    const calculateRequirements = useCallback((product, amount, reqs = {}) => {
        const recipe = RECIPES[product];
        if (!recipe) return reqs;

        Object.entries(recipe.ingredients).forEach(([ingredient, ratio]) => {
            const requiredAmount = ratio * amount;

            // 이미 계산된 재료에 추가
            reqs[ingredient] = (reqs[ingredient] || 0) + requiredAmount;

            // 중간 제품이라면 재귀적으로 계산
            if (RECIPES[ingredient]) {
                calculateRequirements(ingredient, requiredAmount, reqs);
            }
        });

        return reqs;
    }, []);

    // 선택된 제품과 수량이 변경될 때 요구사항 다시 계산
    const updateRequirements = useCallback(() => {
        const reqs = calculateRequirements(selectedProduct, quantity);
        setRequirements(reqs);
    }, [selectedProduct, quantity, calculateRequirements]);

    // 제품 선택 또는 수량 변경시 요구사항 업데이트
    React.useEffect(() => {
        updateRequirements();
    }, [selectedProduct, quantity, updateRequirements]);

    const renderMaterialBlock = (material, amount) => {
        const isBaseProduct = BASE_MATERIALS[material];
        const colorClass = isBaseProduct ? BASE_MATERIALS[material].color : 'bg-blue-500';
        const displayName = isBaseProduct ? BASE_MATERIALS[material].name :
            RECIPES[material] ? RECIPES[material].name : material;

        return (
            <div
                key={material}
                className={`${colorClass} text-white rounded-lg p-4 flex flex-col items-center justify-center`}
            >
                <div className="text-lg font-bold">{displayName}</div>
                <div className="text-2xl font-bold">{amount}</div>
            </div>
        );
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-4">
            <Card>
                <CardHeader>
                    <CardTitle>재료 요구량 계산기</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex gap-4 items-center">
                        <select
                            className="border rounded-lg p-2 flex-1"
                            value={selectedProduct}
                            onChange={(e) => setSelectedProduct(e.target.value)}
                        >
                            {Object.entries(RECIPES).map(([id, recipe]) => (
                                <option key={id} value={id}>{recipe.name}</option>
                            ))}
                        </select>
                        <input
                            type="number"
                            min="1"
                            value={quantity}
                            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                            className="border rounded-lg p-2 w-32 text-center"
                        />
                    </div>

                    {/* 직접적인 재료 요구량 */}
                    <div>
                        <h3 className="text-lg font-medium mb-3">직접 필요한 재료</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {Object.entries(RECIPES[selectedProduct]?.ingredients || {}).map(([material, amount]) =>
                                renderMaterialBlock(material, amount * quantity)
                            )}
                        </div>
                    </div>

                    {/* 기본 재료까지 분해한 총 요구량 */}
                    <div>
                        <h3 className="text-lg font-medium mb-3">기본 재료 총 필요량</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {Object.entries(requirements)
                                .filter(([material]) => BASE_MATERIALS[material])
                                .map(([material, amount]) => renderMaterialBlock(material, amount))}
                        </div>
                    </div>

                    {/* 중간 생산품 요구량 */}
                    <div>
                        <h3 className="text-lg font-medium mb-3">중간 생산품 필요량</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {Object.entries(requirements)
                                .filter(([material]) => RECIPES[material])
                                .map(([material, amount]) => renderMaterialBlock(material, amount))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default MaterialCalculator;
